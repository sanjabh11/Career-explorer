import dotenv from 'dotenv';
import { EnvironmentConfig } from './config/environment';

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Validate environment configuration on startup
try {
  EnvironmentConfig.getInstance();
} catch (error) {
  console.error('Environment configuration error:', error);
  process.exit(1);
}