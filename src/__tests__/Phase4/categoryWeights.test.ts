import {
  defaultCategoryWeights,
  validateWeights,
  adjustWeightsByIndustry,
  calculateWeightedScore,
  calculateCategoryImpact,
  suggestWeightOptimization,
  industryWeightProfiles
} from '../../utils/categoryWeights';
import { CategoryWeight } from '../../types/skills';

describe('Category Weights', () => {
  const sampleScores = {
    tasks: 0.8,
    knowledge: 0.7,
    skills: 0.9,
    abilities: 0.6,
    technologies: 0.75
  };

  describe('validateWeights', () => {
    it('should validate correct weights', () => {
      expect(validateWeights(defaultCategoryWeights)).toBe(true);
    });

    it('should invalidate incorrect weights', () => {
      const invalidWeights: CategoryWeight = {
        tasks: 0.3,
        knowledge: 0.3,
        skills: 0.3,
        abilities: 0.3,
        technologies: 0.3
      };
      expect(validateWeights(invalidWeights)).toBe(false);
    });
  });

  describe('adjustWeightsByIndustry', () => {
    it('should adjust weights for technology industry', () => {
      const adjusted = adjustWeightsByIndustry(defaultCategoryWeights, 'Technology');
      expect(validateWeights(adjusted)).toBe(true);
      expect(adjusted.technologies).toBeGreaterThan(defaultCategoryWeights.technologies);
      expect(adjusted.skills).toBeGreaterThan(defaultCategoryWeights.skills);
    });

    it('should adjust weights for healthcare industry', () => {
      const adjusted = adjustWeightsByIndustry(defaultCategoryWeights, 'Healthcare');
      expect(validateWeights(adjusted)).toBe(true);
      expect(adjusted.knowledge).toBeGreaterThan(defaultCategoryWeights.knowledge);
      expect(adjusted.abilities).toBeGreaterThan(defaultCategoryWeights.abilities);
    });

    it('should maintain default weights for unknown industry', () => {
      const adjusted = adjustWeightsByIndustry(defaultCategoryWeights, 'Unknown');
      expect(adjusted).toEqual(defaultCategoryWeights);
    });
  });

  describe('calculateWeightedScore', () => {
    it('should calculate correct weighted score', () => {
      const expectedScore = Object.entries(defaultCategoryWeights).reduce(
        (total, [category, weight]) => total + sampleScores[category as keyof CategoryWeight] * weight,
        0
      );
      
      const score = calculateWeightedScore(sampleScores, defaultCategoryWeights);
      expect(score).toBeCloseTo(expectedScore, 5);
    });

    it('should handle different weight distributions', () => {
      const customWeights: CategoryWeight = {
        tasks: 0.4,
        knowledge: 0.3,
        skills: 0.2,
        abilities: 0.05,
        technologies: 0.05
      };
      
      const score = calculateWeightedScore(sampleScores, customWeights);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(1);
    });
  });

  describe('calculateCategoryImpact', () => {
    it('should calculate correct impact distribution', () => {
      const impacts = calculateCategoryImpact(sampleScores, defaultCategoryWeights);
      
      // Sum of impacts should be approximately 1
      const totalImpact = Object.values(impacts).reduce((sum, impact) => sum + impact, 0);
      expect(totalImpact).toBeCloseTo(1, 5);

      // Each impact should be between 0 and 1
      Object.values(impacts).forEach(impact => {
        expect(impact).toBeGreaterThan(0);
        expect(impact).toBeLessThan(1);
      });
    });

    it('should reflect weight changes in impact calculations', () => {
      const techWeights = adjustWeightsByIndustry(defaultCategoryWeights, 'Technology');
      const impacts = calculateCategoryImpact(sampleScores, techWeights);
      
      // Technology impact should be higher with tech weights
      expect(impacts.technologies).toBeGreaterThan(
        calculateCategoryImpact(sampleScores, defaultCategoryWeights).technologies
      );
    });
  });

  describe('suggestWeightOptimization', () => {
    it('should suggest optimized weights for better performance', () => {
      const currentWeights: CategoryWeight = {
        tasks: 0.3,
        knowledge: 0.2,
        skills: 0.2,
        abilities: 0.15,
        technologies: 0.15
      };

      const optimized = suggestWeightOptimization(currentWeights, sampleScores, 'Technology');
      
      // Optimized weights should be valid
      expect(validateWeights(optimized)).toBe(true);
      
      // Should shift towards industry profile for better performance
      expect(optimized.technologies).toBeGreaterThan(currentWeights.technologies);
      expect(optimized.skills).toBeGreaterThan(currentWeights.skills);
    });

    it('should maintain current weights if they perform better', () => {
      // Create scores that favor current weights
      const specializedScores = {
        tasks: 0.9,
        knowledge: 0.5,
        skills: 0.5,
        abilities: 0.5,
        technologies: 0.5
      };

      const currentWeights: CategoryWeight = {
        tasks: 0.4,
        knowledge: 0.15,
        skills: 0.15,
        abilities: 0.15,
        technologies: 0.15
      };

      const optimized = suggestWeightOptimization(currentWeights, specializedScores, 'Technology');
      expect(optimized).toEqual(currentWeights);
    });
  });

  describe('industryWeightProfiles', () => {
    it('should have valid weights for all industries', () => {
      Object.entries(industryWeightProfiles).forEach(([industry, weights]) => {
        const adjusted = adjustWeightsByIndustry(defaultCategoryWeights, industry);
        expect(validateWeights(adjusted)).toBe(true);
      });
    });

    it('should have distinct profiles for different industries', () => {
      const industries = Object.keys(industryWeightProfiles);
      for (let i = 0; i < industries.length; i++) {
        for (let j = i + 1; j < industries.length; j++) {
          const profile1 = adjustWeightsByIndustry(defaultCategoryWeights, industries[i]);
          const profile2 = adjustWeightsByIndustry(defaultCategoryWeights, industries[j]);
          expect(profile1).not.toEqual(profile2);
        }
      }
    });
  });
});
