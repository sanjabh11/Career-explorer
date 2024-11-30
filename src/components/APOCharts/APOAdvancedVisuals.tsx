import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  CartesianGrid,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { APOTrendData, IndustryName } from '@/services/APOService';

interface APOAdvancedVisualsProps {
  data: APOTrendData[];
  selectedIndustry: IndustryName;
}

const APOAdvancedVisuals: React.FC<APOAdvancedVisualsProps> = ({
  data,
  selectedIndustry,
}) => {
  // Prepare data for radar chart
  const radarData = data[data.length - 1]?.skillChanges.map(skill => ({
    skill: skill.skill,
    impact: skill.impact,
  })) || [];

  // Prepare data for scatter plot
  const scatterData = data.map(item => ({
    year: item.year,
    apo: item.apo,
    avgSkillImpact: item.skillChanges.reduce((acc, curr) => acc + curr.impact, 0) / item.skillChanges.length,
    size: 20,
  }));

  // Prepare data for trend comparison
  const trendData = data.map(item => ({
    year: item.year,
    apo: item.apo,
    skillImpact: item.skillChanges.reduce((acc, curr) => acc + curr.impact, 0) / item.skillChanges.length,
    trend: ((item.apo - (data[0]?.apo || 0)) / (data[0]?.apo || 1)) * 100,
  }));

  return (
    <div className="space-y-4">
      <Tabs defaultValue="radar">
        <TabsList>
          <TabsTrigger value="radar">Skill Impact</TabsTrigger>
          <TabsTrigger value="scatter">APO Correlation</TabsTrigger>
          <TabsTrigger value="trends">Trend Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="radar">
          <Card>
            <CardHeader>
              <CardTitle>Skill Impact Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Impact"
                    dataKey="impact"
                    stroke="#2563eb"
                    fill="#2563eb"
                    fillOpacity={0.6}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scatter">
          <Card>
            <CardHeader>
              <CardTitle>APO vs Skill Impact Correlation</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid />
                  <XAxis
                    type="number"
                    dataKey="apo"
                    name="APO"
                    unit="%"
                    domain={[0, 100]}
                    label={{ value: 'APO Score (%)', position: 'bottom' }}
                  />
                  <YAxis
                    type="number"
                    dataKey="avgSkillImpact"
                    name="Avg Skill Impact"
                    unit="%"
                    domain={[0, 100]}
                    label={{ value: 'Average Skill Impact (%)', angle: -90, position: 'left' }}
                  />
                  <ZAxis type="number" dataKey="size" range={[100, 500]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Legend />
                  <Scatter
                    name="Industry Data Points"
                    data={scatterData}
                    fill="#2563eb"
                    shape="circle"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>APO and Skill Impact Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis yAxisId="left" domain={[0, 100]} />
                  <YAxis yAxisId="right" orientation="right" domain={[-100, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="apo"
                    fill="#2563eb"
                    name="APO Score"
                    fillOpacity={0.6}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="trend"
                    stroke="#ef4444"
                    name="APO Trend %"
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default APOAdvancedVisuals;
