import React, { useState, useEffect } from 'react';
import { DataCard } from '../shared/DataCard';
import { Badge } from '../shared/Badge';
import { CircularProgress } from '../shared/CircularProgress';

interface LearningResource {
  id: number;
  skill_id: number;
  title: string;
  type: string;
  provider: string;
  format: string;
  duration: number;
  difficulty_level: number;
  cost: number;
  url: string;
  rating: number;
  review_count: number;
  completion_rate: number;
  effectiveness_score: number;
  prerequisites: {
    skill: string;
    level: number;
  }[];
  learning_objectives: string[];
  content_outline: {
    section: string;
    topics: string[];
    duration: number;
  }[];
}

interface LearningResourcesProps {
  skillId: number;
  onResourceSelect?: (resource: LearningResource) => void;
}

export const LearningResources: React.FC<LearningResourcesProps> = ({
  skillId,
  onResourceSelect,
}) => {
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: '',
    format: '',
    maxDifficulty: 10,
    maxCost: 1000,
    minRating: 0,
  });
  const [sortBy, setSortBy] = useState<keyof LearningResource>('effectiveness_score');

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/v2/skill-progression/resources/${skillId}?` +
          new URLSearchParams({
            max_difficulty: filters.maxDifficulty.toString(),
            max_cost: filters.maxCost.toString(),
            format: filters.format,
            type: filters.type,
          })
        );
        if (!response.ok) throw new Error('Failed to fetch learning resources');
        const data = await response.json();
        setResources(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [skillId, filters]);

  const filteredAndSortedResources = resources
    .filter(resource => resource.rating >= filters.minRating)
    .sort((a, b) => (b[sortBy] as number) - (a[sortBy] as number));

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatCost = (cost: number): string => {
    return cost === 0 ? 'Free' : `$${cost.toFixed(2)}`;
  };

  if (loading) return <div className="animate-pulse">Loading learning resources...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <DataCard title="Filters">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resource Type
            </label>
            <select
              className="w-full border-gray-300 rounded-md shadow-sm"
              value={filters.type}
              onChange={e => setFilters(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="">All Types</option>
              <option value="course">Course</option>
              <option value="tutorial">Tutorial</option>
              <option value="workshop">Workshop</option>
              <option value="book">Book</option>
              <option value="video">Video</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Format
            </label>
            <select
              className="w-full border-gray-300 rounded-md shadow-sm"
              value={filters.format}
              onChange={e => setFilters(prev => ({ ...prev, format: e.target.value }))}
            >
              <option value="">All Formats</option>
              <option value="video">Video</option>
              <option value="text">Text</option>
              <option value="interactive">Interactive</option>
              <option value="live">Live</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              className="w-full border-gray-300 rounded-md shadow-sm"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as keyof LearningResource)}
            >
              <option value="effectiveness_score">Effectiveness</option>
              <option value="rating">Rating</option>
              <option value="completion_rate">Completion Rate</option>
              <option value="cost">Cost</option>
              <option value="duration">Duration</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Difficulty (1-10)
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={filters.maxDifficulty}
              onChange={e => setFilters(prev => ({ ...prev, maxDifficulty: parseInt(e.target.value) }))}
              className="w-full"
            />
            <div className="text-sm text-gray-600 mt-1">
              Level {filters.maxDifficulty} or below
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Cost ($)
            </label>
            <input
              type="number"
              min="0"
              step="10"
              value={filters.maxCost}
              onChange={e => setFilters(prev => ({ ...prev, maxCost: parseInt(e.target.value) }))}
              className="w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Rating
            </label>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={filters.minRating}
              onChange={e => setFilters(prev => ({ ...prev, minRating: parseFloat(e.target.value) }))}
              className="w-full"
            />
            <div className="text-sm text-gray-600 mt-1">
              {filters.minRating} stars or above
            </div>
          </div>
        </div>
      </DataCard>

      {/* Resources List */}
      <div className="space-y-4">
        {filteredAndSortedResources.map(resource => (
          <DataCard key={resource.id}>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium">{resource.title}</h3>
                  <p className="text-sm text-gray-600">by {resource.provider}</p>
                </div>
                <div className="flex space-x-2">
                  <Badge text={resource.type} variant="primary" />
                  <Badge text={resource.format} variant="secondary" />
                  <Badge
                    text={formatCost(resource.cost)}
                    variant={resource.cost === 0 ? 'success' : 'primary'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <CircularProgress
                    value={resource.effectiveness_score}
                    maxValue={10}
                    label="Effectiveness"
                    color="blue"
                  />
                </div>
                <div className="text-center">
                  <CircularProgress
                    value={resource.rating}
                    maxValue={5}
                    label="Rating"
                    color="green"
                  />
                </div>
                <div className="text-center">
                  <CircularProgress
                    value={resource.completion_rate}
                    maxValue={100}
                    label="Completion Rate"
                    color="purple"
                  />
                </div>
                <div className="text-center">
                  <CircularProgress
                    value={resource.difficulty_level}
                    maxValue={10}
                    label="Difficulty"
                    color={
                      resource.difficulty_level > 7
                        ? 'red'
                        : resource.difficulty_level > 4
                        ? 'yellow'
                        : 'green'
                    }
                  />
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Learning Objectives</h4>
                <div className="flex flex-wrap gap-2">
                  {resource.learning_objectives.map((objective, index) => (
                    <Badge key={index} text={objective} variant="primary" />
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex space-x-4 text-sm text-gray-600">
                  <span>Duration: {formatDuration(resource.duration)}</span>
                  <span>Reviews: {resource.review_count}</span>
                </div>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  onClick={() => onResourceSelect?.(resource)}
                >
                  View Details
                </button>
              </div>
            </div>
          </DataCard>
        ))}
      </div>

      {filteredAndSortedResources.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          No learning resources match your criteria. Try adjusting the filters.
        </div>
      )}
    </div>
  );
};
