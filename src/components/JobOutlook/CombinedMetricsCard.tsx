import React from 'react';
import { JobOutlook } from '@/types/onet';
import { 
  calculateGrowthAdjustedAPO, 
  calculateCareerViabilityScore,
  generateCareerRecommendation,
  categorizeOccupation,
  calculateAutomationTimeHorizon
} from '@/utils/careerMetrics';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CombinedMetricsCardProps {
  apoScore: number;
  jobOutlook: JobOutlook;
  occupationTitle: string;
}

/**
 * Component to display combined metrics that incorporate both APO and job outlook data
 */
const CombinedMetricsCard: React.FC<CombinedMetricsCardProps> = ({ 
  apoScore, 
  jobOutlook,
  occupationTitle
}) => {
  // Calculate combined metrics
  const growthAdjustedAPO = calculateGrowthAdjustedAPO(apoScore, jobOutlook.growthRate);
  const viabilityScore = calculateCareerViabilityScore(apoScore, jobOutlook);
  const recommendation = generateCareerRecommendation(apoScore, jobOutlook);
  const category = categorizeOccupation(apoScore, jobOutlook.growthRate);
  const timeHorizon = calculateAutomationTimeHorizon(apoScore);
  
  // Determine color for viability score
  const getViabilityColor = () => {
    if (viabilityScore > 80) return 'bg-green-500';
    if (viabilityScore > 60) return 'bg-green-400';
    if (viabilityScore > 40) return 'bg-yellow-400';
    if (viabilityScore > 20) return 'bg-orange-400';
    return 'bg-red-500';
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Career Outlook Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Viability Score */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Career Viability Score</h3>
            <div className="flex items-center mb-2">
              <div className="w-full bg-gray-200 rounded-full h-4 mr-4">
                <div 
                  className={`${getViabilityColor()} h-4 rounded-full`} 
                  style={{ width: `${viabilityScore}%` }}
                ></div>
              </div>
              <span className="text-lg font-bold">{Math.round(viabilityScore)}/100</span>
            </div>
            <p className="text-sm text-gray-700">
              This score combines automation resistance and job growth prospects.
            </p>
          </div>
          
          {/* Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-semibold mb-2">Standard APO Score</h3>
              <div className="flex items-center">
                <Progress value={apoScore} className="w-full mr-4" />
                <span className="font-bold">{Math.round(apoScore)}%</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Automation potential without considering job growth
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-semibold mb-2">Growth-Adjusted APO</h3>
              <div className="flex items-center">
                <Progress value={growthAdjustedAPO} className="w-full mr-4" />
                <span className="font-bold">{Math.round(growthAdjustedAPO)}%</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Automation potential adjusted for projected growth
              </p>
            </div>
          </div>
          
          {/* Category and Time Horizon */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-semibold mb-2">Occupation Category</h3>
              <p className="text-lg font-medium">{category}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-semibold mb-2">Automation Time Horizon</h3>
              <p className="text-lg font-medium">{timeHorizon}</p>
            </div>
          </div>
          
          {/* Recommendation */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-md font-semibold mb-2">Career Recommendation</h3>
            <p className="text-sm">{recommendation}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CombinedMetricsCard;
