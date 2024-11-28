import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface APOTrendLineChartProps {
  data: {
    year: number;
    apo: number;
  }[];
}

const APOTrendLineChart: React.FC<APOTrendLineChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip formatter={(value) => `${value}%`} />
        <Legend />
        <Line type="monotone" dataKey="apo" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default APOTrendLineChart;