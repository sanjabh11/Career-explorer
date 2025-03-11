/**
 * Dynamic APO Calculator Tests
 * Version 1.0
 */

import { DynamicApoCalculator, ScenarioParams } from '../../utils/apo/DynamicApoCalculator';
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

// Mock scenarios
const mockScenarios: ScenarioParams[] = [
  {
    name: 'Accelerated Automation',
    description: 'Scenario with faster adoption of automation technologies',
    factorAdjustments: {
      industryAdoption: 1.5,
      emergingTechImpact: 1.3
    },
    timeHorizonYears: [2, 5, 10]
  },
  {
    name: 'Regulatory Constraints',
    description: 'Scenario with increased regulatory oversight slowing automation',
    factorAdjustments: {
      industryAdoption: 0.7,
      emergingTechImpact: 0.8
    },
    timeHorizonYears: [2, 5, 10]
  }
];

describe('DynamicApoCalculator', () => {
  let factorModel: FactorWeightingModel;
  let calculator: DynamicApoCalculator;

  beforeEach(() => {
    factorModel = new FactorWeightingModel();
    calculator = new DynamicApoCalculator(factorModel);
  });

  test('should calculate enhanced APO with time projections', () => {
    const result = calculator.calculateEnhancedApo(
      'occupation-1',
      'Data Analyst',
      mockTasks,
      mockSkills,
      mockResearchData
    );
    
    // Verify result structure
    expect(result).toHaveProperty('occupationId');
    expect(result).toHaveProperty('occupationTitle');
    expect(result).toHaveProperty('overallScore');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('timeProjections');
    expect(result).toHaveProperty('factorBreakdown');
    expect(result).toHaveProperty('skillsImpact');
    expect(result).toHaveProperty('recommendations');
    expect(result).toHaveProperty('dataSourceInfo');
    
    // Verify occupation data
    expect(result.occupationId).toBe('occupation-1');
    expect(result.occupationTitle).toBe('Data Analyst');
    
    // Verify score ranges
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(1);
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
    
    // Verify time projections
    expect(Array.isArray(result.timeProjections)).toBe(true);
    expect(result.timeProjections.length).toBe(3); // 2, 5, and 10 years
    
    result.timeProjections.forEach(projection => {
      expect(projection).toHaveProperty('year');
      expect(projection).toHaveProperty('score');
      expect(projection).toHaveProperty('confidence');
      expect(projection).toHaveProperty('keyDrivers');
      expect(projection.score).toBeGreaterThanOrEqual(0);
      expect(projection.score).toBeLessThanOrEqual(1);
      expect(projection.confidence).toBeGreaterThanOrEqual(0);
      expect(projection.confidence).toBeLessThanOrEqual(1);
      expect(Array.isArray(projection.keyDrivers)).toBe(true);
    });
    
    // Verify factor breakdown
    expect(result.factorBreakdown).toHaveProperty('taskComplexity');
    expect(result.factorBreakdown).toHaveProperty('collaborationRequirements');
    expect(result.factorBreakdown).toHaveProperty('industryAdoption');
    expect(result.factorBreakdown).toHaveProperty('emergingTechImpact');
    expect(result.factorBreakdown).toHaveProperty('regionalFactors');
    
    // Verify skills impact
    expect(result.skillsImpact).toHaveProperty('highRisk');
    expect(result.skillsImpact).toHaveProperty('moderateRisk');
    expect(result.skillsImpact).toHaveProperty('lowRisk');
    expect(result.skillsImpact).toHaveProperty('emergingSkills');
    expect(Array.isArray(result.skillsImpact.highRisk)).toBe(true);
    expect(Array.isArray(result.skillsImpact.moderateRisk)).toBe(true);
    expect(Array.isArray(result.skillsImpact.lowRisk)).toBe(true);
    expect(Array.isArray(result.skillsImpact.emergingSkills)).toBe(true);
    
    // Verify recommendations
    expect(Array.isArray(result.recommendations)).toBe(true);
    result.recommendations.forEach(recommendation => {
      expect(recommendation).toHaveProperty('type');
      expect(recommendation).toHaveProperty('title');
      expect(recommendation).toHaveProperty('description');
      expect(recommendation).toHaveProperty('timeframe');
      expect(recommendation).toHaveProperty('impact');
    });
  });

  test('should model scenarios for automation potential', () => {
    const results = calculator.modelScenarios(
      'occupation-1',
      'Data Analyst',
      mockTasks,
      mockSkills,
      mockResearchData,
      mockScenarios
    );
    
    // Verify results structure
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(mockScenarios.length);
    
    results.forEach((result, index) => {
      // Verify result structure
      expect(result).toHaveProperty('scenarioName');
      expect(result).toHaveProperty('scenarioDescription');
      expect(result).toHaveProperty('baselineScore');
      expect(result).toHaveProperty('adjustedScore');
      expect(result).toHaveProperty('timeProjections');
      expect(result).toHaveProperty('factorBreakdown');
      expect(result).toHaveProperty('confidenceScore');
      
      // Verify scenario data
      expect(result.scenarioName).toBe(mockScenarios[index].name);
      expect(result.scenarioDescription).toBe(mockScenarios[index].description);
      
      // Verify score ranges
      expect(result.baselineScore).toBeGreaterThanOrEqual(0);
      expect(result.baselineScore).toBeLessThanOrEqual(1);
      expect(result.adjustedScore).toBeGreaterThanOrEqual(0);
      expect(result.adjustedScore).toBeLessThanOrEqual(1);
      expect(result.confidenceScore).toBeGreaterThanOrEqual(0);
      expect(result.confidenceScore).toBeLessThanOrEqual(1);
      
      // Verify time projections
      expect(Array.isArray(result.timeProjections)).toBe(true);
      expect(result.timeProjections.length).toBe(mockScenarios[index].timeHorizonYears.length);
      
      result.timeProjections.forEach(projection => {
        expect(projection).toHaveProperty('year');
        expect(projection).toHaveProperty('score');
        expect(projection).toHaveProperty('confidence');
        expect(projection).toHaveProperty('keyDrivers');
        expect(projection.score).toBeGreaterThanOrEqual(0);
        expect(projection.score).toBeLessThanOrEqual(1);
        expect(projection.confidence).toBeGreaterThanOrEqual(0);
        expect(projection.confidence).toBeLessThanOrEqual(1);
        expect(Array.isArray(projection.keyDrivers)).toBe(true);
      });
      
      // Verify factor breakdown
      expect(result.factorBreakdown).toHaveProperty('taskComplexity');
      expect(result.factorBreakdown).toHaveProperty('collaborationRequirements');
      expect(result.factorBreakdown).toHaveProperty('industryAdoption');
      expect(result.factorBreakdown).toHaveProperty('emergingTechImpact');
      expect(result.factorBreakdown).toHaveProperty('regionalFactors');
    });
    
    // Verify that scenarios have different scores
    if (results.length > 1) {
      expect(results[0].adjustedScore).not.toBe(results[1].adjustedScore);
    }
  });
});
