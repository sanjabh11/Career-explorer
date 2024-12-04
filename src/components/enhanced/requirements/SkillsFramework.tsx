import React, { useState, useEffect } from 'react';
import { DataCard } from '../shared/DataCard';
import { Badge } from '../shared/Badge';
import { ProgressBar } from '../shared/ProgressBar';

interface LearningResource {
  type: string;
  name: string;
  provider: string;
  url: string;
  cost: number;
  duration: number;
  rating: number;
}

interface Prerequisite {
  skillName: string;
  minimumProficiency: number;
  description: string;
}

interface Skill {
  id: number;
  skillCategory: string;
  skillName: string;
  description: string;
  proficiencyLevelRequired: number;
  importanceScore: number;
  timeToAcquire: number;
  prerequisites: Prerequisite[];
  learningResources: LearningResource[];
}

interface SkillsFrameworkProps {
  occupationId: string;
  onSkillSelect?: (skill: Skill) => void;
  selectedCategory?: string;
}

export const SkillsFramework: React.FC<SkillsFrameworkProps> = ({
  occupationId,
  onSkillSelect,
  selectedCategory
}) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeSkill, setActiveSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const url = selectedCategory
          ? `/api/v2/requirements/skills-framework/${occupationId}?category=${selectedCategory}`
          : `/api/v2/requirements/skills-framework/${occupationId}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch skills framework');
        const data = await response.json();
        setSkills(data);
        
        // Extract unique categories with proper typing
        const uniqueCategories = Array.from(
          new Set(data.map((skill: Skill) => skill.skillCategory))
        ).filter((category): category is string => typeof category === 'string');
        
        setCategories(uniqueCategories);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, [occupationId, selectedCategory]);

  const handleSkillClick = (skill: Skill) => {
    setActiveSkill(skill);
    if (onSkillSelect) {
      onSkillSelect(skill);
    }
  };

  const getProficiencyLabel = (level: number): string => {
    switch (level) {
      case 1: return 'Beginner';
      case 2: return 'Basic';
      case 3: return 'Intermediate';
      case 4: return 'Advanced';
      case 5: return 'Expert';
      default: return 'Unknown';
    }
  };

  if (loading) return <div className="animate-pulse">Loading skills framework...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Badge
            key={category}
            text={category}
            variant={selectedCategory === category ? 'primary' : 'secondary'}
            className="cursor-pointer"
            onClick={() => {
              if (selectedCategory === category) {
                // Clear filter
                window.location.href = window.location.pathname;
              } else {
                // Apply filter
                window.location.href = `${window.location.pathname}?category=${category}`;
              }
            }}
          />
        ))}
      </div>

      {/* Skills Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {skills.map((skill) => (
          <DataCard
            key={skill.id}
            className={`cursor-pointer transition-all ${
              activeSkill?.id === skill.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => handleSkillClick(skill)}
          >
            <div className="space-y-4">
              <div>
                <Badge text={skill.skillCategory} variant="secondary" />
                <h3 className="font-medium mt-2">{skill.skillName}</h3>
                <p className="text-sm text-gray-600 mt-1">{skill.description}</p>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Required Proficiency</span>
                  <span>{getProficiencyLabel(skill.proficiencyLevelRequired)}</span>
                </div>
                <ProgressBar
                  value={skill.proficiencyLevelRequired}
                  max={5}
                  color="blue"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Importance</span>
                  <span>{skill.importanceScore}%</span>
                </div>
                <ProgressBar
                  value={skill.importanceScore}
                  max={100}
                  color="green"
                />
              </div>

              <div className="text-sm text-gray-600">
                Estimated time to acquire: {skill.timeToAcquire} hours
              </div>
            </div>

            {/* Expanded View */}
            {activeSkill?.id === skill.id && (
              <div className="mt-4 pt-4 border-t space-y-4">
                {/* Prerequisites */}
                {skill.prerequisites.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Prerequisites</h4>
                    <div className="space-y-2">
                      {skill.prerequisites.map((prereq, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded">
                          <div className="font-medium">{prereq.skillName}</div>
                          <div className="text-sm text-gray-600 mb-2">
                            {prereq.description}
                          </div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Required Proficiency</span>
                            <span>
                              {getProficiencyLabel(prereq.minimumProficiency)}
                            </span>
                          </div>
                          <ProgressBar
                            value={prereq.minimumProficiency}
                            max={5}
                            color="blue"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Learning Resources */}
                {skill.learningResources.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Learning Resources</h4>
                    <div className="space-y-2">
                      {skill.learningResources.map((resource, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{resource.name}</div>
                              <div className="text-sm text-gray-600">
                                {resource.provider}
                              </div>
                            </div>
                            <Badge text={resource.type} variant="secondary" />
                          </div>
                          <div className="mt-2 text-sm text-gray-600">
                            Duration: {resource.duration} hours | 
                            Cost: ${resource.cost.toLocaleString()}
                          </div>
                          <div className="mt-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Rating</span>
                              <span>{resource.rating}/5</span>
                            </div>
                            <ProgressBar
                              value={resource.rating}
                              max={5}
                              color="yellow"
                            />
                          </div>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 text-blue-600 hover:text-blue-800 text-sm inline-block"
                          >
                            View Resource →
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DataCard>
        ))}
      </div>
    </div>
  );
};
