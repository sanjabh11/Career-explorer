/**
 * Development setup file
 * 
 * This file contains utilities and configurations for development mode.
 * It helps with mocking API responses and handling errors gracefully.
 */

import axios from 'axios';

/**
 * Setup axios interceptors for development
 * This will log all API requests and responses for debugging
 */
export const setupAxiosInterceptors = () => {
  // Request interceptor
  axios.interceptors.request.use(
    (config) => {
      console.log(`[DEV] API Request: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    (error) => {
      console.error('[DEV] API Request Error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  axios.interceptors.response.use(
    (response) => {
      console.log(`[DEV] API Response: ${response.status} ${response.config.url}`);
      return response;
    },
    (error) => {
      if (error.response) {
        console.error(`[DEV] API Response Error: ${error.response.status} ${error.config?.url}`);
        console.error('[DEV] Error Data:', error.response.data);
      } else if (error.request) {
        console.error('[DEV] API No Response:', error.request);
      } else {
        console.error('[DEV] API Error:', error.message);
      }
      return Promise.reject(error);
    }
  );
};

/**
 * Check if environment variables are properly set
 * Logs warnings if required environment variables are missing
 */
export const checkEnvironmentVariables = () => {
  const requiredVars = [
    'ONET_USERNAME',
    'ONET_PASSWORD',
    'REACT_APP_JINA_API_KEY',
    'REACT_APP_SERP_API_KEY'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.warn('[DEV] Missing environment variables:', missingVars.join(', '));
    console.warn('[DEV] Some features may not work correctly without these variables.');
  } else {
    console.log('[DEV] All required environment variables are set.');
  }
};

/**
 * Initialize development setup
 * Call this function at application startup in development mode
 */
export const initDevSetup = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[DEV] Running in development mode');
    setupAxiosInterceptors();
    checkEnvironmentVariables();
  }
};
