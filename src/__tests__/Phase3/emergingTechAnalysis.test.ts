import {
  analyzeEmergingTechnology,
  calculateAutomationRisk,
  calculateAugmentationPotential,
  calculateSkillTransferability
} from '../../utils/emergingTechAnalysis';
import { EmergingTechnology } from '../../types/emergingTech';

describe('Emerging Technology Analysis', () => {
  const mockTechnology: EmergingTechnology = {
    id: 'ai-ml-001',
    name: 'Advanced Machine Learning',
    category: 'AI_ML',
    maturityLevel: 'Growth',
    impactScore: 0.85,
    timeToMainstream: 18,
    skillRequirements: [
      {
        skillName: 'Machine Learning',
        proficiencyLevel: 0.8,
        demandTrend: 'increasing',
        availabilityScore: 0.6,
        timeToAcquire: 12
      },
      {
        skillName: 'Python Programming',
        proficiencyLevel: 0.7,
        demandTrend: 'stable',
        availabilityScore: 0.8,
        timeToAcquire: 6
      }
    ],
    industryImpacts: [
      {
        industry: 'Technology',
        disruptionLevel: 0.9,
        adoptionRate: 0.7,
        jobsAffected: {
          created: 1000,
          modified: 5000,
          displaced: 2000
        },
        timelineToImpact: 12,
        barriers: ['Skill gaps', 'Implementation costs'],
        opportunities: ['New markets', 'Efficiency gains']
      }
    ],
    disruptionPotential: {
      processAutomation: 0.8,
      decisionAugmentation: 0.9,
      skillObsolescence: 0.6,
      newCapabilityCreation: 0.85,
      marketRestructuring: 0.7
    },
    implementationFactors: {
      costFactor: {
        initialInvestment: 500000,
        ongoingCosts: 100000,
        roi: 2.5,
        paybackPeriod: 18
      },
      infrastructureRequirements: {
        hardware: ['GPU clusters', 'High-performance servers'],
        software: ['ML frameworks', 'Data processing tools'],
        connectivity: ['High-speed internet', '5G'],
        compliance: ['Data privacy', 'Model governance']
      },
      organizationalReadiness: {
        technicalCapability: 0.7,
        changeManagement: 0.6,
        resourceAvailability: 0.8,
        culturalAlignment: 0.65
      },
      risks: {
        technical: ['Model accuracy', 'Data quality'],
        operational: ['Integration challenges', 'Process disruption'],
        financial: ['Cost overruns', 'Uncertain ROI'],
        strategic: ['Market timing', 'Competitive response']
      }
    },
    marketProjections: [
      {
        year: 2024,
        marketSize: 50000,
        growthRate: 25,
        adoptionRate: 0.4,
        confidence: 0.85,
        keyDrivers: ['Digital transformation', 'Cost reduction'],
        potentialBarriers: ['Skills shortage', 'Budget constraints']
      }
    ],
    relatedTechnologies: ['deep-learning-001', 'nlp-002']
  };

  const currentSkills = ['Python Programming', 'Data Analysis'];
  const industryContext = 'Technology';

  describe('analyzeEmergingTechnology', () => {
    it('should return a complete analysis', () => {
      const analysis = analyzeEmergingTechnology(
        mockTechnology,
        currentSkills,
        industryContext
      );

      expect(analysis).toHaveProperty('jobImpact');
      expect(analysis).toHaveProperty('skillGapAnalysis');
      expect(analysis).toHaveProperty('implementationReadiness');
      expect(analysis).toHaveProperty('timelineProjection');
    });

    it('should calculate correct job impact scores', () => {
      const analysis = analyzeEmergingTechnology(
        mockTechnology,
        currentSkills,
        industryContext
      );

      expect(analysis.jobImpact.automationRisk).toBeGreaterThan(0);
      expect(analysis.jobImpact.automationRisk).toBeLessThanOrEqual(1);
      expect(analysis.jobImpact.augmentationPotential).toBeGreaterThan(0);
      expect(analysis.jobImpact.augmentationPotential).toBeLessThanOrEqual(1);
    });

    it('should identify skill gaps correctly', () => {
      const analysis = analyzeEmergingTechnology(
        mockTechnology,
        currentSkills,
        industryContext
      );

      const missingSkills = mockTechnology.skillRequirements
        .filter(skill => !currentSkills.includes(skill.skillName))
        .map(skill => skill.skillName);

      expect(analysis.skillGapAnalysis.requiredSkills).toEqual(
        expect.arrayContaining(missingSkills)
      );
    });

    it('should generate implementation recommendations', () => {
      const analysis = analyzeEmergingTechnology(
        mockTechnology,
        currentSkills,
        industryContext
      );

      expect(analysis.implementationReadiness.recommendations).toBeInstanceOf(Array);
      expect(analysis.implementationReadiness.recommendations.length).toBeGreaterThan(0);
      
      analysis.implementationReadiness.recommendations.forEach(rec => {
        expect(rec).toHaveProperty('category');
        expect(rec).toHaveProperty('priority');
        expect(rec).toHaveProperty('action');
        expect(rec).toHaveProperty('timeline');
      });
    });

    it('should create a realistic timeline projection', () => {
      const analysis = analyzeEmergingTechnology(
        mockTechnology,
        currentSkills,
        industryContext
      );

      expect(analysis.timelineProjection.totalDuration).toBeGreaterThan(0);
      expect(analysis.timelineProjection.phases.length).toBeGreaterThan(0);
      expect(analysis.timelineProjection.confidenceLevel).toBeGreaterThan(0);
      expect(analysis.timelineProjection.confidenceLevel).toBeLessThanOrEqual(1);
    });
  });

  describe('Risk and Potential Calculations', () => {
    it('should calculate automation risk correctly', () => {
      const risk = calculateAutomationRisk(mockTechnology, mockTechnology.industryImpacts[0]);
      
      expect(risk).toBeGreaterThan(0);
      expect(risk).toBeLessThanOrEqual(1);
      expect(risk).toBeCloseTo(0.7, 1); // Expected based on mock data
    });

    it('should calculate augmentation potential correctly', () => {
      const potential = calculateAugmentationPotential(
        mockTechnology,
        mockTechnology.industryImpacts[0]
      );
      
      expect(potential).toBeGreaterThan(0);
      expect(potential).toBeLessThanOrEqual(1);
      expect(potential).toBeCloseTo(0.8, 1); // Expected based on mock data
    });

    it('should calculate skill transferability correctly', () => {
      const transferability = calculateSkillTransferability(mockTechnology);
      
      expect(transferability).toBeGreaterThan(0);
      expect(transferability).toBeLessThanOrEqual(1);
    });
  });
});
