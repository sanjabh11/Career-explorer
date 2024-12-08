import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const ONET_USERNAME = process.env.ONET_USERNAME || 'ignite_consulting';
const ONET_PASSWORD = process.env.ONET_PASSWORD || '4675rxg';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'O*NET code is required' });
  }

  try {
    const onetCode = Array.isArray(id) ? id[0] : id;
    if (!/^\d{2}-\d{4}\.\d{2}$/.test(onetCode)) {
      return res.status(400).json({ error: 'Invalid O*NET code format' });
    }

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

    const skills = response.data.element.map((skill: any) => ({
      id: skill.id,
      name: skill.name,
      category: "Core Skills",
      current_level: 0,
      required_level: Math.round(skill.level.value * 5),
      description: skill.description,
      importance: Math.round(skill.importance.value * 100)
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
