import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  AutomationRiskAssessment,
  TaskAutomationRisk,
  TechnologyThreat,
  SkillVulnerability
} from './types';
import { automationRiskService } from '@/services/automationRiskService';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowUpRight, Clock, Target } from 'lucide-react';

interface AutomationRiskTabProps {
  occupationId: string;
}

export const AutomationRiskTab: React.FC<AutomationRiskTabProps> = ({ occupationId }) => {
  const [assessment, setAssessment] = useState<AutomationRiskAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const data = await automationRiskService.getAutomationRiskAssessment(occupationId);
        setAssessment(data);
      } catch (err) {
        setError('Failed to load automation risk assessment');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [occupationId]);

  const getRiskColor = (risk: number): string => {
    if (risk >= 0.7) return 'text-red-500';
    if (risk >= 0.4) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getTimeframeColor = (timeframe: string): string => {
    switch (timeframe) {
      case 'immediate':
        return 'bg-red-100 text-red-800';
      case 'short-term':
        return 'bg-orange-100 text-orange-800';
      case 'medium-term':
        return 'bg-yellow-100 text-yellow-800';
      case 'long-term':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!assessment) return null;

  return (
    <div className="space-y-6">
      {/* Overall Risk Score */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Automation Risk</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className={`text-3xl font-bold ${getRiskColor(assessment.overallRisk)}`}>
                  {Math.round(assessment.overallRisk * 100)}%
                </span>
                <p className="text-sm text-gray-500">Risk Score</p>
              </div>
              <div className="space-y-1">
                <span className="text-3xl font-bold text-blue-500">
                  {Math.round(assessment.confidenceScore * 100)}%
                </span>
                <p className="text-sm text-gray-500">Confidence</p>
              </div>
            </div>
            <Progress value={assessment.overallRisk * 100} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tasks">Tasks at Risk</TabsTrigger>
          <TabsTrigger value="technology">Tech Threats</TabsTrigger>
          <TabsTrigger value="skills">Skill Gaps</TabsTrigger>
          <TabsTrigger value="future">Future Requirements</TabsTrigger>
        </TabsList>

        {/* Tasks Analysis */}
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Task Automation Risk Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assessment.taskRisks.map((task) => (
                  <div key={task.taskId} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{task.taskName}</h4>
                        <p className="text-sm text-gray-600">{task.description}</p>
                      </div>
                      <Badge className={getTimeframeColor(task.timeframe)}>
                        {task.timeframe}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Automation Probability</span>
                        <span className={`font-semibold ${getRiskColor(task.automationProbability)}`}>
                          {Math.round(task.automationProbability * 100)}%
                        </span>
                      </div>
                      <Progress value={task.automationProbability * 100} />
                    </div>
                    <div className="mt-4">
                      <h5 className="font-medium mb-2">Required Adaptations:</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {task.requiredAdaptations.map((adaptation, index) => (
                          <li key={index} className="text-sm text-gray-600">{adaptation}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Technology Threats */}
        <TabsContent value="technology">
          <Card>
            <CardHeader>
              <CardTitle>Technology Threat Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assessment.technologyThreats.map((threat) => (
                  <div key={threat.technologyId} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold">{threat.name}</h4>
                        <p className="text-sm text-gray-600">{threat.description}</p>
                      </div>
                      <Badge variant="outline">
                        {threat.timeToMainstream} months
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <span className="text-sm text-gray-600">Maturity</span>
                        <Progress value={threat.maturityLevel * 100} className="mt-1" />
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Adoption</span>
                        <Progress value={threat.adoptionRate * 100} className="mt-1" />
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Impact</span>
                        <Progress value={threat.impactScore * 100} className="mt-1" />
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Affected Tasks:</h5>
                      <div className="flex flex-wrap gap-2">
                        {threat.affectedTasks.map((task, index) => (
                          <Badge key={index} variant="secondary">{task}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skill Vulnerabilities */}
        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle>Skill Vulnerability Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assessment.skillVulnerabilities.map((skill) => (
                  <div key={skill.skillId} className="border rounded-lg p-4">
                    <div className="mb-4">
                      <h4 className="font-semibold">{skill.skillName}</h4>
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        <div>
                          <span className="text-sm text-gray-600">Current Level</span>
                          <Progress value={skill.currentLevel * 10} className="mt-1" />
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Market Demand</span>
                          <Progress value={skill.marketDemand * 100} className="mt-1" />
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Future Relevance</span>
                          <Progress value={skill.futureRelevance * 100} className="mt-1" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium mb-2">Alternative Skills:</h5>
                        <div className="flex flex-wrap gap-2">
                          {skill.alternativeSkills.map((alt, index) => (
                            <Badge key={index} variant="outline">{alt}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">Upskilling Suggestions:</h5>
                        <ul className="list-disc list-inside space-y-1">
                          {skill.upskillingSuggestions.map((suggestion, index) => (
                            <li key={index} className="text-sm text-gray-600">{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Future Requirements */}
        <TabsContent value="future">
          <Card>
            <CardHeader>
              <CardTitle>Future Requirements Projection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assessment.futureRequirements.map((requirement) => (
                  <div key={requirement.requirementId} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold">{requirement.name}</h4>
                        <p className="text-sm text-gray-600">{requirement.description}</p>
                        <Badge variant="secondary" className="mt-2">
                          {requirement.category}
                        </Badge>
                      </div>
                      <Badge variant="outline">
                        {requirement.timeframe} months
                      </Badge>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">Importance</span>
                          <span className="font-semibold">
                            {Math.round(requirement.importance * 100)}%
                          </span>
                        </div>
                        <Progress value={requirement.importance * 100} />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">Current Gap</span>
                          <span className="font-semibold">
                            {Math.round(requirement.currentGap * 100)}%
                          </span>
                        </div>
                        <Progress value={requirement.currentGap * 100} />
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">Development Path:</h5>
                        <ul className="list-disc list-inside space-y-1">
                          {requirement.developmentPath.map((step, index) => (
                            <li key={index} className="text-sm text-gray-600">{step}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Last Updated Info */}
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>Last updated: {new Date(assessment.lastUpdated).toLocaleDateString()}</span>
        <span>Next review: {new Date(assessment.nextReviewDate).toLocaleDateString()}</span>
      </div>
    </div>
  );
};
