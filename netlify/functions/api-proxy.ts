/**
 * API Proxy for SerpAPI and JinaAPI
 * Version 1.0
 * 
 * This proxy function securely handles API calls to external services
 * without exposing API keys in client-side code.
 */

import { Handler } from '@netlify/functions';
import axios from 'axios';
import { EnvironmentConfig } from '../../src/config/environment';

const handler: Handler = async (event, context) => {
  try {
    const config = EnvironmentConfig.getInstance();
    const { apiType, path, params } = JSON.parse(event.body || '{}');

    let response;
    switch (apiType) {
      case 'onet': {
        const onetConfig = config.getOnetConfig();
        response = await handleOnetRequest(path, params, onetConfig);
        break;
      }
      case 'serp': {
        const serpConfig = config.getSerpConfig();
        response = await handleSerpRequest(path, params, serpConfig);
        break;
      }
      case 'jina': {
        const jinaConfig = config.getJinaConfig();
        response = await handleJinaRequest(path, params, jinaConfig);
        break;
      }
      default:
        throw new Error(`Unsupported API type: ${apiType}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify(response)
    };
  } catch (error) {
    console.error('API Proxy Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};

/**
 * Call SerpAPI with the provided parameters
 */
async function handleSerpRequest(path: string, params: any, serpConfig: any) {
  const baseUrl = 'https://serpapi.com';
  
  // Add API key to params
  const apiParams = {
    ...params,
    api_key: serpConfig.apiKey,
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
async function handleJinaRequest(path: string, params: any, jinaConfig: any) {
  const baseUrl = 'https://api.jina.ai/v1';
  
  // Make request
  return axios.post(`${baseUrl}/${path}`, params, {
    headers: {
      'Authorization': `Bearer ${jinaConfig.apiKey}`,
      'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
  });
}

export { handler };
