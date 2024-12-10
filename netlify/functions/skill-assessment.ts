import { Handler } from '@netlify/functions';

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

    // Store the assessment in local storage (this is a placeholder for actual implementation)
    const assessments = JSON.parse(localStorage.getItem(`user_skills_${userId}`) || '{}');
    assessments[skillId] = { level, confidence, lastUpdated: new Date().toISOString() };
    localStorage.setItem(`user_skills_${userId}`, JSON.stringify(assessments));

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
