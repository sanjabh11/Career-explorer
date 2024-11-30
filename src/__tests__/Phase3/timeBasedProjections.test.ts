import {
  calculateTimeBasedAPO,
  projectTechnologyImpact,
  assessTechnologyMaturity
} from '../../utils/timeBasedAnalysis';
import { EmergingTechnology } from '../../types/emergingTech';

describe('Time-Based Analysis', () => {
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
        barriers: ['Skill gaps'],
        opportunities: ['New markets']
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
        hardware: ['GPU clusters'],
        software: ['ML frameworks'],
        connectivity: ['High-speed internet'],
        compliance: ['Data privacy']
      },
      organizationalReadiness: {
        technicalCapability: 0.7,
        changeManagement: 0.6,
        resourceAvailability: 0.8,
        culturalAlignment: 0.65
      },
      risks: {
        technical: ['Model accuracy'],
        operational: ['Integration challenges'],
        financial: ['Cost overruns'],
        strategic: ['Market timing']
      }
    },
    marketProjections: [
      {
        year: 2024,
        marketSize: 50000,
        growthRate: 25,
        adoptionRate: 0.4,
        confidence: 0.85,
        keyDrivers: ['Digital transformation'],
        potentialBarriers: ['Skills shortage']
      }
    ],
    relatedTechnologies: ['deep-learning-001']
  };

  describe('Time-Based APO Projections', () => {
    it('should calculate future APO scores correctly', () => {
      const baseAPO = 0.65;
      const projectionYears = 5;
      
      const projections = calculateTimeBasedAPO(baseAPO, mockTechnology, projectionYears);
      
      expect(projections).toHaveLength(projectionYears);
      projections.forEach(projection => {
        expect(projection.score).toBeGreaterThanOrEqual(baseAPO);
        expect(projection.score).toBeLessThanOrEqual(1);
        expect(projection).toHaveProperty('year');
        expect(projection).toHaveProperty('confidence');
      });
    });

    it('should account for technology maturity in projections', () => {
      const baseAPO = 0.65;
      const projectionYears = 5;
      
      const projections = calculateTimeBasedAPO(baseAPO, mockTechnology, projectionYears);
      
      // Earlier years should have lower impact due to technology maturity
      expect(projections[0].score).toBeLessThan(projections[projectionYears - 1].score);
    });

    it('should handle historical data correlation', () => {
      const baseAPO = 0.65;
      const historicalData = [
        { year: 2020, score: 0.60 },
        { year: 2021, score: 0.62 },
        { year: 2022, score: 0.64 }
      ];
      
      const projections = calculateTimeBasedAPO(
        baseAPO,
        mockTechnology,
        3,
        historicalData
      );
      
      expect(projections[0].confidence).toBeGreaterThan(0.7);
    });
  });

  describe('Technology Impact Predictions', () => {
    it('should predict technology impact over time', () => {
      const impact = projectTechnologyImpact(mockTechnology, 5);
      
      expect(impact).toHaveProperty('shortTerm');
      expect(impact).toHaveProperty('mediumTerm');
      expect(impact).toHaveProperty('longTerm');
      expect(impact.shortTerm.confidence).toBeGreaterThan(impact.longTerm.confidence);
    });

    it('should validate impact predictions against industry data', () => {
      const industryData = {
        adoptionRate: 0.4,
        marketGrowth: 25,
        skillAvailability: 0.6
      };
      
      const impact = projectTechnologyImpact(mockTechnology, 5, industryData);
      
      expect(impact.shortTerm.score).toBeCloseTo(
        mockTechnology.impactScore * industryData.adoptionRate,
        1
      );
    });
  });

  describe('Technology Maturity Assessment', () => {
    it('should assess technology maturity level correctly', () => {
      const assessment = assessTechnologyMaturity(mockTechnology);
      
      expect(assessment).toHaveProperty('currentLevel');
      expect(assessment).toHaveProperty('timeToNextLevel');
      expect(assessment).toHaveProperty('adoptionMetrics');
    });

    it('should validate adoption patterns', () => {
      const assessment = assessTechnologyMaturity(mockTechnology);
      
      expect(assessment.adoptionMetrics).toHaveProperty('currentAdoption');
      expect(assessment.adoptionMetrics).toHaveProperty('projectedGrowth');
      expect(assessment.adoptionMetrics).toHaveProperty('marketPenetration');
    });

    it('should calculate accurate maturity progression', () => {
      const assessment = assessTechnologyMaturity(mockTechnology);
      const futureAssessment = assessTechnologyMaturity(mockTechnology, 2); // 2 years in future
      
      expect(futureAssessment.currentLevel).toBeGreaterThanOrEqual(
        assessment.currentLevel
      );
    });
  });
});
