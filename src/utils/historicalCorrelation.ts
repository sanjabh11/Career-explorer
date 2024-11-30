import { EmergingTechnology } from '../types/emergingTech';

interface HistoricalDataPoint {
  timestamp: Date;
  apo: number;
  factors: {
    technologyImpact: number;
    industryAdoption: number;
    marketGrowth: number;
  };
}

interface CorrelationResult {
  correlationScore: number;
  confidence: number;
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  keyFactors: string[];
  reliability: number;
}

export class HistoricalCorrelationEngine {
  private historicalData: HistoricalDataPoint[] = [];
  private readonly minDataPoints = 3;
  private readonly correlationThreshold = 0.7;

  public addDataPoint(dataPoint: HistoricalDataPoint): void {
    this.historicalData.push(dataPoint);
    this.historicalData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  public analyzeCorrelation(
    technology: EmergingTechnology,
    timeframeMonths: number
  ): CorrelationResult {
    const relevantData = this.getRelevantData(timeframeMonths);
    
    if (relevantData.length < this.minDataPoints) {
      return this.generateLowConfidenceResult();
    }

    const factorCorrelations = this.calculateFactorCorrelations(relevantData);
    const trendAnalysis = this.analyzeTrend(relevantData);
    const reliability = this.calculateReliability(relevantData);

    return {
      correlationScore: this.calculateOverallCorrelation(factorCorrelations),
      confidence: this.calculateConfidence(relevantData.length, reliability),
      trendDirection: trendAnalysis.direction,
      keyFactors: this.identifyKeyFactors(factorCorrelations),
      reliability
    };
  }

  private getRelevantData(timeframeMonths: number): HistoricalDataPoint[] {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - timeframeMonths);
    
    return this.historicalData.filter(point => 
      point.timestamp.getTime() >= cutoffDate.getTime()
    );
  }

  private calculateFactorCorrelations(
    data: HistoricalDataPoint[]
  ): Map<string, number> {
    const correlations = new Map<string, number>();
    
    correlations.set('technologyImpact', 
      this.pearsonCorrelation(
        data.map(d => d.apo),
        data.map(d => d.factors.technologyImpact)
      )
    );
    
    correlations.set('industryAdoption',
      this.pearsonCorrelation(
        data.map(d => d.apo),
        data.map(d => d.factors.industryAdoption)
      )
    );
    
    correlations.set('marketGrowth',
      this.pearsonCorrelation(
        data.map(d => d.apo),
        data.map(d => d.factors.marketGrowth)
      )
    );
    
    return correlations;
  }

  private pearsonCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const sum1 = x.reduce((a, b) => a + b);
    const sum2 = y.reduce((a, b) => a + b);
    const sum1Sq = x.reduce((a, b) => a + b * b);
    const sum2Sq = y.reduce((a, b) => a + b * b);
    const pSum = x.map((x, i) => x * y[i]).reduce((a, b) => a + b);
    
    const num = pSum - (sum1 * sum2 / n);
    const den = Math.sqrt(
      (sum1Sq - sum1 * sum1 / n) *
      (sum2Sq - sum2 * sum2 / n)
    );
    
    return den === 0 ? 0 : num / den;
  }

  private analyzeTrend(
    data: HistoricalDataPoint[]
  ): { direction: 'increasing' | 'decreasing' | 'stable'; strength: number } {
    const apoValues = data.map(d => d.apo);
    const trend = this.calculateLinearTrend(apoValues);
    
    return {
      direction: trend > 0.05 ? 'increasing' :
                trend < -0.05 ? 'decreasing' : 'stable',
      strength: Math.abs(trend)
    };
  }

  private calculateLinearTrend(values: number[]): number {
    const n = values.length;
    const indices = Array.from({length: n}, (_, i) => i);
    
    const correlation = this.pearsonCorrelation(indices, values);
    return correlation;
  }

  private calculateReliability(data: HistoricalDataPoint[]): number {
    const timeDiffs = data
      .slice(1)
      .map((point, i) => 
        point.timestamp.getTime() - data[i].timestamp.getTime()
      );
    
    const avgTimeDiff = timeDiffs.reduce((a, b) => a + b) / timeDiffs.length;
    const stdDevTimeDiff = Math.sqrt(
      timeDiffs.reduce((a, b) => a + Math.pow(b - avgTimeDiff, 2)) / timeDiffs.length
    );
    
    const consistencyScore = 1 - (stdDevTimeDiff / avgTimeDiff);
    const dataPointScore = Math.min(1, data.length / this.minDataPoints);
    
    return (consistencyScore * 0.6 + dataPointScore * 0.4);
  }

  private calculateOverallCorrelation(
    factorCorrelations: Map<string, number>
  ): number {
    const correlations = Array.from(factorCorrelations.values());
    return correlations.reduce((a, b) => a + Math.abs(b)) / correlations.length;
  }

  private calculateConfidence(
    dataPoints: number,
    reliability: number
  ): number {
    const dataPointFactor = Math.min(1, dataPoints / (this.minDataPoints * 2));
    return (dataPointFactor * 0.6 + reliability * 0.4);
  }

  private identifyKeyFactors(
    correlations: Map<string, number>
  ): string[] {
    return Array.from(correlations.entries())
      .filter(([_, value]) => Math.abs(value) >= this.correlationThreshold)
      .map(([key, _]) => key);
  }

  private generateLowConfidenceResult(): CorrelationResult {
    return {
      correlationScore: 0,
      confidence: 0.3,
      trendDirection: 'stable',
      keyFactors: [],
      reliability: 0.3
    };
  }
}
