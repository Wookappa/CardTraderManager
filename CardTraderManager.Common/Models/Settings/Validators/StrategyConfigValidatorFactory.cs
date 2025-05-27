using FluentValidation;

namespace CardTraderManager.Common.Models.Settings.Validators
{
	public class StrategyConfigValidatorFactory
	{
		public static IValidator<StrategyConfig> Create(Enums.PriceAdjustmentType priceAdjustmentType)
		{
			bool isLowestPriceIndex = priceAdjustmentType == Enums.PriceAdjustmentType.LowestPriceIndex;
			return new StrategyConfigValidator(isLowestPriceIndex);
		}
	}
}