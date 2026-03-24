using CardTraderManager.Common;
using CardTraderManager.Common.Interfaces;
using CardTraderManager.Common.Models.Settings.Validators;
using CardTraderManager.Operations.Interfaces;
using CardTraderManager.Operations.Services;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace CardTraderManager.Operations.Extensions;

public static class ServiceCollectionExtensions
{
	/// <summary>
	/// Registers all CardTraderManager business services, settings provider, and validators.
	/// </summary>
	public static IServiceCollection AddCardTraderManagerServices(this IServiceCollection services)
	{
		// Settings provider (singleton - shared configuration state)
		services.AddSingleton<ISettingsProvider, SettingsProvider>();

		// FluentValidation validators (except StrategyConfigValidator which requires runtime params)
		services.AddValidatorsFromAssemblyContaining<ApplicationSettingsValidator>(filter:
			scanResult => scanResult.ValidatorType != typeof(StrategyConfigValidator)
		);

		// Business services
		services.AddScoped<ICardPriceUpdateService, CardPriceUpdateService>();
		services.AddScoped<IPriceAnalysisService, PriceAnalysisService>();
		services.AddScoped<IPriceCalculationService, PriceCalculationService>();

		return services;
	}
}
