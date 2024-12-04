import React from 'react';
import { DataCard } from '../shared/DataCard';
import { Badge } from '../shared/Badge';
import { ProgressBar } from '../shared/ProgressBar';

interface ComparisonCategory {
  name: string;
  items: Array<{
    name: string;
    role1Value: number;
    role2Value: number;
    unit?: string;
    type: 'number' | 'percentage' | 'currency' | 'rating';
  }>;
}

interface RoleComparisonProps {
  role1: string;
  role2: string;
  categories: ComparisonCategory[];
}

export const RoleComparison: React.FC<RoleComparisonProps> = ({
  role1,
  role2,
  categories
}) => {
  const formatValue = (value: number, type: string, unit?: string): string => {
    switch (type) {
      case 'percentage':
        return `${value}%`;
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
      case 'rating':
        return `${value}/10`;
      default:
        return unit ? `${value}${unit}` : value.toString();
    }
  };

  const calculateDifference = (value1: number, value2: number): number => {
    return ((value2 - value1) / value1) * 100;
  };

  const getDifferenceColor = (difference: number): string => {
    if (difference > 0) return 'text-green-600';
    if (difference < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      <DataCard title="Role Comparison">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center font-medium">{role1}</div>
          <div className="text-center text-gray-500">Comparison</div>
          <div className="text-center font-medium">{role2}</div>
        </div>

        <div className="space-y-8">
          {categories.map(category => (
            <div key={category.name}>
              <h4 className="font-medium mb-4">{category.name}</h4>
              
              <div className="space-y-6">
                {category.items.map(item => (
                  <div key={item.name}>
                    <div className="text-sm font-medium mb-2">{item.name}</div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      {/* Role 1 Value */}
                      <div className="text-center">
                        <div className="font-medium">
                          {formatValue(item.role1Value, item.type, item.unit)}
                        </div>
                        {item.type === 'rating' && (
                          <ProgressBar
                            value={item.role1Value}
                            max={10}
                            color="blue"
                          />
                        )}
                      </div>

                      {/* Difference */}
                      <div className="text-center">
                        {item.type !== 'rating' && (
                          <div
                            className={`
                              ${getDifferenceColor(calculateDifference(item.role1Value, item.role2Value))}
                              font-medium
                            `}
                          >
                            {calculateDifference(item.role1Value, item.role2Value) > 0 ? '+' : ''}
                            {calculateDifference(item.role1Value, item.role2Value).toFixed(1)}%
                          </div>
                        )}
                      </div>

                      {/* Role 2 Value */}
                      <div className="text-center">
                        <div className="font-medium">
                          {formatValue(item.role2Value, item.type, item.unit)}
                        </div>
                        {item.type === 'rating' && (
                          <ProgressBar
                            value={item.role2Value}
                            max={10}
                            color="blue"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DataCard>
    </div>
  );
};
