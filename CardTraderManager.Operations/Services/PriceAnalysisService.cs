using CardTraderApi.Client;
using CardTraderApi.Client.Models.Inventory;
using CardTraderApi.Client.Models.Marketplace;
using CardTraderManager.Common.Interfaces;
using CardTraderManager.Common.Models.Settings;
using CardTraderManager.Common.Utilities;
using CardTraderManager.Operations.Interfaces;
using CardTraderManager.Operations.Models;
using Microsoft.Extensions.Logging;

namespace CardTraderManager.Operations.Services;

public class PriceAnalysisService : IPriceAnalysisService
{
	private readonly CardTraderApiClient _cardTraderApiClient;
	private volatile UpdateStrategiesConfig _updateStrategiesConfig;
	private readonly IPriceCalculationService _priceCalculationService;
	private readonly ILogger<PriceAnalysisService> _logger;

	private const int MaxParallelism = 4;

	public PriceAnalysisService(
		CardTraderApiClient cardPriceApiClient,
		ISettingsProvider settingsProvider,
		IPriceCalculationService priceCalculationService,
		ILogger<PriceAnalysisService> logger)
	{
		_cardTraderApiClient = cardPriceApiClient ?? throw new ArgumentNullException(nameof(cardPriceApiClient));
		_updateStrategiesConfig = settingsProvider.GetUpdateStrategiesSettings()
								  ?? throw new ArgumentNullException(nameof(settingsProvider));
		_priceCalculationService = priceCalculationService ?? throw new ArgumentNullException(nameof(priceCalculationService));
		_logger = logger ?? throw new ArgumentNullException(nameof(logger));

		settingsProvider.OnSettingsUpdated += () =>
		{
			_updateStrategiesConfig = settingsProvider.GetUpdateStrategiesSettings();
		};
	}

	public async Task<PriceAnalysisResult> CalculateAnalysisResult(IReadOnlyCollection<InventoryProduct> itemsBatch, CancellationToken cancellationToken = default)
	{
		var analysisResult = new PriceAnalysisResult
		{
			PriceChanges = new List<PriceChangeDetail>(),
			AnalysisDate = DateTime.UtcNow
		};

		// Cache market data by BlueprintId to avoid duplicate API calls
		var marketDataCache = new Dictionary<int, IReadOnlyCollection<MarketProduct>>();
		var semaphore = new SemaphoreSlim(MaxParallelism);
		var lockObj = new object();

		var tasks = itemsBatch.Select(item => ProcessItemAsync(
			item, marketDataCache, semaphore, lockObj, analysisResult, cancellationToken
		));

		await Task.WhenAll(tasks);

		return analysisResult;
	}

	private async Task ProcessItemAsync(
		InventoryProduct item,
		Dictionary<int, IReadOnlyCollection<MarketProduct>> marketDataCache,
		SemaphoreSlim semaphore,
		object lockObj,
		PriceAnalysisResult analysisResult,
		CancellationToken cancellationToken)
	{
		await semaphore.WaitAsync(cancellationToken);
		try
		{
			cancellationToken.ThrowIfCancellationRequested();

			var shouldSkip = _updateStrategiesConfig.DescriptionToSkip.Any() &&
							 item.Description != null &&
							 _updateStrategiesConfig.DescriptionToSkip.Any(skip => item.Description.Contains(skip));

			if (shouldSkip)
			{
				_logger.LogInformation("Skipping item ID: {ItemId} because its description contains a term from DescriptionToSkip", item.Id);
				return;
			}

			_logger.LogInformation("Begin fetch price for Item: {ItemName}", item.NameEn);

			// Check cache for market data by BlueprintId
			IReadOnlyCollection<MarketProduct>? allMarketProducts;
			lock (lockObj)
			{
				marketDataCache.TryGetValue(item.BlueprintId, out allMarketProducts);
			}

			if (allMarketProducts == null)
			{
				var productsOnMarket = await _cardTraderApiClient.Marketplace.GetMarketPlaceProductByBlueprintId(item.BlueprintId);

				if (!productsOnMarket.Values.Any())
				{
					_logger.LogWarning("No market data found for item ID: {ItemId}", item.Id);
					return;
				}

				allMarketProducts = productsOnMarket.Values.First().ToList();
				lock (lockObj)
				{
					marketDataCache.TryAdd(item.BlueprintId, allMarketProducts);
				}
			}

			var filteredProducts = allMarketProducts
				.Where(p => p.PropertiesHash.Condition == item.PropertiesHash?.Condition &&
							 p.PropertiesHash.MtgFoil == item.PropertiesHash.MtgFoil &&
							 item.Expansion != null &&
							 p.Expansion.Id == item.Expansion.Id &&
							 p.PropertiesHash.MtgLanguage == item.PropertiesHash.MtgLanguage)
				.ToList();

			if (filteredProducts.Count == 0)
			{
				_logger.LogWarning("No filtered products found for item ID: {ItemId}", item.Id);
				return;
			}

			var customPrice = _updateStrategiesConfig.UseCustomRules
				? _priceCalculationService.ApplyCustomRules(item, filteredProducts)
				: null;

			decimal basePriceEuros;

			if (customPrice.HasValue)
			{
				basePriceEuros = customPrice.Value;
			}
			else
			{
				try
				{
					basePriceEuros = _priceCalculationService.CalculateBasePrice(filteredProducts, item);
				}
				catch (Exception ex)
				{
					_logger.LogError(ex, "Error calculating base price for item ID: {ItemId}", item.Id);
					return;
				}
			}

			basePriceEuros = Math.Round(basePriceEuros, 2);
			if (Conversion.ConvertToDecimalRatio(item.PriceCents) != basePriceEuros)
			{
				if (item.NameEn != null)
				{
					var priceChange = new PriceChangeDetail(
						item.Id,
						item.NameEn,
						Conversion.ConvertToDecimalRatio(filteredProducts
							.OrderBy(p => p.Price.Cents)
							.First().PriceCents),
						Conversion.ConvertToDecimalRatio(filteredProducts
							.OrderByDescending(p => p.Price.Cents)
							.First().PriceCents),
						Conversion.ConvertToDecimalRatio(StatisticsHelper.Mean(filteredProducts.Select(p => p.Price.Cents).ToList())),
						Conversion.ConvertToDecimalRatio(item.PriceCents),
						basePriceEuros
					);

					lock (lockObj)
					{
						analysisResult.PriceChanges.Add(priceChange);
					}
				}
			}
		}
		catch (OperationCanceledException)
		{
			throw;
		}
		catch (Exception ex)
		{
			_logger.LogError(ex, "Error processing item ID: {ItemId}", item.Id);
		}
		finally
		{
			semaphore.Release();
		}
	}
}