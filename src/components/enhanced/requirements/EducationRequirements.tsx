import React, { useState, useEffect } from 'react';
import { DataCard } from '../shared/DataCard';
import { Badge } from '../shared/Badge';
import { ProgressBar } from '../shared/ProgressBar';

interface Institution {
  name: string;
  location: string;
  programType: string;
  duration: number;
  cost: number;
  rating: number;
}

interface AlternativePath {
  path: string;
  duration: number;
  cost: number;
  advantages: string[];
  limitations: string[];
}

interface EducationRequirement {
  id: number;
  degreeLevel: string;
  fieldOfStudy: string;
  required: boolean;
  preferred: boolean;
  importanceScore: number;
  typicalTimeToComplete: number;
  alternativePaths: AlternativePath[];
  recommendedInstitutions: Institution[];
}

interface EducationRequirementsProps {
  occupationId: string;
  onRequirementSelect?: (requirement: EducationRequirement) => void;
}

export const EducationRequirements: React.FC<EducationRequirementsProps> = ({
  occupationId,
  onRequirementSelect
}) => {
  const [requirements, setRequirements] = useState<EducationRequirement[]>([]);
  const [selectedRequirement, setSelectedRequirement] = useState<EducationRequirement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequirements = async () => {
      try {
        const response = await fetch(`/api/v2/requirements/education-details/${occupationId}`);
        if (!response.ok) throw new Error('Failed to fetch education requirements');
        const data = await response.json();
        setRequirements(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRequirements();
  }, [occupationId]);

  const handleRequirementClick = (requirement: EducationRequirement) => {
    setSelectedRequirement(requirement);
    if (onRequirementSelect) {
      onRequirementSelect(requirement);
    }
  };

  if (loading) return <div className="animate-pulse">Loading education requirements...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <DataCard title="Education Requirements">
        <div className="space-y-6">
          {requirements.map((req) => (
            <div
              key={req.id}
              className={`
                p-4 rounded-lg border cursor-pointer transition-all
                ${selectedRequirement?.id === req.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
                }
              `}
              onClick={() => handleRequirementClick(req)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-medium text-lg">{req.degreeLevel}</h3>
                  <p className="text-gray-600">{req.fieldOfStudy}</p>
                </div>
                <div className="flex gap-2">
                  {req.required && <Badge text="Required" variant="danger" />}
                  {req.preferred && <Badge text="Preferred" variant="warning" />}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Importance</span>
                  <span>{req.importanceScore}%</span>
                </div>
                <ProgressBar
                  value={req.importanceScore}
                  max={100}
                  color="blue"
                />
              </div>

              <div className="text-sm text-gray-600">
                <div className="flex justify-between mb-2">
                  <span>Typical Duration:</span>
                  <span>{req.typicalTimeToComplete} months</span>
                </div>
              </div>

              {selectedRequirement?.id === req.id && (
                <div className="mt-4 space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Alternative Paths</h4>
                    <div className="grid gap-3">
                      {req.alternativePaths.map((path, index) => (
                        <div
                          key={index}
                          className="p-3 bg-white rounded border"
                        >
                          <div className="font-medium mb-1">{path.path}</div>
                          <div className="text-sm text-gray-600">
                            Duration: {path.duration} months | 
                            Cost: ${path.cost.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Recommended Institutions</h4>
                    <div className="grid gap-3">
                      {req.recommendedInstitutions.map((inst, index) => (
                        <div
                          key={index}
                          className="p-3 bg-white rounded border"
                        >
                          <div className="font-medium mb-1">{inst.name}</div>
                          <div className="text-sm text-gray-600">
                            {inst.location} | {inst.programType}
                          </div>
                          <div className="text-sm text-gray-600">
                            Duration: {inst.duration} months | 
                            Cost: ${inst.cost.toLocaleString()}
                          </div>
                          <div className="mt-1">
                            <ProgressBar
                              value={inst.rating}
                              max={5}
                              color="green"
                              label="Rating"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </DataCard>
    </div>
  );
};
