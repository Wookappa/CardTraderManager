
// API configuration based on environment
const getApiBaseUrl = (): string => {
  // Explicit env override
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // In production builds (Docker/deployed), backend runs on port 5000
  // In dev mode (Vite dev server), backend runs on HTTPS port 7083
  if (import.meta.env.PROD) {
    return `${window.location.protocol}//${window.location.hostname}:5000`;
  }

  return "https://localhost:7083";
};

export const API_CONFIG = {
  baseUrl: getApiBaseUrl(),
  endpoints: {
    extractPriceUpdates: "/api/PriceUpdate/ExtractPriceUpdates",
    postPriceUpdates: "/api/PriceUpdate/PostPriceUpdates"
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.baseUrl}${endpoint}`;
};
