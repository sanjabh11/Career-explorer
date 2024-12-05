import React from 'react';

interface CircularProgressProps {
    value: number;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

interface TooltipProps {
    content: string;
    children: React.ReactNode;
}

const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
};

export const CircularProgress: React.FC<CircularProgressProps> = ({
    value,
    size = 'md',
    className = ''
}) => {
    const radius = size === 'sm' ? 12 : size === 'md' ? 20 : 28;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
        <div className={`relative ${sizeClasses[size]} ${className}`}>
            <svg className="w-full h-full transform -rotate-90">
                {/* Background circle */}
                <circle
                    className="text-gray-200"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="50%"
                    cy="50%"
                />
                {/* Progress circle */}
                <circle
                    className="text-blue-600 transition-all duration-300 ease-in-out"
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="50%"
                    cy="50%"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-medium">{Math.round(value)}%</span>
            </div>
        </div>
    );
};

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
    return (
        <div className="relative group">
            {children}
            <div className="absolute z-10 invisible group-hover:visible bg-gray-900 text-white text-sm rounded py-1 px-2 -mt-2 
                           left-1/2 transform -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-all duration-200">
                {content}
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900" />
            </div>
        </div>
    );
};
