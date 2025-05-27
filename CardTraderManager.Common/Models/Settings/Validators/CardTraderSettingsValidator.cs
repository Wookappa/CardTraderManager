using FluentValidation;

namespace CardTraderManager.Common.Models.Settings.Validators
{
	public class CardTraderSettingsValidator : AbstractValidator<CardTraderSettings>
	{
		public CardTraderSettingsValidator()
		{
			RuleFor(x => x.JwtToken)
				.NotEmpty().WithMessage("JwtToken is required.");
		}
	}
}
