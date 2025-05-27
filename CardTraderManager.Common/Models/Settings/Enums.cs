namespace CardTraderManager.Common.Models.Settings
{
	public static class Enums
	{
		public enum PriceAdjustmentType
		{
			LowestPriceIndex,
			FixedPrice,
			Percentage,
			FixedAdjustment
		}

		public enum MarketAverage
		{
			Mean,
			Median,
			TrimmedMean,
			Percentile,
		}
	}
}