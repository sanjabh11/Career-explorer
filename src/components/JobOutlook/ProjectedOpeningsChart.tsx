import React from 'react';

interface ProjectedOpeningsChartProps {
  projectedOpenings: number;
  employmentData: {
    current: number;
    projected: number;
    changePercent: number;
    changeValue: number;
  };
  occupationTitle: string;
}

/**
 * Component to display projected job openings and employment changes
 */
const ProjectedOpeningsChart: React.FC<ProjectedOpeningsChartProps> = ({ 
  projectedOpenings, 
  employmentData,
  occupationTitle
}) => {
  const { current, projected, changePercent, changeValue } = employmentData;
  
  // Format number with commas
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };
  
  // Determine if the change is positive, negative, or neutral
  const getChangeColor = (): string => {
    if (changePercent > 0) return 'text-green-600';
    if (changePercent < 0) return 'text-red-600';
    return 'text-yellow-600';
  };
  
  // Get change direction icon
  const getChangeIcon = () => {
    if (changePercent > 0) {
      return (
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      );
    } else if (changePercent < 0) {
      return (
        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      );
    } else {
      return (
        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
        </svg>
      );
    }
  };
  
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Projected Openings */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-600 mb-1">Projected Job Openings</h4>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-blue-700">{formatNumber(projectedOpenings)}</span>
            <span className="ml-2 text-sm text-gray-500">over the next 10 years</span>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            This represents the projected number of job openings for {occupationTitle} due to growth and replacement needs.
          </p>
        </div>
        
        {/* Employment Change */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-600 mb-1">Employment Change</h4>
          <div className="flex items-center">
            {getChangeIcon()}
            <span className={`ml-2 text-2xl font-bold ${getChangeColor()}`}>
              {changePercent > 0 ? '+' : ''}{changePercent}%
            </span>
          </div>
          <div className="mt-1 text-sm text-gray-600">
            <span className="font-medium">Current employment:</span> {formatNumber(current)}
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Projected employment:</span> {formatNumber(projected)}
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Net change:</span> {changeValue > 0 ? '+' : ''}{formatNumber(changeValue)} jobs
          </div>
        </div>
      </div>
      
      {/* Interpretation */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
        <p>
          {changePercent > 10 ? (
            <>This occupation is projected to grow much faster than average, indicating strong job prospects.</>
          ) : changePercent > 5 ? (
            <>This occupation is projected to grow faster than average, suggesting good job prospects.</>
          ) : changePercent > -5 ? (
            <>This occupation is projected to grow at about the average rate, indicating stable job prospects.</>
          ) : (
            <>This occupation is projected to grow slower than average or decline, which may indicate limited job prospects.</>
          )}
        </p>
      </div>
    </div>
  );
};

export default ProjectedOpeningsChart;
