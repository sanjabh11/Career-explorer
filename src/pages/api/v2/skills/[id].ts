import { NextApiRequest, NextApiResponse } from 'next';
import { ONET_BASE_URL } from '../../../../services/onet/config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Skill ID is required' });
  }

  try {
    const response = await fetch(`${ONET_BASE_URL}/skills/${id}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.ONET_USERNAME}:${process.env.ONET_PASSWORD}`).toString('base64')}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`O*NET API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching skill data:', error);
    return res.status(500).json({ error: 'Failed to fetch skill data from O*NET' });
  }
}
