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
    const { code, maxDifficulty, maxCost } = event.queryStringParameters;

    if (!code) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required parameters' })
      };
    }

    // Mock resources data for now
    const resources = [
      {
        id: 'course1',
        title: 'Introduction to Training and Development',
        type: 'course',
        provider: 'Coursera',
        difficulty: 2,
        cost: 49.99,
        duration: '4 weeks',
        rating: 4.5,
        url: 'https://coursera.org/example'
      },
      {
        id: 'book1',
        title: 'Training and Development: Principles and Practices',
        type: 'book',
        provider: 'Amazon',
        difficulty: 3,
        cost: 29.99,
        duration: 'Self-paced',
        rating: 4.2,
        url: 'https://amazon.com/example'
      }
    ];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(resources)
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch skill resources' })
    };
  }
};
