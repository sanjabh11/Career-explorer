import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  try {
    // Mock data for now - replace with actual data source later
    const review = {
      id: Number(id),
      reviewer: "John Doe",
      date: "2023-12-07",
      rating: 4,
      comments: "Shows good progress in skill development",
      areas_of_improvement: ["Communication", "Problem Solving"],
      strengths: ["Technical Skills", "Team Collaboration"]
    };

    return res.status(200).json(review);
  } catch (error) {
    console.error('Error fetching review:', error);
    return res.status(500).json({ error: 'Failed to fetch review details' });
  }
}
