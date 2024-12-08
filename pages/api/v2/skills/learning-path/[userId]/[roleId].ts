import { NextApiRequest, NextApiResponse } from 'next';
import { ONET_API_BASE_URL } from '@/services/onet/config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId, roleId } = req.query;

  if (!userId || !roleId) {
    return res.status(400).json({ error: 'User ID and Role ID are required' });
  }

  try {
    const response = await fetch(`${ONET_API_BASE_URL}/skills/learning-path/${userId}/${roleId}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.ONET_USERNAME}:${process.env.ONET_PASSWORD}`).toString('base64')}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`O*NET API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json({ learning_path: data.learning_path });
  } catch (error) {
    console.error('Error fetching learning path:', error);
    return res.status(500).json({ error: 'Failed to fetch learning path data from O*NET' });
  }
}
