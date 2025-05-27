using CardTraderApi.Client.Models.Inventory;
using CardTraderManager.Operations.Models;

namespace CardTraderManager.Operations.Interfaces
{
	public interface IPriceAnalysisService
	{
		Task<PriceAnalysisResult> CalculateAnalysisResult(IReadOnlyCollection<InventoryProduct> itemsBatch, CancellationToken cancellationToken = default);
	}
}