
import { useState, useRef, useEffect, useCallback } from 'react';
import { getWsUrl } from '@/config/api';

type ConnectionStatus = 'disconnected' | 'connected' | 'reconnecting';

const MAX_RECONNECT_DELAY = 10000;
const INITIAL_RECONNECT_DELAY = 1000;

export const useWebSocketLogs = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [showLogs, setShowLogs] = useState(false);
  const websocketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectDelayRef = useRef(INITIAL_RECONNECT_DELAY);
  const isActiveRef = useRef(false);
  
  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  }, []);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const createConnection = useCallback(() => {
    const wsUrl = getWsUrl();

    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }

    try {
      const ws = new WebSocket(wsUrl);
      websocketRef.current = ws;

      ws.onopen = () => {
        reconnectDelayRef.current = INITIAL_RECONNECT_DELAY;
        setConnectionStatus('connected');
        addLog("✔ Log server connected");
      };

      ws.onmessage = (event) => {
        addLog(event.data);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = () => {
        // Ignore close events from replaced or stale sockets
        if (websocketRef.current !== ws) {
          return;
        }
        websocketRef.current = null;

        if (!isActiveRef.current) {
          setConnectionStatus('disconnected');
          return;
        }

        // Unexpected close — auto-reconnect with backoff
        setConnectionStatus('reconnecting');
        const delay = reconnectDelayRef.current;
        reconnectDelayRef.current = Math.min(delay * 2, MAX_RECONNECT_DELAY);
        addLog(`⚡ Connection lost, reconnecting in ${(delay / 1000).toFixed(0)}s...`);

        clearReconnectTimer();
        reconnectTimerRef.current = setTimeout(() => {
          if (isActiveRef.current) {
            createConnection();
          }
        }, delay);
      };
    } catch (error) {
      console.error("Failed to connect to WebSocket:", error);
      addLog("Unable to connect to log server");
    }
  }, [addLog, clearReconnectTimer]);

  const connectToLogStream = useCallback(() => {
    isActiveRef.current = true;
    reconnectDelayRef.current = INITIAL_RECONNECT_DELAY;
    clearReconnectTimer();
    createConnection();
  }, [createConnection, clearReconnectTimer]);

  const disconnectLogStream = useCallback(() => {
    isActiveRef.current = false;
    clearReconnectTimer();
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
    setConnectionStatus('disconnected');
    addLog("Log server disconnected");
  }, [addLog, clearReconnectTimer]);

  useEffect(() => {
    return () => {
      isActiveRef.current = false;
      clearReconnectTimer();
      if (websocketRef.current) {
        websocketRef.current.close();
        websocketRef.current = null;
      }
    };
  }, [clearReconnectTimer]);

  // Keep backwards compatibility
  const isConnected = connectionStatus === 'connected';

  return {
    logs,
    setLogs,
    isConnected,
    connectionStatus,
    showLogs,
    setShowLogs,
    addLog,
    connectToLogStream,
    disconnectLogStream,
  };
};
