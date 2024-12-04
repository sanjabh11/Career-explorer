import React, { useState, useEffect } from 'react';
import { DataCard } from '../shared/DataCard';
import { Badge } from '../shared/Badge';
import { CircularProgress } from '../shared/CircularProgress';

interface Equipment {
  name: string;
  type: string;
  description: string;
  frequency: string;
}

interface WorkEnvironment {
  indoor_percentage: number;
  outdoor_percentage: number;
  temperature_controlled: boolean;
  noise_level: number;
  lighting_conditions: string;
  workspace_type: string;
  required_equipment: Equipment[];
  technology_tools: Array<{
    name: string;
    category: string;
    proficiency: string;
  }>;
  protective_equipment: Array<{
    name: string;
    required: boolean;
    purpose: string;
  }>;
  workspace_requirements: {
    minimum_space: string;
    special_features: string[];
    accessibility: string[];
  };
  standing_percentage: number;
  sitting_percentage: number;
  walking_percentage: number;
  lifting_requirements: {
    max_weight: number;
    frequency: string;
    special_conditions: string[];
  };
  physical_activities: Array<{
    activity: string;
    frequency: string;
    intensity: number;
  }>;
  hazard_exposure: Array<{
    type: string;
    level: number;
    mitigation: string;
  }>;
  environmental_risks: Array<{
    risk: string;
    severity: number;
    prevention: string;
  }>;
  weather_exposure: boolean;
}

interface EnvironmentAnalysisProps {
  occupationId: string;
}

export const EnvironmentAnalysis: React.FC<EnvironmentAnalysisProps> = ({
  occupationId,
}) => {
  const [environment, setEnvironment] = useState<WorkEnvironment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('physical');

  useEffect(() => {
    const fetchEnvironment = async () => {
      try {
        const response = await fetch(
          `/api/v2/work-context/environment/${occupationId}`
        );
        if (!response.ok) throw new Error('Failed to fetch environment data');
        const data = await response.json();
        setEnvironment(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchEnvironment();
  }, [occupationId]);

  if (loading) return <div className="animate-pulse">Loading environment data...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!environment) return <div>No environment data available</div>;

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex space-x-4 border-b">
        {['physical', 'equipment', 'safety', 'ergonomics'].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 font-medium ${
              activeTab === tab
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Physical Environment */}
      {activeTab === 'physical' && (
        <div className="space-y-6">
          <DataCard title="Workspace Distribution">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <CircularProgress
                  value={environment.indoor_percentage}
                  maxValue={100}
                  label="Indoor"
                  color="blue"
                />
              </div>
              <div className="text-center">
                <CircularProgress
                  value={environment.outdoor_percentage}
                  maxValue={100}
                  label="Outdoor"
                  color="green"
                />
              </div>
              <div className="text-center">
                <CircularProgress
                  value={100 - environment.indoor_percentage - environment.outdoor_percentage}
                  maxValue={100}
                  label="Mixed"
                  color="purple"
                />
              </div>
            </div>
          </DataCard>

          <DataCard title="Environmental Conditions">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Temperature Control</span>
                  <Badge
                    text={environment.temperature_controlled ? 'Controlled' : 'Variable'}
                    variant={environment.temperature_controlled ? 'success' : 'warning'}
                  />
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Noise Level</span>
                  <Badge
                    text={`${environment.noise_level}/10`}
                    variant={environment.noise_level > 7 ? 'warning' : 'primary'}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Lighting</span>
                  <Badge text={environment.lighting_conditions} variant="secondary" />
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Workspace Type</span>
                  <Badge text={environment.workspace_type} variant="primary" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Weather Exposure</span>
                  <Badge
                    text={environment.weather_exposure ? 'Yes' : 'No'}
                    variant={environment.weather_exposure ? 'warning' : 'success'}
                  />
                </div>
              </div>
            </div>
          </DataCard>
        </div>
      )}

      {/* Equipment Requirements */}
      {activeTab === 'equipment' && (
        <div className="space-y-6">
          <DataCard title="Required Equipment">
            <div className="grid gap-4 md:grid-cols-2">
              {environment.required_equipment.map((equipment, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{equipment.name}</h4>
                    <Badge text={equipment.type} variant="primary" />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{equipment.description}</p>
                  <Badge text={equipment.frequency} variant="secondary" />
                </div>
              ))}
            </div>
          </DataCard>

          <DataCard title="Technology Tools">
            <div className="grid gap-4 md:grid-cols-3">
              {environment.technology_tools.map((tool, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <h4 className="font-medium mb-2">{tool.name}</h4>
                  <div className="flex justify-between items-center">
                    <Badge text={tool.category} variant="secondary" />
                    <Badge text={tool.proficiency} variant="primary" />
                  </div>
                </div>
              ))}
            </div>
          </DataCard>
        </div>
      )}

      {/* Safety Considerations */}
      {activeTab === 'safety' && (
        <div className="space-y-6">
          <DataCard title="Hazard Analysis">
            <div className="space-y-4">
              {environment.hazard_exposure.map((hazard, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{hazard.type}</h4>
                      <p className="text-sm text-gray-600">{hazard.mitigation}</p>
                    </div>
                    <Badge
                      text={`Level ${hazard.level}/10`}
                      variant={hazard.level > 7 ? 'warning' : 'primary'}
                    />
                  </div>
                </div>
              ))}
            </div>
          </DataCard>

          <DataCard title="Protective Equipment">
            <div className="grid gap-4 md:grid-cols-2">
              {environment.protective_equipment.map((ppe, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{ppe.name}</h4>
                    <Badge
                      text={ppe.required ? 'Required' : 'Optional'}
                      variant={ppe.required ? 'warning' : 'secondary'}
                    />
                  </div>
                  <p className="text-sm text-gray-600">{ppe.purpose}</p>
                </div>
              ))}
            </div>
          </DataCard>
        </div>
      )}

      {/* Ergonomics */}
      {activeTab === 'ergonomics' && (
        <div className="space-y-6">
          <DataCard title="Physical Activity Distribution">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <CircularProgress
                  value={environment.sitting_percentage}
                  maxValue={100}
                  label="Sitting"
                  color="blue"
                />
              </div>
              <div className="text-center">
                <CircularProgress
                  value={environment.standing_percentage}
                  maxValue={100}
                  label="Standing"
                  color="green"
                />
              </div>
              <div className="text-center">
                <CircularProgress
                  value={environment.walking_percentage}
                  maxValue={100}
                  label="Walking"
                  color="purple"
                />
              </div>
            </div>
          </DataCard>

          <DataCard title="Physical Requirements">
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Lifting Requirements</h4>
                <div className="grid gap-2">
                  <div className="flex justify-between items-center">
                    <span>Maximum Weight</span>
                    <Badge
                      text={`${environment.lifting_requirements.max_weight} lbs`}
                      variant="warning"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Frequency</span>
                    <Badge
                      text={environment.lifting_requirements.frequency}
                      variant="primary"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {environment.physical_activities.map((activity, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{activity.activity}</h4>
                      <Badge text={activity.frequency} variant="secondary" />
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Intensity</span>
                        <span>{activity.intensity}/10</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${(activity.intensity / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DataCard>
        </div>
      )}
    </div>
  );
};
