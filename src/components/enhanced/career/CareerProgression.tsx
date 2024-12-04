import React, { useState, useEffect } from 'react';
import { DataCard } from '../shared/DataCard';
import { Badge } from '../shared/Badge';
import { ProgressBar } from '../shared/ProgressBar';

interface AdvancementStep {
  title: string;
  description: string;
  timeframe: string;
  requirements: {
    skills: Array<{ name: string; level: number }>;
    certifications: string[];
    experience: string;
  };
  salary: {
    min: number;
    max: number;
    median: number;
  };
}

interface CareerPath {
  id: number;
  pathName: string;
  description: string;
  typicalDuration: number;
  advancementSteps: AdvancementStep[];
  requiredCertifications: string[];
  skillMilestones: Array<{
    skill: string;
    level: number;
    timeframe: string;
  }>;
  salaryProgression: Array<{
    stage: string;
    range: { min: number; max: number; median: number };
  }>;
  successFactors: Array<{
    factor: string;
    importance: number;
    description: string;
  }>;
}

interface CareerProgressionProps {
  occupationId: string;
  onPathSelect?: (path: CareerPath) => void;
}

export const CareerProgression: React.FC<CareerProgressionProps> = ({
  occupationId,
  onPathSelect
}) => {
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<CareerPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCareerPaths = async () => {
      try {
        const response = await fetch(`/api/v2/career-paths/paths/${occupationId}`);
        if (!response.ok) throw new Error('Failed to fetch career paths');
        const data = await response.json();
        setCareerPaths(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCareerPaths();
  }, [occupationId]);

  const handlePathSelect = (path: CareerPath) => {
    setSelectedPath(path);
    if (onPathSelect) {
      onPathSelect(path);
    }
  };

  const formatSalary = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) return <div className="animate-pulse">Loading career paths...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-6">
      {/* Career Paths Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {careerPaths.map((path) => (
          <DataCard
            key={path.id}
            className={`cursor-pointer transition-all ${
              selectedPath?.id === path.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => handlePathSelect(path)}
          >
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-lg">{path.pathName}</h3>
                <p className="text-sm text-gray-600">{path.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  text={`${path.typicalDuration} months`}
                  variant="secondary"
                />
                <Badge
                  text={`${path.advancementSteps.length} steps`}
                  variant="primary"
                />
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium">Required Skills</div>
                  <div className="text-2xl font-bold">
                    {path.skillMilestones.length}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Certifications</div>
                  <div className="text-2xl font-bold">
                    {path.requiredCertifications.length}
                  </div>
                </div>
              </div>
            </div>
          </DataCard>
        ))}
      </div>

      {/* Selected Path Details */}
      {selectedPath && (
        <div className="space-y-8">
          {/* Career Timeline */}
          <DataCard title="Career Progression Timeline">
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-200" />
              
              <div className="space-y-8">
                {selectedPath.advancementSteps.map((step, index) => (
                  <div key={index} className="relative pl-12">
                    {/* Timeline dot */}
                    <div className="absolute left-2.5 w-3 h-3 bg-blue-500 rounded-full transform -translate-x-1/2" />

                    <div className="bg-white rounded-lg border p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-medium text-lg">{step.title}</h4>
                          <p className="text-sm text-gray-600">{step.timeframe}</p>
                        </div>
                        <Badge
                          text={formatSalary(step.salary.median)}
                          variant="success"
                        />
                      </div>

                      <p className="text-gray-700 mb-4">{step.description}</p>

                      {/* Requirements */}
                      <div className="space-y-4">
                        {/* Skills */}
                        <div>
                          <h5 className="font-medium mb-2">Required Skills</h5>
                          <div className="space-y-2">
                            {step.requirements.skills.map((skill, idx) => (
                              <div key={idx}>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>{skill.name}</span>
                                  <span>Level {skill.level}/5</span>
                                </div>
                                <ProgressBar
                                  value={skill.level}
                                  max={5}
                                  color="blue"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Certifications */}
                        {step.requirements.certifications.length > 0 && (
                          <div>
                            <h5 className="font-medium mb-2">
                              Required Certifications
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {step.requirements.certifications.map((cert, idx) => (
                                <Badge
                                  key={idx}
                                  text={cert}
                                  variant="warning"
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Experience */}
                        <div>
                          <h5 className="font-medium mb-2">
                            Experience Requirements
                          </h5>
                          <p className="text-sm text-gray-700">
                            {step.requirements.experience}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DataCard>

          {/* Success Factors */}
          <DataCard title="Key Success Factors">
            <div className="space-y-4">
              {selectedPath.successFactors.map((factor, index) => (
                <div key={index} className="border-b last:border-b-0 pb-4 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{factor.factor}</h4>
                    <Badge
                      text={`Importance: ${factor.importance}/10`}
                      variant="primary"
                    />
                  </div>
                  <p className="text-sm text-gray-700">{factor.description}</p>
                  <div className="mt-2">
                    <ProgressBar
                      value={factor.importance}
                      max={10}
                      color="green"
                    />
                  </div>
                </div>
              ))}
            </div>
          </DataCard>

          {/* Salary Progression */}
          <DataCard title="Salary Progression">
            <div className="space-y-6">
              {selectedPath.salaryProgression.map((stage, index) => (
                <div key={index} className="border-b last:border-b-0 pb-6 last:pb-0">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">{stage.stage}</h4>
                    <div className="text-sm">
                      <span className="text-gray-600">Range: </span>
                      <span className="font-medium">
                        {formatSalary(stage.range.min)} - 
                        {formatSalary(stage.range.max)}
                      </span>
                    </div>
                  </div>
                  <div className="relative pt-2">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{formatSalary(stage.range.min)}</span>
                      <span>{formatSalary(stage.range.median)}</span>
                      <span>{formatSalary(stage.range.max)}</span>
                    </div>
                    <div className="mt-2">
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{
                            width: `${((stage.range.median - stage.range.min) /
                              (stage.range.max - stage.range.min)) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DataCard>
        </div>
      )}
    </div>
  );
};
