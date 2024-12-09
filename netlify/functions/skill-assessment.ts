import { Handler } from '@netlify/functions';
import { MongoClient } from 'mongodb';

const handler: Handler = async (event) => {
  // Only allow POST method
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { userId, skillId, level, confidence } = JSON.parse(event.body || '{}');

    // Validate required fields
    if (!userId || !skillId || level === undefined || confidence === undefined) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // Connect to MongoDB (you'll need to set up MONGODB_URI in your Netlify environment variables)
    const client = await MongoClient.connect(process.env.MONGODB_URI || '');
    const db = client.db('career-explorer');
    const collection = db.collection('skill-assessments');

    // Save or update the assessment
    await collection.updateOne(
      { userId, skillId },
      {
        $set: {
          level,
          confidence,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    await client.close();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Assessment saved successfully' }),
    };
  } catch (error) {
    console.error('Error saving skill assessment:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

export { handler };
