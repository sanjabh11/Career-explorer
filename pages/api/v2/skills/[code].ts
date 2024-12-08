import { NextApiRequest, NextApiResponse } from 'next';
import SkillsService from '@/services/SkillsService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API Route Handler Called:', req.query); // Debug log
  
  // Handle CORS
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

  // Extract the O*NET code from the query
  const { code } = req.query;
  
  if (!code || Array.isArray(code)) {
    console.error('Invalid code parameter:', code); // Debug log
    return res.status(400).json({ error: 'Invalid O*NET code parameter' });
  }

  // Validate O*NET code format
  if (!/^\d{2}-\d{4}\.\d{2}$/.test(code)) {
    console.error('Invalid code format:', code); // Debug log
    return res.status(400).json({ error: 'Invalid O*NET code format' });
  }

  try {
    console.log(`Fetching skills for O*NET code: ${code}`); // Debug log
    
    // Get skills for occupation through our proxy service
    const skills = await SkillsService.getSkillsForOccupation(code);
    
    console.log(`Transformed ${skills.length} skills`); // Debug log
    res.status(200).json(skills);
  } catch (error) {
    console.error('Error fetching skills from O*NET:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch skills data'
    });
  }
}
