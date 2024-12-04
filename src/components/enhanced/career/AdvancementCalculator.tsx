import React, { useState } from 'react';
import { DataCard } from '../shared/DataCard';
import { Badge } from '../shared/Badge';
import { ProgressBar } from '../shared/ProgressBar';

interface Requirement {
  category: string;
  items: Array<{
    name: string;
    required: number;
    current: number;
    weight: number;
  }>;
}

interface AdvancementCalculatorProps {
  targetRole: string;
  requirements: Requirement[];
  onUpdateProgress: (category: string, itemName: string, value: number) => void;
}

export const AdvancementCalculator: React.FC<AdvancementCalculatorProps> = ({
  targetRole,
  requirements,
  onUpdateProgress
}) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const calculateOverallProgress = (): number => {
    let totalWeight = 0;
    let weightedProgress = 0;

    requirements.forEach(category => {
      category.items.forEach(item => {
        totalWeight += item.weight;
        weightedProgress += (item.current / item.required) * item.weight;
      });
    });

    return (weightedProgress / totalWeight) * 100;
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 80) return 'green';
    if (percentage >= 50) return 'yellow';
    return 'red';
  };

  return (
    <div className="space-y-6">
      <DataCard title={`Advancement Requirements - ${targetRole}`}>
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-2">Overall Progress</h4>
          <ProgressBar
            value={calculateOverallProgress()}
            max={100}
            color={getProgressColor(calculateOverallProgress())}
            label="Completion Progress"
          />
        </div>

        <div className="space-y-4">
          {requirements.map(category => (
            <div key={category.category} className="border rounded-lg">
              <button
                className="w-full px-4 py-3 flex items-center justify-between text-left"
                onClick={() => toggleCategory(category.category)}
              >
                <span className="font-medium">{category.category}</span>
                <span className="text-gray-500">
                  {expandedCategories.includes(category.category) ? '▼' : '▶'}
                </span>
              </button>

              {expandedCategories.includes(category.category) && (
                <div className="px-4 pb-4">
                  <div className="space-y-4">
                    {category.items.map(item => (
                      <div key={item.name}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">{item.name}</span>
                          <Badge
                            text={`Weight: ${item.weight}`}
                            variant="secondary"
                          />
                        </div>

                        <div className="space-y-2">
                          <ProgressBar
                            value={item.current}
                            max={item.required}
                            color={getProgressColor((item.current / item.required) * 100)}
                          />

                          <div className="flex justify-between text-sm text-gray-500">
                            <span>Current: {item.current}</span>
                            <span>Required: {item.required}</span>
                          </div>

                          <div className="flex justify-end">
                            <button
                              onClick={() => onUpdateProgress(
                                category.category,
                                item.name,
                                Math.min(item.current + 1, item.required)
                              )}
                              className="text-sm text-blue-600 hover:text-blue-800"
                              disabled={item.current >= item.required}
                            >
                              Update Progress
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
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
