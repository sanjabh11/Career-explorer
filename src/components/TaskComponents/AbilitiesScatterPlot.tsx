import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AbilitiesScatterPlotProps {
  data: {
    name: string;
    importance: number;
    apo: number;
  }[];
}

const AbilitiesScatterPlot: React.FC<AbilitiesScatterPlotProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart>
        <CartesianGrid />
        <XAxis type="number" dataKey="importance" name="Importance" unit="%" />
        <YAxis type="number" dataKey="apo" name="APO" unit="%" />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        <Scatter name="Abilities" data={data} fill="#8884d8" />
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default AbilitiesScatterPlot;