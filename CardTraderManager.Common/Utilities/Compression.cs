using System.IO.Compression;

namespace CardTraderManager.Common.Utilities
{
	public static class Compression
	{
		/// <summary>
		/// Compresses a string using GZip.
		/// </summary>
		public static byte[] CompressMessage(string message)
		{
			using (var memoryStream = new MemoryStream())
			{
				using (var gzipStream = new GZipStream(memoryStream, CompressionMode.Compress))
				using (var writer = new StreamWriter(gzipStream))
				{
					writer.Write(message);
					writer.Flush();
				}

				return memoryStream.ToArray();
			}
		}

		/// <summary>
		/// Decompresses a GZip-compressed string.
		/// </summary>
		public static string DecompressMessage(byte[] compressedMessage)
		{
			using (var memoryStream = new MemoryStream(compressedMessage))
			using (var gzipStream = new GZipStream(memoryStream, CompressionMode.Decompress))
			using (var reader = new StreamReader(gzipStream))
			{
				return reader.ReadToEnd();
			}
		}
	}
}