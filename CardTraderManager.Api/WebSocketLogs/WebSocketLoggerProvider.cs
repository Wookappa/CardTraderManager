using System.Collections.Concurrent;
using System.Net.WebSockets;

namespace CardTraderManager.Api.WebSocketLogs
{
	public class WebSocketLoggerProvider : ILoggerProvider
	{
		private readonly ConcurrentDictionary<string, WebSocket> _webSockets;

		public WebSocketLoggerProvider(ConcurrentDictionary<string, WebSocket> webSockets)
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
