
using CardTraderManager.Common.Models.Settings;

namespace CardTraderManager.Common.Interfaces
{
	public interface ISettingsProvider
	{
		ApiSettings GetApiSettings();
		PriceProtectionSettings GetPriceProtectionSettings();
		UpdateStrategiesConfig GetUpdateStrategiesSettings();
		void UpdateSettings(ApplicationSettings newSettings);

		event Action? OnSettingsUpdated;
	}
}
