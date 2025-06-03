
// API configuration based on environment
const getApiBaseUrl = (): string => {
  const isRunningOnAzure = window.location.hostname.includes(".azurecontainerapps.io");

  if (isRunningOnAzure) {
    // Replace with your actual backend FQDN (HTTPS!)
    return import.meta.env.VITE_API_BASE_URL;
  }

  const isDocker = window.location.hostname === 'localhost' && window.location.port === '8080' ||
                   process.env.NODE_ENV === 'production' ||
                   window.location.hostname !== 'localhost';

  if (isDocker) {
    return "http://localhost:5000";
  } else {
    return "https://localhost:7083";
  }
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
