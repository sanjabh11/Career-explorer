import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface TopCareersBubbleChartProps {
  data: {
    name: string;
    similarity: number;
    apo: number;
  }[];
}

const TopCareersBubbleChart: React.FC<TopCareersBubbleChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart>
        <XAxis type="number" dataKey="similarity" name="Similarity" unit="%" />
        <YAxis type="number" dataKey="apo" name="APO" unit="%" />
        <ZAxis dataKey="name" range={[60, 400]} />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        <Scatter name="Careers" data={data} fill="#8884d8" />
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default TopCareersBubbleChart;