using CardTraderApi.Client.Models.Inventory;
using CardTraderManager.Operations.Models;

namespace CardTraderManager.Operations.Interfaces
{
	public interface ICardPriceUpdateService
	{
		/// <summary>
		/// Updates the prices of the specified items.
		/// </summary>
		/// <param name="items">The list of items to update. If null, all items will be processed.</param>
		/// <param name="filters">Optional filters to apply before analysis.</param>
		/// <param name="cancellationToken">A token to monitor for cancellation requests.</param>
		Task<PriceAnalysisResult> AnalyzeAndPushPriceUpdatesAsync(IReadOnlyCollection<InventoryProduct>? items = null, AnalysisFilters? filters = null, CancellationToken cancellationToken = default);

		/// <summary>
		/// Retrieves price updates for the specified items.
		/// </summary>
		Task<PriceAnalysisResult> AnalyzePriceUpdatesOnlyAsync(IReadOnlyCollection<InventoryProduct>? items = null,
			AnalysisFilters? filters = null, CancellationToken cancellationToken = default);

		/// <summary>
		/// Posts price updates to the system.
		/// </summary>
		Task<PriceAnalysisResult> PushPriceUpdatesOnlyAsync(PriceAnalysisResult analysisResult,
			CancellationToken cancellationToken = default);

		/// <summary>
		/// Extracts items in batches of the specified size.
		/// </summary>
		Task<IList<IList<InventoryProduct>>> ExtractBatchOfItems(int batchSize, CancellationToken cancellationToken);

		/// <summary>
		/// Pushes price updates to the system.
		/// </summary>
		Task PushPriceUpdates(PriceAnalysisResult analysisResult, CancellationToken cancellationToken = default);
	}
}