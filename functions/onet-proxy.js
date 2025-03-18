// functions/onet-proxy.js
// Version 1.3.0

const axios = require('axios');

exports.handler = async function(event, context) {
  // Parse request details
  const path = event.path.replace('/.netlify/functions/onet-proxy', '');
  const queryParams = event.queryStringParameters || {};
  const method = event.httpMethod;
  const body = method !== 'GET' ? JSON.parse(event.body || '{}') : {};
  
  // Get O*NET API credentials from environment variables
  const ONET_API_URL = process.env.NEXT_PUBLIC_ONET_API_URL;
  const ONET_USERNAME = process.env.ONET_USERNAME;
  const ONET_PASSWORD = process.env.ONET_PASSWORD;
  
  // Validate required environment variables
  if (!ONET_API_URL || !ONET_USERNAME || !ONET_PASSWORD) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Missing required environment variables for O*NET API access'
      }),
    };
  }
  
  try {
    // Configure request options for O*NET API
    const headers = {
      'Authorization': `Basic ${Buffer.from(`${ONET_USERNAME}:${ONET_PASSWORD}`).toString('base64')}`,
      'Content-Type': 'application/json',
    };
    
    // Handle different API endpoints
    let url = ONET_API_URL;
    
    // Default request parameters
    const requestOptions = {
      headers,
      validateStatus: false,
    };
    
    // Handle different API endpoints based on path
    if (path === '' || path === '/') {
      // Default search endpoint
      url = `${ONET_API_URL}/occupations`;
      requestOptions.params = queryParams;
    } else if (path === '/details') {
      // Occupation details endpoint
      url = `${ONET_API_URL}/occupations/${queryParams.code}`;
    } else if (path.startsWith('/interest-profiler')) {
      // Interest Profiler endpoints
      if (path === '/interest-profiler/questions') {
        url = `${ONET_API_URL}/interest-profiler/questions`;
        requestOptions.params = queryParams;
      } else if (path === '/interest-profiler/calculate') {
        url = `${ONET_API_URL}/interest-profiler/results`;
        requestOptions.method = 'POST';
        requestOptions.data = body;
      } else if (path === '/interest-profiler/matches') {
        url = `${ONET_API_URL}/interest-profiler/matches`;
        requestOptions.method = 'POST';
        requestOptions.data = body;
      }
    } else if (path === '/job-zones') {
      url = `${ONET_API_URL}/job-zones`;
    } else if (path.startsWith('/bright-outlook')) {
      // Bright Outlook endpoints
      if (path === '/bright-outlook/occupations') {
        url = `${ONET_API_URL}/bright-outlook`;
      } else if (path === '/bright-outlook/check') {
        url = `${ONET_API_URL}/bright-outlook/${queryParams.code}`;
      } else if (path === '/bright-outlook/category') {
        url = `${ONET_API_URL}/bright-outlook/category/${queryParams.category}`;
      }
    } else if (path === '/growth-indicators') {
      url = `${ONET_API_URL}/occupations/${queryParams.code}/growth`;
    } else if (path === '/trending-industries') {
      url = `${ONET_API_URL}/industries/trending`;
      requestOptions.params = queryParams;
    } else if (path.startsWith('/dwa')) {
      // Detailed Work Activities endpoints
      if (path === '/dwa') {
        url = `${ONET_API_URL}/occupations/${queryParams.code}/dwa`;
      } else if (path === '/dwa/categories') {
        url = `${ONET_API_URL}/occupations/${queryParams.code}/dwa/categories`;
      } else if (path === '/dwa/task-mappings') {
        url = `${ONET_API_URL}/occupations/${queryParams.code}/dwa/tasks`;
      } else if (path === '/dwa/hierarchy') {
        url = `${ONET_API_URL}/dwa/hierarchy`;
      } else if (path === '/dwa/frequency') {
        url = `${ONET_API_URL}/dwa/frequency`;
        requestOptions.method = 'POST';
        requestOptions.data = body;
      }
    } else if (path.startsWith('/skills')) {
      // Skills Transferability endpoints
      if (path === '/skills/transferability') {
        url = `${ONET_API_URL}/skills/transferability`;
        requestOptions.params = queryParams;
      } else if (path === '/skills/visualization') {
        url = `${ONET_API_URL}/skills/visualization`;
        requestOptions.params = queryParams;
      } else if (path === '/skills/clusters') {
        url = `${ONET_API_URL}/skills/clusters`;
      } else if (path === '/skills/pathway') {
        url = `${ONET_API_URL}/skills/pathway`;
        requestOptions.params = queryParams;
      }
    } else if (path.startsWith('/technology')) {
      // Technology Skills endpoints
      if (path === '/technologies') {
        url = `${ONET_API_URL}/occupations/${queryParams.code}/technologies`;
      } else if (path === '/technology/details') {
        url = `${ONET_API_URL}/technology/${queryParams.id}`;
      } else if (path === '/technology/categories') {
        url = `${ONET_API_URL}/technology/categories`;
      } else if (path === '/technology/trends') {
        url = `${ONET_API_URL}/technology/trends`;
        requestOptions.params = queryParams;
      } else if (path === '/technology/hot') {
        url = `${ONET_API_URL}/technology/hot`;
        requestOptions.params = queryParams;
      }
    } else {
      // Fallback for unknown endpoints
      return {
        statusCode: 404,
        body: JSON.stringify({ error: `Endpoint not found: ${path}` }),
      };
    }
    
    // Make the request to O*NET API
    let response;
    
    if (method === 'GET') {
      response = await axios.get(url, requestOptions);
    } else if (method === 'POST') {
      response = await axios.post(url, requestOptions.data, {
        headers: requestOptions.headers,
        validateStatus: requestOptions.validateStatus
      });
    } else {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: `Method not allowed: ${method}` }),
      };
    }
    
    // Handle response
    return {
      statusCode: response.status,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error('O*NET API Proxy Error:', error);
    
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({
        error: error.response?.data?.error || 'Internal server error',
        details: error.message
      }),
    };
  }
};
