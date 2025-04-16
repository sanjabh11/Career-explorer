import React from 'react';

interface SalaryChartProps {
  salaryRange: {
    min: number;
    median: number;
    max: number;
    currency: string;
  };
}

/**
 * Component to display salary information with a visual chart
 */
const SalaryChart: React.FC<SalaryChartProps> = ({ salaryRange }) => {
  const { min, median, max, currency } = salaryRange;
  
  // Format salary as currency
  const formatSalary = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Calculate position for median marker (as percentage)
  const getMedianPosition = (): string => {
    if (min === max) return '50%';
    const percentage = ((median - min) / (max - min)) * 100;
    return `${Math.max(10, Math.min(90, percentage))}%`;
  };
  
  return (
    <div className="w-full">
      {/* Salary range bar */}
      <div className="relative h-16 mb-4">
        {/* Salary bar */}
        <div className="absolute top-6 left-0 right-0 h-2 bg-gradient-to-r from-blue-300 via-blue-500 to-blue-700 rounded-full"></div>
        
        {/* Median marker */}
        <div 
          className="absolute top-2 w-0.5 h-10 bg-black"
          style={{ left: getMedianPosition() }}
        >
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            <span className="text-xs font-semibold">Median</span>
          </div>
          <div className="absolute top-11 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            <span className="text-sm font-bold">{formatSalary(median)}</span>
          </div>
        </div>
        
        {/* Min label */}
        <div className="absolute top-6 left-0 transform -translate-x-1/2">
          <div className="absolute top-4 whitespace-nowrap">
            <span className="text-xs text-gray-600">Min</span>
          </div>
          <div className="absolute top-8 whitespace-nowrap">
            <span className="text-sm">{formatSalary(min)}</span>
          </div>
        </div>
        
        {/* Max label */}
        <div className="absolute top-6 right-0 transform translate-x-1/2">
          <div className="absolute top-4 right-0 whitespace-nowrap">
            <span className="text-xs text-gray-600">Max</span>
          </div>
          <div className="absolute top-8 right-0 whitespace-nowrap">
            <span className="text-sm">{formatSalary(max)}</span>
          </div>
        </div>
      </div>
      
      {/* Additional information */}
      <div className="mt-8 text-sm text-gray-700">
        <p>The typical salary range for this occupation is between {formatSalary(min)} and {formatSalary(max)} per year, with a median salary of {formatSalary(median)}.</p>
      </div>
    </div>
  );
};

export default SalaryChart;
