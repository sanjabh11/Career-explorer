import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AutomationFactor } from '@/types/automation';
import { Info } from 'lucide-react';

interface FactorBreakdownProps {
  factors: AutomationFactor[];
}

export const FactorBreakdown: React.FC<FactorBreakdownProps> = ({ factors }) => {
  const getProgressColor = (weight: number) => {
    if (weight >= 0.8) return 'bg-red-500';
    if (weight >= 0.6) return 'bg-orange-500';
    if (weight >= 0.4) return 'bg-yellow-500';
    if (weight >= 0.2) return 'bg-green-500';
    return 'bg-blue-500';
  };

  const getComplexityLabel = (level: number) => {
    if (level >= 4) return 'Very High';
    if (level >= 3) return 'High';
    if (level >= 2) return 'Medium';
    if (level >= 1) return 'Low';
    return 'Very Low';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Factor Breakdown
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Detailed breakdown of automation factors and their impact</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {factors.map((factor) => (
          <div key={factor.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">{factor.name}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-2">
                        <p><strong>Category:</strong> {factor.category}</p>
                        <p><strong>Complexity:</strong> {getComplexityLabel(factor.complexity)}</p>
                        <p><strong>Repetitiveness:</strong> {Math.round(factor.repetitiveness * 100)}%</p>
                        <p><strong>Human-AI Collaboration:</strong> {Math.round(factor.humanAICollaboration * 100)}%</p>
                        <p><strong>Industry Specific:</strong> {factor.industrySpecific ? 'Yes' : 'No'}</p>
                        <p><strong>Emerging Tech Impact:</strong> {Math.round(factor.emergingTechImpact * 100)}%</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="text-sm text-gray-500">{Math.round(factor.weight * 100)}%</span>
            </div>
            <Progress 
              value={factor.weight * 100} 
              className={`h-2 ${getProgressColor(factor.weight)}`}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Complexity: {getComplexityLabel(factor.complexity)}</span>
              <span>Repetitiveness: {Math.round(factor.repetitiveness * 100)}%</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
