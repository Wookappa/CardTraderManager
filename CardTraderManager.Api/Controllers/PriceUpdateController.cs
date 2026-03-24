using CardTraderApi.Client;
using CardTraderManager.Api.Wrappers;
using CardTraderManager.Common.Interfaces;
using CardTraderManager.Operations.Interfaces;
using CardTraderManager.Operations.Models;
using Microsoft.AspNetCore.Mvc;

namespace CardTraderManager.Api.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	public class PriceUpdateController : ControllerBase
	{
		private readonly ICardPriceUpdateService _priceUpdateService;
		private readonly ISettingsProvider _settingsProvider;
		private readonly CardTraderApiClient _cardTraderApiClient;

		public PriceUpdateController(
			ICardPriceUpdateService priceUpdateService,
			ISettingsProvider settingsProvider,
			CardTraderApiClient cardTraderApiClient)
		{
			_priceUpdateService = priceUpdateService;
			_settingsProvider = settingsProvider;
			_cardTraderApiClient = cardTraderApiClient;
		}

		[HttpPost(nameof(StartPriceUpdate))]
		public async Task<IActionResult> StartPriceUpdate([FromBody] StartPriceUpdateRequest? request = null)
		{
			ApplyRequestSettings(request);

			var result = await _priceUpdateService.AnalyzeAndPushPriceUpdatesAsync(cancellationToken: HttpContext.RequestAborted);
			return Ok(result);
		}

		[HttpPost(nameof(ExtractPriceUpdates))]
		public async Task<IActionResult> ExtractPriceUpdates([FromBody] StartPriceUpdateRequest? request = null)
		{
			ApplyRequestSettings(request);

			var result = await _priceUpdateService.AnalyzePriceUpdatesOnlyAsync(cancellationToken: HttpContext.RequestAborted);
			return Ok(result);
		}

		[HttpPost(nameof(PostPriceUpdates))]
		public async Task<IActionResult> PostPriceUpdates([FromBody] PriceAnalysisResult? analysisResult)
		{
			var result = await _priceUpdateService.PushPriceUpdatesOnlyAsync(
				analysisResult ?? throw new ArgumentNullException(nameof(analysisResult)),
				cancellationToken: HttpContext.RequestAborted);

			return Ok(result);
		}

		private void ApplyRequestSettings(StartPriceUpdateRequest? request)
		{
			if (request?.ApplicationSettings == null)
				return;

			_settingsProvider.UpdateSettings(request.ApplicationSettings);

			var jwtToken = request.ApplicationSettings.ApiSettings?.CardTrader?.JwtToken;
			if (!string.IsNullOrWhiteSpace(jwtToken))
			{
				_cardTraderApiClient.UpdateJwtToken(jwtToken);
			}
		}
	}
}