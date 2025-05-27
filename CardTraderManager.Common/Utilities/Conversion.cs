namespace CardTraderManager.Common.Utilities
{
	public static class Conversion
	{
		public static decimal ConvertToDecimalRatio(int cents) => Math.Round(cents / 100m, 2);
		public static decimal ConvertToDecimalRatio(decimal cents) => Math.Round(cents / 100m, 2);
	}
}