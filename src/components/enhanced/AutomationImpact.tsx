import React from 'react';
import { DataCard } from './shared/DataCard';
import { Badge } from './shared/Badge';
import { ProgressBar } from './shared/ProgressBar';

interface AutomationRisk {
  overall_risk_score: number;
  task_automation_potential: Record<string, number>;
  technology_impact_timeline: Record<string, string>;
  required_adaptations: Array<{
    skill_area: string;
    importance: number;
    timeline: string;
  }>;
  market_stability: number;
}

interface SkillTransition {
  current_skills: string[];
  target_skills: string[];
  gap_analysis: Record<string, string>;
  transition_difficulty: number;
  estimated_timeframe: string;
  recommended_resources: Array<{
    name: string;
    type: string;
    url?: string;
  }>;
}

interface AutomationImpactProps {
  risk: AutomationRisk;
  transition: SkillTransition;
}

export const AutomationImpact: React.FC<AutomationImpactProps> = ({
  risk,
  transition
}) => {
  return (
    <div className="space-y-6">
      <DataCard title="Automation Risk Analysis">
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium mb-3">Overall Risk Score</h4>
            <ProgressBar
              value={risk.overall_risk_score * 100}
              max={100}
              color={risk.overall_risk_score > 0.7 ? 'red' : risk.overall_risk_score > 0.3 ? 'yellow' : 'green'}
            />
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-3">Task Automation Potential</h4>
            <div className="space-y-2">
              {Object.entries(risk.task_automation_potential).map(([task, potential]) => (
                <ProgressBar
                  key={task}
                  value={potential * 100}
                  max={100}
                  label={task}
                  color={potential > 0.7 ? 'red' : potential > 0.3 ? 'yellow' : 'green'}
                />
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-3">Technology Impact Timeline</h4>
            <div className="space-y-2">
              {Object.entries(risk.technology_impact_timeline).map(([tech, timeline]) => (
                <div key={tech} className="flex justify-between items-center">
                  <span className="text-gray-700">{tech}</span>
                  <Badge
                    text={timeline}
                    variant={
                      timeline.includes('immediate') ? 'danger' :
                      timeline.includes('near') ? 'warning' : 'primary'
                    }
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-3">Required Adaptations</h4>
            <div className="space-y-4">
              {risk.required_adaptations.map((adaptation, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{adaptation.skill_area}</span>
                    <Badge text={adaptation.timeline} variant="primary" />
                  </div>
                  <ProgressBar
                    value={adaptation.importance * 100}
                    max={100}
                    color="blue"
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-3">Market Stability</h4>
            <ProgressBar
              value={risk.market_stability}
              max={10}
              color={risk.market_stability > 7 ? 'green' : risk.market_stability > 4 ? 'yellow' : 'red'}
            />
          </div>
        </div>
      </DataCard>
      
      <DataCard title="Skill Transition Plan">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium mb-3">Current Skills</h4>
              <div className="flex flex-wrap gap-2">
                {transition.current_skills.map((skill, index) => (
                  <Badge key={index} text={skill} variant="secondary" />
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-3">Target Skills</h4>
              <div className="flex flex-wrap gap-2">
                {transition.target_skills.map((skill, index) => (
                  <Badge key={index} text={skill} variant="primary" />
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-3">Gap Analysis</h4>
            <div className="space-y-2">
              {Object.entries(transition.gap_analysis).map(([skill, gap]) => (
                <div key={skill} className="flex justify-between items-center">
                  <span className="text-gray-700">{skill}</span>
                  <Badge
                    text={gap}
                    variant={
                      gap.includes('critical') ? 'danger' :
                      gap.includes('moderate') ? 'warning' : 'success'
                    }
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-3">Transition Difficulty</h4>
            <ProgressBar
              value={transition.transition_difficulty * 100}
              max={100}
              color={transition.transition_difficulty > 0.7 ? 'red' : transition.transition_difficulty > 0.3 ? 'yellow' : 'green'}
            />
            <p className="text-sm text-gray-500 mt-2">
              Estimated timeframe: {transition.estimated_timeframe}
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-3">Recommended Resources</h4>
            <div className="space-y-3">
              {transition.recommended_resources.map((resource, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{resource.name}</span>
                    <Badge text={resource.type} variant="secondary" className="ml-2" />
                  </div>
                  {resource.url && (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Learn More →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DataCard>
    </div>
  );
};
