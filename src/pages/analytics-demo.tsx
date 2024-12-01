import React, { useState } from 'react';
import { EnhancedAPODisplay } from '@/components/EnhancedAPODisplay';
import { ReportGenerator } from '@/components/ReportGenerator';
import { InteractiveExplorer } from '@/components/InteractiveExplorer';
import { PersonalizedRecommendations } from '@/components/PersonalizedRecommendations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AutomationFactor, AutomationTrend } from '@/types/automation';

// Sample data for demonstration
const sampleFactors: AutomationFactor[] = [
  {
    id: '1',
    name: 'Data Analysis',
    category: 'Technical',
    weight: 0.85,
    complexity: 4,
    repetitiveness: 0.7,
    humanAICollaboration: 0.9,
    emergingTechImpact: 0.95,
    industrySpecific: false,
  },
  {
    id: '2',
    name: 'Customer Service',
    category: 'Soft Skills',
    weight: 0.45,
    complexity: 3,
    repetitiveness: 0.4,
    humanAICollaboration: 0.8,
    emergingTechImpact: 0.6,
    industrySpecific: true,
  },
  {
    id: '3',
    name: 'Project Management',
    category: 'Management',
    weight: 0.35,
    complexity: 4,
    repetitiveness: 0.2,
    humanAICollaboration: 0.7,
    emergingTechImpact: 0.5,
    industrySpecific: false,
  },
  {
    id: '4',
    name: 'Software Development',
    category: 'Technical',
    weight: 0.75,
    complexity: 5,
    repetitiveness: 0.6,
    humanAICollaboration: 0.95,
    emergingTechImpact: 0.9,
    industrySpecific: false,
  },
];

const sampleTrends: AutomationTrend[] = [
  {
    year: 2024,
    score: 65,
    confidence: 0.9,
    keyFactors: ['AI/ML Integration', 'Cloud Computing', 'Automation Tools'],
    marketTrends: ['Rising AI Adoption', 'Remote Work', 'Digital Transformation'],
  },
  {
    year: 2025,
    score: 75,
    confidence: 0.85,
    keyFactors: ['Advanced AI Systems', 'No-Code Development', 'Process Automation'],
    marketTrends: ['AI-First Companies', 'Skill Hybridization'],
  },
  {
    year: 2026,
    score: 82,
    confidence: 0.8,
    keyFactors: ['AGI Development', 'Autonomous Systems', 'AI Collaboration'],
    marketTrends: ['AI Regulation', 'Human-AI Teams'],
  },
];

const historicalData: AutomationTrend[] = [
  {
    year: 2021,
    score: 45,
    confidence: 0.95,
    keyFactors: ['Basic Automation', 'Rule-based Systems'],
    marketTrends: ['Digital Adoption', 'Remote Work Transition'],
  },
  {
    year: 2022,
    score: 52,
    confidence: 0.95,
    keyFactors: ['ML Applications', 'Process Automation'],
    marketTrends: ['AI Tools Adoption', 'Skill Requirements Change'],
  },
  {
    year: 2023,
    score: 58,
    confidence: 0.92,
    keyFactors: ['GPT Integration', 'Automated Analytics'],
    marketTrends: ['GenAI Revolution', 'Workforce Adaptation'],
  },
];

const sampleSkills = [
  'Python Programming',
  'Data Analysis',
  'Machine Learning',
  'Project Management',
  'Communication',
  'Problem Solving',
];

export default function AnalyticsDemo() {
  const [currentFactors, setCurrentFactors] = useState(sampleFactors);

  const handleFactorUpdate = (updatedFactors: AutomationFactor[]) => {
    setCurrentFactors(updatedFactors);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Advanced Analytics Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            This demo showcases advanced analytics features including AI impact prediction,
            human-AI collaboration potential, industry-specific factors, and confidence scoring.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-8">
        <Tabs defaultValue="analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="explorer">Interactive Explorer</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="report">Report Generator</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="mt-6">
            <EnhancedAPODisplay
              factors={currentFactors}
              trends={sampleTrends}
              historicalData={historicalData}
            />
          </TabsContent>

          <TabsContent value="explorer" className="mt-6">
            <InteractiveExplorer
              factors={currentFactors}
              onFactorUpdate={handleFactorUpdate}
            />
          </TabsContent>

          <TabsContent value="recommendations" className="mt-6">
            <PersonalizedRecommendations
              factors={currentFactors}
              trends={sampleTrends}
              skills={sampleSkills}
            />
          </TabsContent>

          <TabsContent value="report" className="mt-6">
            <ReportGenerator
              factors={currentFactors}
              trends={sampleTrends}
              occupationTitle="Data Scientist"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
