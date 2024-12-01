import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';
import { AutomationFactor } from '@/types/automation';

interface AIImpactProps {
  factors: AutomationFactor[];
}

export const AIImpactAnalysis: React.FC<AIImpactProps> = ({ factors }) => {
  const radarData = factors.map(factor => ({
    subject: factor.name,
    'AI Impact': factor.emergingTechImpact * 100,
    'Human-AI Collaboration': factor.humanAICollaboration * 100,
    fullMark: 100,
  }));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          AI Impact Analysis
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Analysis of AI impact and human-AI collaboration potential</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar
                name="AI Impact"
                dataKey="AI Impact"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
              <Radar
                name="Human-AI Collaboration"
                dataKey="Human-AI Collaboration"
                stroke="#82ca9d"
                fill="#82ca9d"
                fillOpacity={0.6}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 space-y-4">
          <div>
            <h4 className="font-medium mb-2">Key Insights:</h4>
            <ul className="list-disc list-inside space-y-2">
              {factors.map(factor => (
                <li key={factor.id}>
                  <span className="font-medium">{factor.name}:</span>{' '}
                  {factor.emergingTechImpact > 0.7 ? (
                    <span className="text-red-500">High AI disruption potential</span>
                  ) : factor.emergingTechImpact > 0.4 ? (
                    <span className="text-yellow-500">Moderate AI impact</span>
                  ) : (
                    <span className="text-green-500">Low AI impact</span>
                  )}
                  {factor.humanAICollaboration > 0.6 && (
                    <span className="text-blue-500"> - Strong collaboration opportunity</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Recommendations:</h4>
            <ul className="list-disc list-inside space-y-2">
              {factors.map(factor => (
                <li key={`${factor.id}-rec`}>
                  {factor.emergingTechImpact > 0.5 ? (
                    <>Focus on developing {factor.name.toLowerCase()} skills that complement AI capabilities</>
                  ) : (
                    <>Maintain and enhance {factor.name.toLowerCase()} expertise while monitoring AI developments</>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
