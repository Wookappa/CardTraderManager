using FluentValidation;

namespace CardTraderManager.Common.Models.Settings.Validators
{
	public class PriceProtectionSettingsValidator : AbstractValidator<PriceProtectionSettings>
	{
		public PriceProtectionSettingsValidator()
		{
			RuleFor(x => x.UsePriceProtection)
				.NotNull().WithMessage("UsePriceProtection is required.");

			When(x => x.UsePriceProtection, () =>
			{
				RuleFor(x => x.MaxPriceDropPercentage)
					.NotNull().WithMessage("MaxPriceDropPercentage is required when PriceProtection is enabled.");

				RuleFor(x => x.MinimumMarketListings)
					.NotNull().WithMessage("MinimumMarketListings is required when PriceProtection is enabled.");

				RuleFor(x => x.MarketAverage)
					.IsInEnum().WithMessage("MarketAverage must be a valid enum value.");

				RuleFor(x => x.TrimPercentage)
					.NotNull().WithMessage("TrimPercentage is required when PriceProtection is enabled.");

				RuleFor(x => x.PriceDifferenceThreshold)
					.NotNull().WithMessage("PriceDifferenceThreshold is required when PriceProtection is enabled.");
			});
		}
	}
}
