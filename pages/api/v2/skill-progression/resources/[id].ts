import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, max_difficulty, max_cost, format, type } = req.query;

  try {
    // Mock data for now - replace with actual data source later
    const resources = [
      {
        id: 1,
        title: "Introduction to Web Development",
        type: "course",
        difficulty: 3,
        cost: 0,
        url: "https://example.com/course1",
        duration: "2 hours"
      },
      {
        id: 2,
        title: "Advanced JavaScript Concepts",
        type: "video",
        difficulty: 7,
        cost: 29.99,
        url: "https://example.com/course2",
        duration: "4 hours"
      }
    ];

    return res.status(200).json({ resources });
  } catch (error) {
    console.error('Error fetching learning resources:', error);
    return res.status(500).json({ error: 'Failed to fetch learning resources' });
  }
}
