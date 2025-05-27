using CardTraderApi.Client;
using CardTraderManager.Api.WebSocketLogs;
using CardTraderManager.Common;
using CardTraderManager.Common.Interfaces;
using CardTraderManager.Common.Models.Settings.Validators;
using CardTraderManager.Operations.Interfaces;
using CardTraderManager.Operations.Services;
using FluentValidation;
using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// ➡️ ConcurrentBag per gestire i WebSocket attivi
var webSocketConnections = new ConcurrentBag<WebSocket>();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Enable CORS
builder.Services.AddCors(options =>
{
	options.AddPolicy("AllowAll",
		policyBuilder =>
		{
			policyBuilder.AllowAnyOrigin()
				   .AllowAnyMethod()
				   .AllowAnyHeader();
		});
});

// Dependency Injection

// Load configuration from appsettings.json
var configuration = new ConfigurationBuilder()
	.SetBasePath(Directory.GetCurrentDirectory())
	.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
	.Build();

// Register configuration for dependency injection
builder.Services.AddSingleton<IConfiguration>(configuration);

// Configure HttpClient for ICardPriceApiClient
builder.Services.AddScoped<CardTraderApiClientConfig>(_ =>
{
	var config = CardTraderApiClientConfig.GetDefault();
	return config;
});

builder.Services.AddCardTraderApiClient(String.Empty);

// Register all validators EXCEPT StrategyConfigValidator (since it requires runtime params)
builder.Services.AddValidatorsFromAssemblyContaining<ApplicationSettingsValidator>(filter:
	scanResult => scanResult.ValidatorType != typeof(StrategyConfigValidator)
);

// Configure ISettingsProvider to provide configuration settings
builder.Services.AddSingleton<ISettingsProvider, SettingsProvider>();

builder.Services.AddScoped<ICardPriceUpdateService, CardPriceUpdateService>();
builder.Services.AddScoped<IMarketDataService, MarketDataService>();
builder.Services.AddScoped<IPriceAnalysisService, PriceAnalysisService>();
builder.Services.AddScoped<IPriceCalculationService, PriceCalculationService>();

builder.Services.AddControllers()
	.AddJsonOptions(options =>
	{
		options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
	});

// ➡️ Aggiungi il WebSocketLoggerProvider
builder.Services.AddSingleton(webSocketConnections);
builder.Services.AddLogging(loggingBuilder =>
{
	loggingBuilder.AddConsole();
	loggingBuilder.AddProvider(new WebSocketLoggerProvider(webSocketConnections));
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
	app.UseSwagger();
	app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

// ➡️ **WebSocket Middleware per lo streaming dei log**
app.UseWebSockets();
app.Use(async (context, next) =>
{
	if (context.Request.Path == "/logs")
	{
		if (context.WebSockets.IsWebSocketRequest)
		{
			var webSocket = await context.WebSockets.AcceptWebSocketAsync();
			webSocketConnections.Add(webSocket);
			Console.WriteLine("✅ WebSocket Connection Established.");

			while (webSocket.State == WebSocketState.Open)
			{
				await Task.Delay(1000); // Mantieni aperta la connessione
			}
		}
		else
		{
			context.Response.StatusCode = 400;
		}
	}
	else
	{
		await next();
	}
});

app.Run();
