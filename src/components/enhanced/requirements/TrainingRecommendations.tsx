import React, { useState, useEffect } from 'react';
import { DataCard } from '../shared/DataCard';
import { Badge } from '../shared/Badge';
import { ProgressBar } from '../shared/ProgressBar';

interface LearningOutcome {
  description: string;
  category: string;
}

interface Training {
  id: number;
  skillId: number;
  trainingType: string;
  provider: string;
  courseName: string;
  description: string;
  duration: number;
  cost: number;
  difficultyLevel: string;
  prerequisites: string[];
  learningOutcomes: LearningOutcome[];
  rating: number;
  reviewCount: number;
  url: string;
}

interface TrainingFilters {
  skillId?: number;
  trainingType?: string;
  maxCost?: number;
  difficultyLevel?: string;
  minRating?: number;
}

interface TrainingRecommendationsProps {
  occupationId: string;
  initialFilters?: TrainingFilters;
  onTrainingSelect?: (training: Training) => void;
}

export const TrainingRecommendations: React.FC<TrainingRecommendationsProps> = ({
  occupationId,
  initialFilters,
  onTrainingSelect
}) => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [filters, setFilters] = useState<TrainingFilters>(initialFilters || {});
  const [activeTraining, setActiveTraining] = useState<Training | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (filters.skillId) queryParams.append('skill_id', filters.skillId.toString());
        if (filters.trainingType) queryParams.append('training_type', filters.trainingType);
        if (filters.maxCost) queryParams.append('max_cost', filters.maxCost.toString());
        if (filters.difficultyLevel) queryParams.append('difficulty_level', filters.difficultyLevel);
        if (filters.minRating) queryParams.append('min_rating', filters.minRating.toString());

        const response = await fetch(
          `/api/v2/requirements/training/${occupationId}?${queryParams.toString()}`
        );
        if (!response.ok) throw new Error('Failed to fetch training recommendations');
        const data = await response.json();
        setTrainings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTrainings();
  }, [occupationId, filters]);

  const handleTrainingClick = (training: Training) => {
    setActiveTraining(training);
    if (onTrainingSelect) {
      onTrainingSelect(training);
    }
  };

  const getDifficultyColor = (level: string): string => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'green';
      case 'intermediate': return 'blue';
      case 'advanced': return 'yellow';
      case 'expert': return 'red';
      default: return 'gray';
    }
  };

  if (loading) return <div className="animate-pulse">Loading training recommendations...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        <h3 className="font-medium">Filter Training</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Cost
            </label>
            <input
              type="number"
              value={filters.maxCost || ''}
              onChange={(e) => setFilters({
                ...filters,
                maxCost: e.target.value ? Number(e.target.value) : undefined
              })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter maximum cost"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty Level
            </label>
            <select
              value={filters.difficultyLevel || ''}
              onChange={(e) => setFilters({
                ...filters,
                difficultyLevel: e.target.value || undefined
              })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Rating
            </label>
            <select
              value={filters.minRating || ''}
              onChange={(e) => setFilters({
                ...filters,
                minRating: e.target.value ? Number(e.target.value) : undefined
              })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Any Rating</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4">4+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
              <option value="3">3+ Stars</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Training Type
            </label>
            <select
              value={filters.trainingType || ''}
              onChange={(e) => setFilters({
                ...filters,
                trainingType: e.target.value || undefined
              })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="Online Course">Online Course</option>
              <option value="Workshop">Workshop</option>
              <option value="Certification">Certification</option>
              <option value="Bootcamp">Bootcamp</option>
            </select>
          </div>
        </div>
      </div>

      {/* Training Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {trainings.map((training) => (
          <DataCard
            key={training.id}
            className={`cursor-pointer transition-all ${
              activeTraining?.id === training.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => handleTrainingClick(training)}
          >
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-start">
                  <Badge
                    text={training.trainingType}
                    variant="primary"
                  />
                  <Badge
                    text={training.difficultyLevel}
                    variant={getDifficultyColor(training.difficultyLevel) as any}
                  />
                </div>
                <h3 className="font-medium mt-2">{training.courseName}</h3>
                <p className="text-sm text-gray-600">{training.provider}</p>
              </div>

              <p className="text-sm">{training.description}</p>

              <div className="flex justify-between text-sm">
                <span>Duration: {training.duration} hours</span>
                <span>Cost: ${training.cost.toLocaleString()}</span>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Rating ({training.reviewCount} reviews)</span>
                  <span>{training.rating}/5</span>
                </div>
                <ProgressBar
                  value={training.rating}
                  max={5}
                  color="yellow"
                />
              </div>
            </div>

            {/* Expanded View */}
            {activeTraining?.id === training.id && (
              <div className="mt-4 pt-4 border-t space-y-4">
                {/* Prerequisites */}
                {training.prerequisites.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Prerequisites</h4>
                    <div className="flex flex-wrap gap-2">
                      {training.prerequisites.map((prereq, index) => (
                        <Badge
                          key={index}
                          text={prereq}
                          variant="secondary"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Learning Outcomes */}
                {training.learningOutcomes.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Learning Outcomes</h4>
                    <div className="space-y-2">
                      {training.learningOutcomes.map((outcome, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2"
                        >
                          <Badge
                            text={outcome.category}
                            variant="secondary"
                            className="mt-0.5"
                          />
                          <p className="text-sm">{outcome.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <a
                  href={training.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mt-2"
                >
                  Enroll Now →
                </a>
              </div>
            )}
          </DataCard>
        ))}
      </div>
    </div>
  );
};
