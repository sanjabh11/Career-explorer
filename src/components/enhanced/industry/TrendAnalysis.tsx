import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { CircularProgress } from '../shared/CircularProgress';

interface TrendData {
    industry_sector: string;
    trend_type: string;
    time_period: string;
    trend_data: {
        values: number[];
        labels: string[];
    };
    impact_score: number;
    confidence_level: number;
}

interface TrendAnalysisProps {
    industryId: string;
    timeRange?: string;
}

export const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ industryId, timeRange }) => {
    const [trends, setTrends] = useState<TrendData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTrendType, setSelectedTrendType] = useState<string>('growth');

    useEffect(() => {
        const fetchTrends = async () => {
            try {
                const response = await fetch(
                    `/api/v2/industry-analysis/trends?industry_sector=${industryId}&trend_type=${selectedTrendType}`
                );
                if (!response.ok) throw new Error('Failed to fetch trends');
                const data = await response.json();
                setTrends(data);
                setError(null);
            } catch (err) {
                setError('Failed to load trend data');
            } finally {
                setLoading(false);
            }
        };

        fetchTrends();
    }, [industryId, selectedTrendType]);

    const chartData = {
        labels: trends[0]?.trend_data.labels || [],
        datasets: trends.map((trend) => ({
            label: trend.industry_sector,
            data: trend.trend_data.values,
            fill: false,
            borderColor: getRandomColor(),
            tension: 0.1,
        })),
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: `Industry ${selectedTrendType} Trends`,
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const trend = trends[context.datasetIndex];
                        return [
                            `Value: ${context.parsed.y}`,
                            `Impact Score: ${trend.impact_score}`,
                            `Confidence: ${(trend.confidence_level * 100).toFixed(1)}%`,
                        ];
                    },
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    if (loading) {
        return <CircularProgress size="lg" value={0} maxValue={100} label="Loading..." />;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">Industry Trend Analysis</h2>
                <select
                    className="p-2 border rounded"
                    value={selectedTrendType}
                    onChange={(e) => setSelectedTrendType(e.target.value)}
                >
                    <option value="growth">Growth</option>
                    <option value="technology">Technology</option>
                    <option value="workforce">Workforce</option>
                    <option value="market">Market</option>
                </select>
            </div>

            <div className="mb-4">
                {trends.map((trend) => (
                    <div
                        key={`${trend.industry_sector}-${trend.trend_type}`}
                        className="mb-2 p-3 border rounded"
                    >
                        <div className="flex justify-between items-center">
                            <span className="font-semibold">{trend.industry_sector}</span>
                            <div className="flex items-center space-x-4">
                                <CircularProgress
                                    value={trend.impact_score * 10}
                                    maxValue={100}
                                    size="sm"
                                    label="Impact"
                                />
                                <CircularProgress
                                    value={trend.confidence_level * 100}
                                    maxValue={100}
                                    size="sm"
                                    label="Confidence"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="h-96">
                <Line data={chartData} options={chartOptions} />
            </div>
        </div>
    );
};

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
