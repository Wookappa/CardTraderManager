using CardTraderManager.Common.Models.Settings;

namespace CardTraderManager.Api.Wrappers
{
	public class StartPriceUpdateRequest
	{
		public StartPriceUpdateRequest(ApplicationSettings applicationSettings)
		{
			ApplicationSettings = applicationSettings;
		}

		public ApplicationSettings ApplicationSettings { get; set; }
	}
}
