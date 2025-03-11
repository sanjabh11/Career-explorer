/**
 * Skill Impact Analyzer Tests
 * Version 1.0
 */

import { SkillImpactAnalyzer } from '../../utils/skills/SkillImpactAnalyzer';
import { Skill } from '../../types/skills';
import { AutomationResearchData } from '../../types/research';
import { OccupationAnalysis } from '../../types/semantic';

// Mock data
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
  },
  {
    id: 'skill-4',
    name: 'Critical Thinking',
    category: 'cognitive',
    description: 'Analyzing facts to form a judgment through objective evaluation of issues'
  },
  {
    id: 'skill-5',
    name: 'Manual Data Entry',
    category: 'physical',
    description: 'Inputting data into computer systems with accuracy and efficiency'
  }
];

// Mock occupation analysis
const mockOccupationAnalysis: OccupationAnalysis = {
  id: 'analysis-123',
  occupationId: '15-1133.00',
  occupationTitle: 'Software Developer',
  semanticRanking: {
    automationPotential: 0.35,
    skillsAnalysis: {
      technicalSkills: 0.4,
      softSkills: 0.2,
      cognitiveSkills: 0.3,
      physicalSkills: 0.1
    },
    taskAnalysis: {
      repetitiveTasksPercentage: 30,
      complexTasksPercentage: 50,
      creativeTasksPercentage: 20
    },
    confidenceScore: 0.85
  },
  skillAlternatives: [
    {
      id: 'skill-ml',
      name: 'Machine Learning',
      description: 'Application of AI that provides systems the ability to automatically learn and improve from experience',
      category: 'Technical',
      importance: 0.9
    }
  ],
  lastUpdated: new Date().toISOString(),
  taskRankings: [
    {
      taskId: 'task-1',
      taskDescription: 'Write code for software applications',
      automationScore: 0.4,
      confidenceScore: 0.8,
      timeHorizon: 5,
      requiredTechnologies: ['AI code generation'],
      barriers: ['Complex problem solving']
    }
  ],
  skillRankings: [
    {
      skillId: 'skill-1',
      skillName: 'JavaScript',
      automationScore: 0.3,
      confidenceScore: 0.7,
      timeHorizon: 7,
      emergingAlternatives: []
    }
  ],
  keyAutomationDrivers: ['AI advancements', 'Code generation tools'],
  keyAutomationBarriers: ['Complex problem solving', 'Creative thinking'],
  overallAutomationScore: 0.35,
  confidenceScore: 0.8,
  recommendedSkillDevelopment: [
    {
      id: 'skill-ai',
      name: 'AI Integration',
      description: 'Ability to integrate AI solutions into software applications',
      category: 'Technical',
      importance: 0.9
    }
  ]
};

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

describe('SkillImpactAnalyzer', () => {
  let analyzer: SkillImpactAnalyzer;

  beforeEach(() => {
    analyzer = new SkillImpactAnalyzer();
  });

  test('should analyze skills with granular assessment', () => {
    const results = analyzer.analyzeSkillsGranular(
      mockSkills,
      mockOccupationAnalysis,
      mockResearchData
    );
    
    // Verify results structure
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(mockSkills.length);
    
    results.forEach((result, index) => {
      // Verify result structure
      expect(result).toHaveProperty('skill');
      expect(result).toHaveProperty('overallScore');
      expect(result).toHaveProperty('confidenceScore');
      expect(result).toHaveProperty('timeHorizon');
      expect(result).toHaveProperty('components');
      expect(result).toHaveProperty('alternativeSkills');
      expect(result).toHaveProperty('developmentPath');
      expect(result).toHaveProperty('resilience');
      
      // Verify skill data
      expect(result.skill).toEqual(mockSkills[index]);
      
      // Verify score ranges
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(1);
      expect(result.confidenceScore).toBeGreaterThanOrEqual(0);
      expect(result.confidenceScore).toBeLessThanOrEqual(1);
      expect(result.timeHorizon).toBeGreaterThanOrEqual(0);
      expect(result.resilience).toBeGreaterThanOrEqual(0);
      expect(result.resilience).toBeLessThanOrEqual(1);
      
      // Verify components
      expect(Array.isArray(result.components)).toBe(true);
      expect(result.components.length).toBeGreaterThanOrEqual(3);
      expect(result.components.length).toBeLessThanOrEqual(5);
      
      result.components.forEach(component => {
        expect(component).toHaveProperty('name');
        expect(component).toHaveProperty('description');
        expect(component).toHaveProperty('automationScore');
        expect(component).toHaveProperty('confidenceScore');
        expect(component).toHaveProperty('timeHorizon');
        expect(component.automationScore).toBeGreaterThanOrEqual(0);
        expect(component.automationScore).toBeLessThanOrEqual(1);
        expect(component.confidenceScore).toBeGreaterThanOrEqual(0);
        expect(component.confidenceScore).toBeLessThanOrEqual(1);
        expect(component.timeHorizon).toBeGreaterThanOrEqual(0);
      });
      
      // Verify alternative skills
      expect(Array.isArray(result.alternativeSkills)).toBe(true);
      expect(result.alternativeSkills.length).toBeGreaterThanOrEqual(1);
      expect(result.alternativeSkills.length).toBeLessThanOrEqual(3);
      
      result.alternativeSkills.forEach(skill => {
        expect(skill).toHaveProperty('id');
        expect(skill).toHaveProperty('name');
        expect(skill).toHaveProperty('category');
        expect(skill).toHaveProperty('description');
      });
      
      // Verify development path
      expect(result.developmentPath).toHaveProperty('targetSkill');
      expect(result.developmentPath).toHaveProperty('milestones');
      expect(result.developmentPath).toHaveProperty('estimatedTimeToMastery');
      expect(result.developmentPath).toHaveProperty('complementarySkills');
      
      expect(Array.isArray(result.developmentPath.milestones)).toBe(true);
      expect(result.developmentPath.milestones.length).toBeGreaterThanOrEqual(1);
      
      result.developmentPath.milestones.forEach(milestone => {
        expect(milestone).toHaveProperty('name');
        expect(milestone).toHaveProperty('description');
        expect(milestone).toHaveProperty('timeframe');
        expect(milestone).toHaveProperty('resources');
        expect(Array.isArray(milestone.resources)).toBe(true);
      });
      
      expect(Array.isArray(result.developmentPath.complementarySkills)).toBe(true);
    });
  });

  test('should cluster skills based on automation potential', () => {
    const skillsAnalysis = analyzer.analyzeSkillsGranular(
      mockSkills,
      mockOccupationAnalysis,
      mockResearchData
    );
    
    const clusters = analyzer.clusterSkills(skillsAnalysis);
    
    // Verify clusters structure
    expect(Array.isArray(clusters)).toBe(true);
    expect(clusters.length).toBeGreaterThanOrEqual(1);
    
    clusters.forEach(cluster => {
      // Verify cluster structure
      expect(cluster).toHaveProperty('name');
      expect(cluster).toHaveProperty('description');
      expect(cluster).toHaveProperty('skills');
      expect(cluster).toHaveProperty('averageAutomationScore');
      expect(cluster).toHaveProperty('averageTimeHorizon');
      expect(cluster).toHaveProperty('trendDirection');
      
      // Verify skills
      expect(Array.isArray(cluster.skills)).toBe(true);
      expect(cluster.skills.length).toBeGreaterThanOrEqual(1);
      
      // Verify score ranges
      expect(cluster.averageAutomationScore).toBeGreaterThanOrEqual(0);
      expect(cluster.averageAutomationScore).toBeLessThanOrEqual(1);
      expect(cluster.averageTimeHorizon).toBeGreaterThanOrEqual(0);
      
      // Verify trend direction
      expect(['increasing', 'stable', 'decreasing']).toContain(cluster.trendDirection);
    });
  });

  test('should analyze skill gaps', () => {
    // Create a subset of skills for current skills
    const currentSkills = mockSkills.slice(0, 3);
    
    // Use all skills as required skills
    const requiredSkills = mockSkills;
    
    const gapAnalysis = analyzer.analyzeSkillGaps(currentSkills, requiredSkills);
    
    // Verify gap analysis structure
    expect(gapAnalysis).toHaveProperty('currentSkills');
    expect(gapAnalysis).toHaveProperty('missingCriticalSkills');
    expect(gapAnalysis).toHaveProperty('skillGaps');
    expect(gapAnalysis).toHaveProperty('overallGapScore');
    
    // Verify skills
    expect(gapAnalysis.currentSkills).toEqual(currentSkills);
    expect(Array.isArray(gapAnalysis.missingCriticalSkills)).toBe(true);
    expect(gapAnalysis.missingCriticalSkills.length).toBe(requiredSkills.length - currentSkills.length);
    
    // Verify skill gaps
    expect(Array.isArray(gapAnalysis.skillGaps)).toBe(true);
    expect(gapAnalysis.skillGaps.length).toBeGreaterThanOrEqual(1);
    
    gapAnalysis.skillGaps.forEach(gap => {
      expect(gap).toHaveProperty('category');
      expect(gap).toHaveProperty('currentLevel');
      expect(gap).toHaveProperty('requiredLevel');
      expect(gap).toHaveProperty('gap');
      expect(gap).toHaveProperty('recommendedActions');
      
      expect(gap.currentLevel).toBeGreaterThanOrEqual(0);
      expect(gap.currentLevel).toBeLessThanOrEqual(1);
      expect(gap.requiredLevel).toBeGreaterThanOrEqual(0);
      expect(gap.requiredLevel).toBeLessThanOrEqual(1);
      expect(gap.gap).toBeGreaterThanOrEqual(0);
      expect(gap.gap).toBeLessThanOrEqual(1);
      
      expect(Array.isArray(gap.recommendedActions)).toBe(true);
    });
    
    // Verify overall gap score
    expect(gapAnalysis.overallGapScore).toBeGreaterThanOrEqual(0);
    expect(gapAnalysis.overallGapScore).toBeLessThanOrEqual(1);
  });
});
