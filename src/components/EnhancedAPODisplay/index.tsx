import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FactorBreakdown } from './FactorBreakdown';
import { TrendAnalysis } from './TrendAnalysis';
import { AIImpactAnalysis } from './AIImpactAnalysis';
import { AutomationFactor, AutomationTrend } from '@/types/automation';

interface EnhancedAPODisplayProps {
  factors: AutomationFactor[];
  trends: AutomationTrend[];
  historicalData?: AutomationTrend[];
}

export const EnhancedAPODisplay: React.FC<EnhancedAPODisplayProps> = ({
  factors,
  trends,
  historicalData,
}) => {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <Tabs defaultValue="factors" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="factors">Factor Breakdown</TabsTrigger>
            <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
            <TabsTrigger value="ai-impact">AI Impact</TabsTrigger>
          </TabsList>
          <TabsContent value="factors" className="mt-6">
            <FactorBreakdown factors={factors} />
          </TabsContent>
          <TabsContent value="trends" className="mt-6">
            <TrendAnalysis trends={trends} historicalData={historicalData} />
          </TabsContent>
          <TabsContent value="ai-impact" className="mt-6">
            <AIImpactAnalysis factors={factors} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
