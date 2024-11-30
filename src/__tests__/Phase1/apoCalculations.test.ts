import { calculateEnhancedAPO, calculateComplexityFactor, calculateHumanAICollaboration } from '../../utils/apoCalculations';
import { AutomationFactor } from '../../types/automation';

describe('Enhanced APO Calculations', () => {
  const mockTask: AutomationFactor = {
    id: 'test-1',
    name: 'Test Task',
    weight: 0.8,
    category: 'Analysis',
    complexity: 3,
    repetitiveness: 0.7,
    humanAICollaboration: 0.6,
    industrySpecific: false,
    emergingTechImpact: 0.5
  };

  describe('calculateEnhancedAPO', () => {
    it('should calculate correct APO score', () => {
      const result = calculateEnhancedAPO(mockTask);
      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThanOrEqual(1);
    });

    it('should include all required factors', () => {
      const result = calculateEnhancedAPO(mockTask);
      expect(result.factors).toHaveProperty('baseAPO');
      expect(result.factors).toHaveProperty('complexityFactor');
      expect(result.factors).toHaveProperty('collaborationFactor');
    });

    it('should handle edge cases', () => {
      const highComplexityTask = { ...mockTask, complexity: 5 };
      const result = calculateEnhancedAPO(highComplexityTask);
      expect(result.score).toBeLessThan(calculateEnhancedAPO(mockTask).score);
    });
  });

  describe('calculateComplexityFactor', () => {
    it('should return lower score for high complexity', () => {
      const highComplexity = calculateComplexityFactor(5);
      const lowComplexity = calculateComplexityFactor(1);
      expect(highComplexity).toBeLessThan(lowComplexity);
    });

    it('should handle invalid inputs', () => {
      expect(() => calculateComplexityFactor(6)).toThrow();
      expect(() => calculateComplexityFactor(0)).toThrow();
    });
  });

  describe('calculateHumanAICollaboration', () => {
    it('should return higher score for optimal collaboration', () => {
      const optimalCollab = calculateHumanAICollaboration(0.5);
      const lowCollab = calculateHumanAICollaboration(0.1);
      expect(optimalCollab).toBeGreaterThan(lowCollab);
    });

    it('should handle edge cases', () => {
      expect(calculateHumanAICollaboration(0)).toBe(0);
      expect(calculateHumanAICollaboration(1)).toBeGreaterThan(0);
    });
  });
});
