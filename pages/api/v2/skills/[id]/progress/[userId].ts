import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, userId } = req.query;

  const mockProgress = {
    skillId: Number(id),
    userId: Number(userId),
    current_level: 3,
    target_level: 5,
    progress_percentage: 60,
    last_activity_date: new Date().toISOString(),
    recent_achievements: [
      {
        id: 1,
        title: "Completed Basic Tutorial",
        date: new Date().toISOString(),
        points: 100
      }
    ]
  };

  return res.status(200).json(mockProgress);
}
