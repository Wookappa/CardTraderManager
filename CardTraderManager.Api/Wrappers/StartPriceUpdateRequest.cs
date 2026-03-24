using CardTraderManager.Common.Models.Settings;
using CardTraderManager.Operations.Models;

namespace CardTraderManager.Api.Wrappers
{
	public class StartPriceUpdateRequest
	{
		public StartPriceUpdateRequest(ApplicationSettings applicationSettings)
		{
			ApplicationSettings = applicationSettings;
		}

		public ApplicationSettings ApplicationSettings { get; set; }

		public AnalysisFilters? Filters { get; set; }
	}
}
