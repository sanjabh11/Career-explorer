import React, { useState, useEffect } from 'react';
import { CircularProgress, Tooltip } from '../../../components/common/Progress';
import { Card } from '../../../components/common/Card';
// Temporary mock for react-query until we can resolve the dependency issue
const useQuery = (key: any, fetcher: () => Promise<any>) => {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await fetcher();
                setData(result);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    return { data, isLoading };
};

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface EducationRequirement {
    min_education_level: string;
    preferred_education_level: string;
    required_majors: string[];
    alternative_paths: Array<{
        path: string;
        duration: string;
        cost: string;
    }>;
    continuing_education: {
        type: string;
        frequency: string;
        requirements: string[];
    };
    experience_substitution: {
        years: number;
        type: string;
        details: string;
    };
    importance_score: number;
}

interface Certification {
    name: string;
    provider: string;
    recognition_score: number;
    estimated_time: number;
    cost_range: {
        min: number;
        max: number;
    };
}

interface EducationMetrics {
    path_completion_rate: number;
    career_progression_rate: number;
    industry_demand_correlation: number;
}

interface EducationRequirementsProps {
    roleId: number;
    currentEducation?: string;
}

export const EducationRequirements: React.FC<EducationRequirementsProps> = ({
    roleId,
    currentEducation
}) => {
    const [selectedPath, setSelectedPath] = useState<string>('standard');
    const [loadingProgress, setLoadingProgress] = useState(0);

    const { data: requirements, isLoading: reqLoading } = useQuery(
        ['education-requirements', roleId],
        () => fetch(`/api/v2/education/requirements/${roleId}`).then(res => res.json())
    );

    const { data: certifications, isLoading: certLoading } = useQuery(
        ['education-certifications', roleId],
        () => fetch(`/api/v2/education/certifications/${roleId}`).then(res => res.json())
    );

    const { data: metrics, isLoading: metricsLoading } = useQuery(
        ['education-metrics', roleId],
        () => fetch(`/api/v2/education/metrics/${roleId}`).then(res => res.json())
    );

    useEffect(() => {
        if (reqLoading || certLoading || metricsLoading) {
            const interval = setInterval(() => {
                setLoadingProgress((prev) => (prev >= 100 ? 0 : prev + 10));
            }, 300);
            return () => clearInterval(interval);
        }
        setLoadingProgress(0);
    }, [reqLoading, certLoading, metricsLoading]);

    if (reqLoading || certLoading || metricsLoading) {
        return <div className="flex justify-center p-8"><CircularProgress value={loadingProgress} /></div>;
    }

    return (
        <div className="space-y-6">
            {/* Core Requirements Section */}
            <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Education Requirements</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-lg font-medium mb-3">Required Education</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-600">Minimum Required</label>
                                <p className="text-lg font-medium">{requirements.min_education_level}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Preferred Level</label>
                                <p className="text-lg font-medium">{requirements.preferred_education_level}</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium mb-3">Importance</h3>
                        <Tooltip content={`${Math.round(requirements.importance_score * 100)}% importance`}>
                            <CircularProgress 
                                value={requirements.importance_score * 100} 
                                size="lg"
                            />
                        </Tooltip>
                    </div>
                </div>
            </Card>

            {/* Required Majors Section */}
            <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Relevant Fields of Study</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {requirements.required_majors.map((major: string, index: number) => (
                        <div 
                            key={index}
                            className="bg-gray-50 rounded-lg p-3 text-center"
                        >
                            {major}
                        </div>
                    ))}
                </div>
            </Card>

            {/* Alternative Paths Section */}
            <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Education Pathways</h3>
                <div className="space-y-6">
                    <div className="flex space-x-4">
                        <button
                            className={`px-4 py-2 rounded-lg ${
                                selectedPath === 'standard' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-100'
                            }`}
                            onClick={() => setSelectedPath('standard')}
                        >
                            Standard Path
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg ${
                                selectedPath === 'alternative' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-100'
                            }`}
                            onClick={() => setSelectedPath('alternative')}
                        >
                            Alternative Paths
                        </button>
                    </div>
                    
                    {selectedPath === 'standard' ? (
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-2">Traditional Education Path</h4>
                                <p>{requirements.min_education_level} → {requirements.preferred_education_level}</p>
                                <div className="mt-4">
                                    <label className="text-sm text-gray-600">Continuing Education</label>
                                    <ul className="list-disc list-inside mt-2">
                                        {requirements.continuing_education.requirements.map((req: string, index: number) => (
                                            <li key={index}>{req}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {requirements.alternative_paths.map((path: { path: string; duration: string; cost: string }, index: number) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium mb-2">{path.path}</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm text-gray-600">Duration</label>
                                            <p>{path.duration}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-600">Estimated Cost</label>
                                            <p>{path.cost}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Card>

            {/* Certifications Section */}
            <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Recommended Certifications</h3>
                <div className="space-y-4">
                    {certifications.map((cert: Certification) => (
                        <div key={cert.name} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-medium">{cert.name}</h4>
                                    <p className="text-sm text-gray-600">{cert.provider}</p>
                                </div>
                                <Tooltip content={`${Math.round(cert.recognition_score * 100)}% industry recognition`}>
                                    <CircularProgress 
                                        value={cert.recognition_score * 100} 
                                        size="sm"
                                    />
                                </Tooltip>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-600">Estimated Time</label>
                                    <p>{cert.estimated_time} hours</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600">Cost Range</label>
                                    <p>${cert.cost_range.min} - ${cert.cost_range.max}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Metrics Section */}
            {metrics && (
                <Card className="p-6">
                    <h3 className="text-lg font-medium mb-4">Education Path Metrics</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                {
                                    name: 'Completion Rate',
                                    value: metrics.path_completion_rate * 100
                                },
                                {
                                    name: 'Career Progress',
                                    value: metrics.career_progression_rate * 100
                                },
                                {
                                    name: 'Industry Demand',
                                    value: (metrics.industry_demand_correlation + 1) * 50
                                }
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Bar dataKey="value" fill="#4F46E5" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default EducationRequirements;
