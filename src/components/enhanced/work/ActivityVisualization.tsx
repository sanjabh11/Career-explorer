import React, { useState, useEffect } from 'react';
import { DataCard } from '../shared/DataCard';
import { Badge } from '../shared/Badge';
import { CircularProgress } from '../shared/CircularProgress';

interface ActivityMetrics {
  daily_tasks: Array<{
    task: string;
    percentage: number;
    description: string;
    skills_used: string[];
  }>;
  time_allocation: {
    core_activities: number;
    administrative: number;
    collaboration: number;
    development: number;
    other: number;
  };
  work_schedule: {
    typical_hours: number;
    flexibility: string;
    shifts: string[];
    peak_periods: string[];
  };
  breaks_pattern: {
    frequency: string;
    duration: string;
    type: string[];
  };
  team_interaction: number;
  client_interaction: number;
  public_interaction: number;
  remote_collaboration: number;
  task_variety: number;
  task_complexity: number;
  decision_making_freq: number;
  problem_solving_req: number;
  deadline_frequency: number;
  multitasking_req: number;
  autonomy_level: number;
  teamwork_req: number;
}

interface ActivityVisualizationProps {
  occupationId: string;
}

export const ActivityVisualization: React.FC<ActivityVisualizationProps> = ({
  occupationId,
}) => {
  const [metrics, setMetrics] = useState<ActivityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState('tasks');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch(
          `/api/v2/work-context/activities/${occupationId}`
        );
        if (!response.ok) throw new Error('Failed to fetch activity metrics');
        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [occupationId]);

  if (loading) return <div className="animate-pulse">Loading activity data...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!metrics) return <div>No activity data available</div>;

  const getMetricColor = (value: number): string => {
    if (value >= 8) return 'text-green-600';
    if (value >= 5) return 'text-blue-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* View Selection */}
      <div className="flex space-x-4 border-b">
        {['tasks', 'schedule', 'interaction', 'complexity'].map((view) => (
          <button
            key={view}
            className={`px-4 py-2 font-medium ${
              activeView === view
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveView(view)}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>

      {/* Daily Tasks View */}
      {activeView === 'tasks' && (
        <div className="space-y-6">
          <DataCard title="Task Distribution">
            <div className="space-y-4">
              {metrics.daily_tasks.map((task, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{task.task}</h4>
                      <p className="text-sm text-gray-600">{task.description}</p>
                    </div>
                    <Badge
                      text={`${task.percentage}%`}
                      variant={task.percentage > 30 ? 'primary' : 'secondary'}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {task.skills_used.map((skill, idx) => (
                      <Badge key={idx} text={skill} variant="success" />
                    ))}
                  </div>
                  <div className="mt-2">
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${task.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DataCard>

          <DataCard title="Time Allocation">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(metrics.time_allocation).map(([key, value]) => (
                <div key={key} className="text-center">
                  <CircularProgress
                    value={value}
                    maxValue={100}
                    label={key.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                    color="blue"
                  />
                </div>
              ))}
            </div>
          </DataCard>
        </div>
      )}

      {/* Schedule View */}
      {activeView === 'schedule' && (
        <div className="space-y-6">
          <DataCard title="Work Schedule">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Typical Hours</h4>
                  <div className="flex justify-between items-center">
                    <span>Hours per Week</span>
                    <Badge
                      text={`${metrics.work_schedule.typical_hours}h`}
                      variant="primary"
                    />
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Schedule Flexibility</h4>
                  <Badge text={metrics.work_schedule.flexibility} variant="secondary" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Shifts</h4>
                  <div className="flex flex-wrap gap-2">
                    {metrics.work_schedule.shifts.map((shift, index) => (
                      <Badge key={index} text={shift} variant="warning" />
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Peak Periods</h4>
                  <div className="flex flex-wrap gap-2">
                    {metrics.work_schedule.peak_periods.map((period, index) => (
                      <Badge key={index} text={period} variant="warning" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </DataCard>

          <DataCard title="Break Patterns">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Frequency</h4>
                <Badge text={metrics.breaks_pattern.frequency} variant="primary" />
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Duration</h4>
                <Badge text={metrics.breaks_pattern.duration} variant="secondary" />
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Types</h4>
                <div className="flex flex-wrap gap-2">
                  {metrics.breaks_pattern.type.map((type, index) => (
                    <Badge key={index} text={type} variant="success" />
                  ))}
                </div>
              </div>
            </div>
          </DataCard>
        </div>
      )}

      {/* Interaction View */}
      {activeView === 'interaction' && (
        <div className="space-y-6">
          <DataCard title="Interaction Patterns">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <CircularProgress
                  value={metrics.team_interaction}
                  maxValue={10}
                  label="Team Interaction"
                  color="blue"
                />
              </div>
              <div className="text-center">
                <CircularProgress
                  value={metrics.client_interaction}
                  maxValue={10}
                  label="Client Interaction"
                  color="green"
                />
              </div>
              <div className="text-center">
                <CircularProgress
                  value={metrics.public_interaction}
                  maxValue={10}
                  label="Public Interaction"
                  color="yellow"
                />
              </div>
              <div className="text-center">
                <CircularProgress
                  value={metrics.remote_collaboration}
                  maxValue={10}
                  label="Remote Collaboration"
                  color="purple"
                />
              </div>
            </div>
          </DataCard>

          <DataCard title="Teamwork Requirements">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium">Autonomy Level</span>
                <span className={getMetricColor(metrics.autonomy_level)}>
                  {metrics.autonomy_level}/10
                </span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium">Team Collaboration</span>
                <span className={getMetricColor(metrics.teamwork_req)}>
                  {metrics.teamwork_req}/10
                </span>
              </div>
            </div>
          </DataCard>
        </div>
      )}

      {/* Complexity View */}
      {activeView === 'complexity' && (
        <div className="space-y-6">
          <DataCard title="Task Complexity">
            <div className="space-y-4">
              {[
                { label: 'Task Variety', value: metrics.task_variety },
                { label: 'Task Complexity', value: metrics.task_complexity },
                { label: 'Decision Making', value: metrics.decision_making_freq },
                { label: 'Problem Solving', value: metrics.problem_solving_req },
              ].map((metric, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{metric.label}</span>
                    <span className={getMetricColor(metric.value)}>
                      {metric.value}/10
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(metric.value / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </DataCard>

          <DataCard title="Workload Management">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Deadline Frequency</h4>
                <div className="flex items-center justify-between">
                  <span>Intensity</span>
                  <span className={getMetricColor(metrics.deadline_frequency)}>
                    {metrics.deadline_frequency}/10
                  </span>
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(metrics.deadline_frequency / 10) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Multitasking Requirements</h4>
                <div className="flex items-center justify-between">
                  <span>Intensity</span>
                  <span className={getMetricColor(metrics.multitasking_req)}>
                    {metrics.multitasking_req}/10
                  </span>
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(metrics.multitasking_req / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </DataCard>
        </div>
      )}
    </div>
  );
};
