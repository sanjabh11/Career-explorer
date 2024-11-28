import React from 'react';
import { Treemap, Tooltip, ResponsiveContainer } from 'recharts';

interface TechnologyUsageTreemapProps {
  data: {
    name: string;
    size: number;
  }[];
}

const TechnologyUsageTreemap: React.FC<TechnologyUsageTreemapProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <Treemap
        data={data}
        dataKey="size"
        nameKey="name"
        stroke="#fff"
        fill="#8884d8"
      >
        <Tooltip />
      </Treemap>
    </ResponsiveContainer>
  );
};

export default TechnologyUsageTreemap;