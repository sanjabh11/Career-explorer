import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResearchData } from '@/types/automationTrends';
import { Badge } from '@/components/ui/badge';

interface ResearchInsightsProps {
  data: ResearchData[];
  occupationCode: string;
}

const ResearchInsights: React.FC<ResearchInsightsProps> = ({ data, occupationCode }) => {
  const relevantResearch = data
    .filter(item => item.relevantOccupations.includes(occupationCode))
    .sort((a, b) => b.impactScore - a.impactScore);

  const getConfidenceBadgeColor = (confidence: number): string => {
    if (confidence >= 80) return 'bg-green-500';
    if (confidence >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest Research Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {relevantResearch.length > 0 ? (
            relevantResearch.map((item, index) => (
              <Card key={index} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <div className="flex gap-2">
                    <Badge 
                      className={getConfidenceBadgeColor(item.confidenceLevel)}
                    >
                      {item.confidenceLevel}% Confidence
                    </Badge>
                    <Badge variant="outline">
                      Impact: {item.impactScore.toFixed(1)}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {new Date(item.date).toLocaleDateString()}
                </p>
                <p className="text-sm mb-2">{item.findings}</p>
                <div className="text-xs text-gray-500">
                  Source: {item.source}
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center text-gray-500 py-4">
              No relevant research findings available for this occupation.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResearchInsights;
