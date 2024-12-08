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

    // Mock projects data for now
    const projects = [
      {
        id: 'proj1',
        title: 'Design Training Program',
        description: 'Create a comprehensive training program for new employees',
        difficulty: 3,
        duration: '2 weeks',
        skills_covered: ['Instructional Design', 'Curriculum Development'],
        status: 'available'
      },
      {
        id: 'proj2',
        title: 'Training Effectiveness Analysis',
        description: 'Analyze and report on the effectiveness of existing training programs',
        difficulty: 4,
        duration: '1 week',
        skills_covered: ['Training Analysis', 'Report Writing'],
        status: 'available'
      }
    ];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(projects)
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch skill projects' })
    };
  }
};
