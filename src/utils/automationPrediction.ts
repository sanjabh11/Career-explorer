import { AutomationTrend, PredictedAPO } from '@/types/automationTrends';
import { AutomationFactor } from '@/types/automation';

const calculateTrendSlope = (data: AutomationTrend[]): number => {
  const n = data.length;
  if (n < 2) return 0;

  const xMean = (n - 1) / 2;
  const yMean = data.reduce((sum, d) => sum + d.apoScore, 0) / n;

  let numerator = 0;
  let denominator = 0;

  data.forEach((d, i) => {
    const x = i - xMean;
    const y = d.apoScore - yMean;
    numerator += x * y;
    denominator += x * x;
  });

  return denominator !== 0 ? numerator / denominator : 0;
};

const calculateConfidence = (
  historicalData: AutomationTrend[],
  factors: AutomationFactor[]
): number => {
  const dataPoints = historicalData.length;
  const factorConsistency = factors.reduce((acc, f) => acc + (f.weight || 0), 0) / factors.length;
  const trendConsistency = Math.min(1, dataPoints / 12); // Normalize to 12 months of data

  return (factorConsistency * 0.4 + trendConsistency * 0.6) * 100;
};

const analyzeTrends = (data: AutomationTrend[]): { [key: string]: 'increasing' | 'decreasing' | 'stable' } => {
  const trends: { [key: string]: number[] } = {};
  
  data.forEach(point => {
    point.factors.forEach(factor => {
      if (!trends[factor]) trends[factor] = [];
      trends[factor].push(point.apoScore);
    });
  });

  return Object.entries(trends).reduce((acc, [factor, values]) => {
    const slope = calculateTrendSlope(values.map((v, i) => ({ date: new Date(), apoScore: v, factors: [], confidence: 0, industryImpact: 0, technologyAdoption: 0 })));
    acc[factor] = slope > 0.1 ? 'increasing' : slope < -0.1 ? 'decreasing' : 'stable';
    return acc;
  }, {} as { [key: string]: 'increasing' | 'decreasing' | 'stable' });
};

export const predictAutomationTrend = async (
  historicalData: AutomationTrend[],
  occupationFactors: AutomationFactor[],
  timeframeMonths = 6
): Promise<PredictedAPO> => {
  const slope = calculateTrendSlope(historicalData);
  const trends = analyzeTrends(historicalData);
  const confidence = calculateConfidence(historicalData, occupationFactors);

  const baseAPO = historicalData.length > 0 
    ? historicalData[historicalData.length - 1].apoScore 
    : 50;

  const predictedAPO = Math.min(100, Math.max(0, baseAPO + (slope * timeframeMonths)));

  const factors = occupationFactors.map(factor => ({
    name: factor.name,
    impact: factor.weight * 100,
    trend: trends[factor.name] || 'stable'
  }));

  return {
    predictedAPO,
    confidence,
    factors,
    timeframe: timeframeMonths,
    lastUpdated: new Date()
  };
};
