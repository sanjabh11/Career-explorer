import React, { useEffect, useState } from 'react';
import { CareerPath, ExperienceMilestone } from './types';
import { careerProgressionService } from '@/services/careerProgressionService';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, ArrowDown, Target, CheckCircle2, Circle } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import RoleComparison from './RoleComparison';

interface Props {
  occupationId: string;
}

const CareerProgressionTab: React.FC<Props> = ({ occupationId }) => {
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [careerPath, setCareerPath] = useState<CareerPath | null>(null);
  const [milestones, setMilestones] = useState<ExperienceMilestone[]>([]);
  const [progressStats, setProgressStats] = useState({
    completedMilestones: 0,
    skillsAcquired: 0,
    timeInRole: 0
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCareerPath = async () => {
      try {
        setLoading(true);
        const path = await careerProgressionService.getCareerPath(occupationId);
        setCareerPath(path);
        setError(null);
      } catch (err) {
        setError('Failed to load career progression data');
        console.error('Error loading career path:', err);
      } finally {
        setLoading(false);
      }
    };

    if (occupationId) {
      loadCareerPath();
    }
  }, [occupationId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!careerPath) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Career Ladder Visualization */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Career Progression Path
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {careerPath?.levels.map((level, index) => (
                <div
                  key={level.id}
                  className={`
                    p-4 border rounded-lg mb-4 relative cursor-pointer
                    ${selectedLevel === level.id ? 'border-primary ring-2 ring-primary/20' : 'border-border'}
                  `}
                  onClick={() => setSelectedLevel(level.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedLevel(level.id);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{level.title}</h4>
                      <p className="text-sm text-muted-foreground">{level.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {level.salary.currency}{level.salary.min.toLocaleString()} - {level.salary.currency}{level.salary.max.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {level.requirements.experience}+ years
                      </div>
                    </div>
                  </div>
                  
                  {/* Skills Required */}
                  <div className="mt-3">
                    <div className="text-sm font-medium mb-2">Required Skills</div>
                    <div className="flex flex-wrap gap-2">
                      {level.requirements.skills.map((skill, i) => (
                        <Badge key={i} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Progress Arrow */}
                  {index < careerPath.levels.length - 1 && (
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                      <ArrowDown className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Milestone Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Progress Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Progress Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Completed Milestones</div>
                  <div className="text-2xl font-bold">{progressStats.completedMilestones}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Skills Acquired</div>
                  <div className="text-2xl font-bold">{progressStats.skillsAcquired}</div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <h4 className="font-medium">Experience Milestones</h4>
                {milestones.map((milestone, index) => (
                  <div
                    key={milestone.id}
                    className="relative pl-6 pb-4 border-l last:pb-0"
                  >
                    <div className="absolute left-0 transform -translate-x-1/2">
                      {milestone.achieved ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium">{milestone.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {milestone.description}
                      </div>
                      <div className="text-sm">
                        Required: {milestone.yearsRequired} years
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Comparison */}
      {selectedLevel && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Compare Roles</h3>
          <RoleComparison 
            currentLevelId={selectedLevel} 
            onLevelSelect={(levelId) => {
              // Handle level selection if needed
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CareerProgressionTab;
