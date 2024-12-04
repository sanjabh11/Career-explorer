import React from 'react';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'error' | 'info';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  className?: string;
  onClick?: () => void;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-blue-100 text-blue-800',
  secondary: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
};

export const Badge: React.FC<BadgeProps> = ({ 
  text, 
  variant = 'primary',
  className = '',
  onClick
}) => {
  return (
    <span 
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${variantClasses[variant]}
        ${className}
        ${onClick ? 'cursor-pointer' : ''}
      `}
      onClick={onClick}
    >
      {text}
    </span>
  );
};
