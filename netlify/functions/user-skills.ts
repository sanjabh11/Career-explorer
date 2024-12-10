import { Handler } from '@netlify/functions';

// Sample user skills data
const userSkills = [
    { id: '1', name: 'JavaScript', level: 5, confidence: 80, lastUpdated: new Date().toISOString() },
    { id: '2', name: 'React', level: 4, confidence: 75, lastUpdated: new Date().toISOString() },
    { id: '3', name: 'Node.js', level: 3, confidence: 70, lastUpdated: new Date().toISOString() },
];

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
        // Return the user skills data
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(userSkills)
        };
    } catch (error) {
        console.error('Error fetching user skills:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to fetch user skills data' })
        };
    }
};

export { handler };
