import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const educationLevels = [
  'All Levels',
  'Less than High School',
  'High School Diploma',
  'Some College',
  'Associate\'s Degree',
  'Bachelor\'s Degree',
  'Master\'s Degree',
  'Doctoral Degree',
  'Professional Degree'
];

interface Props {
  selectedLevel: string;
  onLevelChange: (level: string) => void;
}

const EducationFilter: React.FC<Props> = ({ selectedLevel, onLevelChange }) => {
  return (
    <div className="flex items-center space-x-4">
      <label htmlFor="education-level" className="text-sm font-medium">Filter by Education Level:</label>
      <Select value={selectedLevel} onValueChange={onLevelChange}>
        <SelectTrigger id="education-level" className="w-[200px]">
          <SelectValue placeholder="Select education level" />
        </SelectTrigger>
        <SelectContent>
          {educationLevels.map((level) => (
            <SelectItem key={level} value={level}>
              {level}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default EducationFilter;
