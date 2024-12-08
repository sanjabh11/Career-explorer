import React from 'react';

interface DataCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export const DataCard: React.FC<DataCardProps> = ({ title, children, className = '', headerAction }) => {
  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
          {headerAction}
        </div>
        {children}
      </div>
    </div>
  );
};
