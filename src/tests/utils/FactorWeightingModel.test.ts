/**
 * Factor Weighting Model Tests
 * Version 1.0
 */

import { FactorWeightingModel } from '../../utils/apo/FactorWeightingModel';
import { OccupationTask } from '../../types/semantic';
import { Skill } from '../../types/skills';
import { AutomationResearchData } from '../../types/research';

// Mock data
const mockTasks: OccupationTask[] = [
  {
    id: 'task-1',
    description: 'Analyze data using statistical methods and machine learning algorithms'
  },
  {
    id: 'task-2',
    description: 'Create reports and visualizations to communicate findings to stakeholders'
  },
  {
    id: 'task-3',
    description: 'Conduct interviews with clients to understand business requirements'
  }
];

const mockSkills: Skill[] = [
  {
    id: 'skill-1',
    name: 'Machine Learning',
    category: 'technical',
    description: 'Application of statistical models and algorithms to enable systems to learn from data'
  },
  {
    id: 'skill-2',
    name: 'Data Visualization',
    category: 'technical',
    description: 'Creating visual representations of data to communicate insights effectively'
  },
  {
    id: 'skill-3',
    name: 'Client Communication',
    category: 'soft',
    description: 'Effectively communicating with clients to understand needs and present solutions'
  }
];

// Mock research data
const mockResearchData: AutomationResearchData = {
  occupation: 'Data Analyst',
  researchPapers: [],
  industryReports: [],
  newsArticles: [],
  trends: [
    {
      trendName: 'Automated Data Processing',
      description: 'Increasing automation of routine data processing tasks',
      impactScore: 0.8,
      timeframe: 'Short-term',
      relevantTechnologies: ['Machine Learning', 'RPA'],
      sources: ['Research Paper 1']
    }
  ],
  overallScore: 0.65,
  confidenceLevel: {
    overall: 0.75,
    sourceCount: 15,
    sourceQuality: 0.8,
    dataConsistency: 0.7,
    recency: 0.75
  },
  regionalImpact: {
    global: 0.65,
    regional: {
      northAmerica: 0.7,
      europe: 0.65,
      asia: 0.6,
      other: 0.5
    },
    factorsByRegion: {
      northAmerica: ['High technology adoption rate'],
      europe: ['Regulatory considerations'],
      asia: ['Growing technology sector'],
      other: ['Variable technology infrastructure']
    }
  },
  adoptionCurves: {
    shortTerm: [{ year: 2025, adoption: 0.3 }, { year: 2026, adoption: 0.4 }],
    mediumTerm: [{ year: 2028, adoption: 0.6 }, { year: 2030, adoption: 0.7 }],
    longTerm: [{ year: 2035, adoption: 0.8 }, { year: 2040, adoption: 0.9 }]
  },
  lastUpdated: new Date().toISOString()
};

describe('FactorWeightingModel', () => {
  let model: FactorWeightingModel;

  beforeEach(() => {
    model = new FactorWeightingModel();
  });

  test('should extract features from occupation data', () => {
    const features = model.extractFeatures(mockTasks, mockSkills, mockResearchData);
    
    // Verify feature structure
    expect(features).toHaveProperty('taskComplexityFeatures');
    expect(features).toHaveProperty('collaborationFeatures');
    expect(features).toHaveProperty('industryAdoptionFeatures');
    expect(features).toHaveProperty('emergingTechFeatures');
    expect(features).toHaveProperty('regionalFeatures');
    
    // Verify feature arrays
    expect(Array.isArray(features.taskComplexityFeatures)).toBe(true);
    expect(Array.isArray(features.collaborationFeatures)).toBe(true);
    expect(Array.isArray(features.industryAdoptionFeatures)).toBe(true);
    expect(Array.isArray(features.emergingTechFeatures)).toBe(true);
    expect(Array.isArray(features.regionalFeatures)).toBe(true);
  });

  test('should calculate adjusted weights for an occupation', () => {
    const features = model.extractFeatures(mockTasks, mockSkills, mockResearchData);
    const adjustment = model.calculateAdjustedWeights('occupation-1', features);
    
    // Verify adjustment structure
    expect(adjustment).toHaveProperty('occupationId');
    expect(adjustment).toHaveProperty('baseWeights');
    expect(adjustment).toHaveProperty('adjustedWeights');
    expect(adjustment).toHaveProperty('confidenceScores');
    expect(adjustment).toHaveProperty('lastUpdated');
    
    // Verify weights
    expect(adjustment.occupationId).toBe('occupation-1');
    expect(adjustment.baseWeights).toHaveProperty('taskComplexity');
    expect(adjustment.baseWeights).toHaveProperty('collaborationRequirements');
    expect(adjustment.baseWeights).toHaveProperty('industryAdoption');
    expect(adjustment.baseWeights).toHaveProperty('emergingTechImpact');
    expect(adjustment.baseWeights).toHaveProperty('regionalFactors');
    
    // Verify adjusted weights
    expect(adjustment.adjustedWeights).toHaveProperty('taskComplexity');
    expect(adjustment.adjustedWeights).toHaveProperty('collaborationRequirements');
    expect(adjustment.adjustedWeights).toHaveProperty('industryAdoption');
    expect(adjustment.adjustedWeights).toHaveProperty('emergingTechImpact');
    expect(adjustment.adjustedWeights).toHaveProperty('regionalFactors');
    
    // Verify weight normalization
    const totalWeight = Object.values(adjustment.adjustedWeights).reduce((sum, weight) => sum + weight, 0);
    expect(totalWeight).toBeCloseTo(1.0, 1); // Sum should be close to 1.0
  });

  test('should predict automation potential based on features and weights', () => {
    const features = model.extractFeatures(mockTasks, mockSkills, mockResearchData);
    const adjustment = model.calculateAdjustedWeights('occupation-1', features);
    const prediction = model.predictAutomationPotential(features, adjustment.adjustedWeights);
    
    // Verify prediction structure
    expect(prediction).toHaveProperty('predictedScore');
    expect(prediction).toHaveProperty('confidence');
    expect(prediction).toHaveProperty('featureImportance');
    expect(prediction).toHaveProperty('timeHorizon');
    
    // Verify score ranges
    expect(prediction.predictedScore).toBeGreaterThanOrEqual(0);
    expect(prediction.predictedScore).toBeLessThanOrEqual(1);
    expect(prediction.confidence).toBeGreaterThanOrEqual(0);
    expect(prediction.confidence).toBeLessThanOrEqual(1);
    expect(prediction.timeHorizon).toBeGreaterThanOrEqual(0);
    
    // Verify feature importance
    expect(prediction.featureImportance).toEqual(adjustment.adjustedWeights);
  });

  test('should update the model with new training data', () => {
    const features = model.extractFeatures(mockTasks, mockSkills, mockResearchData);
    const adjustment = model.calculateAdjustedWeights('occupation-1', features);
    
    // Create a deep copy of the original weights for comparison
    const originalWeights = JSON.parse(JSON.stringify(adjustment.adjustedWeights));
    
    // Update the model with a significantly different score to force changes
    model.updateModel('occupation-1', 0.9); // High score to force adjustment
    
    // Calculate adjusted weights again
    const newAdjustment = model.calculateAdjustedWeights('occupation-1', features);
    
    // Verify at least one weight has changed by comparing with original values
    const weightKeys: Array<keyof typeof newAdjustment.adjustedWeights> = [
      'taskComplexity', 
      'collaborationRequirements', 
      'industryAdoption', 
      'emergingTechImpact', 
      'regionalFactors'
    ];
    
    // Check if any weight has changed significantly
    let hasChangedWeights = false;
    for (const key of weightKeys) {
      if (Math.abs(newAdjustment.adjustedWeights[key] - originalWeights[key]) > 0.001) {
        hasChangedWeights = true;
        break;
      }
    }
    
    expect(hasChangedWeights).toBe(true);
  });
});
