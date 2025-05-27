using CardTraderApi.Client.Models.Inventory;
using CardTraderManager.Operations.Models;

namespace CardTraderManager.Operations.Interfaces
{
	public interface IMarketDataService
	{
		Task<PriceAnalysisResult> ExtractPriceUpdatesAsync(IReadOnlyCollection<InventoryProduct>? items = null, CancellationToken cancellationToken = default);
	}
}