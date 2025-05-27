namespace CardTraderManager.Common.Models.Settings
{
	public class ApplicationSettings
	{
		public ApiSettings ApiSettings { get; set; } = new ApiSettings();
		public PriceProtectionSettings PriceProtectionSettings { get; set; } = new PriceProtectionSettings();
		public UpdateStrategiesConfig UpdateStrategiesConfig { get; set; } = new UpdateStrategiesConfig();
	}
}
