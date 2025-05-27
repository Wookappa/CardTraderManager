using System.Collections.Concurrent;
using System.Net.WebSockets;

namespace CardTraderManager.Api.WebSocketLogs
{
	public class WebSocketLoggerProvider : ILoggerProvider
	{
		private readonly ConcurrentBag<WebSocket> _webSockets;

		public WebSocketLoggerProvider(ConcurrentBag<WebSocket> webSockets)
		{
			_webSockets = webSockets;
		}

		public ILogger CreateLogger(string categoryName)
		{
			return new WebSocketLogger(categoryName, _webSockets);
		}

		public void Dispose() { }
	}
}
