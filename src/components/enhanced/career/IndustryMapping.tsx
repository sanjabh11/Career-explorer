import React, { useState, useEffect } from 'react';
import { DataCard } from '../shared/DataCard';
import { Badge } from '../shared/Badge';

interface Industry {
  id: number;
  name: string;
  description: string;
  marketSize: number;
  growthRate: number;
  employmentCount: number;
  topCompanies: Array<{
    name: string;
    size: string;
    location: string;
  }>;
  keyTechnologies: string[];
  marketTrends: Array<{
    trend: string;
    impact: number;
    timeframe: string;
  }>;
  geographicalHotspots: Array<{
    region: string;
    demandLevel: number;
    avgSalary: number;
  }>;
}

interface IndustryMappingProps {
  occupationId: string;
  onIndustrySelect?: (industry: Industry) => void;
}

export const IndustryMapping: React.FC<IndustryMappingProps> = ({
  occupationId,
  onIndustrySelect
}) => {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    minGrowthRate: 0,
    minMarketSize: 0
  });

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const response = await fetch(
          `/api/v2/career-paths/sectors?growth_rate_min=${filters.minGrowthRate}&market_size_min=${filters.minMarketSize}`
        );
        if (!response.ok) throw new Error('Failed to fetch industries');
        const data = await response.json();
        setIndustries(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchIndustries();
  }, [filters, occupationId]);

  const handleIndustrySelect = (industry: Industry) => {
    setSelectedIndustry(industry);
    if (onIndustrySelect) {
      onIndustrySelect(industry);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount * 1e9); // Convert billions to actual value
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(num);
  };

  if (loading) return <div className="animate-pulse">Loading industry data...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Growth Rate (%)
          </label>
          <input
            type="number"
            value={filters.minGrowthRate}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                minGrowthRate: parseFloat(e.target.value) || 0
              }))
            }
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Market Size (B$)
          </label>
          <input
            type="number"
            value={filters.minMarketSize}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                minMarketSize: parseFloat(e.target.value) || 0
              }))
            }
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      {/* Industry Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {industries.map((industry) => (
          <DataCard
            key={industry.id}
            className={`cursor-pointer transition-all ${
              selectedIndustry?.id === industry.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => handleIndustrySelect(industry)}
          >
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-lg">{industry.name}</h3>
                <p className="text-sm text-gray-600">{industry.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  text={`${industry.growthRate}% growth`}
                  variant={industry.growthRate > 5 ? 'success' : 'warning'}
                />
                <Badge
                  text={formatCurrency(industry.marketSize)}
                  variant="primary"
                />
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium">Employment</div>
                  <div className="text-2xl font-bold">
                    {formatNumber(industry.employmentCount)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Key Technologies</div>
                  <div className="text-2xl font-bold">
                    {industry.keyTechnologies.length}
                  </div>
                </div>
              </div>
            </div>
          </DataCard>
        ))}
      </div>

      {/* Selected Industry Details */}
      {selectedIndustry && (
        <div className="space-y-6">
          {/* Market Trends */}
          <DataCard title="Market Trends">
            <div className="space-y-4">
              {selectedIndustry.marketTrends.map((trend, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{trend.trend}</h4>
                    <p className="text-sm text-gray-600">{trend.timeframe}</p>
                  </div>
                  <Badge
                    text={`Impact: ${trend.impact}/10`}
                    variant={trend.impact > 7 ? 'warning' : 'secondary'}
                  />
                </div>
              ))}
            </div>
          </DataCard>

          {/* Top Companies */}
          <DataCard title="Leading Companies">
            <div className="grid gap-4 md:grid-cols-2">
              {selectedIndustry.topCompanies.map((company, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h4 className="font-medium">{company.name}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge text={company.size} variant="secondary" />
                    <Badge text={company.location} variant="primary" />
                  </div>
                </div>
              ))}
            </div>
          </DataCard>

          {/* Geographical Hotspots */}
          <DataCard title="Regional Opportunities">
            <div className="space-y-4">
              {selectedIndustry.geographicalHotspots.map((hotspot, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{hotspot.region}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        text={`Demand: ${hotspot.demandLevel}/10`}
                        variant="primary"
                      />
                      <span className="text-sm text-gray-600">
                        Avg. Salary: {formatCurrency(hotspot.avgSalary / 1e9)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DataCard>
        </div>
      )}
    </div>
  );
};
