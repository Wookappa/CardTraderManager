
// Runtime configuration loaded from /config.json
// Allows overriding API URLs per environment without rebuilding
let runtimeConfig: { apiBaseUrl?: string; wsUrl?: string } = {};

export async function loadRuntimeConfig(): Promise<void> {
  try {
    const res = await fetch('/config.json');
    if (res.ok) {
      runtimeConfig = await res.json();
    }
  } catch {
    // Config not available — use defaults
  }
}

// API configuration based on environment
const getApiBaseUrl = (): string => {
  // 1. Runtime config (from /config.json, set per environment)
  if (runtimeConfig.apiBaseUrl) {
    return runtimeConfig.apiBaseUrl;
  }

  // 2. Build-time env override
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // 3. Production: same origin (FE served by backend)
  if (import.meta.env.PROD) {
    return '';
  }

  // 4. Development: local backend
  return "https://localhost:7083";
};

export const getWsUrl = (): string => {
  if (runtimeConfig.wsUrl) {
    return runtimeConfig.wsUrl;
  }

  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }

  // Production: same host, derive protocol from page
  if (import.meta.env.PROD) {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${wsProtocol}//${window.location.host}/logs`;
  }

  return "ws://localhost:5050/logs";
};

export const API_CONFIG = {
  get baseUrl() { return getApiBaseUrl(); },
  endpoints: {
    extractPriceUpdates: "/api/PriceUpdate/ExtractPriceUpdates",
    postPriceUpdates: "/api/PriceUpdate/PostPriceUpdates"
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.baseUrl}${endpoint}`;
};
