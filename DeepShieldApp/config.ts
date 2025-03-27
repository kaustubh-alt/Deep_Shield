export const API_ENDPOINT = 'https://your-deep-learning-api-endpoint.com/analyze';

export const CONFIG = {
  // Version info
  APP_VERSION: '1.0.0',
  
  // Feature flags
  ENABLE_MOCK_API: true, // Set to false when your real API is ready
  
  // API settings
  API: {
    ENDPOINT: API_ENDPOINT,
    TIMEOUT: 30000, // 30 seconds
  },
  
  // UI settings
  UI: {
    RESULT_COLORS: {
      FAKE: '#ffcdd2', // Light red
      REAL: '#c8e6c9', // Light green
    }
  }
}; 