import { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const userId = event.queryStringParameters?.userId;

    if (!userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing userId parameter' }),
      };
    }

    // Connect to MongoDB
    const client = await MongoClient.connect(process.env.MONGODB_URI || '');
    const db = client.db('career-explorer');
    const collection = db.collection('skill-assessments');

    // Get all skill assessments for the user
    const assessments = await collection
      .find({ userId })
      .toArray();

    await client.close();

    // Transform the assessments into the Skill format
    const skills = assessments.map(assessment => ({
      id: assessment.skillId,
      current_level: assessment.level,
      confidence: assessment.confidence,
      updatedAt: assessment.updatedAt,
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(skills),
    };
  } catch (error) {
    console.error('Error fetching user skills:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

export { handler };
