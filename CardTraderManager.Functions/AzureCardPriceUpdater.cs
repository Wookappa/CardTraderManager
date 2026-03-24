using Azure.Storage.Queues;
using CardTraderApi.Client.Models.Inventory;
using CardTraderManager.Common.Interfaces;
using CardTraderManager.Common.Utilities;
using CardTraderManager.Operations.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace CardTraderManager.Functions;

public class AzureCardPriceUpdater
{
	private readonly ICardPriceUpdateService _priceUpdateService;
	private readonly ISettingsProvider _settingsProvider;
	private readonly ILogger<AzureCardPriceUpdater> _logger;
	private readonly QueueClient _queueClient;


	public AzureCardPriceUpdater(
		ICardPriceUpdateService priceUpdateService,
		ISettingsProvider settingsProvider,
		ILogger<AzureCardPriceUpdater> logger,
		QueueServiceClient queueServiceClient)
	{
		_priceUpdateService = priceUpdateService;
		_settingsProvider = settingsProvider;
		_logger = logger;

		_queueClient = queueServiceClient.GetQueueClient("card-price-updates");
		_queueClient.CreateIfNotExists();
	}

	[Function("GetAllConfiguration")]
	public Task<IActionResult> GetAllConfiguration(
		[HttpTrigger(AuthorizationLevel.Function, "get", "post")]
		HttpRequest req)
	{
		try
		{
			var configuration = (new { apiSetting = _settingsProvider.GetApiSettings(), strategies = _settingsProvider.GetUpdateStrategiesSettings() });
			return Task.FromResult<IActionResult>(new OkObjectResult(configuration));
		}
		catch (OperationCanceledException)
		{
			_logger.LogWarning("GetAllConfiguration was cancelled due to timeout.");
			return Task.FromResult<IActionResult>(new StatusCodeResult(408));
		}
		catch (Exception ex)
		{
			_logger.LogError("Error in GetAllConfiguration: {ErrorMessage}", ex.Message);
			return Task.FromResult<IActionResult>(new StatusCodeResult(500));
		}
	}

	[Function("HttpTriggerFunction")]
	public async Task<IActionResult> StartBatchProcessing(
		[HttpTrigger(AuthorizationLevel.Function, "get", "post")]
		HttpRequest req)
	{
		try
		{
			var cancellationToken = req.HttpContext.RequestAborted;
			var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
			cts.CancelAfter(TimeSpan.FromMinutes(60));

			await ProcessBatch(_queueClient, cts.Token);
			return new OkObjectResult(new { message = "Batch processing started." });
		}
		catch (OperationCanceledException)
		{
			_logger.LogWarning("Batch processing was cancelled due to timeout.");
			return new StatusCodeResult(408); // Request Timeout
		}
		catch (Exception ex)
		{
			_logger.LogError("Error in batch processing: {ErrorMessage}", ex.Message);
			return new StatusCodeResult(500);
		}
	}

	[Function("ScheduledBatchProcessing")]
	[FixedDelayRetry(5, "00:00:10")]
	public async Task ScheduledBatchProcessingAsync([TimerTrigger("0 0 */2 * * *")] TimerInfo timerInfo)
	{
		var randomDelay = new Random().Next(0, 30 * 60 * 1000);
		await Task.Delay(randomDelay);
		try
		{
			_logger.LogInformation("Scheduled batch processing started.");
			var cts = new CancellationTokenSource(TimeSpan.FromMinutes(5));
			await ProcessBatch(_queueClient, cts.Token);
		}
		catch (OperationCanceledException)
		{
			_logger.LogWarning("Scheduled batch processing was cancelled due to timeout.");
		}
		catch (Exception ex)
		{
			_logger.LogError("Error in scheduled batch processing: {errorMessage}", ex.Message);
		}
	}

	[Function("ProcessBatchFromQueue")]
	public async Task ProcessBatchFromQueue([QueueTrigger("card-price-updates", Connection = "AzureWebJobsStorage")] byte[] compressedMessageBase)
	{
		try
		{
			_logger.LogInformation("Processing batch from queue...");

			var decompressedMessage = Compression.DecompressMessage(compressedMessageBase);

			var batch = JsonSerializer.Deserialize<IReadOnlyCollection<InventoryProduct>>(decompressedMessage);

			if (batch != null && batch.Count > 0)
			{
				var cts = new CancellationTokenSource(TimeSpan.FromMinutes(5));
				await _priceUpdateService.AnalyzeAndPushPriceUpdatesAsync(batch, cts.Token);
				_logger.LogInformation("Price update completed for batch of {batchCount} items.", batch.Count);
			}
			else
			{
				_logger.LogWarning("Received an empty batch from the queue.");
			}
		}
		catch (FormatException ex)
		{
			_logger.LogError("Base64 decoding error: {errorMessage}", ex.Message);
		}
		catch (OperationCanceledException)
		{
			_logger.LogWarning("Batch processing from queue was cancelled due to timeout.");
		}
		catch (Exception ex)
		{
			_logger.LogError("Error processing batch from queue: {errorMessage}", ex.Message);
			throw;
		}
	}

	private async Task ProcessBatch(QueueClient queueClient, CancellationToken cancellationToken)
	{
		var listOfBatches = await _priceUpdateService.ExtractBatchOfItems(200, cancellationToken);
		_logger.LogInformation("Extracted {BatchCount} batches.", listOfBatches.Count);

		foreach (var batch in listOfBatches)
		{
			if (batch != null && batch.Count > 0)
			{
				var message = JsonSerializer.Serialize(batch);
				var compressedMessage = Compression.CompressMessage(message);

				if (compressedMessage.Length > 64 * 1024)
				{
					_logger.LogError("Compressed message size exceeds Azure Queue limit.");
					throw new InvalidOperationException("Message size exceeds Azure Queue limit after compression.");
				}

				await queueClient.SendMessageAsync(Convert.ToBase64String(compressedMessage), cancellationToken);
				_logger.LogInformation("Batch with {batchCount} items pushed to queue.", batch.Count);
			}
		}
	}
}