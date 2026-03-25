
import { useState, useRef, useEffect, useCallback } from 'react';
import { getWsUrl } from '@/config/api';

export const useWebSocketLogs = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const websocketRef = useRef<WebSocket | null>(null);
  
  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  }, []);
  
  const connectToLogStream = useCallback(() => {
    // Get WebSocket URL based on environment
    const wsUrl = getWsUrl();
    
    if (websocketRef.current) {
      websocketRef.current.close();
    }
    
    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        setIsConnected(true);
        addLog("Log server connection established");
      };
      
      ws.onmessage = (event) => {
        const logMessage = event.data;
        addLog(logMessage);
      };
      
      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        addLog("Error connecting to log server");
      };
      
      ws.onclose = () => {
        setIsConnected(false);
        addLog("Log server connection closed");
      };
      
      websocketRef.current = ws;
    } catch (error) {
      console.error("Failed to connect to WebSocket:", error);
      addLog("Unable to connect to log server");
    }
  }, [addLog]);
  
  useEffect(() => {
    // Cleanup WebSocket connection when component unmounts
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, []);
  
  return {
    logs,
    setLogs,
    isConnected,
    showLogs,
    setShowLogs,
    addLog,
    connectToLogStream,
  };
};
