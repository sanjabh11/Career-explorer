/**
 * Factor Weighting Model
 * Version 1.0
 * 
 * Implements ML-driven factor weighting for enhanced APO calculations.
 * Uses historical data to determine optimal weights for different factors
 * affecting automation potential.
 */

import { FeatureWeights, OccupationFeatureVector, ModelPrediction, ModelConfig, FactorAdjustment } from '../../types/ml';
import { OccupationTask } from '../../types/semantic';
import { Skill } from '../../types/skills';
import { AutomationResearchData } from '../../types/research';

/**
 * Implements ML-driven factor weighting for APO calculations
 */
export class FactorWeightingModel {
  private baseWeights: FeatureWeights;
  private modelConfig: ModelConfig;
  private trainingData: Map<string, FactorAdjustment>; // occupationId -> adjustment

  /**
   * Creates a new FactorWeightingModel instance
   * @param baseWeights Initial weights for factors
   * @param config Model configuration options
   */
  constructor(
    baseWeights: FeatureWeights = {
      taskComplexity: 0.25,
      collaborationRequirements: 0.20,
      industryAdoption: 0.25,
      emergingTechImpact: 0.20,
      regionalFactors: 0.10
    },
    config: ModelConfig = {
      learningRate: 0.01,
      iterations: 100,
      regularization: 0.001,
      validationSplit: 0.2
    }
  ) {
    this.baseWeights = baseWeights;
    this.modelConfig = config;
    this.trainingData = new Map();
  }

  /**
   * Extracts features from occupation data
   * @param tasks Occupation tasks
   * @param skills Occupation skills
   * @param researchData Research data for the occupation
   * @returns Feature vector for the occupation
   */
  public extractFeatures(
    tasks: OccupationTask[],
    skills: Skill[],
    researchData: AutomationResearchData
  ): OccupationFeatureVector {
    // Extract task complexity features
    const taskComplexityFeatures = this.extractTaskComplexityFeatures(tasks);
    
    // Extract collaboration features
    const collaborationFeatures = this.extractCollaborationFeatures(tasks);
    
    // Extract industry adoption features
    const industryAdoptionFeatures = this.extractIndustryAdoptionFeatures(researchData);
    
    // Extract emerging tech features
    const emergingTechFeatures = this.extractEmergingTechFeatures(researchData);
    
    // Extract regional features
    const regionalFeatures = this.extractRegionalFeatures(researchData);
    
    return {
      taskComplexityFeatures,
      collaborationFeatures,
      industryAdoptionFeatures,
      emergingTechFeatures,
      regionalFeatures
    };
  }

  /**
   * Calculates adjusted weights for a specific occupation
   * @param occupationId Occupation ID
   * @param features Occupation feature vector
   * @returns Adjusted weights for the occupation
   */
  public calculateAdjustedWeights(
    occupationId: string,
    features: OccupationFeatureVector
  ): FactorAdjustment {
    // Check if we have cached weights for this occupation
    if (this.trainingData.has(occupationId)) {
      return this.trainingData.get(occupationId)!;
    }
    
    // Calculate feature importance for each factor
    const taskComplexityImportance = this.calculateFeatureImportance(features.taskComplexityFeatures);
    const collaborationImportance = this.calculateFeatureImportance(features.collaborationFeatures);
    const industryAdoptionImportance = this.calculateFeatureImportance(features.industryAdoptionFeatures);
    const emergingTechImportance = this.calculateFeatureImportance(features.emergingTechFeatures);
    const regionalImportance = this.calculateFeatureImportance(features.regionalFeatures);
    
    // Calculate total importance
    const totalImportance = taskComplexityImportance + collaborationImportance + 
                           industryAdoptionImportance + emergingTechImportance + 
                           regionalImportance;
    
    // Normalize importance values
    const adjustedWeights: FeatureWeights = {
      taskComplexity: taskComplexityImportance / totalImportance,
      collaborationRequirements: collaborationImportance / totalImportance,
      industryAdoption: industryAdoptionImportance / totalImportance,
      emergingTechImpact: emergingTechImportance / totalImportance,
      regionalFactors: regionalImportance / totalImportance
    };
    
    // Calculate confidence scores based on feature variance
    const confidenceScores = {
      taskComplexity: this.calculateConfidenceScore(features.taskComplexityFeatures),
      collaborationRequirements: this.calculateConfidenceScore(features.collaborationFeatures),
      industryAdoption: this.calculateConfidenceScore(features.industryAdoptionFeatures),
      emergingTechImpact: this.calculateConfidenceScore(features.emergingTechFeatures),
      regionalFactors: this.calculateConfidenceScore(features.regionalFeatures)
    };
    
    // Create factor adjustment
    const factorAdjustment: FactorAdjustment = {
      occupationId,
      baseWeights: { ...this.baseWeights },
      adjustedWeights,
      confidenceScores,
      lastUpdated: new Date().toISOString()
    };
    
    // Cache the adjustment
    this.trainingData.set(occupationId, factorAdjustment);
    
    return factorAdjustment;
  }

  /**
   * Predicts automation potential based on feature vector and adjusted weights
   * @param features Occupation feature vector
   * @param weights Adjusted weights for the occupation
   * @returns Predicted automation potential and confidence
   */
  public predictAutomationPotential(
    features: OccupationFeatureVector,
    weights: FeatureWeights
  ): ModelPrediction {
    // Calculate weighted feature importance
    const taskComplexityScore = this.aggregateFeatures(features.taskComplexityFeatures) * weights.taskComplexity;
    const collaborationScore = this.aggregateFeatures(features.collaborationFeatures) * weights.collaborationRequirements;
    const industryAdoptionScore = this.aggregateFeatures(features.industryAdoptionFeatures) * weights.industryAdoption;
    const emergingTechScore = this.aggregateFeatures(features.emergingTechFeatures) * weights.emergingTechImpact;
    const regionalScore = this.aggregateFeatures(features.regionalFeatures) * weights.regionalFactors;
    
    // Calculate overall score
    const predictedScore = taskComplexityScore + collaborationScore + 
                          industryAdoptionScore + emergingTechScore + 
                          regionalScore;
    
    // Calculate confidence based on feature confidence scores
    const confidence = (
      this.calculateConfidenceScore(features.taskComplexityFeatures) * weights.taskComplexity +
      this.calculateConfidenceScore(features.collaborationFeatures) * weights.collaborationRequirements +
      this.calculateConfidenceScore(features.industryAdoptionFeatures) * weights.industryAdoption +
      this.calculateConfidenceScore(features.emergingTechFeatures) * weights.emergingTechImpact +
      this.calculateConfidenceScore(features.regionalFeatures) * weights.regionalFactors
    );
    
    // Estimate time horizon based on predicted score
    const timeHorizon = this.estimateTimeHorizon(predictedScore);
    
    return {
      predictedScore,
      confidence,
      featureImportance: weights,
      timeHorizon
    };
  }

  /**
   * Updates the model with new training data
   * @param occupationId Occupation ID
   * @param actualScore Actual automation potential score
   */
  public updateModel(occupationId: string, actualScore: number): void {
    // Get the cached adjustment for this occupation
    const adjustment = this.trainingData.get(occupationId);
    if (!adjustment) return;
    
    // In a real implementation, this would update the weights
    // based on the error between predicted and actual scores
    // Apply a small adjustment to the weights based on actualScore
    const learningRate = 0.05;
    const scaleFactor = actualScore > 0.5 ? 1 + learningRate : 1 - learningRate;
    
    // Update the weights with a small adjustment
    adjustment.adjustedWeights = {
      taskComplexity: adjustment.adjustedWeights.taskComplexity * scaleFactor,
      collaborationRequirements: adjustment.adjustedWeights.collaborationRequirements * scaleFactor,
      industryAdoption: adjustment.adjustedWeights.industryAdoption * scaleFactor,
      emergingTechImpact: adjustment.adjustedWeights.emergingTechImpact * scaleFactor,
      regionalFactors: adjustment.adjustedWeights.regionalFactors * scaleFactor
    };
    
    // Update the lastUpdated timestamp
    adjustment.lastUpdated = new Date().toISOString();
    
    // Update the cached adjustment
    this.trainingData.set(occupationId, adjustment);
  }

  /**
   * Extracts task complexity features from occupation tasks
   * @param tasks Occupation tasks
   * @returns Task complexity features
   */
  private extractTaskComplexityFeatures(tasks: OccupationTask[]): number[] {
    // In a real implementation, this would analyze task descriptions
    // to extract features related to task complexity
    // For now, return random features
    return Array(5).fill(0).map(() => Math.random());
  }

  /**
   * Extracts collaboration features from occupation tasks
   * @param tasks Occupation tasks
   * @returns Collaboration features
   */
  private extractCollaborationFeatures(tasks: OccupationTask[]): number[] {
    // In a real implementation, this would analyze task descriptions
    // to extract features related to collaboration requirements
    // For now, return random features
    return Array(5).fill(0).map(() => Math.random());
  }

  /**
   * Extracts industry adoption features from research data
   * @param researchData Research data for the occupation
   * @returns Industry adoption features
   */
  private extractIndustryAdoptionFeatures(researchData: AutomationResearchData): number[] {
    // In a real implementation, this would analyze research data
    // to extract features related to industry adoption
    // For now, return random features
    return Array(5).fill(0).map(() => Math.random());
  }

  /**
   * Extracts emerging tech features from research data
   * @param researchData Research data for the occupation
   * @returns Emerging tech features
   */
  private extractEmergingTechFeatures(researchData: AutomationResearchData): number[] {
    // In a real implementation, this would analyze research data
    // to extract features related to emerging technologies
    // For now, return random features
    return Array(5).fill(0).map(() => Math.random());
  }

  /**
   * Extracts regional features from research data
   * @param researchData Research data for the occupation
   * @returns Regional features
   */
  private extractRegionalFeatures(researchData: AutomationResearchData): number[] {
    // In a real implementation, this would analyze research data
    // to extract features related to regional factors
    // For now, return random features
    return Array(5).fill(0).map(() => Math.random());
  }

  /**
   * Calculates feature importance based on feature values
   * @param features Feature values
   * @returns Feature importance
   */
  private calculateFeatureImportance(features: number[]): number {
    // In a real implementation, this would use a more sophisticated
    // algorithm to calculate feature importance
    // For now, calculate the average feature value
    return features.reduce((sum, value) => sum + value, 0) / features.length;
  }

  /**
   * Calculates confidence score based on feature variance
   * @param features Feature values
   * @returns Confidence score
   */
  private calculateConfidenceScore(features: number[]): number {
    // Calculate mean
    const mean = features.reduce((sum, value) => sum + value, 0) / features.length;
    
    // Calculate variance
    const variance = features.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / features.length;
    
    // Higher variance = lower confidence
    return Math.max(0, Math.min(1, 1 - Math.sqrt(variance)));
  }

  /**
   * Aggregates features into a single score
   * @param features Feature values
   * @returns Aggregated score
   */
  private aggregateFeatures(features: number[]): number {
    // In a real implementation, this would use a more sophisticated
    // algorithm to aggregate features
    // For now, calculate the average feature value
    return features.reduce((sum, value) => sum + value, 0) / features.length;
  }

  /**
   * Estimates time horizon based on predicted score
   * @param score Predicted automation score
   * @returns Estimated time horizon in years
   */
  private estimateTimeHorizon(score: number): number {
    // Higher score = shorter time horizon
    if (score >= 0.8) {
      return 2; // 2 years
    } else if (score >= 0.6) {
      return 5; // 5 years
    } else if (score >= 0.4) {
      return 10; // 10 years
    } else if (score >= 0.2) {
      return 15; // 15 years
    } else {
      return 20; // 20 years
    }
  }
}
