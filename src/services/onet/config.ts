// O*NET API Configuration
export const ONET_VERSION = '28.0';
export const ONET_BASE_URL = 'https://services.onetcenter.org/ws';

export const getOnetCredentials = () => ({
  username: process.env.NEXT_PUBLIC_ONET_USERNAME || '',
  password: process.env.NEXT_PUBLIC_ONET_PASSWORD || '',
});

// API Endpoints
export const ENDPOINTS = {
  SKILLS: '/skills',
  OCCUPATIONS: '/occupations',
  EDUCATION: '/education',
  WORK_ENVIRONMENT: '/work_environment',
  DETAILS: (code: string) => `${ONET_BASE_URL}?code=${code}`,
  SEARCH: (keyword: string) => `${ONET_BASE_URL}/search?keyword=${keyword}`,
};

// Data transformation constants
export const SKILL_LEVEL_MULTIPLIER = 5; // Convert 0-1 to 0-5 scale
export const IMPORTANCE_MULTIPLIER = 100; // Convert 0-1 to percentage

// Error messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access. Please check your O*NET credentials.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'An error occurred while fetching data from O*NET.',
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  INVALID_CODE: 'Invalid O*NET code provided',
  FETCH_ERROR: 'Failed to fetch data from O*NET',
  TRANSFORM_ERROR: 'Error transforming O*NET data',
};
