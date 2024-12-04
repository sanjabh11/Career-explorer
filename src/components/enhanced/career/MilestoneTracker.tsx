import React from 'react';
import { DataCard } from '../shared/DataCard';
import { Badge, BadgeVariant } from '../shared/Badge';
import { ProgressBar } from '../shared/ProgressBar';

interface Milestone {
  id: string;
  title: string;
  description: string;
  timeframe: string;
  requirements: string[];
  status: 'completed' | 'in-progress' | 'upcoming';
  progress?: number;
  skills: Array<{
    name: string;
    proficiency: number;
  }>;
}

interface MilestoneTrackerProps {
  milestones: Milestone[];
  onUpdateMilestone: (milestoneId: string, progress: number) => void;
}

export const MilestoneTracker: React.FC<MilestoneTrackerProps> = ({
  milestones,
  onUpdateMilestone
}) => {
  const getStatusColor = (status: Milestone['status']): BadgeVariant => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'primary';
      case 'upcoming':
        return 'secondary';
      default:
        return 'primary';
    }
  };

  return (
    <div className="space-y-6">
      <DataCard title="Career Milestones">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={milestone.id} className="relative pl-12">
                {/* Timeline dot */}
                <div
                  className={`absolute left-2.5 w-3 h-3 rounded-full transform -translate-x-1/2 ${
                    milestone.status === 'completed'
                      ? 'bg-green-500'
                      : milestone.status === 'in-progress'
                      ? 'bg-blue-500'
                      : 'bg-gray-300'
                  }`}
                />

                <div className="bg-white rounded-lg border p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{milestone.title}</h4>
                      <p className="text-sm text-gray-500">{milestone.timeframe}</p>
                    </div>
                    <Badge
                      text={milestone.status.replace('-', ' ')}
                      variant={getStatusColor(milestone.status)}
                    />
                  </div>

                  <p className="text-gray-700 mb-4">{milestone.description}</p>

                  {milestone.status === 'in-progress' && milestone.progress !== undefined && (
                    <div className="mb-4">
                      <ProgressBar
                        value={milestone.progress}
                        max={100}
                        color="blue"
                        label="Progress"
                      />
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h5 className="text-sm font-medium mb-2">Requirements</h5>
                      <div className="flex flex-wrap gap-2">
                        {milestone.requirements.map((req, idx) => (
                          <Badge key={idx} text={req} variant="secondary" />
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium mb-2">Required Skills</h5>
                      <div className="space-y-2">
                        {milestone.skills.map((skill, idx) => (
                          <div key={idx}>
                            <div className="flex justify-between text-sm mb-1">
                              <span>{skill.name}</span>
                              <span className="text-gray-500">
                                {skill.proficiency}/10
                              </span>
                            </div>
                            <ProgressBar
                              value={skill.proficiency}
                              max={10}
                              color="green"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {milestone.status === 'in-progress' && (
                    <div className="mt-4">
                      <button
                        onClick={() => onUpdateMilestone(
                          milestone.id,
                          (milestone.progress || 0) + 10
                        )}
                        className="text-sm text-blue-600 hover:text-blue-800"
                        disabled={(milestone.progress || 0) >= 100}
                      >
                        Update Progress
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DataCard>
    </div>
  );
};
