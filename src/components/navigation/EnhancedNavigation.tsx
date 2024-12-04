import React, { useState } from 'react';
import { navigationStructure } from './NavigationStructure';

interface SubcategoryProps {
  name: string;
  data: {
    current: boolean;
    components: string[];
  };
  onSelect: (category: string, subcategory: string, component: string) => void;
}

interface CategoryProps {
  name: string;
  data: {
    title: string;
    subcategories: Record<string, {
      current: boolean;
      components: string[];
    }>;
  };
  onSelect: (category: string, subcategory: string, component: string) => void;
}

const Subcategory: React.FC<SubcategoryProps> = ({ name, data, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="ml-4 mb-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center text-left w-full py-2 px-3 rounded hover:bg-gray-100"
      >
        <span className={`mr-2 ${data.current ? 'text-blue-600' : ''}`}>
          {name.replace(/_/g, ' ').charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' ')}
        </span>
        <span className="text-xs text-gray-500 ml-auto">
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>
      {isExpanded && (
        <div className="ml-4">
          {data.components.map((component, index) => (
            <button
              key={index}
              onClick={() => onSelect(name, component, '')}
              className="block w-full text-left py-1 px-3 text-sm hover:bg-gray-50 rounded"
            >
              {component}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Category: React.FC<CategoryProps> = ({ name, data, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center w-full text-left font-semibold py-2 px-4 bg-gray-50 rounded-lg hover:bg-gray-100"
      >
        <span>{data.title}</span>
        <span className="ml-auto">{isExpanded ? '▼' : '▶'}</span>
      </button>
      {isExpanded && (
        <div className="mt-2">
          {Object.entries(data.subcategories).map(([subName, subData]) => (
            <Subcategory
              key={subName}
              name={subName}
              data={subData}
              onSelect={(subcategory, component) => onSelect(name, subcategory, component)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const EnhancedNavigation: React.FC<{
  onNavigate: (category: string, subcategory: string, component: string) => void;
}> = ({ onNavigate }) => {
  return (
    <nav className="w-64 bg-white border-r border-gray-200 p-4">
      <div className="space-y-4">
        {Object.entries(navigationStructure.primary_categories).map(([name, data]) => (
          <Category
            key={name}
            name={name}
            data={data}
            onSelect={onNavigate}
          />
        ))}
      </div>
    </nav>
  );
};

export default EnhancedNavigation;
