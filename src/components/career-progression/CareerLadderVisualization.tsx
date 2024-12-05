import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CareerPath, CareerLevel } from './types';
import { ChevronRight } from 'lucide-react';

interface Props {
  careerPath: CareerPath;
  currentLevelId?: string;
}

const CareerLadderVisualization: React.FC<Props> = ({ careerPath, currentLevelId }) => {
  const maxLevel = Math.max(...careerPath.levels.map(level => level.level));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Career Ladder: {careerPath.name}</span>
          <Badge variant="secondary">{careerPath.domain}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] w-full pr-4">
          <div className="space-y-4">
            {[...Array(maxLevel)].map((_, index) => {
              const levelNumber = maxLevel - index;
              const levelsAtThisNumber = careerPath.levels.filter(
                level => level.level === levelNumber
              );

              return (
                <div key={levelNumber} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    {levelNumber}
                  </div>
                  <div className="flex-1 space-y-4">
                    {levelsAtThisNumber.map(level => (
                      <Card
                        key={level.id}
                        className={`p-4 ${
                          level.id === currentLevelId
                            ? 'border-primary border-2'
                            : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{level.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {level.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {level.salary.currency}{level.salary.min.toLocaleString()} - {level.salary.currency}{level.salary.max.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {level.requirements.experience}+ years
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {level.requirements.skills.map(skill => (
                            <Badge key={skill} variant="outline">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        {level.nextLevels.length > 0 && (
                          <div className="mt-2 flex items-center text-sm text-muted-foreground">
                            <ChevronRight className="h-4 w-4" />
                            <span>Next possible roles: </span>
                            {level.nextLevels.map(nextId => {
                              const nextLevel = careerPath.levels.find(
                                l => l.id === nextId
                              );
                              return nextLevel ? (
                                <Badge
                                  key={nextId}
                                  variant="secondary"
                                  className="ml-2"
                                >
                                  {nextLevel.title}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default CareerLadderVisualization;
