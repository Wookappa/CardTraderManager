using CardTraderApi.Client;
using CardTraderManager.Api.WebSocketLogs;
using CardTraderManager.Operations.Extensions;
using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;
using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// WebSocket connection manager
var webSocketConnections = new ConcurrentDictionary<string, WebSocket>();

// Add services to the container
builder.Services.AddControllers()
	.AddJsonOptions(options =>
	{
		options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
	});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHealthChecks();

// CORS - restrict to known origins
builder.Services.AddCors(options =>
{
	options.AddPolicy("AllowFrontend",
		policyBuilder =>
		{
			var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
								?? ["http://localhost:8080", "http://localhost:5173"];

			policyBuilder.WithOrigins(allowedOrigins)
				.AllowAnyMethod()
				.AllowAnyHeader();
		});
});

// Load configuration from appsettings.json
var configuration = new ConfigurationBuilder()
	.SetBasePath(Directory.GetCurrentDirectory())
	.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
	.Build();

builder.Services.AddSingleton<IConfiguration>(configuration);

// Configure HttpClient for CardTrader API
builder.Services.AddScoped<CardTraderApiClientConfig>(_ => CardTraderApiClientConfig.GetDefault());
builder.Services.AddCardTraderApiClient(string.Empty);

// Register all business services, validators, and settings provider
builder.Services.AddCardTraderManagerServices();

// WebSocket logger
builder.Services.AddSingleton(webSocketConnections);
builder.Services.AddLogging(loggingBuilder =>
{
	loggingBuilder.AddConsole();
	loggingBuilder.AddProvider(new WebSocketLoggerProvider(webSocketConnections));
});

var app = builder.Build();

// Global exception handler
app.UseExceptionHandler(errorApp =>
{
	errorApp.Run(async context =>
	{
		context.Response.StatusCode = 500;
		context.Response.ContentType = "application/json";

		var exceptionFeature = context.Features.Get<IExceptionHandlerFeature>();
		if (exceptionFeature != null)
		{
			var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
			logger.LogError(exceptionFeature.Error, "Unhandled exception");

			await context.Response.WriteAsJsonAsync(new
			{
				error = exceptionFeature.Error.Message,
				type = exceptionFeature.Error.GetType().Name
			});
		}
	});
});

// Swagger in development
if (app.Environment.IsDevelopment())
{
	app.UseSwagger();
	app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseAuthorization();

// WebSocket middleware BEFORE MapControllers
app.UseWebSockets(new WebSocketOptions
{
	KeepAliveInterval = TimeSpan.FromSeconds(30)
});
app.Use(async (context, next) =>
{
	if (context.Request.Path == "/logs")
	{
		if (context.WebSockets.IsWebSocketRequest)
		{
			var webSocket = await context.WebSockets.AcceptWebSocketAsync();
			var connectionId = Guid.NewGuid().ToString();
			webSocketConnections.TryAdd(connectionId, webSocket);

			try
			{
				var buffer = new byte[1024];
				while (webSocket.State == WebSocketState.Open)
				{
					var result = await webSocket.ReceiveAsync(buffer, CancellationToken.None);
					if (result.MessageType == WebSocketMessageType.Close)
						break;
				}
			}
			finally
			{
				webSocketConnections.TryRemove(connectionId, out _);
				if (webSocket.State == WebSocketState.Open)
					await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
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

app.MapControllers();
app.MapHealthChecks("/health");

app.Run();
