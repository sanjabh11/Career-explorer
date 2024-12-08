import React, { useState, useEffect } from 'react';
import { CircularProgress } from '../../../components/common/Progress';
import { Card } from '../../../components/common/Card';
import { DataCard } from '../../../components/common/DataCard';
import { Badge } from '../../../components/common/Badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

interface SkillsDevelopmentProps {
    roleId: number;
    userId: number;
}

interface Skill {
    id: number;
    name: string;
    category: string;
    current_level: number;
    required_level: number;
    learning_resources: any[];
}

interface LearningPath {
    skill_id: number;
    name: string;
    current_level: number;
    target_level: number;
    prerequisites: Array<{
        skill_id: number;
        name: string;
        estimated_time: number;
    }>;
    learning_resources: any[];
    estimated_time: number;
    milestones: Array<{
        level: number;
        description: string;
        assessment_criteria: string[];
    }>;
}

const SkillsDevelopment: React.FC<SkillsDevelopmentProps> = ({ roleId, userId }) => {
    const [loading, setLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [learningPath, setLearningPath] = useState<LearningPath[]>([]);
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch required skills
                const skillsResponse = await fetch(`/api/v2/skills/${roleId}`);
                if (!skillsResponse.ok) throw new Error('Failed to fetch skills');
                const skillsData = await skillsResponse.json();
                setSkills(skillsData);

                // Fetch learning path
                const pathResponse = await fetch(`/api/v2/skills/learning-path/${userId}/${roleId}`);
                if (!pathResponse.ok) throw new Error('Failed to fetch learning path');
                const pathData = await pathResponse.json();
                setLearningPath(pathData.learning_path);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [roleId, userId]);

    useEffect(() => {
        if (loading) {
            const interval = setInterval(() => {
                setLoadingProgress((prev) => (prev >= 100 ? 0 : prev + 10));
            }, 300);
            return () => clearInterval(interval);
        }
        setLoadingProgress(0);
    }, [loading]);

    if (loading) {
        return <div className="flex justify-center p-8"><CircularProgress value={loadingProgress} /></div>;
    }

    if (error) {
        return (
            <Card className="p-4 m-4 bg-red-50">
                <p className="text-red-600">Error: {error}</p>
            </Card>
        );
    }

    const skillsChartData = skills.map(skill => ({
        name: skill.name,
        current: skill.current_level * 20,
        required: skill.required_level * 20,
    }));

    return (
        <div className="space-y-6">
            {/* Skills Overview */}
            <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Skills Overview</h2>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={skillsChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="current" name="Current Level" fill="#4F46E5" />
                            <Bar dataKey="required" name="Required Level" fill="#E5E7EB" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* Learning Path */}
            <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Learning Path</h2>
                <div className="space-y-4">
                    {learningPath.map((pathItem, index) => (
                        <div 
                            key={pathItem.skill_id}
                            className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                            onClick={() => setSelectedSkill(skills.find(s => s.id === pathItem.skill_id) || null)}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-semibold">{pathItem.name}</h3>
                                <span className="text-sm text-gray-500">
                                    {pathItem.estimated_time}h estimated
                                </span>
                            </div>
                            <div className="flex items-center space-x-4 mb-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-indigo-600 h-2 rounded-full"
                                        style={{ width: `${(pathItem.current_level / pathItem.target_level) * 100}%` }}
                                    />
                                </div>
                                <span className="text-sm text-gray-600">
                                    Level {pathItem.current_level} → {pathItem.target_level}
                                </span>
                            </div>
                            {pathItem.prerequisites.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-sm text-gray-600">Prerequisites:</p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {pathItem.prerequisites.map(prereq => (
                                            <span 
                                                key={prereq.skill_id}
                                                className="px-2 py-1 bg-gray-100 rounded-full text-xs"
                                            >
                                                {prereq.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </Card>

            {/* Selected Skill Details */}
            {selectedSkill && (
                <Card className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-2xl font-bold">{selectedSkill.name}</h2>
                        <button 
                            onClick={() => setSelectedSkill(null)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            Close
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold mb-2">Learning Resources</h3>
                            <div className="space-y-2">
                                {selectedSkill.learning_resources.map((resource, index) => (
                                    <a
                                        key={index}
                                        href={resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block p-2 bg-gray-50 rounded hover:bg-gray-100"
                                    >
                                        {resource.title}
                                    </a>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Current Progress</h3>
                            <div className="flex items-center space-x-4">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-indigo-600 h-2 rounded-full"
                                        style={{ width: `${(selectedSkill.current_level / selectedSkill.required_level) * 100}%` }}
                                    />
                                </div>
                                <span className="text-sm text-gray-600">
                                    Level {selectedSkill.current_level} / {selectedSkill.required_level}
                                </span>
                            </div>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default SkillsDevelopment;
