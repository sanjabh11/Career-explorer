import fetch from 'node-fetch';

const ONET_BASE_URL = process.env.REACT_APP_ONET_API_URL || 'https://services.onetcenter.org/ws/online';
const ONET_USERNAME = process.env.ONET_USERNAME;
const ONET_PASSWORD = process.env.ONET_PASSWORD;

exports.handler = async function(event, context) {
  try {
    // Log incoming request details
    console.log('Request path:', event.path);
    console.log('Environment:', process.env.NODE_ENV);
    
    const path = event.path.replace('/.netlify/functions/onet-proxy', '');
    const url = `${ONET_BASE_URL}${path}`;
    
    console.log('Fetching from O*NET:', url);

    const response = await fetch(url, {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${ONET_USERNAME}:${ONET_PASSWORD}`).toString('base64'),
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('O*NET API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      throw new Error(`O*NET API responded with ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('O*NET API response:', data); // Debug log

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Proxy error:', error);
    return {
      statusCode: error.response?.status || 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
      },
      body: JSON.stringify({ 
        error: 'Failed to fetch data from O*NET',
        details: error.message,
        path: event.path
      })
    };
  }
}; 