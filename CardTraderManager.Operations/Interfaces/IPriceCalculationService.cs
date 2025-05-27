using CardTraderApi.Client.Models.Inventory;
using CardTraderApi.Client.Models.Marketplace;

namespace CardTraderManager.Operations.Interfaces
{
	public interface IPriceCalculationService
	{
		decimal? ApplyCustomRules(InventoryProduct item, IReadOnlyCollection<MarketProduct> filteredProducts);

		Task<decimal> CalculateBasePrice(IReadOnlyCollection<MarketProduct> filteredProducts,
			InventoryProduct item);
	}
}