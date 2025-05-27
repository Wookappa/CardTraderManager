namespace CardTraderManager.Common.Models.Settings
{
	public class StrategyConfig
	{
		public Enums.MarketAverage MarketAverage { get; set; } = Enums.MarketAverage.Median; // Default average type for the strategy
		public decimal TrimFraction { get; set; } = 0.1m;
		public int? LowestPriceIndex { get; set; } // Lowest price index to use for adjustment
		public decimal? PercentageAdjustment { get; set; } // Percentage adjustment
		public decimal? FixedAdjustment { get; set; } // Fixed price for the card, if applicable
	}
}
