using FluentValidation;

namespace CardTraderManager.Common.Models.Settings.Validators
{
	public class ApiSettingsValidator : AbstractValidator<ApiSettings>
	{
		public ApiSettingsValidator()
		{
			RuleFor(x => x.CardTrader)
				.NotNull().WithMessage("CardTrader settings cannot be null.")
				.SetValidator(new CardTraderSettingsValidator());
		}
	}
}