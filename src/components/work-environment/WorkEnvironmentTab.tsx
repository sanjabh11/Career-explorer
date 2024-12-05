import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  AlertCircle, 
  Calendar, 
  Clock, 
  Home, 
  Shield, 
  ThermometerSun 
} from 'lucide-react';
import { 
  WorkEnvironmentData,
  WorkCondition,
  SafetyRequirement,
  ScheduleFlexibility,
  RemoteWorkOpportunity
} from './types';
import { workEnvironmentAssessmentService } from '@/services/workEnvironmentAssessmentService';

interface WorkEnvironmentTabProps {
  occupationId: string;
}

export const WorkEnvironmentTab: React.FC<WorkEnvironmentTabProps> = ({ occupationId }) => {
  const [assessment, setAssessment] = useState<WorkEnvironmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const data = await workEnvironmentAssessmentService.getWorkEnvironmentAssessment(occupationId);
        setAssessment(data);
      } catch (err) {
        setError('Failed to load work environment assessment');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [occupationId]);

  const getScoreColor = (score: number): string => {
    if (score >= 0.7) return 'text-green-500';
    if (score >= 0.4) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
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
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle>Work Environment Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <span className={`text-3xl font-bold ${getScoreColor(assessment.overallScore)}`}>
                {Math.round(assessment.overallScore * 100)}%
              </span>
              <p className="text-sm text-gray-500">Overall Score</p>
            </div>
          </div>
          <Progress value={assessment.overallScore * 100} className="w-full" />
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="conditions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="conditions">
            <ThermometerSun className="h-4 w-4 mr-2" />
            Conditions
          </TabsTrigger>
          <TabsTrigger value="safety">
            <Shield className="h-4 w-4 mr-2" />
            Safety
          </TabsTrigger>
          <TabsTrigger value="schedule">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="remote">
            <Home className="h-4 w-4 mr-2" />
            Remote Work
          </TabsTrigger>
        </TabsList>

        {/* Work Conditions */}
        <TabsContent value="conditions">
          <Card>
            <CardHeader>
              <CardTitle>Working Conditions Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assessment.conditions.map((condition) => (
                  <div key={condition.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{condition.name}</h4>
                        <p className="text-sm text-gray-600">{condition.description}</p>
                      </div>
                      <Badge variant="outline">{condition.frequency}</Badge>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-600">Condition Level</span>
                        <Progress value={condition.level * 100} className="mt-1" />
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Performance Impact</span>
                        <Progress value={condition.impactOnPerformance * 100} className="mt-1" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <h5 className="font-medium mb-2">Adaptation Options:</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {condition.adaptationOptions.map((option, index) => (
                          <li key={index} className="text-sm text-gray-600">{option}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Safety Requirements */}
        <TabsContent value="safety">
          <Card>
            <CardHeader>
              <CardTitle>Safety Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assessment.safetyRequirements.map((requirement) => (
                  <div key={requirement.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold">{requirement.category}</h4>
                        <p className="text-sm text-gray-600">{requirement.description}</p>
                      </div>
                      <Badge className={getPriorityColor(requirement.priority)}>
                        {requirement.priority}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="text-sm font-medium">Compliance Level</span>
                        <p className="text-sm text-gray-600">{requirement.complianceLevel}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Update Frequency</span>
                        <p className="text-sm text-gray-600">{requirement.updateFrequency}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium mb-2">Consequences:</h5>
                        <ul className="list-disc list-inside space-y-1">
                          {requirement.consequences.map((consequence, index) => (
                            <li key={index} className="text-sm text-gray-600">{consequence}</li>
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

        {/* Schedule Flexibility */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Flexibility</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Overall Flexibility</span>
                    <span className={`font-bold ${getScoreColor(assessment.scheduleFlexibility.overallFlexibility)}`}>
                      {Math.round(assessment.scheduleFlexibility.overallFlexibility * 100)}%
                    </span>
                  </div>
                  <Progress value={assessment.scheduleFlexibility.overallFlexibility * 100} />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Work Hours</h4>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Type: </span>
                        {assessment.scheduleFlexibility.workHours.type}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Core Hours: </span>
                        {assessment.scheduleFlexibility.workHours.coreHours.join(" - ")}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Weekly Hours: </span>
                        {assessment.scheduleFlexibility.workHours.averageHoursPerWeek}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Time Off Policy</h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">PTO Days: </span>
                          {assessment.scheduleFlexibility.timeOffPolicy.paidTimeOff}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Sick Days: </span>
                          {assessment.scheduleFlexibility.timeOffPolicy.sickDays}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Notice Required: </span>
                          {assessment.scheduleFlexibility.timeOffPolicy.advanceNoticeRequired} days
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Accommodations</h4>
                  <div className="flex flex-wrap gap-2">
                    {assessment.scheduleFlexibility.accommodations.map((accommodation, index) => (
                      <Badge key={index} variant="secondary">{accommodation}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Remote Work */}
        <TabsContent value="remote">
          <Card>
            <CardHeader>
              <CardTitle>Remote Work Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Remote Work Eligibility</span>
                    <span className={`font-bold ${getScoreColor(assessment.remoteWorkOpportunities.remoteWorkEligibility)}`}>
                      {Math.round(assessment.remoteWorkOpportunities.remoteWorkEligibility * 100)}%
                    </span>
                  </div>
                  <Progress value={assessment.remoteWorkOpportunities.remoteWorkEligibility * 100} />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Requirements</h4>
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-sm font-medium mb-1">Technology</h5>
                        <ul className="list-disc list-inside space-y-1">
                          {assessment.remoteWorkOpportunities.requirements.technology.map((req, index) => (
                            <li key={index} className="text-sm text-gray-600">{req}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium mb-1">Security</h5>
                        <ul className="list-disc list-inside space-y-1">
                          {assessment.remoteWorkOpportunities.requirements.security.map((req, index) => (
                            <li key={index} className="text-sm text-gray-600">{req}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Schedule & Benefits</h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">Minimum Onsite Days: </span>
                          {assessment.remoteWorkOpportunities.schedule.minimumOnsiteDays}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Time Zone: </span>
                          {assessment.remoteWorkOpportunities.schedule.timeZoneRequirements}
                        </p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium mb-1">Allowances</h5>
                        <p className="text-sm">
                          <span className="font-medium">Equipment: </span>
                          ${assessment.remoteWorkOpportunities.benefits.equipmentAllowance}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Internet: </span>
                          ${assessment.remoteWorkOpportunities.benefits.internetStipend}/month
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Success Factors</h4>
                  <div className="flex flex-wrap gap-2">
                    {assessment.remoteWorkOpportunities.successFactors.map((factor, index) => (
                      <Badge key={index} variant="secondary">{factor}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Last Updated Info */}
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>Last updated: {new Date(assessment.lastUpdated).toLocaleDateString()}</span>
        <span>Next assessment: {new Date(assessment.nextAssessmentDate).toLocaleDateString()}</span>
      </div>
    </div>
  );
};
