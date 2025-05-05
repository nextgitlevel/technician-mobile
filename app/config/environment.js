import Constants from 'expo-constants';

// Default environment variables
const ENV = {
  development: {
    API_URL: 'http://localhost:5000/api',
    enableDebugMode: true,
    logLevel: 'debug',
  },
  staging: {
    API_URL: 'https://nextlevelmaintenance.com/mobile/api/staging',
    enableDebugMode: true,
    logLevel: 'info',
  },
  production: {
    API_URL: 'https://nextlevelmaintenance.com/mobile/api',
    enableDebugMode: false,
    logLevel: 'error',
  }
};

// Get the environment from EAS or default to development
const getEnvVariables = () => {
  const expoConstants = Constants.expoConfig?.extra;
  const currentEnv = expoConstants?.env || 'development';
  
  // Allow overriding variables from EAS build
  const customApiUrl = Constants.expoConfig?.extra?.API_URL;
  
  return {
    ...ENV.development, // Default fallback
    ...ENV[currentEnv], // Environment-specific overrides
    ...(customApiUrl ? { API_URL: customApiUrl } : {}), // EAS override if provided
  };
};

export default getEnvVariables();