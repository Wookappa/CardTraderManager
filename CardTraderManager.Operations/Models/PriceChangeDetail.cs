namespace CardTraderManager.Operations.Models
{
	public class PriceChangeDetail
	{
		public int ItemId { get; set; }
		public string? CardName { get; set; }
		public decimal MinPrice { get; set; }
		public decimal MaxPrice { get; set; }
		public decimal Median { get; set; }
		public decimal OldPrice { get; set; }
		public decimal NewPrice { get; set; }
		public decimal PriceChange => NewPrice - OldPrice;
		public bool Updated { get; set; }
		public string? Warning { get; set; }

		public PriceChangeDetail(int itemId, string? cardName, decimal minPrice, decimal maxPrice, decimal median,
			decimal oldPrice, decimal newPrice, string? warning = null)
		{
			ItemId = itemId;
			CardName = cardName;
			MinPrice = minPrice;
			MaxPrice = maxPrice;
			Median = median;
			OldPrice = oldPrice;
			NewPrice = newPrice;
			Warning = warning;
		}
	}
}
