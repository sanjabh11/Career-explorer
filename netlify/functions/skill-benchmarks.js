exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers
    };
  }

  try {
    const { code, industry } = event.queryStringParameters;

    if (!code || !industry) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required parameters' })
      };
    }

    // Mock benchmark data for now
    const benchmarks = {
      industry_average: 3.5,
      peer_average: 4.0,
      top_performers: 4.8,
      your_score: 0
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(benchmarks)
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch skill benchmarks' })
    };
  }
};
