import React from 'react';
import { CareerPath } from './types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from 'lucide-react';

interface Props {
  careerPath: CareerPath;
  currentLevelId: string;
}

const CareerLadderVisualization: React.FC<Props> = ({ careerPath, currentLevelId }) => {
  const levels = careerPath.levels.map((level, index) => ({
    ...level,
    displayLevel: careerPath.levels.length - index
  }));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Career Progression Path</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {levels.map((level) => (
            <div
              key={level.id}
              className={`
                relative p-4 border rounded-lg
                ${level.id === currentLevelId ? 'border-primary ring-2 ring-primary/20' : 'border-border'}
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{level.title}</h4>
                  <p className="text-sm text-muted-foreground">{level.description}</p>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    Level {level.displayLevel}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {level.requirements.experience}+ years
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {/* Skills */}
                <div>
                  <div className="text-sm font-medium mb-2">Required Skills</div>
                  <div className="flex flex-wrap gap-2">
                    {level.requirements.skills.map((skill, i) => (
                      <Badge key={i} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>

                {/* Education */}
                {level.requirements.education && level.requirements.education.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Education</div>
                    <div className="flex flex-wrap gap-2">
                      {level.requirements.education.map((edu, i) => (
                        <Badge key={i} variant="outline">{edu}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Salary */}
                <div>
                  <div className="text-sm font-medium mb-2">Salary Range</div>
                  <div className="text-sm">
                    {level.salary.currency}{level.salary.min.toLocaleString()} - {level.salary.currency}{level.salary.max.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Progress Arrow */}
              {level.displayLevel > 1 && (
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                  <ChevronRight className="h-4 w-4 transform rotate-90 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CareerLadderVisualization;
