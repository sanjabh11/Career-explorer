import React, { useEffect, useState } from 'react';
import { careerProgressionService } from '@/services/careerProgressionService';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Props {
  currentLevelId: string;
  onLevelSelect?: (levelId: string) => void;
}

const RoleComparison: React.FC<Props> = ({ currentLevelId, onLevelSelect }) => {
  const [targetLevelId, setTargetLevelId] = useState<string>('');
  const [careerPath, setCareerPath] = useState<any>(null);
  const [requirements, setRequirements] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCareerPath = async () => {
      try {
        const path = await careerProgressionService.getCareerPath(currentLevelId.split('-')[0]);
        setCareerPath(path);
      } catch (error) {
        console.error('Error loading career path:', error);
      }
    };
    loadCareerPath();
  }, [currentLevelId]);

  useEffect(() => {
    const fetchRequirements = async () => {
      if (currentLevelId && targetLevelId && careerPath) {
        setLoading(true);
        try {
          const reqs = await careerProgressionService.getAdvancementRequirements(
            currentLevelId,
            targetLevelId,
            careerPath
          );
          setRequirements(reqs);
        } catch (error) {
          console.error('Error fetching advancement requirements:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchRequirements();
  }, [currentLevelId, targetLevelId, careerPath]);

  const formatTime = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years === 0) return `${remainingMonths} months`;
    if (remainingMonths === 0) return `${years} years`;
    return `${years} years, ${remainingMonths} months`;
  };

  if (!careerPath) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Select
          value={targetLevelId}
          onValueChange={(value) => {
            setTargetLevelId(value);
            onLevelSelect?.(value);
          }}
        >
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select target role" />
          </SelectTrigger>
          <SelectContent>
            {careerPath.levels.map((level: any) => (
              <SelectItem 
                key={level.id} 
                value={level.id}
                disabled={level.id === currentLevelId}
              >
                {level.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {requirements && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Skills Gap Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-2">Required Skills</div>
                  <div className="flex flex-wrap gap-2">
                    {requirements.requirements.skillGaps.map((skill: string, i: number) => (
                      <Badge key={i} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
                
                {requirements.requirements.educationGaps.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Education Requirements</div>
                    <div className="flex flex-wrap gap-2">
                      {requirements.requirements.educationGaps.map((edu: string, i: number) => (
                        <Badge key={i} variant="secondary">{edu}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-sm font-medium mb-2">Experience Gap</div>
                  <div className="text-sm">
                    {requirements.requirements.experienceGap} additional years required
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline & Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-2">Estimated Timeline</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Skills Acquisition</span>
                      <span>{formatTime(requirements.timeEstimates.skillAcquisition)}</span>
                    </div>
                    <Progress value={
                      (requirements.timeEstimates.skillAcquisition / requirements.totalTimeEstimate) * 100
                    } />
                    
                    <div className="flex justify-between text-sm">
                      <span>Education</span>
                      <span>{formatTime(requirements.timeEstimates.education)}</span>
                    </div>
                    <Progress value={
                      (requirements.timeEstimates.education / requirements.totalTimeEstimate) * 100
                    } />
                    
                    <div className="flex justify-between text-sm">
                      <span>Experience</span>
                      <span>{formatTime(requirements.timeEstimates.experience)}</span>
                    </div>
                    <Progress value={
                      (requirements.timeEstimates.experience / requirements.totalTimeEstimate) * 100
                    } />
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">Total Timeline</div>
                  <div className="text-lg font-semibold">
                    {formatTime(requirements.totalTimeEstimate)}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">Salary Increase</div>
                  <div className="space-y-1">
                    <div className="text-lg font-semibold text-green-600">
                      +{requirements.salaryIncrease.percentage.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {requirements.currentLevel.salary.currency}{requirements.salaryIncrease.min.toLocaleString()} - {requirements.currentLevel.salary.currency}{requirements.salaryIncrease.max.toLocaleString()} increase
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RoleComparison;
