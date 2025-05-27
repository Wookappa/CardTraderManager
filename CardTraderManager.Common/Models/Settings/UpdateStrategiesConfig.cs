namespace CardTraderManager.Common.Models.Settings
{
	public class UpdateStrategiesConfig
	{
		public string DescriptionToSkip { get; set; } = "";
		public bool AlwaysBelowCardTraderZero { get; set; }
		public bool UseCustomRules { get; set; } // Indicates if custom rules are used
		public string PriceAdjustmentStrategy { get; set; } = "Moderate"; // Default strategy
		public Enums.PriceAdjustmentType PriceAdjustmentType { get; set; } = Enums.PriceAdjustmentType.Percentage; // Default adjustment type
		public List<CustomRule> CustomRules { get; set; } = new List<CustomRule>(); // List of custom rules
		public Dictionary<string, StrategyConfig> Strategies { get; set; } = new Dictionary<string, StrategyConfig>();
	}
}
