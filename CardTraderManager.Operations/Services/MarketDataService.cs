using CardTraderApi.Client;
using CardTraderApi.Client.Models.Inventory;
using CardTraderManager.Operations.Interfaces;
using CardTraderManager.Operations.Models;
using Microsoft.Extensions.Logging;

namespace CardTraderManager.Operations.Services;

public class MarketDataService : IMarketDataService
{
	private readonly CardTraderApiClient _cardTraderApiClient;
	private readonly IPriceAnalysisService _priceAnalysisService;
	private readonly ILogger<MarketDataService> _logger;

	public MarketDataService(CardTraderApiClient cardTraderApiService, IPriceAnalysisService priceAnalysisService, ILogger<MarketDataService> logger)
	{
		_cardTraderApiClient = cardTraderApiService;
		_priceAnalysisService = priceAnalysisService;
		_logger = logger;
	}

	public async Task<PriceAnalysisResult> ExtractPriceUpdatesAsync(IReadOnlyCollection<InventoryProduct>? items = null, CancellationToken cancellationToken = default)
	{
		var analysisResult = new PriceAnalysisResult();

		try
		{
			var listedProducts = items ?? await _cardTraderApiClient.Inventory.GetUserProducts();

			analysisResult = await _priceAnalysisService.CalculateAnalysisResult(listedProducts, cancellationToken);
		}
		catch (OperationCanceledException)
		{
			throw;
		}
		catch (Exception ex)
		{
			_logger.LogError(ex, "Error in ExtractPriceUpdatesAsync");
		}

		return analysisResult; // Return the analysis result containing all price changes
	}
}