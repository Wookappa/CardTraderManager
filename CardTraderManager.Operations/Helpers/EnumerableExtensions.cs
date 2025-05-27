namespace CardTraderManager.Operations.Helpers
{
	public static class EnumerableExtensions
	{
		public static IEnumerable<IList<T>> Batch<T>(this IEnumerable<T> source, int batchSize)
		{
			for (var i = 0; i < source.Count(); i += batchSize)
			{
				yield return source.Skip(i).Take(batchSize).ToList();
			}
		}
	}
}
