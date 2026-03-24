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
	private readonly IPriceAnalysisService _priceAnalysisService;
	private readonly ILogger<CardPriceUpdateService> _logger;

	public CardPriceUpdateService(CardTraderApiClient cardTraderApiClient,
		IPriceAnalysisService priceAnalysisService,
		ILogger<CardPriceUpdateService> logger)
	{
		_cardTraderApiClient = cardTraderApiClient;
		_priceAnalysisService = priceAnalysisService;
		_logger = logger ?? throw new ArgumentNullException(nameof(logger));
	}

	public Task<PriceAnalysisResult> AnalyzeAndPushPriceUpdatesAsync(
		IReadOnlyCollection<InventoryProduct>? items = null,
		CancellationToken cancellationToken = default)
	{
		return ExecuteWithTimingAsync(async ct =>
		{
			var analysisResult = await ExtractPriceUpdatesAsync(items, ct);
			await PushPriceUpdates(analysisResult, ct);
			return analysisResult;
		}, cancellationToken);
	}

	public Task<PriceAnalysisResult> AnalyzePriceUpdatesOnlyAsync(
		IReadOnlyCollection<InventoryProduct>? items = null,
		CancellationToken cancellationToken = default)
	{
		return ExecuteWithTimingAsync(
			async ct => await ExtractPriceUpdatesAsync(items, ct),
			cancellationToken);
	}

	public Task<PriceAnalysisResult> PushPriceUpdatesOnlyAsync(
		PriceAnalysisResult analysisResult,
		CancellationToken cancellationToken = default)
	{
		return ExecuteWithTimingAsync(async ct =>
		{
			await PushPriceUpdates(analysisResult, ct);
			return analysisResult;
		}, cancellationToken);
	}

	public async Task<IList<IList<InventoryProduct>>> ExtractBatchOfItems(int batchSize, CancellationToken cancellationToken)
	{
		var listedProducts = await _cardTraderApiClient.Inventory.GetUserProducts();
		return listedProducts.Batch(batchSize).ToList();
	}

	public async Task PushPriceUpdates(PriceAnalysisResult analysisResult, CancellationToken cancellationToken)
	{
		var failedItems = new List<(int ItemId, string Error)>();

		foreach (var changeDetail in analysisResult.PriceChanges)
		{
			try
			{
				cancellationToken.ThrowIfCancellationRequested();

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
			catch (Exception e)
			{
				_logger.LogError(e, "Failed to update price for item ID: {ItemId}", changeDetail.ItemId);
				failedItems.Add((changeDetail.ItemId, e.Message));
			}
		}

		var updatedCount = analysisResult.PriceChanges.Count(p => p.Updated);
		_logger.LogInformation("Price update push completed. Updated: {UpdatedCount}/{TotalCount}",
			updatedCount, analysisResult.PriceChanges.Count);

		if (failedItems.Count > 0)
		{
			_logger.LogWarning("Failed to update {FailedCount} items: {FailedItems}",
				failedItems.Count, string.Join(", ", failedItems.Select(f => $"#{f.ItemId}: {f.Error}")));
		}
	}

	private async Task<PriceAnalysisResult> ExtractPriceUpdatesAsync(
		IReadOnlyCollection<InventoryProduct>? items,
		CancellationToken cancellationToken)
	{
		var listedProducts = items ?? await _cardTraderApiClient.Inventory.GetUserProducts();
		return await _priceAnalysisService.CalculateAnalysisResult(listedProducts, cancellationToken);
	}

	private async Task<PriceAnalysisResult> ExecuteWithTimingAsync(
		Func<CancellationToken, Task<PriceAnalysisResult>> operation,
		CancellationToken cancellationToken)
	{
		try
		{
			var stopwatch = Stopwatch.StartNew();

			var result = await operation(cancellationToken);

			stopwatch.Stop();
			result.IsSuccess = true;
			result.ElapsedTime = stopwatch.Elapsed;

			_logger.LogInformation("Operation completed in {ElapsedTime}", stopwatch.Elapsed);

			return result;
		}
		catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
		{
			_logger.LogInformation("Operation was cancelled");
			return new PriceAnalysisResult { IsSuccess = false, ErrorMessage = "Operation was cancelled" };
		}
		catch (Exception ex)
		{
			_logger.LogError(ex, "Operation failed");
			return new PriceAnalysisResult { IsSuccess = false, ErrorMessage = ex.Message };
		}
	}
}