import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import type { APOTrendData, IndustryName } from '@/services/APOService';

interface APOTrendAnalysisProps {
  data: APOTrendData[];
  industries: IndustryName[];
  selectedIndustry: IndustryName;
  onIndustryChange: (industry: IndustryName) => void;
  zoomLevel: number;
  chartType: 'line' | 'area' | 'bar';
}

interface ExtendedAPOTrendData extends APOTrendData {
  isProjected?: boolean;
}

const APOTrendAnalysis: React.FC<APOTrendAnalysisProps> = ({
  data,
  industries,
  selectedIndustry,
  onIndustryChange,
  zoomLevel,
  chartType,
}) => {
  const [selectedArea, setSelectedArea] = useState<{ start: number; end: number } | null>(null);
  const chartHeight = 400 * zoomLevel;

  const handleMouseDown = (e: any) => {
    if (e && e.activeLabel) {
      setSelectedArea({ start: e.activeLabel, end: e.activeLabel });
    }
  };

  const handleMouseMove = (e: any) => {
    if (selectedArea && e && e.activeLabel) {
      setSelectedArea(prev => prev ? { ...prev, end: e.activeLabel } : null);
    }
  };

  const handleMouseUp = () => {
    setSelectedArea(null);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload as ExtendedAPOTrendData;
      return (
        <div className="bg-white p-4 border rounded shadow-lg">
          <p className="font-medium">{`Year: ${label}`}</p>
          <p className="text-sm text-blue-600">{`APO Score: ${payload[0].value.toFixed(2)}%`}</p>
          {dataPoint.isProjected && (
            <p className="text-sm text-gray-500 italic">Projected Value</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>APO Trend Analysis</CardTitle>
          <Select value={selectedIndustry} onValueChange={onIndustryChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {industries.map(industry => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ height: `${chartHeight}px` }} className="transition-all duration-300">
          {chartType === 'line' ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="year"
                  label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
                />
                <YAxis
                  label={{
                    value: 'APO Score (%)',
                    angle: -90,
                    position: 'insideLeft',
                  }}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="apo"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                  name="APO Score"
                />
                {selectedArea && (
                  <ReferenceArea
                    x1={selectedArea.start}
                    x2={selectedArea.end}
                    strokeOpacity={0.3}
                    fill="#2563eb"
                    fillOpacity={0.3}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          ) : chartType === 'area' ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="apo"
                  stroke="#2563eb"
                  fill="#2563eb"
                  fillOpacity={0.3}
                  name="APO Score"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="apo"
                  fill="#2563eb"
                  name="APO Score"
                  shape={(props: any) => {
                    const { x, y, width, height, fill } = props;
                    const dataPoint = data[props.index] as ExtendedAPOTrendData;
                    return (
                      <g>
                        <rect x={x} y={y} width={width} height={height} fill={fill} fillOpacity={dataPoint.isProjected ? 0.5 : 1} />
                        {dataPoint.isProjected && (
                          <pattern id="projected" patternUnits="userSpaceOnUse" width="4" height="4">
                            <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="#000" strokeWidth="0.5" />
                          </pattern>
                        )}
                      </g>
                    );
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default APOTrendAnalysis;
