namespace CardTraderManager.Operations.Helpers
{
	public static class EnumerableExtensions
	{
		public static IEnumerable<IList<T>> Batch<T>(this IEnumerable<T> source, int batchSize)
		{
			var list = source as IList<T> ?? source.ToList();
			for (var i = 0; i < list.Count; i += batchSize)
			{
				yield return list.Skip(i).Take(batchSize).ToList();
			}
		}
	}
}
