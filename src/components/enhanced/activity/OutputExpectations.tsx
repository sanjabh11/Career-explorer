import React, { useState, useEffect } from 'react';
import { CircularProgress } from '../shared/CircularProgress';

interface Performance {
    metric_name: string;
    description: string;
    target_value: number;
    unit: string;
    importance: number;
    current_value?: number;
    historical_data: Array<{
        period: string;
        value: number;
    }>;
    benchmarks: {
        industry_average: number;
        top_performers: number;
    };
}

interface OutputExpectationsProps {
    roleId: string;
}

export const OutputExpectations: React.FC<OutputExpectationsProps> = ({ roleId }) => {
    const [metrics, setMetrics] = useState<Performance[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMetric, setSelectedMetric] = useState<Performance | null>(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await fetch(`/api/v2/activity-integration/performance-metrics/${roleId}`);
                if (!response.ok) throw new Error('Failed to fetch performance metrics');
                const data = await response.json();
                setMetrics(data);
                setError(null);
            } catch (err) {
                setError('Failed to load performance metrics');
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, [roleId]);

    const calculateProgress = (current: number, target: number) => {
        return (current / target) * 100;
    };

    if (loading) {
        return <CircularProgress size="lg" value={0} maxValue={100} label="Loading..." />;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Performance Metrics & Expectations</h2>

            <div className="grid grid-cols-2 gap-4">
                <div className="border rounded p-3">
                    <h3 className="font-semibold mb-3">Key Performance Indicators</h3>
                    <div className="space-y-2">
                        {metrics.map((metric) => (
                            <div
                                key={metric.metric_name}
                                className={`p-2 rounded cursor-pointer transition-colors ${
                                    selectedMetric?.metric_name === metric.metric_name
                                        ? 'bg-blue-100'
                                        : 'hover:bg-gray-100'
                                }`}
                                onClick={() => setSelectedMetric(metric)}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">{metric.metric_name}</span>
                                    <div className="flex items-center space-x-2">
                                        {metric.current_value && (
                                            <CircularProgress
                                                value={calculateProgress(
                                                    metric.current_value,
                                                    metric.target_value
                                                )}
                                                maxValue={100}
                                                size="sm"
                                                label="Progress"
                                            />
                                        )}
                                        <CircularProgress
                                            value={metric.importance * 10}
                                            maxValue={100}
                                            size="sm"
                                            label="Importance"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {selectedMetric && (
                    <div className="border rounded p-3">
                        <h3 className="font-semibold mb-3">Metric Details</h3>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium">Description</h4>
                                <p className="text-gray-700">{selectedMetric.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium">Target</h4>
                                    <div className="text-xl font-bold">
                                        {selectedMetric.target_value} {selectedMetric.unit}
                                    </div>
                                </div>
                                {selectedMetric.current_value && (
                                    <div>
                                        <h4 className="font-medium">Current</h4>
                                        <div className="text-xl font-bold">
                                            {selectedMetric.current_value} {selectedMetric.unit}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <h4 className="font-medium mb-2">Industry Benchmarks</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span>Industry Average</span>
                                        <div className="font-medium">
                                            {selectedMetric.benchmarks.industry_average}{' '}
                                            {selectedMetric.unit}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Top Performers</span>
                                        <div className="font-medium">
                                            {selectedMetric.benchmarks.top_performers} {selectedMetric.unit}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium mb-2">Historical Performance</h4>
                                <div className="space-y-1">
                                    {selectedMetric.historical_data.map((data) => (
                                        <div
                                            key={data.period}
                                            className="flex justify-between items-center"
                                        >
                                            <span className="text-sm">{data.period}</span>
                                            <span>
                                                {data.value} {selectedMetric.unit}
                                            </span>
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
