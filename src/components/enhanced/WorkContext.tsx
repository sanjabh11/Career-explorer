import React from 'react';
import { DataCard } from './shared/DataCard';
import { Badge } from './shared/Badge';
import { ProgressBar } from './shared/ProgressBar';

interface WorkEnvironment {
  physical_demands: Record<string, number>;
  environmental_conditions: Record<string, string>;
  safety_requirements: string[];
  schedule_flexibility: number;
  remote_work_potential: number;
  collaboration_level: number;
  stress_level: number;
}

interface WorkActivity {
  activity_type: string;
  cognitive_load: number;
  interpersonal_intensity: number;
  technical_complexity: number;
  autonomy_level: number;
  decision_making_frequency: number;
}

interface WorkContextProps {
  environment: WorkEnvironment;
  activities: WorkActivity[];
}

export const WorkContext: React.FC<WorkContextProps> = ({
  environment,
  activities
}) => {
  return (
    <div className="space-y-6">
      <DataCard title="Work Environment">
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium mb-3">Physical Demands</h4>
            <div className="space-y-2">
              {Object.entries(environment.physical_demands).map(([demand, level]) => (
                <ProgressBar
                  key={demand}
                  value={level}
                  max={10}
                  label={demand}
                  color="blue"
                />
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-3">Environmental Conditions</h4>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(environment.environmental_conditions).map(([condition, value]) => (
                <div key={condition}>
                  <span className="text-gray-500">{condition}:</span>
                  <span className="ml-2">{value}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-3">Safety Requirements</h4>
            <div className="flex flex-wrap gap-2">
              {environment.safety_requirements.map((req, index) => (
                <Badge key={index} text={req} variant="warning" />
              ))}
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium mb-2">Schedule Flexibility</h4>
              <ProgressBar
                value={environment.schedule_flexibility}
                max={10}
                color="green"
              />
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Remote Work Potential</h4>
              <ProgressBar
                value={environment.remote_work_potential * 100}
                max={100}
                color="blue"
              />
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Collaboration Level</h4>
              <ProgressBar
                value={environment.collaboration_level}
                max={10}
                color="purple"
              />
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Stress Level</h4>
              <ProgressBar
                value={environment.stress_level}
                max={10}
                color="red"
              />
            </div>
          </div>
        </div>
      </DataCard>
      
      <DataCard title="Work Activities">
        <div className="space-y-6">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="border-b last:border-b-0 pb-6 last:pb-0"
            >
              <h4 className="font-medium mb-3">{activity.activity_type}</h4>
              <div className="space-y-3">
                <div>
                  <h5 className="text-sm font-medium mb-2">Cognitive Load</h5>
                  <ProgressBar
                    value={activity.cognitive_load}
                    max={10}
                    color="blue"
                  />
                </div>
                
                <div>
                  <h5 className="text-sm font-medium mb-2">Interpersonal Intensity</h5>
                  <ProgressBar
                    value={activity.interpersonal_intensity}
                    max={10}
                    color="purple"
                  />
                </div>
                
                <div>
                  <h5 className="text-sm font-medium mb-2">Technical Complexity</h5>
                  <ProgressBar
                    value={activity.technical_complexity}
                    max={10}
                    color="green"
                  />
                </div>
                
                <div>
                  <h5 className="text-sm font-medium mb-2">Autonomy Level</h5>
                  <ProgressBar
                    value={activity.autonomy_level}
                    max={10}
                    color="yellow"
                  />
                </div>
                
                <div>
                  <h5 className="text-sm font-medium mb-2">Decision Making Frequency</h5>
                  <ProgressBar
                    value={activity.decision_making_frequency}
                    max={10}
                    color="red"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </DataCard>
    </div>
  );
};
