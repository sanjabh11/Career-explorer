import React from 'react';

interface CircularProgressProps {
  value: number;
  maxValue: number;
  label: string;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  size?: 'sm' | 'md' | 'lg';
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  maxValue,
  label,
  color = 'blue',
  size = 'md',
}) => {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const radius = size === 'sm' ? 30 : size === 'md' ? 40 : 50;
  const strokeWidth = size === 'sm' ? 4 : size === 'md' ? 5 : 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    red: 'text-red-500',
    yellow: 'text-yellow-500',
    purple: 'text-purple-500',
  };

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const valueSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${sizeClasses[size]}`}>
        <svg className="transform -rotate-90" viewBox={`0 0 ${radius * 2 + strokeWidth} ${radius * 2 + strokeWidth}`}>
          {/* Background circle */}
          <circle
            cx={radius + strokeWidth / 2}
            cy={radius + strokeWidth / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx={radius + strokeWidth / 2}
            cy={radius + strokeWidth / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`${colorClasses[color]} transition-all duration-500 ease-in-out`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-semibold ${valueSizeClasses[size]} ${colorClasses[color]}`}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      <span className={`mt-2 text-center ${labelSizeClasses[size]} text-gray-600`}>
        {label}
      </span>
    </div>
  );
};
