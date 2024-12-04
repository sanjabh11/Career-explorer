import React, { useState, useEffect } from 'react';
import { DataCard } from '../shared/DataCard';
import { Badge } from '../shared/Badge';

interface Skill {
  id: string;
  name: string;
  category: string;
  currentLevel: number;
  requiredLevel: number;
  timeToAcquire: number;
  learningResources: Array<{
    type: string;
    title: string;
    provider: string;
    duration: string;
    cost: number;
  }>;
}

interface TransitionPlan {
  duration: number;
  difficulty: number;
  steps: Array<{
    phase: string;
    duration: number;
    objectives: string[];
    milestones: string[];
  }>;
  estimatedCosts: {
    training: number;
    certification: number;
    other: number;
  };
}

interface SkillGapAnalysisProps {
  sourceOccupationId: string;
  targetOccupationId: string;
}

export const SkillGapAnalysis: React.FC<SkillGapAnalysisProps> = ({
  sourceOccupationId,
  targetOccupationId,
}) => {
  const [skillGaps, setSkillGaps] = useState<Skill[]>([]);
  const [transitionPlan, setTransitionPlan] = useState<TransitionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch skill gaps
        const gapsResponse = await fetch(
          `/api/v2/career-paths/role-comparison/skill-gaps?source=${sourceOccupationId}&target=${targetOccupationId}`
        );
        if (!gapsResponse.ok) throw new Error('Failed to fetch skill gaps');
        const gapsData = await gapsResponse.json();
        setSkillGaps(gapsData);

        // Fetch transition plan
        const planResponse = await fetch(
          `/api/v2/career-paths/role-comparison/transition-plan?source=${sourceOccupationId}&target=${targetOccupationId}`
        );
        if (!planResponse.ok) throw new Error('Failed to fetch transition plan');
        const planData = await planResponse.json();
        setTransitionPlan(planData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sourceOccupationId, targetOccupationId]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) return <div className="animate-pulse">Analyzing skill gaps...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-8">
      {/* Skill Gaps Overview */}
      <DataCard title="Skill Gaps Analysis">
        <div className="space-y-6">
          {skillGaps.map((skill) => (
            <div
              key={skill.id}
              className="border-b last:border-b-0 pb-6 last:pb-0"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-medium text-lg">{skill.name}</h4>
                  <Badge text={skill.category} variant="secondary" />
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Gap to Close</div>
                  <Badge
                    text={`${skill.requiredLevel - skill.currentLevel} levels`}
                    variant={
                      skill.requiredLevel - skill.currentLevel > 2
                        ? 'warning'
                        : 'success'
                    }
                  />
                </div>
              </div>

              {/* Skill Level Visualization */}
              <div className="relative pt-1">
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-semibold inline-block text-blue-600">
                    Current Level: {skill.currentLevel}
                  </span>
                  <span className="text-xs font-semibold inline-block text-green-600">
                    Required Level: {skill.requiredLevel}
                  </span>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                  <div
                    style={{ width: `${(skill.currentLevel / 5) * 100}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                  />
                  <div
                    style={{
                      width: `${
                        ((skill.requiredLevel - skill.currentLevel) / 5) * 100
                      }%`
                    }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 opacity-25"
                  />
                </div>
              </div>

              {/* Learning Resources */}
              <div className="mt-4">
                <h5 className="text-sm font-medium mb-2">
                  Recommended Learning Resources
                </h5>
                <div className="grid gap-3 md:grid-cols-2">
                  {skill.learningResources.map((resource, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{resource.title}</div>
                          <div className="text-sm text-gray-600">
                            {resource.provider}
                          </div>
                        </div>
                        <Badge text={resource.type} variant="primary" />
                      </div>
                      <div className="mt-2 flex justify-between text-sm">
                        <span>{resource.duration}</span>
                        <span>{formatCurrency(resource.cost)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </DataCard>

      {/* Transition Plan */}
      {transitionPlan && (
        <DataCard title="Transition Plan">
          <div className="space-y-6">
            {/* Overview */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Total Duration</div>
                <div className="text-2xl font-bold">
                  {transitionPlan.duration} months
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Difficulty Level</div>
                <div className="text-2xl font-bold">
                  {transitionPlan.difficulty}/10
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Total Cost</div>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    Object.values(transitionPlan.estimatedCosts).reduce(
                      (a, b) => a + b,
                      0
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative pt-4">
              <div className="absolute left-4 h-full w-0.5 bg-gray-200" />
              {transitionPlan.steps.map((step, index) => (
                <div key={index} className="relative pl-12 pb-8 last:pb-0">
                  <div className="absolute left-2.5 w-3 h-3 bg-blue-500 rounded-full transform -translate-x-1/2" />
                  <div className="bg-white rounded-lg border p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium">{step.phase}</h4>
                      <Badge
                        text={`${step.duration} months`}
                        variant="secondary"
                      />
                    </div>

                    {/* Objectives */}
                    <div className="mb-4">
                      <h5 className="text-sm font-medium mb-2">Objectives</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {step.objectives.map((objective, idx) => (
                          <li key={idx} className="text-sm text-gray-600">
                            {objective}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Milestones */}
                    <div>
                      <h5 className="text-sm font-medium mb-2">Key Milestones</h5>
                      <div className="flex flex-wrap gap-2">
                        {step.milestones.map((milestone, idx) => (
                          <Badge
                            key={idx}
                            text={milestone}
                            variant="success"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cost Breakdown */}
            <div>
              <h4 className="font-medium mb-4">Cost Breakdown</h4>
              <div className="space-y-2">
                {Object.entries(transitionPlan.estimatedCosts).map(
                  ([category, cost]) => (
                    <div
                      key={category}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="capitalize">
                        {category.replace('_', ' ')}
                      </span>
                      <span className="font-medium">
                        {formatCurrency(cost)}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </DataCard>
      )}
    </div>
  );
};
