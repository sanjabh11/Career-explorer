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

interface APOStackedBarChartProps {
  data: {
    name: string;
    apo: number;
  }[];
}

const APOStackedBarChart: React.FC<APOStackedBarChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div>No data available for APO Stacked Bar Chart</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value) => `${value}%`} />
        <Legend />
        <Bar dataKey="apo" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default APOStackedBarChart;