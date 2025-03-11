/**
 * Dynamic APO Calculator
 * Version 1.1
 * 
 * Implements enhanced APO calculations with time-based projections
 * and scenario modeling capabilities.
 */

import { FactorWeightingModel } from './FactorWeightingModel';
import { OccupationTask } from '../../types/semantic';
import { Skill } from '../../types/skills';
import { AutomationResearchData } from '../../types/research';
import { APOResult, TimeProjection, FactorBreakdown } from '../../types/apo';
import { OccupationFeatureVector, FeatureWeights, ModelPrediction } from '../../types/ml';

/**
 * Scenario parameters for "what-if" modeling
 */
export interface ScenarioParams {
  name: string;
  description: string;
  factorAdjustments: {
    taskComplexity?: number; // multiplier for task complexity (default: 1.0)
    collaborationRequirements?: number; // multiplier for collaboration requirements (default: 1.0)
    industryAdoption?: number; // multiplier for industry adoption (default: 1.0)
    emergingTechImpact?: number; // multiplier for emerging tech impact (default: 1.0)
    regionalFactors?: number; // multiplier for regional factors (default: 1.0)
  };
  timeHorizonYears: number[]; // years to project (e.g., [2, 5, 10])
}

/**
 * Scenario result for comparison
 */
export interface ScenarioResult {
  scenarioName: string;
  scenarioDescription: string;
  baselineScore: number;
  adjustedScore: number;
  overallScore: number;
  timeProjections: TimeProjection[];
  factorBreakdown: FactorBreakdown;
  confidenceScore: number;
}

/**
 * Dynamic APO Calculator with enhanced projections and scenario modeling
 */
export class DynamicApoCalculator {
  private factorWeightingModel: FactorWeightingModel;
  
  /**
   * Creates a new DynamicApoCalculator instance
   * @param factorWeightingModel Factor weighting model instance
   */
  constructor(factorWeightingModel: FactorWeightingModel) {
    this.factorWeightingModel = factorWeightingModel;
  }
  
  /**
   * Calculates APO with enhanced time-based projections
   * @param occupationId Occupation ID
   * @param occupationTitle Occupation title
   * @param tasks Occupation tasks
   * @param skills Occupation skills
   * @param researchData Research data for the occupation
   * @returns Enhanced APO result with time projections
   */
  public calculateEnhancedApo(
    occupationId: string,
    occupationTitle: string,
    tasks: OccupationTask[],
    skills: Skill[],
    researchData: AutomationResearchData
  ): APOResult {
    // Extract features from occupation data
    const features = this.factorWeightingModel.extractFeatures(tasks, skills, researchData);
    
    // Calculate adjusted weights for the occupation
    const factorAdjustment = this.factorWeightingModel.calculateAdjustedWeights(occupationId, features);
    
    // Predict automation potential
    const prediction = this.factorWeightingModel.predictAutomationPotential(
      features,
      factorAdjustment.adjustedWeights
    );
    
    // Generate time projections
    const timeProjections = this.generateTimeProjections(
      prediction,
      researchData
    );
    
    // Create factor breakdown
    const factorBreakdown = this.createFactorBreakdown(
      prediction,
      factorAdjustment
    );
    
    // Analyze skills impact
    const skillsImpact = this.analyzeSkillsImpact(
      skills,
      prediction,
      researchData
    );
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      prediction,
      skillsImpact,
      researchData
    );
    
    // Create APO result
    return {
      occupationId,
      occupationTitle,
      overallScore: prediction.predictedScore,
      confidence: prediction.confidence,
      timeProjections,
      factorBreakdown,
      skillsImpact,
      recommendations,
      taskAnalysis: {
        highRiskTasks: tasks
          .filter(task => this.calculateTaskAutomationPotential(task) > 0.7)
          .map(task => ({
            id: task.id,
            description: task.description,
            automationPotential: this.calculateTaskAutomationPotential(task),
            reason: `High automation potential due to ${this.getTaskAutomationReason(task)}`,
            timeframe: 'Short-term'
          })),
        moderateRiskTasks: tasks
          .filter(task => {
            const score = this.calculateTaskAutomationPotential(task);
            return score >= 0.3 && score <= 0.7;
          })
          .map(task => ({
            id: task.id,
            description: task.description,
            automationPotential: this.calculateTaskAutomationPotential(task),
            reason: `Moderate automation potential due to ${this.getTaskAutomationReason(task)}`,
            timeframe: 'Medium-term'
          })),
        lowRiskTasks: tasks
          .filter(task => this.calculateTaskAutomationPotential(task) < 0.3)
          .map(task => ({
            id: task.id,
            description: task.description,
            automationPotential: this.calculateTaskAutomationPotential(task),
            reason: `Low automation potential due to ${this.getTaskAutomationReason(task)}`,
            timeframe: 'Long-term'
          })),
        overallTaskAutomationScore: this.calculateOverallTaskAutomationScore(tasks)
      },
      dataSourceInfo: {
        onetDataDate: new Date().toISOString(), // In a real implementation, this would come from O*NET data
        researchDataDate: researchData.lastUpdated,
        semanticAnalysisDate: new Date().toISOString()
      }
    };
  }
  
  /**
   * Generates time-based projections for automation potential
   * @param prediction Model prediction
   * @param researchData Research data for the occupation
   * @returns Time projections for different horizons
   */
  private generateTimeProjections(
    prediction: ModelPrediction,
    researchData: AutomationResearchData
  ): TimeProjection[] {
    const currentYear = new Date().getFullYear();
    
    // Generate projections for 2, 5, and 10 years
    return [2, 5, 10].map(years => {
      // Calculate projected score based on adoption curves
      const projectedScore = this.calculateProjectedScore(
        prediction.predictedScore,
        years,
        researchData
      );
      
      // Identify key factors affecting the projection
      const keyDrivers = this.identifyKeyFactors(
        prediction,
        years,
        researchData
      );
      
      return {
        year: currentYear + years,
        score: projectedScore,
        confidence: Math.max(0, prediction.confidence - (years * 0.05)), // Confidence decreases with time
        keyDrivers
      };
    });
  }
  
  /**
   * Calculates projected score based on adoption curves
   * @param baseScore Base automation score
   * @param years Years into the future
   * @param researchData Research data for the occupation
   * @returns Projected automation score
   */
  private calculateProjectedScore(
    baseScore: number,
    years: number,
    researchData: AutomationResearchData
  ): number {
    // Get adoption curve data
    let adoptionData: { year: number; adoption: number }[] = [];
    
    if (years <= 2) {
      adoptionData = researchData.adoptionCurves.shortTerm;
    } else if (years <= 5) {
      adoptionData = researchData.adoptionCurves.mediumTerm;
    } else {
      adoptionData = researchData.adoptionCurves.longTerm;
    }
    
    // Find closest year in adoption data
    const currentYear = new Date().getFullYear();
    const targetYear = currentYear + years;
    
    const closestYearData = adoptionData.reduce((closest, current) => {
      return Math.abs(current.year - targetYear) < Math.abs(closest.year - targetYear)
        ? current
        : closest;
    }, adoptionData[0]);
    
    // Apply adoption rate to base score
    const adoptionRate = closestYearData.adoption;
    
    // Calculate projected score
    // Higher adoption rate = faster approach to maximum score
    const maxScore = Math.min(1, baseScore * 1.5); // Maximum possible score
    const projectedScore = baseScore + ((maxScore - baseScore) * adoptionRate);
    
    return Math.min(1, Math.max(0, projectedScore));
  }
  
  /**
   * Identifies key factors affecting the projection
   * @param prediction Model prediction
   * @param years Years into the future
   * @param researchData Research data for the occupation
   * @returns Key factors affecting the projection
   */
  private identifyKeyFactors(
    prediction: ModelPrediction,
    years: number,
    researchData: AutomationResearchData
  ): string[] {
    // Identify trends relevant to the time horizon
    const relevantTrends = researchData.trends.filter(trend => {
      if (years <= 2 && trend.timeframe === 'Short-term') return true;
      if (years <= 5 && trend.timeframe === 'Medium-term') return true;
      if (years <= 10 && trend.timeframe === 'Long-term') return true;
      return false;
    });
    
    // Extract key factors from trends
    const trendFactors = relevantTrends.map(trend => trend.trendName);
    
    // Add factors based on feature importance
    const importanceFactors: string[] = [];
    
    // Add task complexity factor if it's important
    if (prediction.featureImportance.taskComplexity > 0.3) {
      importanceFactors.push('Task complexity level');
    }
    
    // Add collaboration factor if it's important
    if (prediction.featureImportance.collaborationRequirements > 0.3) {
      importanceFactors.push('Human collaboration requirements');
    }
    
    // Add industry adoption factor if it's important
    if (prediction.featureImportance.industryAdoption > 0.3) {
      importanceFactors.push('Industry automation adoption rate');
    }
    
    // Add emerging tech factor if it's important
    if (prediction.featureImportance.emergingTechImpact > 0.3) {
      importanceFactors.push('Emerging technology impact');
    }
    
    // Add regional factor if it's important
    if (prediction.featureImportance.regionalFactors > 0.3) {
      importanceFactors.push('Regional economic factors');
    }
    
    // Combine and deduplicate factors
    return [...new Set([...trendFactors, ...importanceFactors])].slice(0, 5);
  }
  
  /**
   * Creates factor breakdown based on model prediction
   * @param prediction Model prediction
   * @param factorAdjustment Factor adjustment
   * @returns Factor breakdown
   */
  private createFactorBreakdown(
    prediction: ModelPrediction,
    factorAdjustment: { adjustedWeights: FeatureWeights, confidenceScores: any }
  ): FactorBreakdown {
    return {
      taskComplexity: prediction.featureImportance.taskComplexity * prediction.predictedScore,
      collaborationRequirements: prediction.featureImportance.collaborationRequirements * prediction.predictedScore,
      industryAdoption: prediction.featureImportance.industryAdoption * prediction.predictedScore,
      emergingTechImpact: prediction.featureImportance.emergingTechImpact * prediction.predictedScore,
      regionalFactors: {
        highIncome: prediction.featureImportance.regionalFactors * prediction.predictedScore,
        middleIncome: prediction.featureImportance.regionalFactors * prediction.predictedScore * 0.8,
        lowIncome: prediction.featureImportance.regionalFactors * prediction.predictedScore * 0.6
      }
    };
  }
  
  /**
   * Analyzes skills impact based on model prediction
   * @param skills Occupation skills
   * @param prediction Model prediction
   * @param researchData Research data for the occupation
   * @returns Skills impact analysis
   */
  private analyzeSkillsImpact(
    skills: Skill[],
    prediction: ModelPrediction,
    researchData: AutomationResearchData
  ): any {
    // In a real implementation, this would perform a detailed analysis
    // of each skill's automation potential
    // For now, return a simplified analysis
    
    // Classify skills based on automation potential
    const highRiskThreshold = 0.7;
    const moderateRiskThreshold = 0.4;
    
    // Randomly assign automation scores to skills
    const skillsWithScores = skills.map(skill => ({
      ...skill,
      automationScore: Math.random()
    }));
    
    // Classify skills
    const highRisk = skillsWithScores
      .filter(skill => skill.automationScore >= highRiskThreshold)
      .map(({ automationScore, ...skill }) => skill);
    
    const moderateRisk = skillsWithScores
      .filter(skill => skill.automationScore >= moderateRiskThreshold && skill.automationScore < highRiskThreshold)
      .map(({ automationScore, ...skill }) => skill);
    
    const lowRisk = skillsWithScores
      .filter(skill => skill.automationScore < moderateRiskThreshold)
      .map(({ automationScore, ...skill }) => skill);
    
    // Generate emerging skills
    const emergingSkills = [
      {
        id: 'emerging-1',
        name: 'AI System Oversight',
        category: 'technical',
        description: 'Monitoring and managing AI systems to ensure they operate as intended'
      },
      {
        id: 'emerging-2',
        name: 'Human-AI Collaboration',
        category: 'soft',
        description: 'Working effectively alongside AI systems to achieve enhanced outcomes'
      },
      {
        id: 'emerging-3',
        name: 'Ethical Technology Implementation',
        category: 'cognitive',
        description: 'Ensuring technology is implemented in ways that align with ethical principles'
      }
    ];
    
    return {
      highRisk,
      moderateRisk,
      lowRisk,
      emergingSkills
    };
  }
  
  /**
   * Generates recommendations based on model prediction
   * @param prediction Model prediction
   * @param skillsImpact Skills impact analysis
   * @param researchData Research data for the occupation
   * @returns Career recommendations
   */
  private generateRecommendations(
    prediction: ModelPrediction,
    skillsImpact: any,
    researchData: AutomationResearchData
  ): any[] {
    // In a real implementation, this would generate personalized
    // recommendations based on the model prediction and skills impact
    // For now, return generic recommendations
    
    const recommendations = [];
    
    // Add skill development recommendation
    recommendations.push({
      type: 'skill_development',
      title: 'Develop AI-Resistant Skills',
      description: 'Focus on developing skills that are difficult to automate, such as creative problem solving, emotional intelligence, and ethical decision making.',
      timeframe: 'Short-term',
      impact: 'High'
    });
    
    // Add career pivot recommendation if high automation potential
    if (prediction.predictedScore >= 0.7) {
      recommendations.push({
        type: 'career_pivot',
        title: 'Consider Career Transition',
        description: 'Explore related occupations with lower automation potential that leverage your transferable skills.',
        timeframe: 'Medium-term',
        impact: 'High'
      });
    }
    
    // Add education recommendation
    recommendations.push({
      type: 'education',
      title: 'Pursue Continuous Learning',
      description: 'Engage in ongoing education to stay ahead of technological changes in your field.',
      timeframe: 'Medium-term',
      impact: 'Medium'
    });
    
    // Add industry change recommendation if very high automation potential
    if (prediction.predictedScore >= 0.85) {
      recommendations.push({
        type: 'industry_change',
        title: 'Explore Emerging Industries',
        description: 'Consider transitioning to industries with lower automation potential and growing demand for human workers.',
        timeframe: 'Long-term',
        impact: 'High'
      });
    }
    
    return recommendations;
  }
  
  /**
   * Models "what-if" scenarios for automation potential
   * @param occupationId Occupation ID
   * @param occupationTitle Occupation title
   * @param tasks Occupation tasks
   * @param skills Occupation skills
   * @param researchData Research data for the occupation
   * @param scenarios Scenario parameters
   * @returns Scenario results for comparison
   */
  public modelScenarios(
    occupationId: string,
    occupationTitle: string,
    tasks: OccupationTask[],
    skills: Skill[],
    researchData: AutomationResearchData,
    scenarios: ScenarioParams[]
  ): ScenarioResult[] {
    // Extract features from occupation data
    const features = this.factorWeightingModel.extractFeatures(tasks, skills, researchData);
    
    // Calculate baseline prediction
    const basePrediction = this.factorWeightingModel.predictAutomationPotential(
      features,
      {
        taskComplexity: 0.25,
        collaborationRequirements: 0.20,
        industryAdoption: 0.25,
        emergingTechImpact: 0.20,
        regionalFactors: 0.10
      }
    );
    
    // Generate scenario results
    return scenarios.map(scenario => {
      // Apply factor adjustments
      const factorAdjustment = this.applyFactorAdjustments(
        basePrediction,
        scenario.factorAdjustments
      );
      
      // Calculate adjusted score
      const adjustedScore = this.calculateAdjustedScore(
        basePrediction.predictedScore,
        factorAdjustment
      );
      
      // Create factor breakdown
      const factorBreakdown = this.createFactorBreakdown(
        basePrediction,
        factorAdjustment
      );
      
      // Generate time projections for the scenario
      const timeProjections = scenario.timeHorizonYears.map(years => {
        // Calculate projected score based on adoption curves
        const projectedScore = this.calculateProjectedScore(
          adjustedScore,
          years,
          researchData
        );
        
        // Identify key factors affecting the projection
        const keyDrivers = this.identifyKeyFactors(
          basePrediction,
          years,
          researchData
        );
        
        return {
          year: new Date().getFullYear() + years,
          score: projectedScore,
          confidence: Math.max(0, basePrediction.confidence - (years * 0.05)), // Confidence decreases with time
          keyDrivers
        };
      });
      
      return {
        scenarioName: scenario.name,
        scenarioDescription: scenario.description,
        baselineScore: basePrediction.predictedScore,
        adjustedScore,
        overallScore: adjustedScore,
        timeProjections,
        factorBreakdown,
        confidenceScore: basePrediction.confidence
      };
    });
  }

  /**
   * Applies factor adjustments to a prediction
   * @param prediction Base prediction
   * @param factorAdjustments Factor adjustments
   * @returns Adjusted factor weights
   */
  private applyFactorAdjustments(
    prediction: ModelPrediction,
    factorAdjustments: {
      taskComplexity?: number;
      collaborationRequirements?: number;
      industryAdoption?: number;
      emergingTechImpact?: number;
      regionalFactors?: number;
    }
  ): { adjustedWeights: FeatureWeights, confidenceScores: any } {
    // Get base weights from the prediction
    const baseWeights = {
      taskComplexity: 0.25,
      collaborationRequirements: 0.20,
      industryAdoption: 0.25,
      emergingTechImpact: 0.20,
      regionalFactors: 0.10
    };
    
    // Apply adjustments
    const adjustedWeights: FeatureWeights = {
      taskComplexity: baseWeights.taskComplexity * (factorAdjustments.taskComplexity || 1.0),
      collaborationRequirements: baseWeights.collaborationRequirements * (factorAdjustments.collaborationRequirements || 1.0),
      industryAdoption: baseWeights.industryAdoption * (factorAdjustments.industryAdoption || 1.0),
      emergingTechImpact: baseWeights.emergingTechImpact * (factorAdjustments.emergingTechImpact || 1.0),
      regionalFactors: baseWeights.regionalFactors * (factorAdjustments.regionalFactors || 1.0)
    };
    
    // Normalize weights
    const totalWeight = Object.values(adjustedWeights).reduce((sum, weight) => sum + weight, 0);
    Object.keys(adjustedWeights).forEach(key => {
      adjustedWeights[key as keyof FeatureWeights] /= totalWeight;
    });
    
    // Mock confidence scores for now
    const confidenceScores = {
      taskComplexity: 0.8,
      collaborationRequirements: 0.7,
      industryAdoption: 0.75,
      emergingTechImpact: 0.6,
      regionalFactors: 0.65
    };
    
    return {
      adjustedWeights,
      confidenceScores
    };
  }
  
  /**
   * Calculates adjusted score based on factor adjustments
   * @param baseScore Base automation score
   * @param factorAdjustment Factor adjustment
   * @returns Adjusted automation score
   */
  private calculateAdjustedScore(
    baseScore: number,
    factorAdjustment: { adjustedWeights: FeatureWeights, confidenceScores: any }
  ): number {
    // Calculate adjustment multiplier based on weights
    const adjustmentMultiplier = 
      (factorAdjustment.adjustedWeights.taskComplexity * 1.1) +
      (factorAdjustment.adjustedWeights.collaborationRequirements * 0.9) +
      (factorAdjustment.adjustedWeights.industryAdoption * 1.2) +
      (factorAdjustment.adjustedWeights.emergingTechImpact * 1.3) +
      (factorAdjustment.adjustedWeights.regionalFactors * 1.0);
    
    // Normalize multiplier
    const normalizedMultiplier = adjustmentMultiplier / 
      (1.1 + 0.9 + 1.2 + 1.3 + 1.0);
    
    // Apply adjustment to base score
    const adjustedScore = baseScore * normalizedMultiplier;
    
    // Ensure score is within 0-1 range
    return Math.max(0, Math.min(1, adjustedScore));
  }

  private calculateTaskAutomationPotential(task: OccupationTask): number {
    // In a real implementation, this would calculate the automation potential
    // of a task based on its characteristics
    // For now, return a random score
    return Math.random();
  }

  private getTaskAutomationReason(task: OccupationTask): string {
    // In a real implementation, this would return a reason for the automation
    // potential of a task based on its characteristics
    // For now, return a generic reason
    return 'Task characteristics';
  }

  private calculateOverallTaskAutomationScore(tasks: OccupationTask[]): number {
    // In a real implementation, this would calculate the overall automation
    // potential of a set of tasks based on their characteristics
    // For now, return a random score
    return Math.random();
  }
}
