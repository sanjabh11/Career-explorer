import React from 'react';

interface GrowthIndicatorProps {
  growthRate: number;
  description: string;
}

/**
 * Visual indicator of growth rate with color coding and description
 */
const GrowthIndicator: React.FC<GrowthIndicatorProps> = ({ growthRate, description }) => {
  // Determine color based on growth rate
  const getColorClass = () => {
    if (growthRate > 14) return 'bg-green-500'; // Much faster than average
    if (growthRate > 5) return 'bg-green-400';  // Faster than average
    if (growthRate > -5) return 'bg-yellow-400'; // Average
    if (growthRate > -14) return 'bg-orange-400'; // Slower than average
    return 'bg-red-500'; // Much slower than average
  };

  // Determine width of the growth bar (min 5%, max 95%)
  const getBarWidth = () => {
    // Convert growth rate to a percentage between 5% and 95%
    const normalizedGrowth = Math.min(Math.max(growthRate, -30), 30);
    const percentage = ((normalizedGrowth + 30) / 60) * 90 + 5;
    return `${percentage}%`;
  };

  // Get growth trend icon
  const getGrowthIcon = () => {
    if (growthRate > 5) {
      return (
        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    } else if (growthRate > -5) {
      return (
        <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      );
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center mb-2">
        {getGrowthIcon()}
        <span className="ml-2 font-semibold">
          {growthRate > 0 ? '+' : ''}{growthRate}% projected growth
        </span>
      </div>
      
      {/* Growth rate bar */}
      <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
        <div 
          className={`${getColorClass()} h-4 rounded-full`} 
          style={{ width: getBarWidth() }}
        ></div>
      </div>
      
      {/* Description */}
      <p className="text-sm text-gray-700">{description}</p>
      
      {/* National average comparison */}
      <div className="mt-4 text-sm">
        <span className="font-medium">Compared to national average: </span>
        {growthRate > 7 ? (
          <span className="text-green-600">Above average</span>
        ) : growthRate > -7 ? (
          <span className="text-yellow-600">Average</span>
        ) : (
          <span className="text-red-600">Below average</span>
        )}
      </div>
    </div>
  );
};

export default GrowthIndicator;
