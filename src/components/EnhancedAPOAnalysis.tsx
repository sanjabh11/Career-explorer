import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { APOResult, AutomationFactor } from '@/types/automation';
import { calculateEnhancedAPO } from '@/utils/apoCalculations';

interface EnhancedAPOAnalysisProps {
  automationFactor: AutomationFactor;
}

const EnhancedAPOAnalysis: React.FC<EnhancedAPOAnalysisProps> = ({ automationFactor }) => {
  const result: APOResult = calculateEnhancedAPO(automationFactor);
  const scorePercentage = Math.round(result.score * 100);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-red-500";
    if (score >= 50) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Automation Potential Analysis</CardTitle>
          <CardDescription>
            Detailed analysis of automation potential considering multiple factors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Overall Score */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Overall APO Score</h3>
              <div className="flex items-center gap-4">
                <Progress value={scorePercentage} className="w-full" />
                <span className={`font-bold ${getScoreColor(scorePercentage)}`}>
                  {scorePercentage}%
                </span>
              </div>
            </div>

            {/* Contributing Factors */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Contributing Factors</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(result.factors).map(([factor, value]) => (
                  <div key={factor} className="bg-gray-100 p-3 rounded">
                    <div className="text-sm font-medium">{factor}</div>
                    <div className="text-lg">{Math.round(value * 100)}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Confidence Score */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Analysis Confidence</h3>
              <div className="flex items-center gap-4">
                <Progress value={result.confidence * 100} className="w-full" />
                <span className="font-bold">
                  {Math.round(result.confidence * 100)}%
                </span>
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
              <ul className="list-disc pl-5 space-y-2">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="text-gray-700">{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedAPOAnalysis;
