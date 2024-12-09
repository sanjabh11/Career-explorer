import { Handler } from '@netlify/functions';
import fetch from 'node-fetch';

const handler: Handler = async (event) => {
  // Only allow GET method
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const skillId = event.queryStringParameters?.skillId;

    if (!skillId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing skillId parameter' }),
      };
    }

    // Fetch training resources from O*NET API
    const onetResponse = await fetch(
      `https://services.onetcenter.org/ws/online/occupations/${skillId}/training`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            process.env.ONET_API_KEY + ':' + process.env.ONET_API_SECRET
          ).toString('base64')}`,
        },
      }
    );

    if (!onetResponse.ok) {
      throw new Error('Failed to fetch training data from O*NET');
    }

    const onetData = await onetResponse.json();

    // Transform O*NET data into our format
    const trainingResources = onetData.training.map((resource: any) => ({
      title: resource.title,
      provider: resource.provider,
      url: resource.url,
      type: resource.type,
      level: resource.level,
      description: resource.description,
      duration: resource.duration,
      cost: resource.cost,
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(trainingResources),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  } catch (error) {
    console.error('Error fetching training resources:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

export { handler };
