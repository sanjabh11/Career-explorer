import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

// Note: In production, these should be in environment variables
const ONET_USERNAME = process.env.ONET_USERNAME || 'ignite_consulting';
const ONET_PASSWORD = process.env.ONET_PASSWORD || '4675rxg';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'O*NET code is required' });
  }

  try {
    // Validate O*NET code format (e.g., "13-1151.00")
    const onetCode = Array.isArray(id) ? id[0] : id;
    if (!/^\d{2}-\d{4}\.\d{2}$/.test(onetCode)) {
      return res.status(400).json({ error: 'Invalid O*NET code format' });
    }

    // Make the request to O*NET API using the correct endpoint
    const response = await axios.get(
      `https://services.onetcenter.org/ws/online/occupations/${onetCode}/summary/skills`,
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

    // Transform O*NET response to match our expected format
    const skills = response.data.element.map((skill: any) => ({
      id: skill.id,
      name: skill.name,
      category: "Core Skills",
      current_level: 0,
      required_level: Math.round(skill.level.value * 5), // Convert O*NET scale to our 0-5 scale
      description: skill.description,
      importance: Math.round(skill.importance.value * 100) // Convert to percentage
    }));

    res.status(200).json(skills);
  } catch (error) {
    console.error('Error fetching skills from O*NET:', error);
    if (axios.isAxiosError(error) && error.response) {
      return res.status(error.response.status).json({ 
        error: `O*NET API error: ${error.response.statusText}`,
        details: error.response.data
      });
    }
    res.status(500).json({ error: 'Failed to fetch skills data' });
  }
}
