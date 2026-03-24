using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;

namespace CardTraderManager.Api.WebSocketLogs
{
	public class WebSocketLogger : ILogger
	{
		private readonly string _categoryName;
		private readonly ConcurrentDictionary<string, WebSocket> _webSockets;

		private static readonly List<string> _excludedCategories =
		[
			"System.Net.Http"
		];

		public WebSocketLogger(string categoryName, ConcurrentDictionary<string, WebSocket> webSockets)
		{
			_categoryName = categoryName;
			_webSockets = webSockets;
		}

		public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;

		public bool IsEnabled(LogLevel logLevel) => true;

		public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception,
			Func<TState, Exception?, string> formatter)
		{
			if (_excludedCategories.Any(category => _categoryName.StartsWith(category)))
				return;

			var message = $"[{DateTime.UtcNow:HH:mm:ss}] [{logLevel}] {formatter(state, exception)}";

			if (exception != null)
			{
				message += $"\nException: {exception.Message}";
			}

			var encodedMessage = Encoding.UTF8.GetBytes(message);

			// Fire-and-forget but with error handling
			_ = BroadcastAsync(encodedMessage);
		}

		private async Task BroadcastAsync(byte[] encodedMessage)
		{
			var closedConnections = new List<string>();

			foreach (var (connectionId, socket) in _webSockets)
			{
				try
				{
					if (socket.State == WebSocketState.Open)
					{
						await socket.SendAsync(new ArraySegment<byte>(encodedMessage),
							WebSocketMessageType.Text, true, CancellationToken.None);
					}
					else
					{
						closedConnections.Add(connectionId);
					}
				}
				catch
				{
					closedConnections.Add(connectionId);
				}
			}

			// Remove closed connections
			foreach (var id in closedConnections)
			{
				_webSockets.TryRemove(id, out _);
			}
		}
	}
}