import React from 'react';

interface DataCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const DataCard: React.FC<DataCardProps> = ({
  title,
  children,
  className = '',
  onClick
}) => {
  return (
    <div
      className={`
        bg-white rounded-lg border border-gray-200 p-4 shadow-sm
        ${className}
        ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
      `}
      onClick={onClick}
    >
      {title && (
        <h2 className="text-lg font-medium mb-4">{title}</h2>
      )}
      {children}
    </div>
  );
};
