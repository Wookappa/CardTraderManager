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
		/// <param name="cancellationToken">A token to monitor for cancellation requests.</param>
		Task<PriceAnalysisResult> AnalyzeAndPushPriceUpdatesAsync(IReadOnlyCollection<InventoryProduct>? items = null, CancellationToken cancellationToken = default);

		/// <summary>
		/// Retrieves price updates for the specified items.
		/// </summary>
		/// <param name="items"></param>
		/// <param name="cancellationToken"></param>
		/// <returns></returns>
		Task<PriceAnalysisResult> AnalyzePriceUpdatesOnlyAsync(IReadOnlyCollection<InventoryProduct>? items = null,
			CancellationToken cancellationToken = default);

		/// <summary>
		/// Posts price updates to the system.
		/// </summary>
		/// <param name="analysisResult"></param>
		/// <param name="cancellationToken"></param>
		/// <returns></returns>
		Task<PriceAnalysisResult> PushPriceUpdatesOnlyAsync(PriceAnalysisResult analysisResult,
			CancellationToken cancellationToken = default);

		/// <summary>
		/// Extracts items in batches of the specified size.
		/// </summary>
		/// <param name="batchSize">The size of each batch.</param>
		/// <param name="cancellationToken">A token to monitor for cancellation requests.</param>
		/// <returns>A list of batches, where each batch is a list of items.</returns>
		Task<IList<IList<InventoryProduct>>> ExtractBatchOfItems(int batchSize, CancellationToken cancellationToken);

		/// <summary>
		/// Pushes price updates to the system.
		/// </summary>
		/// <param name="analysisResult">The result of the price analysis.</param>
		/// <param name="cancellationToken">A token to monitor for cancellation requests.</param>
		Task PushPriceUpdates(PriceAnalysisResult analysisResult, CancellationToken cancellationToken = default);
	}
}