import React from 'react';
import { Badge } from '../shared/Badge';

interface EducationLevel {
  id: number;
  name: string;
  description: string;
}

interface EducationFilterProps {
  selectedLevels: number[];
  onLevelChange: (levels: number[]) => void;
}

const educationLevels: EducationLevel[] = [
  { id: 1, name: 'High School', description: 'High school diploma or equivalent' },
  { id: 2, name: 'Associate', description: "Associate's degree" },
  { id: 3, name: 'Bachelor', description: "Bachelor's degree" },
  { id: 4, name: 'Master', description: "Master's degree" },
  { id: 5, name: 'Doctoral', description: 'Doctoral or professional degree' },
  { id: 6, name: 'Certification', description: 'Professional certification' },
  { id: 7, name: 'License', description: 'Professional license' },
  { id: 8, name: 'None', description: 'No formal education required' }
];

export const EducationFilter: React.FC<EducationFilterProps> = ({
  selectedLevels,
  onLevelChange
}) => {
  const toggleLevel = (levelId: number) => {
    if (selectedLevels.includes(levelId)) {
      onLevelChange(selectedLevels.filter(id => id !== levelId));
    } else {
      onLevelChange([...selectedLevels, levelId]);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Education Level</h3>
      <div className="flex flex-wrap gap-2">
        {educationLevels.map(level => (
          <button
            key={level.id}
            onClick={() => toggleLevel(level.id)}
            className={`
              inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium
              transition-colors duration-200
              ${selectedLevels.includes(level.id)
                ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
            `}
            title={level.description}
          >
            {level.name}
            {selectedLevels.includes(level.id) && (
              <span className="ml-1">✓</span>
            )}
          </button>
        ))}
      </div>
      
      {selectedLevels.length > 0 && (
        <div className="mt-2">
          <div className="text-sm text-gray-500 mb-1">Selected Levels:</div>
          <div className="flex flex-wrap gap-2">
            {selectedLevels.map(id => {
              const level = educationLevels.find(l => l.id === id);
              return level ? (
                <Badge
                  key={id}
                  text={level.name}
                  variant="primary"
                />
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};
