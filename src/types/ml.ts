/**
 * Machine Learning Types for Enhanced APO Dashboard
 * Version 1.0
 */

/**
 * Model feature weights for factor analysis
 */
export interface FeatureWeights {
  taskComplexity: number;
  collaborationRequirements: number;
  industryAdoption: number;
  emergingTechImpact: number;
  regionalFactors: number;
}

/**
 * Occupation feature vector used for ML predictions
 */
export interface OccupationFeatureVector {
  taskComplexityFeatures: number[];
  collaborationFeatures: number[];
  industryAdoptionFeatures: number[];
  emergingTechFeatures: number[];
  regionalFeatures: number[];
}

/**
 * Training data point for ML model
 */
export interface TrainingDataPoint {
  features: OccupationFeatureVector;
  actualAutomationScore: number;
  timeHorizon: number; // in years
}

/**
 * Model prediction result
 */
export interface ModelPrediction {
  predictedScore: number;
  confidence: number;
  featureImportance: FeatureWeights;
  timeHorizon: number; // in years
}

/**
 * Model configuration options
 */
export interface ModelConfig {
  learningRate?: number;
  iterations?: number;
  regularization?: number;
  validationSplit?: number;
}

/**
 * Factor weight adjustment parameters
 */
export interface FactorAdjustment {
  occupationId: string;
  baseWeights: FeatureWeights;
  adjustedWeights: FeatureWeights;
  confidenceScores: {
    taskComplexity: number;
    collaborationRequirements: number;
    industryAdoption: number;
    emergingTechImpact: number;
    regionalFactors: number;
  };
  lastUpdated: string;
}
