import React from 'react';
import { DataCard } from './shared/DataCard';
import { Badge } from './shared/Badge';
import { ProgressBar } from './shared/ProgressBar';

interface CareerProgression {
  next_role: string;
  typical_timeframe: string;
  required_experience: number;
  required_skills: string[];
  salary_increase: number;
  difficulty_level: number;
  success_rate: number;
}

interface IndustryConnection {
  industry_sector: string;
  relevance_score: number;
  growth_rate: number;
  transition_difficulty: number;
  required_reskilling: string[];
  market_demand: number;
}

interface CareerPathwaysProps {
  progressions: CareerProgression[];
  industryConnections: IndustryConnection[];
}

export const CareerPathways: React.FC<CareerPathwaysProps> = ({
  progressions,
  industryConnections
}) => {
  return (
    <div className="space-y-6">
      <DataCard title="Career Progression Paths">
        <div className="space-y-6">
          {progressions.map((progression, index) => (
            <div
              key={index}
              className="border-b last:border-b-0 pb-6 last:pb-0"
            >
              <h4 className="font-medium mb-3">{progression.next_role}</h4>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-gray-500">Timeframe:</span>
                  <span className="ml-2">{progression.typical_timeframe}</span>
                </div>
                <div>
                  <span className="text-gray-500">Experience Required:</span>
                  <span className="ml-2">{progression.required_experience} years</span>
                </div>
                <div>
                  <span className="text-gray-500">Salary Increase:</span>
                  <span className="ml-2">{(progression.salary_increase * 100).toFixed(0)}%</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h5 className="text-sm font-medium mb-2">Required Skills</h5>
                  <div className="flex flex-wrap gap-2">
                    {progression.required_skills.map((skill, idx) => (
                      <Badge key={idx} text={skill} variant="primary" />
                    ))}
                  </div>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium mb-2">Difficulty Level</h5>
                  <ProgressBar
                    value={progression.difficulty_level}
                    max={10}
                    color="blue"
                  />
                </div>
                
                <div>
                  <h5 className="text-sm font-medium mb-2">Success Rate</h5>
                  <ProgressBar
                    value={progression.success_rate * 100}
                    max={100}
                    color="green"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </DataCard>
      
      <DataCard title="Industry Connections">
        <div className="space-y-6">
          {industryConnections.map((connection, index) => (
            <div
              key={index}
              className="border-b last:border-b-0 pb-6 last:pb-0"
            >
              <h4 className="font-medium mb-3">{connection.industry_sector}</h4>
              <div className="space-y-3">
                <div>
                  <h5 className="text-sm font-medium mb-2">Relevance Score</h5>
                  <ProgressBar
                    value={connection.relevance_score * 100}
                    max={100}
                    color="blue"
                  />
                </div>
                
                <div>
                  <h5 className="text-sm font-medium mb-2">Growth Rate</h5>
                  <div className="flex items-center">
                    <span className={`text-${connection.growth_rate >= 0 ? 'green' : 'red'}-600 font-medium`}>
                      {connection.growth_rate >= 0 ? '+' : ''}{connection.growth_rate}%
                    </span>
                  </div>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium mb-2">Required Reskilling</h5>
                  <div className="flex flex-wrap gap-2">
                    {connection.required_reskilling.map((skill, idx) => (
                      <Badge key={idx} text={skill} variant="warning" />
                    ))}
                  </div>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium mb-2">Market Demand</h5>
                  <ProgressBar
                    value={connection.market_demand}
                    max={10}
                    color="green"
                  />
                </div>
                
                <div>
                  <h5 className="text-sm font-medium mb-2">Transition Difficulty</h5>
                  <ProgressBar
                    value={connection.transition_difficulty * 100}
                    max={100}
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
