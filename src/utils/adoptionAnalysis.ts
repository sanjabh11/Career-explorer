import {
  TechnologyAdoption,
  AdoptionTrend,
  AdoptionForecast,
  AdoptionInsight,
  IndustryAdoptionRate
} from '../types/adoption';

export function calculateAdoptionImpact(
  baseScore: number,
  adoptionData: TechnologyAdoption,
  industry: string
): number {
  const industryRate = getIndustryRate(adoptionData, industry);
  const trendImpact = calculateTrendImpact(adoptionData.historicalTrend);
  const forecastImpact = calculateForecastImpact(adoptionData.forecast);
  
  return adjustBaseScore(baseScore, industryRate, trendImpact, forecastImpact);
}

export function generateAdoptionInsights(
  adoption: TechnologyAdoption,
  industry: string
): AdoptionInsight[] {
  const insights: AdoptionInsight[] = [];
  const industryRate = getIndustryRate(adoption, industry);
  const forecast = getLatestForecast(adoption);

  // Early adoption opportunity
  if (industryRate.rate < adoption.currentAdoptionRate) {
    insights.push({
      type: 'opportunity',
      description: 'Industry adoption rate below average - opportunity for early adoption advantage',
      impact: 0.8,
      timeframe: 'Short-term',
      actionItems: [
        'Assess implementation costs',
        'Identify skill gaps',
        'Plan pilot program'
      ]
    });
  }

  // Rapid growth trend
  if (isRapidGrowth(adoption.historicalTrend)) {
    insights.push({
      type: 'trend',
      description: 'Technology showing rapid adoption growth - consider prioritizing implementation',
      impact: 0.9,
      timeframe: 'Medium-term',
      actionItems: [
        'Develop adoption strategy',
        'Allocate resources',
        'Create training program'
      ]
    });
  }

  // Skills gap risk
  if (adoption.impactFactors.skillRequirement > 0.7) {
    insights.push({
      type: 'risk',
      description: 'High skill requirements may pose adoption challenges',
      impact: 0.7,
      timeframe: 'Medium-term',
      actionItems: [
        'Assess current skill levels',
        'Identify training needs',
        'Consider hiring requirements'
      ]
    });
  }

  return insights;
}

export function predictAdoptionTimeline(
  adoption: TechnologyAdoption,
  targetRate: number
): number {
  const latestTrend = adoption.historicalTrend[adoption.historicalTrend.length - 1];
  const growthRate = calculateGrowthRate(adoption.historicalTrend);
  
  if (growthRate <= 0) return -1; // Cannot predict if no growth

  const rateGap = targetRate - latestTrend.rate;
  return Math.ceil(rateGap / growthRate);
}

// Helper functions
function getIndustryRate(
  adoption: TechnologyAdoption,
  industry: string
): IndustryAdoptionRate {
  return (
    adoption.industryRates.find(rate => rate.industry === industry) || {
      industry,
      rate: adoption.currentAdoptionRate,
      leadingFactors: [],
      barriers: []
    }
  );
}

function calculateTrendImpact(trends: AdoptionTrend[]): number {
  if (trends.length < 2) return 0;
  
  const recentTrends = trends.slice(-4); // Look at last 4 periods
  const growthRates = recentTrends.map((trend, i) => 
    i > 0 ? (trend.rate - recentTrends[i-1].rate) / recentTrends[i-1].rate : 0
  );
  
  return Math.min(1, Math.max(0, average(growthRates) * 2)); // Scale impact
}

function calculateForecastImpact(forecasts: AdoptionForecast[]): number {
  if (forecasts.length === 0) return 0;
  
  const weightedRates = forecasts.map(f => f.predictedRate * f.confidence);
  return Math.min(1, Math.max(0, average(weightedRates)));
}

function adjustBaseScore(
  base: number,
  industryRate: IndustryAdoptionRate,
  trendImpact: number,
  forecastImpact: number
): number {
  const weights = {
    industry: 0.4,
    trend: 0.3,
    forecast: 0.3
  };

  const adjustedScore = base * (
    1 + (
      industryRate.rate * weights.industry +
      trendImpact * weights.trend +
      forecastImpact * weights.forecast
    )
  );

  return Math.min(1, Math.max(0, adjustedScore));
}

function isRapidGrowth(trends: AdoptionTrend[]): boolean {
  const growthRate = calculateGrowthRate(trends);
  return growthRate > 0.2; // 20% growth rate threshold
}

function calculateGrowthRate(trends: AdoptionTrend[]): number {
  if (trends.length < 2) return 0;
  
  const first = trends[0].rate;
  const last = trends[trends.length - 1].rate;
  const periods = trends.length - 1;
  
  return (last - first) / (first * periods);
}

function getLatestForecast(adoption: TechnologyAdoption): AdoptionForecast {
  return adoption.forecast[0] || {
    year: new Date().getFullYear(),
    predictedRate: adoption.currentAdoptionRate,
    confidence: 1,
    drivingFactors: []
  };
}

function average(numbers: number[]): number {
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
}
