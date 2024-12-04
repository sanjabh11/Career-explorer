import React from 'react';
import { DataCard } from './shared/DataCard';
import { Badge } from './shared/Badge';
import { ProgressBar } from './shared/ProgressBar';

interface Education {
  required_level: number;
  preferred_level: number;
  field_of_study: string;
  certifications: string[];
  licenses: string[];
  continuing_education: Record<string, string>;
}

interface TrainingProgram {
  name: string;
  provider: string;
  duration: string;
  format: string;
  cost_range: string;
  success_rate: number;
}

interface EducationRequirementsProps {
  education: Education;
  trainingPrograms: TrainingProgram[];
}

export const EducationRequirements: React.FC<EducationRequirementsProps> = ({
  education,
  trainingPrograms
}) => {
  return (
    <div className="space-y-6">
      <DataCard title="Education Requirements">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Education Level</h4>
            <div className="space-y-2">
              <ProgressBar
                value={education.required_level}
                max={10}
                label="Required Level"
                color="blue"
              />
              <ProgressBar
                value={education.preferred_level}
                max={10}
                label="Preferred Level"
                color="green"
              />
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Field of Study</h4>
            <p className="text-gray-700">{education.field_of_study}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Certifications</h4>
            <div className="flex flex-wrap gap-2">
              {education.certifications.map((cert, index) => (
                <Badge key={index} text={cert} variant="primary" />
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Licenses</h4>
            <div className="flex flex-wrap gap-2">
              {education.licenses.map((license, index) => (
                <Badge key={index} text={license} variant="secondary" />
              ))}
            </div>
          </div>
        </div>
      </DataCard>
      
      <DataCard title="Training Programs">
        <div className="space-y-4">
          {trainingPrograms.map((program, index) => (
            <div
              key={index}
              className="border-b last:border-b-0 pb-4 last:pb-0"
            >
              <h4 className="font-medium mb-2">{program.name}</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Provider:</span>
                  <span className="ml-2">{program.provider}</span>
                </div>
                <div>
                  <span className="text-gray-500">Duration:</span>
                  <span className="ml-2">{program.duration}</span>
                </div>
                <div>
                  <span className="text-gray-500">Format:</span>
                  <span className="ml-2">{program.format}</span>
                </div>
                <div>
                  <span className="text-gray-500">Cost Range:</span>
                  <span className="ml-2">{program.cost_range}</span>
                </div>
              </div>
              <div className="mt-2">
                <ProgressBar
                  value={program.success_rate * 100}
                  max={100}
                  label="Success Rate"
                  color="green"
                />
              </div>
            </div>
          ))}
        </div>
      </DataCard>
    </div>
  );
};
