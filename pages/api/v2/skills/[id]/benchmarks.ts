import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const { industry } = req.query;

  const mockBenchmarks = {
    skillId: Number(id),
    industry: industry,
    benchmarks: [
      {
        level: "Entry",
        score: 2,
        description: "Basic understanding and application"
      },
      {
        level: "Intermediate",
        score: 3,
        description: "Practical application and understanding"
      },
      {
        level: "Advanced",
        score: 4,
        description: "Deep understanding and expertise"
      }
    ],
    industry_average: 3.2,
    percentile_rank: 75
  };

  return res.status(200).json(mockBenchmarks);
}
