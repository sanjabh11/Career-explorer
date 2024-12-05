import React, { useState, useEffect } from 'react';
import { CircularProgress } from '../../../components/common/Progress';
import { Card } from '../../../components/common/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

interface WorkEnvironmentProps {
    roleId: number;
    userId: number;
}

interface Recommendation {
    category: string;
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
}

interface CompatibilityData {
    overall_compatibility: number;
    breakdown: {
        physical: number;
        environmental: number;
        stress: number;
        safety: number;
        flexibility: number;
    };
    recommendations: Recommendation[];
}

const WorkEnvironmentAnalysis: React.FC<WorkEnvironmentProps> = ({ roleId, userId }) => {
    const [loading, setLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [compatibilityData, setCompatibilityData] = useState<CompatibilityData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`/api/v2/work-environment/compatibility/${userId}/${roleId}`);
                if (!response.ok) throw new Error('Failed to fetch compatibility data');
                const data = await response.json();
                setCompatibilityData(data);
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

    if (!compatibilityData) {
        return (
            <Card className="p-4 m-4">
                <p>No compatibility data available.</p>
            </Card>
        );
    }

    const chartData = Object.entries(compatibilityData.breakdown).map(([key, value]) => ({
        factor: key.charAt(0).toUpperCase() + key.slice(1),
        score: value * 100
    }));

    return (
        <div className="space-y-6">
            <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Work Environment Compatibility</h2>
                <div className="flex items-center justify-between mb-6">
                    <div className="text-center">
                        <CircularProgress 
                            value={compatibilityData.overall_compatibility * 100}
                            size="lg"
                        />
                        <p className="mt-2 text-sm text-gray-600">Overall Compatibility</p>
                    </div>
                    <div className="flex-1 ml-8">
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="factor" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="score" fill="#4F46E5" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </Card>

            {compatibilityData.recommendations.length > 0 && (
                <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Recommendations</h3>
                    <div className="space-y-4">
                        {compatibilityData.recommendations.map((rec, index) => (
                            <div 
                                key={index}
                                className={`p-4 rounded-lg ${
                                    rec.priority === 'high' ? 'bg-red-50' :
                                    rec.priority === 'medium' ? 'bg-yellow-50' :
                                    'bg-green-50'
                                }`}
                            >
                                <div className="flex items-start">
                                    <div className="flex-1">
                                        <h4 className="font-medium capitalize">{rec.category}</h4>
                                        <p className="text-gray-600 mt-1">{rec.suggestion}</p>
                                    </div>
                                    <span className={`text-sm px-2 py-1 rounded ${
                                        rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-green-100 text-green-800'
                                    }`}>
                                        {rec.priority}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
};

export default WorkEnvironmentAnalysis;
