using FluentValidation;

namespace CardTraderManager.Common.Models.Settings.Validators
{
	public class ApplicationSettingsValidator : AbstractValidator<ApplicationSettings>
	{
		public ApplicationSettingsValidator()
		{
			RuleFor(x => x.ApiSettings)
				.NotNull().WithMessage("ApiSettings cannot be null.")
				.SetValidator(new ApiSettingsValidator());

			RuleFor(x => x.PriceProtectionSettings)
				.NotNull().WithMessage("PriceProtectionSettings cannot be null.")
				.SetValidator(new PriceProtectionSettingsValidator());

			RuleFor(x => x.UpdateStrategiesConfig)
				.NotNull().WithMessage("UpdateStrategiesConfig cannot be null.")
				.SetValidator(new UpdateStrategiesConfigValidator());
		}
	}

}
