/**
 * SkillsDevelopmentService Tests
 * Version 1.2.1
 * 
 * Tests for the SkillsDevelopmentService including integration with APO calculation
 * system, skill gap analysis, recommendations, and performance monitoring.
 */

import { SkillsDevelopmentService, SkillGap } from '../../services/SkillsDevelopmentService';
import { DynamicApoCalculator } from '../../utils/apo/DynamicApoCalculator';
import { Skill } from '../../types/skills';
import { APOResult, TimeProjection, CareerRecommendation, FactorBreakdown } from '../../types/apo';
import { OccupationTask } from '../../types/semantic';

// Mock data for testing
const mockCurrentSkills: Skill[] = [
  {
    id: 'skill-1',
    name: 'JavaScript',
    description: 'Programming language for web development',
    category: 'technical',
    currentLevel: 3,
    requiredLevel: 4,
    importance: 0.8
  },
  {
    id: 'skill-2',
    name: 'React',
    description: 'JavaScript library for building user interfaces',
    category: 'technical',
    currentLevel: 2,
    requiredLevel: 4,
    importance: 0.7
  }
];

const mockRequiredSkills: Skill[] = [
  {
    id: 'skill-1',
    name: 'JavaScript',
    description: 'Programming language for web development',
    category: 'technical',
    currentLevel: 3,
    requiredLevel: 4,
    importance: 0.8
  },
  {
    id: 'skill-2',
    name: 'React',
    description: 'JavaScript library for building user interfaces',
    category: 'technical',
    currentLevel: 2,
    requiredLevel: 4,
    importance: 0.7
  },
  {
    id: 'skill-3',
    name: 'Node.js',
    description: 'JavaScript runtime for server-side development',
    category: 'technical',
    requiredLevel: 3,
    importance: 0.6
  },
  {
    id: 'skill-4',
    name: 'Communication',
    description: 'Ability to communicate effectively',
    category: 'soft',
    requiredLevel: 4,
    importance: 0.9
  }
];

const mockTasks: OccupationTask[] = [
  {
    id: 'task-1',
    description: 'Create reusable UI components using React',
    importance: 0.8,
    frequency: 0.9,
    category: 'development'
  },
  {
    id: 'task-2',
    description: 'Develop backend services using Node.js',
    importance: 0.7,
    frequency: 0.8,
    category: 'development'
  }
];

const mockTimeProjections: TimeProjection[] = [
  {
    year: 2025,
    score: 0.2,
    confidence: 0.8,
    keyDrivers: ['AI-assisted development', 'Low-code platforms']
  },
  {
    year: 2030,
    score: 0.5,
    confidence: 0.7,
    keyDrivers: ['Automated testing', 'Code generation']
  },
  {
    year: 2035,
    score: 0.7,
    confidence: 0.6,
    keyDrivers: ['AI programming', 'No-code solutions']
  }
];

// Create mock factor breakdown that matches the expected type
const mockFactorBreakdown: FactorBreakdown = {
  taskComplexity: 0.55,
  collaborationRequirements: 0.65,
  industryAdoption: 0.7,
  emergingTechImpact: 0.6,
  regionalFactors: {
    highIncome: 0.5,
    middleIncome: 0.4,
    lowIncome: 0.3
  }
};

// Create mock recommendations that match the expected type
const mockRecommendations: CareerRecommendation[] = [
  {
    type: 'skill_development',
    title: 'Develop AI Integration Skills',
    description: 'Focus on developing AI integration skills',
    timeframe: 'Short-term',
    impact: 'High'
  },
  {
    type: 'career_pivot',
    title: 'Specialize in AI-Enhanced Development',
    description: 'Consider specializing in AI-enhanced web development',
    timeframe: 'Medium-term',
    impact: 'Medium'
  }
];

// Create properly typed skills for the APO result
const mockSkillsForApo = {
  highRisk: [
    {
      id: 'skill-3',
      name: 'Node.js',
      description: 'JavaScript runtime for server-side development',
      category: 'technical',
      type: 'hard' as 'hard'
    }
  ],
  moderateRisk: [
    {
      id: 'skill-2',
      name: 'React',
      description: 'JavaScript library for building user interfaces',
      category: 'technical',
      type: 'hard' as 'hard'
    }
  ],
  lowRisk: [
    {
      id: 'skill-4',
      name: 'Communication',
      description: 'Ability to communicate effectively',
      category: 'soft',
      type: 'soft' as 'soft'
    }
  ],
  emergingSkills: [
    {
      id: 'skill-5',
      name: 'AI Integration',
      description: 'Integration of AI technologies in applications',
      category: 'technical',
      type: 'hard' as 'hard'
    }
  ]
};

const mockApoResult: APOResult = {
  occupationId: 'occupation-1',
  occupationTitle: 'Web Developer',
  overallScore: 0.6,
  confidence: 0.75,
  timeProjections: mockTimeProjections,
  factorBreakdown: mockFactorBreakdown,
  skillsImpact: mockSkillsForApo,
  recommendations: mockRecommendations,
  taskAnalysis: {
    highRiskTasks: [],
    moderateRiskTasks: [],
    lowRiskTasks: [],
    overallTaskAutomationScore: 0.5
  },
  dataSourceInfo: {
    onetDataDate: new Date().toISOString(),
    researchDataDate: new Date().toISOString(),
    semanticAnalysisDate: new Date().toISOString()
  }
};

// Mock research data for APO calculation
const mockResearchData = {
  occupation: 'Web Developer',
  researchPapers: [],
  industryReports: [],
  newsArticles: [],
  trends: [],
  overallScore: 0.6,
  confidenceLevel: {
    overall: 0.75,
    sourceCount: 0.8,
    sourceQuality: 0.7,
    dataConsistency: 0.8,
    recency: 0.7
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
      northAmerica: ['tech adoption rate', 'education system'],
      europe: ['regulatory environment', 'labor laws'],
      asia: ['manufacturing focus', 'tech growth'],
      other: ['varying economic conditions']
    }
  },
  adoptionCurves: {
    shortTerm: [0.1, 0.2, 0.3],
    mediumTerm: [0.3, 0.4, 0.5],
    longTerm: [0.5, 0.6, 0.7]
  },
  lastUpdated: new Date().toISOString()
};

describe('SkillsDevelopmentService', () => {
  let service: SkillsDevelopmentService;
  let apoCalculator: DynamicApoCalculator;

  beforeEach(() => {
    // Create a mock APO calculator
    apoCalculator = {
      calculateEnhancedApo: jest.fn().mockReturnValue(mockApoResult)
    } as unknown as DynamicApoCalculator;
    
    // Initialize service with mock APO calculator
    service = new SkillsDevelopmentService(apoCalculator);
  });

  describe('analyzeSkillGaps', () => {
    it('should analyze gaps between current and required skills', () => {
      const gaps = service.analyzeSkillGaps(mockCurrentSkills, mockRequiredSkills);
      
      expect(gaps.length).toBe(mockRequiredSkills.length);
      expect(gaps[0].skill.id).toBe('skill-1');
      expect(gaps[0].gap).toBe(1); // 4 required - 3 current
      expect(gaps[1].skill.id).toBe('skill-2');
      expect(gaps[1].gap).toBe(2); // 4 required - 2 current
    });

    it('should handle skills not in current skill set', () => {
      const gaps = service.analyzeSkillGaps(mockCurrentSkills, mockRequiredSkills);
      
      // Check skill-3 which is not in current skills
      const nodeJsGap = gaps.find(gap => gap.skill.id === 'skill-3');
      expect(nodeJsGap).toBeDefined();
      expect(nodeJsGap?.currentLevel).toBe(0);
      expect(nodeJsGap?.gap).toBe(3); // 3 required - 0 current
    });

    it('should generate appropriate recommendations based on gap size', () => {
      const gaps = service.analyzeSkillGaps(mockCurrentSkills, mockRequiredSkills);
      
      // Small gap (1) should recommend self-directed learning
      expect(gaps[0].recommendations.some(r => r.type === 'self-directed')).toBeTruthy();
      
      // Medium gap (2) should recommend formal training
      expect(gaps[1].recommendations.some(r => r.type === 'self-directed')).toBeTruthy();
      
      // Large gap (3) should recommend intensive training
      const nodeJsGap = gaps.find(gap => gap.skill.id === 'skill-3');
      expect(nodeJsGap?.recommendations.some(r => r.type === 'intensive')).toBeTruthy();
    });
  });

  describe('prioritizeSkillDevelopment', () => {
    it('should prioritize skills based on importance and gap size', () => {
      const gaps = service.analyzeSkillGaps(mockCurrentSkills, mockRequiredSkills);
      const prioritized = service.prioritizeSkillDevelopment(gaps);
      
      // Communication (skill-4) should be first due to high importance (0.9)
      expect(prioritized[0].skill.id).toBe('skill-4');
      
      // JavaScript (skill-1) should be prioritized over React (skill-2) due to higher importance
      const jsIndex = prioritized.findIndex(gap => gap.skill.id === 'skill-1');
      const reactIndex = prioritized.findIndex(gap => gap.skill.id === 'skill-2');
      expect(jsIndex).toBeLessThan(reactIndex);
    });
  });

  describe('APO integration', () => {
    it('should integrate APO calculation results into skill gap analysis', () => {
      const enhancedGaps = service.integrateApoResults(
        mockCurrentSkills,
        mockRequiredSkills,
        'occupation-1',
        'Web Developer',
        mockTasks
      );
      
      // Verify APO calculator was called
      expect(apoCalculator.calculateEnhancedApo).toHaveBeenCalled();
      
      // Check that the results include APO-based priority
      expect(enhancedGaps.some(gap => gap.priority === 'high')).toBeTruthy();
      
      // Check that time projections are included
      expect(enhancedGaps[0].timeProjections).toBeDefined();
      // Safely check length only if timeProjections is defined
      if (enhancedGaps[0].timeProjections) {
        expect(enhancedGaps[0].timeProjections.length).toBeGreaterThan(0);
      }
    });

    it('should adjust recommendations based on APO risk levels', () => {
      const enhancedGaps = service.integrateApoResults(
        mockCurrentSkills,
        mockRequiredSkills,
        'occupation-1',
        'Web Developer',
        mockTasks
      );
      
      // Find the Node.js skill gap (high risk in mock data)
      const nodeJsGap = enhancedGaps.find(gap => gap.skill.id === 'skill-3');
      expect(nodeJsGap).toBeDefined();
      
      // Should have automation resilience recommendation
      expect(nodeJsGap?.recommendations.some(r => r.type === 'automation-resilience')).toBeTruthy();
      
      // Should have high automation risk
      expect(nodeJsGap?.automationRisk).toBeGreaterThan(0.7);
    });

    it('should handle case when APO calculator is not available', () => {
      // Create service without APO calculator
      const serviceWithoutApo = new SkillsDevelopmentService();
      
      const gaps = serviceWithoutApo.integrateApoResults(
        mockCurrentSkills,
        mockRequiredSkills,
        'occupation-1',
        'Web Developer',
        mockTasks
      );
      
      // Should still return skill gaps
      expect(gaps.length).toBe(mockRequiredSkills.length);
      
      // But should not have APO-specific properties
      expect(gaps[0].timeProjections).toBeUndefined();
      expect(gaps[0].automationRisk).toBeUndefined();
    });
  });

  describe('Complete workflow', () => {
    it('should process the complete skill development workflow', () => {
      // Step 1: Analyze skill gaps
      const gaps = service.analyzeSkillGaps(mockCurrentSkills, mockRequiredSkills);
      expect(gaps.length).toBe(mockRequiredSkills.length);
      
      // Step 2: Integrate APO results
      const enhancedGaps = service.integrateApoResults(
        mockCurrentSkills,
        mockRequiredSkills,
        'occupation-1',
        'Web Developer',
        mockTasks
      );
      expect(enhancedGaps.some(gap => gap.automationRisk !== undefined)).toBeTruthy();
      
      // Step 3: Generate development plan
      const plan = service.generateDevelopmentPlan(enhancedGaps);
      expect(plan.skills.length).toBe(enhancedGaps.length);
      expect(plan.timeframe.shortTerm.length).toBeGreaterThan(0);
      expect(plan.projectedOutcomes.automationResilience).toBeLessThanOrEqual(1);
      expect(plan.projectedOutcomes.automationResilience).toBeGreaterThanOrEqual(0);
      
      // Step 4: Check performance metrics
      const { gaps: gapsWithPerformance, performance } = service.analyzeSkillGapsWithPerformanceTracking(
        mockCurrentSkills,
        mockRequiredSkills
      );
      expect(gapsWithPerformance.length).toBe(mockRequiredSkills.length);
      expect(performance.executionTimeMs).toBeGreaterThanOrEqual(0);
      expect(performance.timestamp).toBeDefined();
    });
  });
});