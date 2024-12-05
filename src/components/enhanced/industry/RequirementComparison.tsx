import React, { useState, useEffect } from 'react';
import { CircularProgress } from '../shared/CircularProgress';

interface Requirement {
    requirement_type: string;
    requirement_name: string;
    importance_score: number;
    frequency_score: number;
    future_relevance: number;
    requirement_details: {
        description: string;
        prerequisites?: string[];
        timeline?: string;
    };
    alternatives: Array<{
        name: string;
        equivalency_score: number;
    }>;
}

interface ComparisonData {
    source_industry: string;
    target_industry: string;
    similarity_score: number;
    transition_difficulty: number;
    skill_gaps: Array<{
        skill: string;
        importance: number;
        difficulty: number;
    }>;
}

interface RequirementComparisonProps {
    sourceIndustry: string;
    targetIndustry: string;
}

export const RequirementComparison: React.FC<RequirementComparisonProps> = ({
    sourceIndustry,
    targetIndustry,
}) => {
    const [comparison, setComparison] = useState<ComparisonData | null>(null);
    const [requirements, setRequirements] = useState<{
        source: Requirement[];
        target: Requirement[];
    }>({ source: [], target: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [comparisonRes, sourceReqs, targetReqs] = await Promise.all([
                    fetch(`/api/v2/industry-analysis/requirements/comparison?source_industry=${sourceIndustry}&target_industry=${targetIndustry}`),
                    fetch(`/api/v2/industry-analysis/requirements?industry_sector=${sourceIndustry}`),
                    fetch(`/api/v2/industry-analysis/requirements?industry_sector=${targetIndustry}`),
                ]);

                if (!comparisonRes.ok || !sourceReqs.ok || !targetReqs.ok) {
                    throw new Error('Failed to fetch data');
                }

                const [compData, sourceData, targetData] = await Promise.all([
                    comparisonRes.json(),
                    sourceReqs.json(),
                    targetReqs.json(),
                ]);

                setComparison(compData);
                setRequirements({
                    source: sourceData,
                    target: targetData,
                });
                setError(null);
            } catch (err) {
                setError('Failed to load comparison data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [sourceIndustry, targetIndustry]);

    if (loading) {
        return <CircularProgress size="lg" value={0} maxValue={100} label="Loading..." />;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <div className="mb-6">
                <h2 className="text-xl font-bold mb-4">Industry Requirements Comparison</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border rounded">
                        <h3 className="font-semibold mb-2">{sourceIndustry}</h3>
                        {requirements.source.map((req) => (
                            <RequirementCard key={req.requirement_name} requirement={req} />
                        ))}
                    </div>
                    <div className="p-3 border rounded">
                        <h3 className="font-semibold mb-2">{targetIndustry}</h3>
                        {requirements.target.map((req) => (
                            <RequirementCard key={req.requirement_name} requirement={req} />
                        ))}
                    </div>
                </div>
            </div>

            {comparison && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Transition Analysis</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-4">
                            <CircularProgress
                                value={comparison.similarity_score * 100}
                                maxValue={100}
                                size="md"
                                label="Similarity"
                            />
                            <CircularProgress
                                value={(10 - comparison.transition_difficulty) * 10}
                                maxValue={100}
                                size="md"
                                label="Ease of Transition"
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <h4 className="font-semibold mb-2">Skill Gaps to Address</h4>
                        <div className="space-y-2">
                            {comparison.skill_gaps.map((gap) => (
                                <div
                                    key={gap.skill}
                                    className="p-2 border rounded flex justify-between items-center"
                                >
                                    <span>{gap.skill}</span>
                                    <div className="flex items-center space-x-4">
                                        <CircularProgress
                                            value={gap.importance * 10}
                                            maxValue={100}
                                            size="sm"
                                            label="Importance"
                                        />
                                        <CircularProgress
                                            value={(10 - gap.difficulty) * 10}
                                            maxValue={100}
                                            size="sm"
                                            label="Ease"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const RequirementCard: React.FC<{ requirement: Requirement }> = ({ requirement }) => (
    <div className="mb-3 p-2 bg-gray-50 rounded">
        <div className="flex justify-between items-center mb-2">
            <span className="font-medium">{requirement.requirement_name}</span>
            <span className="text-sm text-gray-600">{requirement.requirement_type}</span>
        </div>
        <div className="flex space-x-2 mb-2">
            <CircularProgress
                value={requirement.importance_score * 10}
                maxValue={100}
                size="sm"
                label="Importance"
            />
            <CircularProgress
                value={requirement.frequency_score * 10}
                maxValue={100}
                size="sm"
                label="Frequency"
            />
            <CircularProgress
                value={requirement.future_relevance * 10}
                maxValue={100}
                size="sm"
                label="Future"
            />
        </div>
        <p className="text-sm text-gray-700">{requirement.requirement_details.description}</p>
        {requirement.alternatives.length > 0 && (
            <div className="mt-2">
                <span className="text-sm text-gray-600">Alternatives:</span>
                <div className="text-sm">
                    {requirement.alternatives.map((alt) => (
                        <div key={alt.name} className="flex justify-between">
                            <span>{alt.name}</span>
                            <span>{(alt.equivalency_score * 100).toFixed(0)}% match</span>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
);
