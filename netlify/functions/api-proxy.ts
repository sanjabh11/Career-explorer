/**
 * API Proxy for SerpAPI and JinaAPI
 * Version 1.0
 * 
 * This proxy function securely handles API calls to external services
 * without exposing API keys in client-side code.
 */

import { Handler } from '@netlify/functions';
import axios from 'axios';

// API configurations
const SERP_API_KEY = process.env.SERP_API_KEY || '7e3aa9cacd93806c7b8f31b3f84e0c31149546f95f97bab73e4b62048dafd256';
const JINA_API_KEY = process.env.JINA_API_KEY || 'jina_f538de4fd4be4147909f381c14854289F5zkC_DM6KCyTfbbHaEIkyg41syn';

// Cache settings
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const cache: Record<string, { data: any; timestamp: number }> = {};

const handler: Handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    // Parse request body
    const { apiType, path, params, cacheKey } = JSON.parse(event.body || '{}');

    // Check for required parameters
    if (!apiType || !path) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required parameters' }),
      };
    }

    // Check cache if cacheKey is provided
    if (cacheKey && cache[cacheKey] && (Date.now() - cache[cacheKey].timestamp) < CACHE_DURATION) {
      console.log(`Cache hit for key: ${cacheKey}`);
      return {
        statusCode: 200,
        body: JSON.stringify(cache[cacheKey].data),
      };
    }

    let response;

    // Route to appropriate API
    switch (apiType) {
      case 'serp':
        response = await callSerpApi(path, params);
        break;
      case 'jina':
        response = await callJinaApi(path, params);
        break;
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid API type' }),
        };
    }

    // Store in cache if cacheKey is provided
    if (cacheKey) {
      cache[cacheKey] = {
        data: response.data,
        timestamp: Date.now(),
      };
      console.log(`Cached response for key: ${cacheKey}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error('API proxy error:', error);
    
    // Handle different error types
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.error || error.message;
      
      return {
        statusCode: status,
        body: JSON.stringify({ 
          error: message,
          details: error.response?.data
        }),
      };
    }
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};

/**
 * Call SerpAPI with the provided parameters
 */
async function callSerpApi(path: string, params: any) {
  const baseUrl = 'https://serpapi.com';
  
  // Add API key to params
  const apiParams = {
    ...params,
    api_key: SERP_API_KEY,
  };
  
  // Make request
  return axios.get(`${baseUrl}/${path}`, {
    params: apiParams,
    timeout: 10000, // 10 second timeout
  });
}

/**
 * Call JinaAPI with the provided parameters
 */
async function callJinaApi(path: string, params: any) {
  const baseUrl = 'https://api.jina.ai/v1';
  
  // Make request
  return axios.post(`${baseUrl}/${path}`, params, {
    headers: {
      'Authorization': `Bearer ${JINA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
  });
}

export { handler };
