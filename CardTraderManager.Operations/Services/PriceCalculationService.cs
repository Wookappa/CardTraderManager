using CardTraderApi.Client.Models.Inventory;
using CardTraderApi.Client.Models.Marketplace;
using CardTraderManager.Common.Interfaces;
using CardTraderManager.Common.Models.Settings;
using CardTraderManager.Common.Utilities;
using CardTraderManager.Operations.Interfaces;
using Microsoft.Extensions.Logging;
using static CardTraderManager.Common.Models.Settings.Enums;

namespace CardTraderManager.Operations.Services;

public class PriceCalculationService : IPriceCalculationService
{
	private readonly ILogger<PriceCalculationService> _logger;
	private UpdateStrategiesConfig _updateStrategiesConfig;
	private PriceProtectionSettings _priceProtectionSettings;

	private const decimal CardTraderZeroPriceReduction = 0.15m;

	public PriceCalculationService(ILogger<PriceCalculationService> logger, ISettingsProvider settingsProvider)
	{
		_logger = logger;
		_updateStrategiesConfig = settingsProvider.GetUpdateStrategiesSettings()
								  ?? throw new ArgumentNullException(nameof(settingsProvider));
		_priceProtectionSettings = settingsProvider.GetPriceProtectionSettings()
								   ?? throw new ArgumentNullException(nameof(settingsProvider));

		settingsProvider.OnSettingsUpdated += () =>
		{
			_updateStrategiesConfig = settingsProvider.GetUpdateStrategiesSettings();
			_priceProtectionSettings = settingsProvider.GetPriceProtectionSettings();
		};
	}

	public decimal? ApplyCustomRules(InventoryProduct item, IReadOnlyCollection<MarketProduct> filteredProducts)
	{
		var itemPriceEuros = Conversion.ConvertToDecimalRatio(item.PriceCents);
		var marketPricesCents = filteredProducts.Select(p => p.Price.Cents).ToList();

		foreach (var rule in _updateStrategiesConfig.CustomRules)
		{
			// Check if card name and condition match (if specified)
			var cardNameMatches = string.IsNullOrEmpty(rule.ItemName) || rule.ItemName == item.NameEn;
			var conditionMatches = string.IsNullOrEmpty(rule.Condition) || rule.Condition == item.PropertiesHash?.Condition;

			if ((!cardNameMatches || !conditionMatches) &&
				(!string.IsNullOrEmpty(rule.ItemName) || !string.IsNullOrEmpty(rule.Condition)))
				continue;

			// Skip if item's price is outside the defined range
			if (rule.MinPriceRange.HasValue && rule.MaxPriceRange.HasValue &&
				(itemPriceEuros < rule.MinPriceRange.Value || itemPriceEuros > rule.MaxPriceRange.Value))
				continue;

			var newPriceEuros = itemPriceEuros;

			switch (rule.PriceAdjustmentType)
			{
				// Calculate price only if adjustment type is Fixed or Percentage
				case PriceAdjustmentType.FixedPrice:
					{
						if (rule.FixedAdjustment != null) newPriceEuros = rule.FixedAdjustment.Value;
						break;
					}
				case PriceAdjustmentType.Percentage when rule.PercentageAdjustment.HasValue:
					{
						newPriceEuros = CalculateAveragePrice(marketPricesCents, rule.MarketAverage, rule.TrimFraction);
						newPriceEuros += newPriceEuros * rule.PercentageAdjustment.Value;
						break;
					}
				default:
					{
						if (rule is { LowestPriceIndex: not null, PriceAdjustmentType: PriceAdjustmentType.LowestPriceIndex })
							newPriceEuros = CalculatePriceByLowestIndex(filteredProducts, rule.LowestPriceIndex.Value,
								newPriceEuros);

						break;
					}
			}

			if (!_updateStrategiesConfig.AlwaysBelowCardTraderZero)
			{
				var lowestSealedWithCtZeroPrice = GetLowestPriceFromSealedWithCtZeroSellers(filteredProducts);

				if (lowestSealedWithCtZeroPrice.HasValue)
				{
					var targetPrice = lowestSealedWithCtZeroPrice.Value - CardTraderZeroPriceReduction;
					if (newPriceEuros >= targetPrice)
					{
						_logger.LogInformation("Price to be at least {PriceReduction} lower. Original: {OriginalPrice}, Cheapest CT Zero: {CheapestCtZero}",
					CardTraderZeroPriceReduction, newPriceEuros, lowestSealedWithCtZeroPrice.Value);
						newPriceEuros = targetPrice;
					}
				}
			}

			// Ensure price respects the minimum allowed
			if (rule.MinAllowedPrice.HasValue) newPriceEuros = Math.Max(newPriceEuros, rule.MinAllowedPrice.Value);

			newPriceEuros = ApplyPriceProtection(marketPricesCents, newPriceEuros);
			return newPriceEuros; // Return calculated price if all conditions are met
		}

		return null; // No rule applied
	}

	public decimal CalculateBasePrice(IReadOnlyCollection<MarketProduct> filteredProducts, InventoryProduct item)
	{
		var strategyName = _updateStrategiesConfig.PriceAdjustmentStrategy;
		var selectedStrategy = _updateStrategiesConfig.Strategies[strategyName];
		var basePriceEuros = Conversion.ConvertToDecimalRatio(item.PriceCents);

		try
		{
			if (!filteredProducts.Any())
			{
				_logger.LogWarning("No filtered products found for item ID: {ItemId}. Returning current price.", item.Id);
				return basePriceEuros;
			}

			var marketPricesCents = filteredProducts.Select(p => p.Price.Cents).ToList();

			// Calculate base price depending on the adjustment type
			basePriceEuros = GetAdjustedBasePrice(
				filteredProducts,
				marketPricesCents,
				selectedStrategy,
				item.PriceCents
			);

			// Apply strategy-specific adjustments
			basePriceEuros = ApplyStrategyAdjustments(basePriceEuros, selectedStrategy);

			// Final price protection step
			return ApplyPriceProtection(marketPricesCents, basePriceEuros);
		}
		catch (Exception ex)
		{
			_logger.LogError(
				ex,
				"Error calculating base price for item ID: {ItemId}. Exception: {ExceptionMessage}",
				item.Id,
				ex.Message
			);

			return Conversion.ConvertToDecimalRatio(item.PriceCents);
		}
	}

	private decimal GetAdjustedBasePrice(
		IReadOnlyCollection<MarketProduct> filteredProducts,
		List<int> marketPricesCents,
		StrategyConfig selectedStrategy,
		int fallbackPriceCents)
	{
		switch (_updateStrategiesConfig.PriceAdjustmentType)
		{
			case PriceAdjustmentType.LowestPriceIndex:
				return CalculatePriceByLowestIndex(
					filteredProducts,
					selectedStrategy.LowestPriceIndex,
					Conversion.ConvertToDecimalRatio(fallbackPriceCents)
				);

			case PriceAdjustmentType.Percentage:
			case PriceAdjustmentType.FixedAdjustment:
				var marketAverageType = selectedStrategy.MarketAverage;
				var averagePriceCents = marketAverageType switch
				{
					MarketAverage.Median => StatisticsHelper.Median(marketPricesCents),
					MarketAverage.TrimmedMean => StatisticsHelper.TrimmedMean(marketPricesCents, selectedStrategy.TrimFraction),
					_ => throw new InvalidOperationException($"Unsupported MarketAverage type: {marketAverageType}")
				};

				return Conversion.ConvertToDecimalRatio(averagePriceCents);

			default:
				return Conversion.ConvertToDecimalRatio(fallbackPriceCents);
		}
	}

	private decimal ApplyStrategyAdjustments(decimal basePrice, StrategyConfig strategy)
	{
		return _updateStrategiesConfig.PriceAdjustmentType switch
		{
			PriceAdjustmentType.Percentage when strategy.PercentageAdjustment != 0 => (decimal)(basePrice +
				(basePrice * strategy.PercentageAdjustment))!,
			PriceAdjustmentType.FixedAdjustment when strategy.FixedAdjustment != 0 => (decimal)(basePrice +
				strategy.FixedAdjustment)!,
			_ => basePrice
		};
	}

	private static decimal CalculateAveragePrice(List<int> marketPrices, MarketAverage marketAverage, decimal trimFraction)
	{
		decimal averageCents = marketAverage switch
		{
			MarketAverage.Mean => StatisticsHelper.Mean(marketPrices),
			MarketAverage.Median => StatisticsHelper.Median(marketPrices),
			MarketAverage.Percentile => StatisticsHelper.Percentile(marketPrices, trimFraction),
			MarketAverage.TrimmedMean => StatisticsHelper.TrimmedMean(marketPrices, trimFraction),
			_ => StatisticsHelper.Mean(marketPrices)
		};

		return Conversion.ConvertToDecimalRatio(averageCents);
	}

	private decimal CalculatePriceByLowestIndex(IReadOnlyCollection<MarketProduct> filteredProducts, int? lowestPriceIndex, decimal fallbackPriceEuros)
	{
		if (!filteredProducts.Any())
		{
			_logger.LogWarning("No filtered products found. Returning fallback price.");
			return fallbackPriceEuros;
		}

		int selectedPriceCents;

		if (filteredProducts.Count >= lowestPriceIndex)
		{
			selectedPriceCents = filteredProducts
				.Select(p => p.Price.Cents)
				.OrderBy(p => p)
				.Skip((int)(lowestPriceIndex - 1))
				.FirstOrDefault();
		}
		else
		{
			_logger.LogWarning("Not enough items in the list to apply LowestPriceIndex strategy. Using the last available price.");
			selectedPriceCents = filteredProducts
				.Select(p => p.Price.Cents)
				.OrderBy(p => p)
				.LastOrDefault();
		}

		var finalPrice = selectedPriceCents > 0
			? Conversion.ConvertToDecimalRatio(selectedPriceCents)
			: fallbackPriceEuros;

		return finalPrice;
	}

	private decimal? GetLowestPriceFromSealedWithCtZeroSellers(IEnumerable<MarketProduct> products)
	{
		if (!products.Any())
		{
			_logger.LogWarning("Products collection is null");
			return null;
		}

		var sealedWithCtZeroProducts = products
			.Where(p => p.User?.CanSellSealedWithCtZero == true)
			.ToList();

		if (!sealedWithCtZeroProducts.Any())
		{
			_logger.LogDebug("No products with can_sell_sealed_with_ct_zero true found");
			return null;
		}

		try
		{
			var lowestPriceCents = sealedWithCtZeroProducts.Min(p => p.Price.Cents);
			var lowestPriceEuros = Conversion.ConvertToDecimalRatio(lowestPriceCents);

			_logger.LogDebug("Found lowest price from sealed_with_ct_zero sellers: {LowestPrice}€", lowestPriceEuros);
			return lowestPriceEuros;
		}
		catch (Exception ex)
		{
			_logger.LogError(ex, "Error while calculating lowest price from sealed_with_ct_zero sellers");
			return null;
		}
	}

	private decimal ApplyPriceProtection(List<int> marketPrices, decimal proposedPrice)
	{
		if (_priceProtectionSettings.UsePriceProtection)
		{
			if (marketPrices.Count < _priceProtectionSettings.MinimumMarketListings)
				return proposedPrice;

			marketPrices = marketPrices
				.OrderBy(p => p)
				.Take(_priceProtectionSettings.MinimumMarketListings)
			.ToList();

			var referencePrice = CalculateAveragePrice(marketPrices, _priceProtectionSettings.MarketAverage, _priceProtectionSettings.TrimPercentage);

			var minAllowedPrice = referencePrice * (1 - (Conversion.ConvertToDecimalRatio(_priceProtectionSettings.MaxPriceDropPercentage)));

			if (proposedPrice + _priceProtectionSettings.PriceDifferenceThreshold < minAllowedPrice)
			{
				_logger.LogWarning("Price protection triggered. Proposed: {ProposedPrice}, Min allowed: {MinAllowed} (Reference: {ReferencePrice})",
					proposedPrice, minAllowedPrice, referencePrice);
				return minAllowedPrice;
			}
		}

		return proposedPrice;
	}
}