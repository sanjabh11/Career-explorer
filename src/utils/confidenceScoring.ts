import { EmergingTechnology } from '../types/emergingTech';

interface ConfidenceMetrics {
  dataQuality: number;
  predictionHorizon: number;
  marketStability: number;
  technologyMaturity: number;
  industryRelevance: number;
}

interface ConfidenceScore {
  overall: number;
  breakdown: ConfidenceMetrics;
  reliability: number;
  recommendations: string[];
}

export class ConfidenceScoringSystem {
  private readonly horizonWeights = {
    shortTerm: 0.8,  // 0-2 years
    mediumTerm: 0.6, // 2-5 years
    longTerm: 0.4    // 5+ years
  };

  private readonly maturityWeights = {
    'Experimental': 0.4,
    'Emerging': 0.6,
    'Growth': 0.8,
    'Mature': 0.9,
    'Declining': 0.7
  };

  public calculateConfidence(
    technology: EmergingTechnology,
    predictionYears: number,
    historicalDataPoints: number
  ): ConfidenceScore {
    const metrics = this.calculateMetrics(
      technology,
      predictionYears,
      historicalDataPoints
    );

    const reliability = this.calculateReliability(metrics);
    const recommendations = this.generateRecommendations(metrics);

    return {
      overall: this.calculateOverallScore(metrics),
      breakdown: metrics,
      reliability,
      recommendations
    };
  }

  private calculateMetrics(
    technology: EmergingTechnology,
    predictionYears: number,
    historicalDataPoints: number
  ): ConfidenceMetrics {
    return {
      dataQuality: this.assessDataQuality(historicalDataPoints),
      predictionHorizon: this.assessPredictionHorizon(predictionYears),
      marketStability: this.assessMarketStability(technology),
      technologyMaturity: this.assessTechnologyMaturity(technology),
      industryRelevance: this.assessIndustryRelevance(technology)
    };
  }

  private assessDataQuality(historicalDataPoints: number): number {
    const minPoints = 3;
    const optimalPoints = 10;
    
    if (historicalDataPoints < minPoints) {
      return 0.3;
    }
    
    return Math.min(1, 0.5 + (historicalDataPoints / optimalPoints) * 0.5);
  }

  private assessPredictionHorizon(years: number): number {
    if (years <= 2) {
      return this.horizonWeights.shortTerm;
    } else if (years <= 5) {
      return this.horizonWeights.mediumTerm;
    } else {
      return this.horizonWeights.longTerm;
    }
  }

  private assessMarketStability(tech: EmergingTechnology): number {
    const marketProjection = tech.marketProjections[0];
    if (!marketProjection) return 0.5;

    const growthRate = marketProjection.growthRate;
    const adoptionRate = marketProjection.adoptionRate;
    const confidence = marketProjection.confidence;

    // Higher stability for moderate growth and adoption rates
    const growthStability = 1 - Math.abs(growthRate - 15) / 30;
    const adoptionStability = 1 - Math.abs(adoptionRate - 0.5);

    return (
      growthStability * 0.4 +
      adoptionStability * 0.3 +
      confidence * 0.3
    );
  }

  private assessTechnologyMaturity(tech: EmergingTechnology): number {
    const maturityScore = this.maturityWeights[
      tech.maturityLevel as keyof typeof this.maturityWeights
    ] || 0.5;

    const implementationReadiness = (
      tech.implementationFactors.organizationalReadiness.technicalCapability +
      tech.implementationFactors.organizationalReadiness.resourceAvailability +
      tech.implementationFactors.organizationalReadiness.culturalAlignment
    ) / 3;

    return (maturityScore * 0.6 + implementationReadiness * 0.4);
  }

  private assessIndustryRelevance(tech: EmergingTechnology): number {
    const industryImpact = tech.industryImpacts[0];
    if (!industryImpact) return 0.5;

    const disruptionScore = industryImpact.disruptionLevel;
    const adoptionScore = industryImpact.adoptionRate;
    const timelineScore = Math.max(0, 1 - industryImpact.timelineToImpact / 36);

    return (
      disruptionScore * 0.4 +
      adoptionScore * 0.3 +
      timelineScore * 0.3
    );
  }

  private calculateOverallScore(metrics: ConfidenceMetrics): number {
    return (
      metrics.dataQuality * 0.25 +
      metrics.predictionHorizon * 0.20 +
      metrics.marketStability * 0.15 +
      metrics.technologyMaturity * 0.25 +
      metrics.industryRelevance * 0.15
    );
  }

  private calculateReliability(metrics: ConfidenceMetrics): number {
    const minMetric = Math.min(
      metrics.dataQuality,
      metrics.predictionHorizon,
      metrics.marketStability,
      metrics.technologyMaturity,
      metrics.industryRelevance
    );

    const avgMetric = this.calculateOverallScore(metrics);
    
    // Reliability decreases if there's high variance between metrics
    return Math.min(avgMetric, minMetric * 1.5);
  }

  private generateRecommendations(metrics: ConfidenceMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.dataQuality < 0.6) {
      recommendations.push(
        'Collect more historical data points to improve prediction accuracy'
      );
    }

    if (metrics.marketStability < 0.6) {
      recommendations.push(
        'Consider market volatility factors in prediction models'
      );
    }

    if (metrics.technologyMaturity < 0.6) {
      recommendations.push(
        'Assess technology readiness level and implementation requirements'
      );
    }

    if (metrics.industryRelevance < 0.6) {
      recommendations.push(
        'Evaluate industry-specific adoption patterns and barriers'
      );
    }

    return recommendations;
  }
}
