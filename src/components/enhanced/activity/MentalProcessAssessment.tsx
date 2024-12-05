import React, { useState, useEffect } from 'react';
import { CircularProgress } from '../shared/CircularProgress';

interface MentalProcess {
    process_name: string;
    description: string;
    importance: number;
    frequency: number;
    complexity: number;
    skills_required: Array<{
        skill: string;
        level: number;
    }>;
    development_time: string;
}

interface MentalProcessAssessmentProps {
    roleId: string;
}

export const MentalProcessAssessment: React.FC<MentalProcessAssessmentProps> = ({ roleId }) => {
    const [processes, setProcesses] = useState<MentalProcess[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedProcess, setSelectedProcess] = useState<MentalProcess | null>(null);

    useEffect(() => {
        const fetchProcesses = async () => {
            try {
                const response = await fetch(`/api/v2/activity-integration/mental-processes/${roleId}`);
                if (!response.ok) throw new Error('Failed to fetch mental processes');
                const data = await response.json();
                setProcesses(data);
                setError(null);
            } catch (err) {
                setError('Failed to load mental processes');
            } finally {
                setLoading(false);
            }
        };

        fetchProcesses();
    }, [roleId]);

    if (loading) {
        return <CircularProgress size="lg" value={0} maxValue={100} label="Loading..." />;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Mental Process Assessment</h2>

            <div className="grid grid-cols-2 gap-4">
                <div className="border rounded p-3">
                    <h3 className="font-semibold mb-3">Process List</h3>
                    <div className="space-y-2">
                        {processes.map((process) => (
                            <div
                                key={process.process_name}
                                className={`p-2 rounded cursor-pointer transition-colors ${
                                    selectedProcess?.process_name === process.process_name
                                        ? 'bg-blue-100'
                                        : 'hover:bg-gray-100'
                                }`}
                                onClick={() => setSelectedProcess(process)}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">{process.process_name}</span>
                                    <div className="flex space-x-2">
                                        <CircularProgress
                                            value={process.importance * 10}
                                            maxValue={100}
                                            size="sm"
                                            label="Importance"
                                        />
                                        <CircularProgress
                                            value={process.frequency * 10}
                                            maxValue={100}
                                            size="sm"
                                            label="Frequency"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {selectedProcess && (
                    <div className="border rounded p-3">
                        <h3 className="font-semibold mb-3">Process Details</h3>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium">Description</h4>
                                <p className="text-gray-700">{selectedProcess.description}</p>
                            </div>

                            <div>
                                <h4 className="font-medium mb-2">Complexity Assessment</h4>
                                <CircularProgress
                                    value={selectedProcess.complexity * 10}
                                    maxValue={100}
                                    size="md"
                                    label="Complexity"
                                />
                            </div>

                            <div>
                                <h4 className="font-medium mb-2">Required Skills</h4>
                                <div className="space-y-2">
                                    {selectedProcess.skills_required.map((skill) => (
                                        <div
                                            key={skill.skill}
                                            className="flex justify-between items-center"
                                        >
                                            <span>{skill.skill}</span>
                                            <CircularProgress
                                                value={skill.level * 10}
                                                maxValue={100}
                                                size="sm"
                                                label="Level"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium">Development Time</h4>
                                <p className="text-gray-700">{selectedProcess.development_time}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
