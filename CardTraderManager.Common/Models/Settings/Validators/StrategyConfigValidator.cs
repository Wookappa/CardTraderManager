using FluentValidation;

namespace CardTraderManager.Common.Models.Settings.Validators
{
	public class StrategyConfigValidator : AbstractValidator<StrategyConfig>
	{
		public StrategyConfigValidator(bool isLowestPriceIndex)
		{
			RuleFor(x => x.MarketAverage)
				.IsInEnum().WithMessage("MarketAverage must be a valid enum value.")
				.When(_ => !isLowestPriceIndex);

			RuleFor(x => x.LowestPriceIndex)
				.NotNull().WithMessage("LowestPriceIndex is required when PriceAdjustmentType is LowestPriceIndex.")
				.When(_ => isLowestPriceIndex);

			RuleFor(x => x.TrimFraction)
				.GreaterThanOrEqualTo(0).WithMessage("TrimFraction must be greater than or equal to 0.")
				.When(_ => !isLowestPriceIndex);

			RuleFor(x => x.PercentageAdjustment)
				.NotNull().WithMessage(
					"PercentageAdjustment is required when PriceAdjustmentType is not LowestPriceIndex.")
				.When(_ => !isLowestPriceIndex);

			RuleFor(x => x.FixedAdjustment)
				.NotNull().WithMessage("FixedAdjustment is required when PriceAdjustmentType is not LowestPriceIndex.")
				.When(_ => !isLowestPriceIndex);

			// Additional rule for TrimmedMean or Percentile
			When(
				x => x.MarketAverage == Enums.MarketAverage.TrimmedMean ||
					 x.MarketAverage == Enums.MarketAverage.Percentile, () =>
				{
					RuleFor(x => x.TrimFraction)
						.NotNull().WithMessage(
							"TrimFraction is required when MarketAverage is TrimmedMean or Percentile.");
				});
		}
	}
}
