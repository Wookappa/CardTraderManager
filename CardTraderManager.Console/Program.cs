using CardTraderApi.Client;
using CardTraderManager.Common;
using CardTraderManager.Common.Interfaces;
using CardTraderManager.Common.Models.Settings.Validators;
using CardTraderManager.Operations.Interfaces;
using CardTraderManager.Operations.Services;
using FluentValidation;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace CardTraderManager.Console
{
	class Program
	{
		static async Task Main()
		{
			try
			{
				// Configure services and logging
				var services = new ServiceCollection();

				// Load configuration from appsettings.json
				var configuration = new ConfigurationBuilder()
					.SetBasePath(Directory.GetCurrentDirectory())
					.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
					.Build();

				// Register configuration for dependency injection
				services.AddSingleton<IConfiguration>(configuration);

				// Configure HttpClient for ICardPriceApiClient
				services.AddCardTraderApiClient(configuration["ApplicationSettings:ApiSettings:CardTrader:JWTToken"]);

				// Configure ISettingsProvider to provide configuration settings
				services.AddSingleton<ISettingsProvider, SettingsProvider>();
				services.AddValidatorsFromAssemblyContaining<ApplicationSettingsValidator>(filter:
					scanResult => scanResult.ValidatorType != typeof(StrategyConfigValidator)
				);

				services.AddSingleton<ICardPriceUpdateService, CardPriceUpdateService>();
				services.AddSingleton<IMarketDataService, MarketDataService>();
				services.AddSingleton<IPriceAnalysisService, PriceAnalysisService>();
				services.AddSingleton<IPriceCalculationService, PriceCalculationService>();

				// Set up logging to console
				services.AddLogging(configure => configure.AddConsole());

				// Build the ServiceProvider
				var serviceProvider = services.BuildServiceProvider();

				// Resolve and use ICardPriceUpdateService
				var priceOperations = serviceProvider.GetRequiredService<ICardPriceUpdateService>();

				try
				{
					// Call the method to update prices
					await priceOperations.AnalyzeAndPushPriceUpdatesAsync();

					System.Console.WriteLine("Prices updated successfully.");
				}
				catch (Exception ex)
				{
					System.Console.WriteLine($"An error occurred while updating prices: {ex.Message}");
				}
			}
			catch (Exception ex)
			{
				System.Console.WriteLine($"An error occurred during application setup: {ex.Message}");
			}
		}
	}
}
