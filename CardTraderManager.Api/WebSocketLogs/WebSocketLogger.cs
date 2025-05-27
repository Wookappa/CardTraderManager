using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;

namespace CardTraderManager.Api.WebSocketLogs
{
	public class WebSocketLogger : ILogger
	{
		private readonly string _categoryName;
		private readonly ConcurrentBag<WebSocket> _webSockets;

		private static readonly List<string> _excludedCategories = new List<string>
		{
			"System.Net.Http" // ➡️ Ignore HttpClient logs
		};

		public WebSocketLogger(string categoryName, ConcurrentBag<WebSocket> webSockets)
		{
			_categoryName = categoryName;
			_webSockets = webSockets;
		}

		public IDisposable? BeginScope<TState>(TState state) => null;

		public bool IsEnabled(LogLevel logLevel) => true;

		public async void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception,
			Func<TState, Exception, string> formatter)
		{
			if (formatter == null || _excludedCategories.Any(category => _categoryName.StartsWith(category)))
				return;

			var message = $"[{DateTime.Now:HH:mm:ss}] [{logLevel}] {formatter(state, exception)}";

			if (exception != null)
			{
				message += $"\nException: {exception.Message}";
			}

			var encodedMessage = Encoding.UTF8.GetBytes(message);

			foreach (var socket in _webSockets)
			{
				if (socket.State == WebSocketState.Open)
				{
					await socket.SendAsync(new ArraySegment<byte>(encodedMessage, 0, encodedMessage.Length),
						WebSocketMessageType.Text, true, CancellationToken.None);
				}
			}
		}
	}
}