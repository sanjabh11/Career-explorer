import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  value, 
  max, 
  label,
  color = 'blue'
}) => {
  const percentage = (value / max) * 100;
  
  return (
    <div className="w-full">
      {label && <div className="text-sm mb-1">{label}</div>}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`bg-${color}-600 h-2.5 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-gray-500 mt-1">{value} / {max}</div>
    </div>
  );
};
