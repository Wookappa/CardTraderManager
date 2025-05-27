using Azure.Storage.Queues;
using CardTraderApi.Client;
using CardTraderManager.Common;
using CardTraderManager.Common.Interfaces;
using CardTraderManager.Common.Models.Settings.Validators;
using CardTraderManager.Operations.Interfaces;
using CardTraderManager.Operations.Services;
using FluentValidation;
using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = FunctionsApplication.CreateBuilder(args);

builder.Services.AddSingleton(_ =>
{
	var connectionString = builder.Configuration["AzureWebJobsStorage"];
	return new QueueServiceClient(connectionString);
});

// Register API client with JWT token
builder.Services.AddCardTraderApiClient(builder.Configuration["ApplicationSettings:ApiSettings:CardTrader:JWTToken"]);

// Register business services
builder.Services.AddScoped<ICardPriceUpdateService, CardPriceUpdateService>();
builder.Services.AddScoped<IMarketDataService, MarketDataService>();
builder.Services.AddScoped<IPriceAnalysisService, PriceAnalysisService>();
builder.Services.AddScoped<IPriceCalculationService, PriceCalculationService>();

// Register settings provider
builder.Services.AddSingleton<ISettingsProvider, SettingsProvider>();


// Register FluentValidation validators (excluding StrategyConfigValidator)
builder.Services.AddValidatorsFromAssemblyContaining<ApplicationSettingsValidator>(filter:
	scanResult => scanResult.ValidatorType != typeof(StrategyConfigValidator)
);

// Configure the function app
builder.ConfigureFunctionsWebApplication();

// Build and run the app
builder.Build().Run();