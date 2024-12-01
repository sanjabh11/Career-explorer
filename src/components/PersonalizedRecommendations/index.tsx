import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AutomationFactor, AutomationTrend } from '@/types/automation';
import { ArrowUpRight, Brain, Lightbulb, Target, Workflow } from 'lucide-react';

interface PersonalizedRecommendationsProps {
  factors: AutomationFactor[];
  trends: AutomationTrend[];
  skills: string[];
}

export const PersonalizedRecommendations: React.FC<PersonalizedRecommendationsProps> = ({
  factors,
  trends,
  skills,
}) => {
  const getSkillRecommendations = () => {
    const recommendations: Array<{
      type: string;
      title: string;
      description: string;
      priority: 'high' | 'medium' | 'low';
      icon: React.ReactNode;
    }> = [];

    // Analyze factors for skill recommendations
    factors.forEach(factor => {
      if (factor.emergingTechImpact > 0.7) {
        recommendations.push({
          type: 'AI Skills',
          title: `Enhance ${factor.name} with AI`,
          description: `Focus on learning AI tools and techniques that complement your ${factor.name.toLowerCase()} skills.`,
          priority: 'high',
          icon: <Brain className="w-4 h-4" />,
        });
      }

      if (factor.humanAICollaboration > 0.8) {
        recommendations.push({
          type: 'Collaboration',
          title: `${factor.name} Collaboration`,
          description: `Develop skills to effectively collaborate with AI systems in ${factor.name.toLowerCase()}.`,
          priority: 'high',
          icon: <Workflow className="w-4 h-4" />,
        });
      }
    });

    // Analyze trends for future skill needs
    const latestTrend = trends[trends.length - 1];
    if (latestTrend && latestTrend.score > 70) {
      recommendations.push({
        type: 'Future Skills',
        title: 'Prepare for High Automation',
        description: 'Focus on developing uniquely human skills that are hard to automate.',
        priority: 'high',
        icon: <Target className="w-4 h-4" />,
      });
    }

    return recommendations;
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
    }
  };

  const recommendations = getSkillRecommendations();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          Personalized Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                    {rec.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{rec.title}</h3>
                      <Badge
                        variant="secondary"
                        className={getPriorityColor(rec.priority)}
                      >
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
