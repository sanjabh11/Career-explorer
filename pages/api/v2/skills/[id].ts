import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

// Note: In production, these should be in environment variables
const ONET_USERNAME = 'ignite_consulting';
const ONET_PASSWORD = '4675rxg';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'O*NET code is required' });
  }

  try {
    // Validate O*NET code format (e.g., "13-1151.00")
    const onetCode = id.toString();
    if (!/^\d{2}-\d{4}\.\d{2}$/.test(onetCode)) {
      return res.status(400).json({ error: 'Invalid O*NET code format' });
    }

    // For now, return mock data that matches our expected format
    const mockSkills = [
      {
        id: "2.a.1.a",
        name: "Active Learning",
        category: "Core Skills",
        current_level: 0,
        required_level: 4,
        description: "Understanding the implications of new information for both current and future problem-solving and decision-making.",
        importance: 91
      },
      {
        id: "2.a.1.b",
        name: "Instructional Design",
        category: "Technical Skills",
        current_level: 0,
        required_level: 4,
        description: "Designing and implementing effective training programs",
        importance: 86
      },
      {
        id: "2.a.1.c",
        name: "Training Program Development",
        category: "Technical Skills",
        current_level: 0,
        required_level: 3,
        description: "Creating and maintaining training programs for organizations",
        importance: 82
      }
    ];

    // Return mock data for now
    // In production, you would use the O*NET API call:
    /*
    const response = await axios.get(
      `https://services.onetcenter.org/ws/online/occupations/${onetCode}/details`,
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
    */

    res.status(200).json(mockSkills);
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ error: 'Failed to fetch skills data' });
  }
}
