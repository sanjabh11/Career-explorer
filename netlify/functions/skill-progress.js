const { getOccupationDetails } = require('../../src/services/OnetService');

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
    const { code, userId } = event.queryStringParameters;

    if (!code || !userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required parameters' })
      };
    }

    // Get occupation details from O*NET
    const details = await getOccupationDetails(code);

    // Transform skills into learning path format
    const learning_path = details.skills.map(skill => ({
      skill_id: skill.id || `skill-${Math.random().toString(36).substr(2, 9)}`,
      name: skill.name,
      current_level: 0,
      target_level: Math.round((skill.level || 0) * 5),
      progress: 0,
      resources: []
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ learning_path })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch skill progress' })
    };
  }
};
