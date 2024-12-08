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
    const { code } = event.queryStringParameters;

    if (!code) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required parameters' })
      };
    }

    // Mock reviews data for now
    const reviews = [
      {
        id: 'rev1',
        reviewer: 'John Doe',
        role: 'Senior Training Specialist',
        rating: 4,
        comment: 'Great progress in developing training materials',
        date: '2024-01-15'
      },
      {
        id: 'rev2',
        reviewer: 'Jane Smith',
        role: 'Learning & Development Manager',
        rating: 5,
        comment: 'Excellent understanding of training methodologies',
        date: '2024-01-10'
      }
    ];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(reviews)
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch skill reviews' })
    };
  }
};
