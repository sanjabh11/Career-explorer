import React, { useState, useEffect } from 'react';
import { CircularProgress } from '../shared/CircularProgress';

interface TaskAutomation {
    task_name: string;
    description: string;
    automation_probability: number;
    timeline: string;
    impact_level: number;
    required_adaptations: Array<{
        skill: string;
        importance: number;
        development_time: string;
    }>;
    technology_factors: Array<{
        technology: string;
        impact: number;
        maturity: number;
        adoption_rate: number;
    }>;
}

interface AutomationRiskAnalysisProps {
    roleId: string;
}

export const AutomationRiskAnalysis: React.FC<AutomationRiskAnalysisProps> = ({ roleId }) => {
    const [tasks, setTasks] = useState<TaskAutomation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTask, setSelectedTask] = useState<TaskAutomation | null>(null);
    const [filterThreshold, setFilterThreshold] = useState<number>(0);

    useEffect(() => {
        const fetchAutomationData = async () => {
            try {
                const response = await fetch(`/api/v2/automation-analysis/tasks/${roleId}`);
                if (!response.ok) throw new Error('Failed to fetch automation data');
                const data = await response.json();
                setTasks(data);
                setError(null);
            } catch (err) {
                setError('Failed to load automation data');
            } finally {
                setLoading(false);
            }
        };

        fetchAutomationData();
    }, [roleId]);

    const filteredTasks = tasks.filter(
        (task) => task.automation_probability * 100 >= filterThreshold
    );

    if (loading) {
        return <CircularProgress size="lg" value={0} maxValue={100} label="Loading..." />;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Automation Risk Analysis</h2>
                <div className="flex items-center space-x-2">
                    <span className="text-sm">Risk Threshold:</span>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={filterThreshold}
                        onChange={(e) => setFilterThreshold(Number(e.target.value))}
                        className="w-32"
                    />
                    <span className="text-sm">{filterThreshold}%</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="border rounded p-3">
                    <h3 className="font-semibold mb-3">Tasks at Risk</h3>
                    <div className="space-y-2">
                        {filteredTasks.map((task) => (
                            <div
                                key={task.task_name}
                                className={`p-2 rounded cursor-pointer transition-colors ${
                                    selectedTask?.task_name === task.task_name
                                        ? 'bg-blue-100'
                                        : 'hover:bg-gray-100'
                                }`}
                                onClick={() => setSelectedTask(task)}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">{task.task_name}</span>
                                    <div className="flex space-x-2">
                                        <CircularProgress
                                            value={task.automation_probability * 100}
                                            maxValue={100}
                                            size="sm"
                                            label="Risk"
                                        />
                                        <CircularProgress
                                            value={task.impact_level * 10}
                                            maxValue={100}
                                            size="sm"
                                            label="Impact"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {selectedTask && (
                    <div className="border rounded p-3">
                        <h3 className="font-semibold mb-3">Task Details</h3>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium">Description</h4>
                                <p className="text-gray-700">{selectedTask.description}</p>
                            </div>

                            <div>
                                <h4 className="font-medium">Timeline</h4>
                                <p className="text-gray-700">{selectedTask.timeline}</p>
                            </div>

                            <div>
                                <h4 className="font-medium mb-2">Required Adaptations</h4>
                                <div className="space-y-2">
                                    {selectedTask.required_adaptations.map((adaptation) => (
                                        <div
                                            key={adaptation.skill}
                                            className="flex justify-between items-center"
                                        >
                                            <div>
                                                <div className="font-medium">{adaptation.skill}</div>
                                                <div className="text-sm text-gray-600">
                                                    {adaptation.development_time}
                                                </div>
                                            </div>
                                            <CircularProgress
                                                value={adaptation.importance * 10}
                                                maxValue={100}
                                                size="sm"
                                                label="Importance"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium mb-2">Technology Factors</h4>
                                <div className="space-y-2">
                                    {selectedTask.technology_factors.map((tech) => (
                                        <div key={tech.technology} className="border rounded p-2">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-medium">{tech.technology}</span>
                                                <CircularProgress
                                                    value={tech.impact * 10}
                                                    maxValue={100}
                                                    size="sm"
                                                    label="Impact"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <span className="text-sm text-gray-600">
                                                        Maturity:
                                                    </span>
                                                    <CircularProgress
                                                        value={tech.maturity * 100}
                                                        maxValue={100}
                                                        size="sm"
                                                        label="Maturity"
                                                    />
                                                </div>
                                                <div>
                                                    <span className="text-sm text-gray-600">
                                                        Adoption:
                                                    </span>
                                                    <CircularProgress
                                                        value={tech.adoption_rate * 100}
                                                        maxValue={100}
                                                        size="sm"
                                                        label="Adoption"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
