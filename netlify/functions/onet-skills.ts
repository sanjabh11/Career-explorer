import { Handler } from '@netlify/functions';
import axios from 'axios';

const ONET_BASE_URL = 'https://services.onetcenter.org/ws/online';
const ONET_USERNAME = process.env.ONET_USERNAME;
const ONET_PASSWORD = process.env.ONET_PASSWORD;

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

  const { occupationId } = event.queryStringParameters || {};

  if (!occupationId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Occupation ID is required' })
    };
  }

  try {
    console.log(`Fetching skills for occupation: ${occupationId}`);
    
    const response = await axios.get(
      `${ONET_BASE_URL}/occupations/${occupationId}/summary/skills`,
      {
        auth: {
          username: ONET_USERNAME,
          password: ONET_PASSWORD
        },
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    console.log('Response from O*NET API:', response.data);

    if (response.status !== 200) {
      console.error(`O*NET API error: ${response.status} ${response.statusText}`);
      throw new Error(`O*NET API responded with status: ${response.status}`);
    }

    const skills = response.data?.element?.map((skill: any) => ({
      id: skill.id,
      name: skill.name,
      description: skill.description || '',
      category: skill.category || 'General',
      required_level: Math.round((skill.level?.value || 0) * 5), // Convert to 0-5 scale
      importance: Math.round((skill.importance?.value || 0) * 100), // Convert to percentage
      proficiency_criteria: []
    })) || [];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ element: skills })
    };
  } catch (error) {
    console.error('Error fetching from O*NET:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        status: error.response?.status,
        data: error.response?.data
      });
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch skills data',
        details: error.message || 'No details available'
      })
    };
  }
};

export { handler };
