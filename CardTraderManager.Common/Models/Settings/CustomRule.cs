namespace CardTraderManager.Common.Models.Settings
{
	public class CustomRule : StrategyConfig
	{
		public string Condition { get; set; } = string.Empty;
		public string ItemName { get; set; } = string.Empty;
		public decimal? MinPriceRange { get; set; } // Minimum price in the range, if applicable
		public decimal? MaxPriceRange { get; set; } // Maximum price in the range, if applicable
		public decimal? MinAllowedPrice { get; set; } // Minimum allowed price
		public Enums.PriceAdjustmentType PriceAdjustmentType { get; set; } = Enums.PriceAdjustmentType.Percentage; // Default to PercentageAdjustment
	}
}