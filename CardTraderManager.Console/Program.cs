using CardTraderApi.Client;
using CardTraderManager.Operations.Extensions;
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
				var services = new ServiceCollection();

				var configuration = new ConfigurationBuilder()
					.SetBasePath(Directory.GetCurrentDirectory())
					.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
					.Build();

				services.AddSingleton<IConfiguration>(configuration);
				services.AddCardTraderApiClient(configuration["ApplicationSettings:ApiSettings:CardTrader:JWTToken"]);
				services.AddCardTraderManagerServices();
				services.AddLogging(configure => configure.AddConsole());

				await using var serviceProvider = services.BuildServiceProvider();
				using var scope = serviceProvider.CreateScope();

				var priceOperations = scope.ServiceProvider.GetRequiredService<Operations.Interfaces.ICardPriceUpdateService>();

				try
				{
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
