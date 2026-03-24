using Azure.Storage.Queues;
using CardTraderApi.Client;
using CardTraderManager.Operations.Extensions;
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

// Register all business services, validators, and settings provider
builder.Services.AddCardTraderManagerServices();

// Configure the function app
builder.ConfigureFunctionsWebApplication();

// Build and run the app
builder.Build().Run();