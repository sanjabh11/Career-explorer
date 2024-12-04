import React, { useState, useEffect } from 'react';
import { CircularProgress } from '../shared/CircularProgress';
import { Badge } from '../shared/Badge';
import { DataCard } from '../shared/DataCard';

interface Skill {
  id: number;
  name: string;
  category: string;
  description: string;
  proficiency_levels: {
    level: number;
    description: string;
    requirements: string[];
  }[];
  learning_duration: {
    level: number;
    estimated_hours: number;
  }[];
  industry_relevance: {
    industry: string;
    relevance_score: number;
  }[];
  future_outlook: {
    growth_rate: number;
    demand_prediction: string;
    emerging_applications: string[];
  };
}

interface LearningPath {
  id: number;
  name: string;
  description: string;
  difficulty_level: number;
  estimated_duration: number;
  target_role: string;
  prerequisites: {
    skill: string;
    level: number;
  }[];
  learning_objectives: string[];
}

interface ProgressData {
  current_level: number;
  target_level: number;
  progress_percentage: number;
  time_spent: number;
  completed_resources: {
    id: number;
    title: string;
    type: string;
  }[];
  assessment_results: {
    date: string;
    score: number;
    level: number;
  }[];
  milestones_achieved: {
    date: string;
    description: string;
  }[];
  next_steps: {
    action: string;
    priority: number;
  }[];
  learning_pace: number;
  strengths: string[];
  areas_for_improvement: string[];
}

interface SkillProgressionProps {
  userId: string;
  selectedSkillId?: number;
}

export const SkillProgression: React.FC<SkillProgressionProps> = ({
  userId,
  selectedSkillId
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'path' | 'progress'>('overview');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedSkillId) return;

      try {
        setLoading(true);
        
        // Fetch skill details
        const skillResponse = await fetch(`/api/v2/skill-progression/skills/${selectedSkillId}`);
        if (!skillResponse.ok) throw new Error('Failed to fetch skill details');
        const skillData = await skillResponse.json();
        setSelectedSkill(skillData);

        // Fetch learning path
        const pathResponse = await fetch(
          `/api/v2/skill-progression/learning-paths?skill_id=${selectedSkillId}`
        );
        if (!pathResponse.ok) throw new Error('Failed to fetch learning path');
        const pathData = await pathResponse.json();
        setLearningPath(pathData[0] || null);

        // Fetch progress data
        const progressResponse = await fetch(
          `/api/v2/skill-progression/progress/${userId}/${selectedSkillId}`
        );
        if (!progressResponse.ok) throw new Error('Failed to fetch progress data');
        const progressData = await progressResponse.json();
        setProgressData(progressData);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, selectedSkillId]);

  if (loading) return <div className="animate-pulse">Loading skill progression data...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!selectedSkill) return <div>Please select a skill to view progression</div>;

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b">
        {['overview', 'path', 'progress'].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 font-medium ${
              activeTab === tab
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab(tab as typeof activeTab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Skill Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <DataCard title="Skill Information">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-lg">{selectedSkill.name}</h3>
                <p className="text-gray-600">{selectedSkill.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge text={selectedSkill.category} variant="primary" />
                <Badge
                  text={`Growth: ${selectedSkill.future_outlook.growth_rate}%`}
                  variant={selectedSkill.future_outlook.growth_rate > 0 ? 'success' : 'warning'}
                />
              </div>
            </div>
          </DataCard>

          <DataCard title="Proficiency Levels">
            <div className="space-y-4">
              {selectedSkill.proficiency_levels.map((level, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">Level {level.level}</h4>
                      <p className="text-sm text-gray-600">{level.description}</p>
                    </div>
                    <Badge
                      text={`${selectedSkill.learning_duration[index]?.estimated_hours}h`}
                      variant="secondary"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {level.requirements.map((req, idx) => (
                      <Badge key={idx} text={req} variant="primary" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </DataCard>

          <DataCard title="Industry Relevance">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {selectedSkill.industry_relevance.map((industry, index) => (
                <div key={index} className="text-center">
                  <CircularProgress
                    value={industry.relevance_score}
                    maxValue={100}
                    label={industry.industry}
                    color="blue"
                  />
                </div>
              ))}
            </div>
          </DataCard>
        </div>
      )}

      {/* Learning Path */}
      {activeTab === 'path' && learningPath && (
        <div className="space-y-6">
          <DataCard title="Learning Path Overview">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-lg">{learningPath.name}</h3>
                <p className="text-gray-600">{learningPath.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Difficulty Level</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{learningPath.difficulty_level}/10</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${(learningPath.difficulty_level / 10) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Estimated Duration</span>
                  <div className="font-medium">
                    {learningPath.estimated_duration} hours
                  </div>
                </div>
              </div>
            </div>
          </DataCard>

          <DataCard title="Prerequisites">
            <div className="space-y-4">
              {learningPath.prerequisites.map((prereq, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <span>{prereq.skill}</span>
                  <Badge text={`Level ${prereq.level}`} variant="secondary" />
                </div>
              ))}
            </div>
          </DataCard>

          <DataCard title="Learning Objectives">
            <div className="space-y-2">
              {learningPath.learning_objectives.map((objective, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-2 p-2 hover:bg-gray-50"
                >
                  <span className="text-blue-500">•</span>
                  <span>{objective}</span>
                </div>
              ))}
            </div>
          </DataCard>
        </div>
      )}

      {/* Progress Tracking */}
      {activeTab === 'progress' && progressData && (
        <div className="space-y-6">
          <DataCard title="Progress Overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <CircularProgress
                  value={progressData.progress_percentage}
                  maxValue={100}
                  label="Overall Progress"
                  color="blue"
                />
              </div>
              <div className="text-center">
                <CircularProgress
                  value={progressData.current_level}
                  maxValue={progressData.target_level}
                  label="Current Level"
                  color="green"
                />
              </div>
              <div className="text-center">
                <CircularProgress
                  value={progressData.learning_pace}
                  maxValue={10}
                  label="Learning Pace"
                  color="purple"
                />
              </div>
            </div>
          </DataCard>

          <DataCard title="Recent Achievements">
            <div className="space-y-4">
              {progressData.milestones_achieved.map((milestone, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium">{milestone.description}</div>
                    <div className="text-sm text-gray-500">{milestone.date}</div>
                  </div>
                  <Badge text="Completed" variant="success" />
                </div>
              ))}
            </div>
          </DataCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DataCard title="Strengths">
              <div className="space-y-2">
                {progressData.strengths.map((strength, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-50"
                  >
                    <span className="text-green-500">✓</span>
                    <span>{strength}</span>
                  </div>
                ))}
              </div>
            </DataCard>

            <DataCard title="Areas for Improvement">
              <div className="space-y-2">
                {progressData.areas_for_improvement.map((area, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-50"
                  >
                    <span className="text-yellow-500">!</span>
                    <span>{area}</span>
                  </div>
                ))}
              </div>
            </DataCard>
          </div>

          <DataCard title="Next Steps">
            <div className="space-y-4">
              {progressData.next_steps
                .sort((a, b) => b.priority - a.priority)
                .map((step, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <span>{step.action}</span>
                    <Badge
                      text={`Priority ${step.priority}`}
                      variant={
                        step.priority > 7
                          ? 'danger'
                          : step.priority > 4
                          ? 'warning'
                          : 'primary'
                      }
                    />
                  </div>
                ))}
            </div>
          </DataCard>
        </div>
      )}
    </div>
  );
};
