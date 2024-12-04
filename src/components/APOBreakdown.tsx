import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { APOItem } from '@/types/onet';
import { calculateAPO } from '@/utils/apoCalculations';
import { CustomTooltipProps } from '@/types/occupation';

interface APOBreakdownProps {
  items: APOItem[];
  category: string;
}

interface ChartData {
  name: string;
  apo: number;
  genAIImpact?: 'High' | 'Medium' | 'Low';
}

const APOBreakdown: React.FC<APOBreakdownProps> = ({ items, category }) => {
  const truncateString = (str: string, num: number) => {
    if (str.length <= num) return str;
    return str.slice(0, num) + '...';
  };

  const data: ChartData[] = items.map(item => ({
    name: truncateString(item.name, 30), // Limit task name length
    apo: calculateAPO(item, category),
    genAIImpact: item.genAIImpact as 'High' | 'Medium' | 'Low' | undefined
  }));

  const getBarColor = (apo: number, genAIImpact: 'High' | 'Medium' | 'Low' | undefined) => {
    // Convert numeric APO to impact level
    const apoImpact = apo >= 75 ? 'High' : apo >= 50 ? 'Medium' : 'Low';
    return getImpactColor(genAIImpact || apoImpact);
  };

  const getImpactColor = (impact: 'High' | 'Medium' | 'Low') => {
    if (impact === 'High') return '#ff0000';
    if (impact === 'Medium') return '#ffa500';
    return '#00ff00';
  };

  return (
    <div style={{ width: '100%', height: '600px', overflowY: 'auto' }}>
      <ResponsiveContainer width="100%" height={Math.max(400, data.length * 40)}>
        <BarChart 
          data={data} 
          layout="vertical" 
          margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 12 }} />
          <Tooltip 
            formatter={(value: number, name: string, props: CustomTooltipProps<number, string>) => [
              `${value.toFixed(2)}%`, 
              `APO - GenAI Impact: ${props.payload?.[0]?.payload.genAIImpact || 'N/A'}`
            ]}
            labelFormatter={(label) => data.find(item => item.name === label)?.name || label}
          />
          <Legend />
          <Bar dataKey="apo" name="APO">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.apo, entry.genAIImpact)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default APOBreakdown;
