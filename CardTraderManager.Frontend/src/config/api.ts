
// API configuration based on environment
const getApiBaseUrl = (): string => {
  // Check if running in Docker by looking for common Docker environment indicators
  const isDocker = window.location.hostname === 'localhost' && window.location.port === '8080' ||
                   process.env.NODE_ENV === 'production' ||
                   window.location.hostname !== 'localhost';
  
  if (isDocker) {
    // Docker environment - use port 5000
    return "http://localhost:5000";
  } else {
    // Local development - use port 7083
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
