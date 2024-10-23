import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface OccupationComparisonChartProps {
  data: {
    name: string;
    apo: number;
  }[];
}

const OccupationComparisonChart: React.FC<OccupationComparisonChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical">
        <XAxis type="number" />
        <YAxis type="category" dataKey="name" />
        <Tooltip formatter={(value) => `${value}%`} />
        <Legend />
        <Bar dataKey="apo" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default OccupationComparisonChart;