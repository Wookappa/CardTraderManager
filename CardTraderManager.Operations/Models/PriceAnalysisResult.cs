namespace CardTraderManager.Operations.Models
{
	public class PriceAnalysisResult
	{
		public List<PriceChangeDetail> PriceChanges { get; set; } = new();
		public bool IsSuccess { get; set; }
		public string? ErrorMessage { get; set; }
		public TimeSpan ElapsedTime { get; set; }
		public DateTime AnalysisDate { get; set; } = DateTime.UtcNow;
	}
}
