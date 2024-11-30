import { 
  RegionalMarketData, 
  RegionalInsight, 
  RegionalTrend,
  RegionalComparison,
  MarketIndicators
} from '../types/regional';

export function calculateRegionalImpact(
  baseScore: number,
  regionalData: RegionalMarketData
): number {
  const marketImpact = calculateMarketImpact(regionalData.marketIndicators);
  const laborImpact = calculateLaborImpact(regionalData.laborStats);
  const techHubImpact = calculateTechHubImpact(regionalData.techHubData);
  const costImpact = calculateCostImpact(regionalData.costOfLiving);

  return adjustBaseScore(
    baseScore,
    marketImpact,
    laborImpact,
    techHubImpact,
    costImpact
  );
}

export function generateRegionalInsights(
  regionalData: RegionalMarketData
): RegionalInsight[] {
  const insights: RegionalInsight[] = [];

  // Market opportunities
  if (regionalData.marketIndicators.gdpGrowth > 3) {
    insights.push({
      type: 'opportunity',
      description: 'Strong market growth indicates expanding job opportunities',
      impact: 0.8,
      timeframe: 'short',
      confidence: 0.85
    });
  }

  // Labor market challenges
  if (regionalData.laborStats.skillGapIndex > 0.6) {
    insights.push({
      type: 'challenge',
      description: 'Significant skill gap in the region may require upskilling',
      impact: 0.7,
      timeframe: 'medium',
      confidence: 0.9
    });
  }

  // Tech hub opportunities
  if (regionalData.techHubData.hubScore > 0.7) {
    insights.push({
      type: 'opportunity',
      description: 'Strong tech hub presence offers innovation opportunities',
      impact: 0.85,
      timeframe: 'long',
      confidence: 0.8
    });
  }

  return insights;
}

export function analyzeRegionalTrends(
  historicalData: RegionalMarketData[],
  timeframe: number
): RegionalTrend[] {
  return Object.keys(historicalData[0].marketIndicators).map(indicator => ({
    indicator,
    historicalData: extractHistoricalTrend(historicalData, indicator),
    forecast: generateForecast(historicalData, indicator, timeframe)
  }));
}

export function compareRegions(
  regions: RegionalMarketData[]
): RegionalComparison[] {
  return regions.map(region => ({
    regionCode: region.regionCode,
    metrics: calculateRegionMetrics(region),
    ranking: calculateRegionRanking(region, regions),
    strengthFactors: identifyStrengths(region),
    weaknessFactors: identifyWeaknesses(region)
  }));
}

// Private helper functions
function calculateMarketImpact(indicators: MarketIndicators): number {
  const weights = {
    gdpGrowth: 0.3,
    employmentRate: 0.2,
    industryGrowth: 0.2,
    innovationIndex: 0.15,
    marketSize: 0.1,
    competitiveIndex: 0.05
  };

  return Object.entries(weights).reduce(
    (impact, [key, weight]) => impact + indicators[key as keyof MarketIndicators] * weight,
    0
  );
}

function calculateLaborImpact(laborStats: any): number {
  // Implementation based on labor statistics
  return 0.7; // Placeholder
}

function calculateTechHubImpact(techHubData: any): number {
  // Implementation based on tech hub data
  return 0.8; // Placeholder
}

function calculateCostImpact(costData: any): number {
  // Implementation based on cost of living data
  return 0.6; // Placeholder
}

function adjustBaseScore(
  baseScore: number,
  ...impacts: number[]
): number {
  const avgImpact = impacts.reduce((sum, impact) => sum + impact, 0) / impacts.length;
  return Math.min(1, Math.max(0, baseScore * (1 + (avgImpact - 0.5))));
}

function extractHistoricalTrend(
  data: RegionalMarketData[],
  indicator: string
): Array<{ date: string; value: number }> {
  // Implementation for historical trend extraction
  return []; // Placeholder
}

function generateForecast(
  data: RegionalMarketData[],
  indicator: string,
  timeframe: number
): Array<{ date: string; value: number; confidence: number }> {
  // Implementation for forecast generation
  return []; // Placeholder
}

function calculateRegionMetrics(region: RegionalMarketData): { [key: string]: number } {
  // Implementation for region metrics calculation
  return {}; // Placeholder
}

function calculateRegionRanking(
  region: RegionalMarketData,
  allRegions: RegionalMarketData[]
): number {
  // Implementation for region ranking calculation
  return 1; // Placeholder
}

function identifyStrengths(region: RegionalMarketData): string[] {
  // Implementation for strength identification
  return []; // Placeholder
}

function identifyWeaknesses(region: RegionalMarketData): string[] {
  // Implementation for weakness identification
  return []; // Placeholder
}
