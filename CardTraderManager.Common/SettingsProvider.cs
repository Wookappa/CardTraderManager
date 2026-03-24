using CardTraderManager.Common.Interfaces;
using CardTraderManager.Common.Models.Settings;
using FluentValidation;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CardTraderManager.Common
{
	public class SettingsProvider : ISettingsProvider
	{
		private volatile ApplicationSettings _applicationSettings;
		private readonly IServiceScopeFactory _serviceScopeFactory;

		public event Action? OnSettingsUpdated;

		public SettingsProvider(IConfiguration configuration, IServiceScopeFactory serviceScopeFactory)
		{
			_serviceScopeFactory = serviceScopeFactory;

			// Load the entire ApplicationSettings from IConfiguration or fallback
			_applicationSettings = GetConfiguration<ApplicationSettings>(configuration, nameof(ApplicationSettings));

			// Perform validation at startup
			ValidateSettings(_applicationSettings);
		}

		// Generic method to retrieve configuration, with fallback to local config if not found
		private static T GetConfiguration<T>(IConfiguration configuration, string sectionName) where T : class
		{
			return configuration.GetSection(sectionName).Get<T>()
				   ?? LoadFromLocalConfig<T>(sectionName);
		}

		// Fallback to local configuration if necessary
		private static T LoadFromLocalConfig<T>(string sectionName) where T : class
		{
			var localConfig = new ConfigurationBuilder()
				.SetBasePath(Directory.GetCurrentDirectory())
				.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
				.Build();

			return localConfig.GetSection(sectionName).Get<T>()
				   ?? throw new InvalidOperationException($"{sectionName} cannot be null.");
		}

		// Method to validate settings
		private void ValidateSettings(ApplicationSettings settings)
		{
			// Create a temporary scope to resolve the validator
			using var scope = _serviceScopeFactory.CreateScope();
			var validator = scope.ServiceProvider.GetRequiredService<IValidator<ApplicationSettings>>();

			var validationResult = validator.Validate(settings);

			if (!validationResult.IsValid)
			{
				var validationErrors = validationResult.Errors.Select(error => new
				{
					Field = error.PropertyName,
					Message = error.ErrorMessage
				}).ToList();

				var formattedErrors = string.Join(Environment.NewLine,
					validationErrors.Select(e => $"[Field: {e.Field}] -> {e.Message}"));

				throw new ValidationException($"Validation failed:\n{formattedErrors}");
			}
		}

		// Directly access properties from ApplicationSettings
		public ApiSettings GetApiSettings() => _applicationSettings.ApiSettings;

		public UpdateStrategiesConfig GetUpdateStrategiesSettings() => _applicationSettings.UpdateStrategiesConfig;

		public PriceProtectionSettings GetPriceProtectionSettings() => _applicationSettings.PriceProtectionSettings;

		public void UpdateSettings(ApplicationSettings newSettings)
		{
			ValidateSettings(newSettings); // Validate before updating
			_applicationSettings = newSettings;
			OnSettingsUpdated?.Invoke();
		}
	}
}
