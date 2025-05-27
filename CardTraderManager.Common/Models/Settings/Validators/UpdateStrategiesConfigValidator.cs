using FluentValidation;

namespace CardTraderManager.Common.Models.Settings.Validators
{
	public class UpdateStrategiesConfigValidator : AbstractValidator<UpdateStrategiesConfig>
	{
		public UpdateStrategiesConfigValidator()
		{
			RuleFor(x => x.DescriptionToSkip)
				.NotEmpty().WithMessage("DescriptionToSkip is required.");

			RuleFor(x => x.PriceAdjustmentStrategy)
				.NotEmpty().WithMessage("PriceAdjustmentStrategy is required.");

			RuleFor(x => x.PriceAdjustmentType)
				.IsInEnum().WithMessage("PriceAdjustmentType must be a valid enum value.");

			RuleFor(x => x.Strategies)
				.NotNull().WithMessage("Strategies dictionary cannot be null.");

			When(x => x.UseCustomRules, () =>
			{
				RuleFor(x => x.CustomRules)
					.NotNull().WithMessage("CustomRules cannot be null when UseCustomRules is enabled.");
			});
		}
	}
}