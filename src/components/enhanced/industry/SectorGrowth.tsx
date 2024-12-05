import React, { useState, useEffect } from 'react';
import { CircularProgress } from '../shared/CircularProgress';
import { Bar } from 'react-chartjs-2';

interface GrowthData {
    industry_sector: string;
    region: string;
    time_period: string;
    growth_rate: number;
    job_openings: number;
    salary_trends: {
        median: number;
        percentiles: {
            [key: string]: number;
        };
        growth_rate: number;
    };
    growth_factors: Array<{
        factor: string;
        impact: number;
        description: string;
    }>;
    risk_factors: Array<{
        factor: string;
        risk_level: number;
        mitigation: string;
    }>;
    opportunity_score: number;
    data_quality: number;
}

interface SectorGrowthProps {
    industryId: string;
    region?: string;
}

export const SectorGrowth: React.FC<SectorGrowthProps> = ({ industryId, region }) => {
    const [growthData, setGrowthData] = useState<GrowthData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>('2023-2025');

    useEffect(() => {
        const fetchGrowthData = async () => {
            try {
                const response = await fetch(
                    `/api/v2/industry-analysis/growth?industry_sector=${industryId}${
                        region ? `&region=${region}` : ''
                    }`
                );
                if (!response.ok) throw new Error('Failed to fetch growth data');
                const data = await response.json();
                setGrowthData(data);
                setError(null);
            } catch (err) {
                setError('Failed to load growth data');
            } finally {
                setLoading(false);
            }
        };

        fetchGrowthData();
    }, [industryId, region]);

    const salaryChartData = {
        labels: Object.keys(growthData?.salary_trends.percentiles || {}),
        datasets: [
            {
                label: 'Salary Distribution',
                data: Object.values(growthData?.salary_trends.percentiles || {}),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Salary Distribution by Percentile',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Salary (USD)',
                },
            },
        },
    };

    if (loading) {
        return <CircularProgress size="lg" value={0} maxValue={100} label="Loading..." />;
    }

    if (error || !growthData) {
        return <div className="text-red-500">{error || 'No data available'}</div>;
    }

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <div className="mb-6">
                <h2 className="text-xl font-bold">Sector Growth Analysis</h2>
                <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="p-3 border rounded">
                        <h3 className="font-semibold mb-2">Growth Metrics</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span>Growth Rate</span>
                                <CircularProgress
                                    value={growthData.growth_rate}
                                    maxValue={100}
                                    size="md"
                                    label="%"
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Opportunity Score</span>
                                <CircularProgress
                                    value={growthData.opportunity_score * 10}
                                    maxValue={100}
                                    size="md"
                                    label="Score"
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Data Quality</span>
                                <CircularProgress
                                    value={growthData.data_quality * 100}
                                    maxValue={100}
                                    size="md"
                                    label="Quality"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-3 border rounded">
                        <h3 className="font-semibold mb-2">Growth Factors</h3>
                        <div className="space-y-2">
                            {growthData.growth_factors.map((factor) => (
                                <div
                                    key={factor.factor}
                                    className="flex justify-between items-center"
                                >
                                    <span className="text-sm">{factor.factor}</span>
                                    <CircularProgress
                                        value={factor.impact * 10}
                                        maxValue={100}
                                        size="sm"
                                        label="Impact"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-3 border rounded">
                        <h3 className="font-semibold mb-2">Risk Factors</h3>
                        <div className="space-y-2">
                            {growthData.risk_factors.map((risk) => (
                                <div
                                    key={risk.factor}
                                    className="flex justify-between items-center"
                                >
                                    <span className="text-sm">{risk.factor}</span>
                                    <CircularProgress
                                        value={risk.risk_level * 10}
                                        maxValue={100}
                                        size="sm"
                                        label="Risk"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Salary Trends</h3>
                <div className="h-64">
                    <Bar data={salaryChartData} options={chartOptions} />
                </div>
                <div className="mt-4 text-sm text-gray-600">
                    <div className="flex justify-between">
                        <span>Median Salary: ${growthData.salary_trends.median.toLocaleString()}</span>
                        <span>
                            Salary Growth Rate: {growthData.salary_trends.growth_rate.toFixed(1)}%
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Job Market Indicators</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border rounded">
                        <h4 className="font-medium mb-2">Current Job Openings</h4>
                        <div className="text-2xl font-bold">
                            {growthData.job_openings.toLocaleString()}
                        </div>
                    </div>
                    <div className="p-3 border rounded">
                        <h4 className="font-medium mb-2">Region</h4>
                        <div className="text-lg">{growthData.region}</div>
                        <div className="text-sm text-gray-600">Time Period: {growthData.time_period}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
