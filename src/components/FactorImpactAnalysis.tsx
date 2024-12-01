import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AutomationFactor } from '@/types/automation';
import { PredictedAPO } from '@/types/automationTrends';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface FactorImpactAnalysisProps {
  currentFactors: AutomationFactor[];
  prediction: PredictedAPO;
}

const FactorImpactAnalysis: React.FC<FactorImpactAnalysisProps> = ({
  currentFactors,
  prediction
}) => {
  const getTrendIcon = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing':
        return <ArrowUp className="text-green-500" />;
      case 'decreasing':
        return <ArrowDown className="text-red-500" />;
      default:
        return <Minus className="text-yellow-500" />;
    }
  };

  const getImpactClass = (impact: number): string => {
    if (impact >= 75) return 'text-red-500';
    if (impact >= 50) return 'text-orange-500';
    if (impact >= 25) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Factor Impact Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {prediction.factors.map((factor, index) => {
            const currentFactor = currentFactors.find(f => f.name === factor.name);
            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{factor.name}</span>
                    {getTrendIcon(factor.trend)}
                  </div>
                  <span className={`font-bold ${getImpactClass(factor.impact)}`}>
                    {factor.impact.toFixed(1)}% Impact
                  </span>
                </div>
                <Progress value={factor.impact} className="h-2" />
                <div className="text-sm text-gray-500">
                  {currentFactor?.category && (
                    <span className="mr-4">Category: {currentFactor.category}</span>
                  )}
                  <span>Trend: {factor.trend}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Prediction Confidence</span>
            <span className="font-bold">{prediction.confidence.toFixed(1)}%</span>
          </div>
          <Progress value={prediction.confidence} className="h-2" />
          <p className="mt-2 text-sm text-gray-600">
            Based on {prediction.factors.length} factors analyzed over {prediction.timeframe} months
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FactorImpactAnalysis;
