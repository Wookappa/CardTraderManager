using CardTraderApi.Client;
using CardTraderApi.Client.Models.Inventory;
using CardTraderManager.Common.Utilities;
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
		AnalysisFilters? filters = null,
		CancellationToken cancellationToken = default)
	{
		return ExecuteWithTimingAsync(async ct =>
		{
			var analysisResult = await ExtractPriceUpdatesAsync(items, filters, ct);
			await PushPriceUpdates(analysisResult, ct);
			return analysisResult;
		}, cancellationToken);
	}

	public Task<PriceAnalysisResult> AnalyzePriceUpdatesOnlyAsync(
		IReadOnlyCollection<InventoryProduct>? items = null,
		AnalysisFilters? filters = null,
		CancellationToken cancellationToken = default)
	{
		return ExecuteWithTimingAsync(
			async ct => await ExtractPriceUpdatesAsync(items, filters, ct),
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
		AnalysisFilters? filters,
		CancellationToken cancellationToken)
	{
		var listedProducts = items ?? await _cardTraderApiClient.Inventory.GetUserProducts();

		if (filters != null && filters.HasAnyFilter)
		{
			var filtered = ApplyFilters(listedProducts, filters);
			_logger.LogInformation("Filters applied: {OriginalCount} → {FilteredCount} items",
				listedProducts.Count, filtered.Count);
			listedProducts = filtered;
		}

		return await _priceAnalysisService.CalculateAnalysisResult(listedProducts, cancellationToken);
	}

	private static IReadOnlyCollection<InventoryProduct> ApplyFilters(
		IReadOnlyCollection<InventoryProduct> items, AnalysisFilters filters)
	{
		IEnumerable<InventoryProduct> query = items;

		if (filters.MinPrice.HasValue)
		{
			var minCents = filters.MinPrice.Value;
			query = query.Where(i => Conversion.ConvertToDecimalRatio(i.PriceCents) >= minCents);
		}

		if (filters.MaxPrice.HasValue)
		{
			var maxCents = filters.MaxPrice.Value;
			query = query.Where(i => Conversion.ConvertToDecimalRatio(i.PriceCents) <= maxCents);
		}

		if (!string.IsNullOrWhiteSpace(filters.CardName))
		{
			query = query.Where(i => i.NameEn != null &&
				i.NameEn.Contains(filters.CardName, StringComparison.OrdinalIgnoreCase));
		}

		if (filters.Conditions is { Count: > 0 })
		{
			var conditionSet = new HashSet<string>(filters.Conditions, StringComparer.OrdinalIgnoreCase);
			query = query.Where(i => i.PropertiesHash?.Condition != null &&
				conditionSet.Contains(i.PropertiesHash.Condition));
		}

		if (filters.ExpansionIds is { Count: > 0 })
		{
			var expansionSet = new HashSet<int>(filters.ExpansionIds);
			query = query.Where(i => i.Expansion != null && expansionSet.Contains(i.Expansion.Id));
		}

		if (filters.IsFoil.HasValue)
		{
			query = query.Where(i => i.PropertiesHash?.MtgFoil == filters.IsFoil.Value);
		}

		return query.ToList().AsReadOnly();
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