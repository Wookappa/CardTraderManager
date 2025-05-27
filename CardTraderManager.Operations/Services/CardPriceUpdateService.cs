using CardTraderApi.Client;
using CardTraderApi.Client.Models.Inventory;
using CardTraderManager.Operations.Helpers;
using CardTraderManager.Operations.Interfaces;
using CardTraderManager.Operations.Models;
using Microsoft.Extensions.Logging;
using System.Diagnostics;

namespace CardTraderManager.Operations.Services;

public class CardPriceUpdateService : ICardPriceUpdateService
{
	private readonly CardTraderApiClient _cardTraderApiClient;
	private readonly IMarketDataService _marketDataService;
	private readonly ILogger<CardPriceUpdateService> _logger;

	public CardPriceUpdateService(CardTraderApiClient cardTraderApiClient,
		IMarketDataService marketDataService,
		ILogger<CardPriceUpdateService> logger)
	{
		_cardTraderApiClient = cardTraderApiClient;
		_marketDataService = marketDataService;
		_logger = logger ?? throw new ArgumentNullException(nameof(logger));
	}

	public async Task<PriceAnalysisResult> AnalyzeAndPushPriceUpdatesAsync(IReadOnlyCollection<InventoryProduct>? items = null, CancellationToken cancellationToken = default)
	{
		try
		{
			var totalStopwatch = Stopwatch.StartNew();

			var analysisResult = await _marketDataService.ExtractPriceUpdatesAsync(items, cancellationToken);
			await PushPriceUpdates(analysisResult, cancellationToken);

			totalStopwatch.Stop();

			analysisResult.IsSuccess = true;
			analysisResult.ElapsedTime = totalStopwatch.Elapsed;

			_logger.LogInformation("Total time to process all items: {ElapsedTime}", totalStopwatch.Elapsed);

			return analysisResult;
		}
		catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
		{
			_logger.LogInformation("Price update operation was cancelled");
			return new PriceAnalysisResult { IsSuccess = false, ErrorMessage = "operation was cancelled" };
		}
		catch (Exception ex)
		{
			_logger.LogError(ex, "Error in AnalyzeAndPushPriceUpdatesAsync");
			return new PriceAnalysisResult { IsSuccess = false, ErrorMessage = ex.Message };
		}
	}

	public async Task<PriceAnalysisResult> AnalyzePriceUpdatesOnlyAsync(IReadOnlyCollection<InventoryProduct>? items = null, CancellationToken cancellationToken = default)
	{
		try
		{
			var totalStopwatch = Stopwatch.StartNew();

			var analysisResult = await _marketDataService.ExtractPriceUpdatesAsync(items, cancellationToken);
			analysisResult.IsSuccess = true;

			totalStopwatch.Stop();

			analysisResult.ElapsedTime = totalStopwatch.Elapsed;

			_logger.LogInformation("Total time to process all items: {ElapsedTime}", totalStopwatch.Elapsed);

			return analysisResult;
		}
		catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
		{
			_logger.LogInformation("Get items price operation was cancelled");
			return new PriceAnalysisResult { IsSuccess = false, ErrorMessage = "operation was cancelled" };
		}
		catch (Exception ex)
		{
			_logger.LogError(ex, "Error in AnalyzePriceUpdatesOnlyAsync");
			return new PriceAnalysisResult { IsSuccess = false, ErrorMessage = ex.Message };
		}
	}

	public async Task<PriceAnalysisResult> PushPriceUpdatesOnlyAsync(PriceAnalysisResult analysisResult, CancellationToken cancellationToken = default)
	{
		try
		{
			var totalStopwatch = Stopwatch.StartNew();

			await PushPriceUpdates(analysisResult, cancellationToken);

			totalStopwatch.Stop();

			analysisResult.IsSuccess = true;
			analysisResult.ElapsedTime = totalStopwatch.Elapsed;

			_logger.LogInformation("Total time to process all items: {ElapsedTime}", totalStopwatch.Elapsed);

			return analysisResult;
		}
		catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
		{
			_logger.LogInformation("Price update operation was cancelled");
			return new PriceAnalysisResult { IsSuccess = false, ErrorMessage = "operation was cancelled" };
		}
		catch (Exception ex)
		{
			_logger.LogError(ex, "Error in AnalyzeAndPushPriceUpdatesAsync");
			return new PriceAnalysisResult { IsSuccess = false, ErrorMessage = ex.Message };
		}
	}


	public async Task<IList<IList<InventoryProduct>>> ExtractBatchOfItems(int batchSize, CancellationToken cancellationToken)
	{
		// Fetch the list of products
		var listedProducts = await _cardTraderApiClient.Inventory.GetUserProducts();

		// Use the Batch extension method to split the list into batches
		var listOfBatches = listedProducts.Batch(batchSize).ToList();

		// Return the list of batches
		return listOfBatches;
	}

	public async Task PushPriceUpdates(PriceAnalysisResult analysisResult, CancellationToken cancellationToken)
	{
		foreach (var changeDetail in analysisResult.PriceChanges)
		{
			try
			{
				var updateSuccessful = await _cardTraderApiClient.Inventory.Update(changeDetail.ItemId, changeDetail.NewPrice);

				if (updateSuccessful != null)
				{
					changeDetail.Updated = true;

					changeDetail.Warning = string.Join(", ", updateSuccessful.Warnings.Properties
						.SelectMany(warning => warning.Value.Select(message => $"{warning.Key}: {message}")));

					if (!string.IsNullOrEmpty(changeDetail.Warning))
					{
						_logger.LogWarning("Warnings for item ID: {ItemId} - {Warnings}", changeDetail.ItemId, changeDetail.Warning);
					}

					_logger.LogInformation("Price updated successfully for item ID: {ItemName} from {OldPrice} to {NewPrice} euros.",
						changeDetail.CardName, changeDetail.OldPrice, changeDetail.NewPrice);
				}
			}
			catch (OperationCanceledException)
			{
				throw;
			}
			catch (CardTraderApiException e)
			{
				Console.WriteLine(e);
				_logger.LogError("Failed to update price for item ID: {ItemId}", changeDetail.ItemId);
				throw;
			}
		}

		_logger.LogInformation("Price update push completed. Updated prices: {PriceChangesCount}", analysisResult.PriceChanges.Count);
	}
}