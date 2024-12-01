import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { AutomationTrend } from '@/types/automation';

interface TrendAnalysisProps {
  trends: AutomationTrend[];
  historicalData?: AutomationTrend[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    payload: AutomationTrend;
  }>;
  label?: string;
}

export const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ trends, historicalData = [] }) => {
  const combinedData = [...historicalData, ...trends].sort((a, b) => a.year - b.year);

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (!active || !payload?.[0]) return null;

    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border">
        <p className="font-bold">Year: {label}</p>
        <p>APO Score: {payload[0].value.toFixed(2)}%</p>
        <p>Confidence: {(data.confidence * 100).toFixed(1)}%</p>
        {data.keyFactors && data.keyFactors.length > 0 && (
          <div className="mt-2">
            <p className="font-semibold">Key Factors:</p>
            <ul className="list-disc list-inside">
              {data.keyFactors.map((factor, index) => (
                <li key={index}>{factor}</li>
              ))}
            </ul>
          </div>
        )}
        {data.marketTrends && data.marketTrends.length > 0 && (
          <div className="mt-2">
            <p className="font-semibold">Market Trends:</p>
            <ul className="list-disc list-inside">
              {data.marketTrends.map((trend, index) => (
                <li key={index}>{trend}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Automation Potential Trend Analysis
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Historical and predicted automation potential over time</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combinedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="year" 
                domain={['auto', 'auto']}
                type="number"
                tickFormatter={(value) => value.toString()}
              />
              <YAxis 
                domain={[0, 100]} 
                tickFormatter={(value) => `${value}%`}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="score"
                name="Historical APO"
                stroke="#8884d8"
                dot={true}
                strokeWidth={2}
                data={historicalData}
              />
              <Line
                type="monotone"
                dataKey="score"
                name="Predicted APO"
                stroke="#82ca9d"
                strokeDasharray="5 5"
                dot={true}
                strokeWidth={2}
                data={trends}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-sm text-gray-500">
          <p>* Confidence levels and predictions are based on historical data and market trends</p>
          <p>* Dashed line indicates predicted values</p>
        </div>
      </CardContent>
    </Card>
  );
};
