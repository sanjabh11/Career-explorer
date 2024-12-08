import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  try {
    // Mock data for now - replace with actual data source later
    const project = {
      id: Number(id),
      title: "Sample Project",
      description: "This is a sample project to demonstrate skills",
      status: "in_progress",
      completion: 65,
      due_date: "2024-12-31",
      skills_demonstrated: ["JavaScript", "React", "TypeScript"]
    };

    return res.status(200).json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return res.status(500).json({ error: 'Failed to fetch project details' });
  }
}
