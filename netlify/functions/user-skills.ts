import { Handler } from '@netlify/functions';
import { MongoClient } from 'mongodb';

const handler: Handler = async (event) => {
  // Only allow GET method
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const userId = event.queryStringParameters?.userId;

    if (!userId) {
      return {
        statusCode: 400,
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
      body: JSON.stringify(skills),
    };
  } catch (error) {
    console.error('Error fetching user skills:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

export { handler };
