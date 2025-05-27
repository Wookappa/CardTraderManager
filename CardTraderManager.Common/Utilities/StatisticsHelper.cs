namespace CardTraderManager.Common.Utilities
{
	public class StatisticsHelper
	{
		public static decimal Mean(List<int> prices)
		{
			return prices.Count == 0 ? 0 : prices.Average(p => (decimal)p);
		}

		public static decimal TrimmedMean(List<int> prices, decimal trimFraction = 0.1m)
		{
			if (prices.Count == 0) return 0;

			var sortedPrices = prices.OrderBy(p => p).ToList();
			var trimCount = (int)(sortedPrices.Count * trimFraction);

			var trimmedPrices = sortedPrices.Skip(trimCount).Take(sortedPrices.Count - 2 * trimCount).ToList();
			return trimmedPrices.Any() ? trimmedPrices.Average(p => (decimal)p) : 0;
		}

		public static decimal Median(List<int> prices)
		{
			if (prices.Count == 0) return 0;

			var sortedPrices = prices.OrderBy(p => p).ToList();
			var midIndex = sortedPrices.Count / 2;

			if (sortedPrices.Count % 2 == 0)
			{
				return ((decimal)sortedPrices[midIndex - 1] + sortedPrices[midIndex]) / 2;
			}
			else
			{
				return sortedPrices[midIndex];
			}
		}

		public static decimal Percentile(List<int> prices, decimal percentile)
		{
			if (prices.Count == 0) return 0;

			var sortedPrices = prices.OrderBy(p => p).ToList();
			var rank = (percentile / 100) * (sortedPrices.Count - 1);
			var lowerIndex = (int)rank;
			var fractionalPart = rank - lowerIndex;

			if (lowerIndex + 1 < sortedPrices.Count)
			{
				return sortedPrices[lowerIndex] + fractionalPart * (sortedPrices[lowerIndex + 1] - sortedPrices[lowerIndex]);
			}
			else
			{
				return sortedPrices[lowerIndex];
			}
		}
	}
}
