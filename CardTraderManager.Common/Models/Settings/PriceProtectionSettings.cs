namespace CardTraderManager.Common.Models.Settings
{
	public class PriceProtectionSettings
	{
		public bool UsePriceProtection { get; set; }
		public int MaxPriceDropPercentage { get; set; }
		public int MinimumMarketListings { get; set; }
		public Enums.MarketAverage MarketAverage { get; set; } = Enums.MarketAverage.Median; // Default average type for the strategy
		public int TrimPercentage { get; set; }
		public decimal PriceDifferenceThreshold { get; set; }
	}
}
