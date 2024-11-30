import { calculateEnhancedAPO } from '../apoCalculations';
import { AutomationFactor, IndustryContext } from '@/types/automation';

describe('Enhanced APO Calculations', () => {
  const mockAutomationFactor: AutomationFactor = {
    id: '1',
    name: 'Data Analysis',
    weight: 0.8,
    category: 'cognitive',
    complexity: 3,
    humanAICollaboration: 0.6,
    industrySpecific: false,
    emergingTechImpact: 0.7
  };

  const mockIndustryContext: IndustryContext = {
    name: 'Finance',
    techMaturity: 0.8,
    regulatoryComplexity: 0.7,
    humanInteractionLevel: 0.4
  };

  test('calculates APO score correctly', () => {
    const result = calculateEnhancedAPO(mockAutomationFactor, mockIndustryContext);
    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThan(1);
  });

  test('provides all required factors', () => {
    const result = calculateEnhancedAPO(mockAutomationFactor, mockIndustryContext);
    expect(result.factors).toHaveProperty('baseAPO');
    expect(result.factors).toHaveProperty('complexityFactor');
    expect(result.factors).toHaveProperty('collaborationFactor');
    expect(result.factors).toHaveProperty('industryFactor');
    expect(result.factors).toHaveProperty('emergingTechFactor');
  });

  test('generates appropriate recommendations', () => {
    const result = calculateEnhancedAPO(mockAutomationFactor, mockIndustryContext);
    expect(Array.isArray(result.recommendations)).toBe(true);
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  test('calculates confidence score', () => {
    const result = calculateEnhancedAPO(mockAutomationFactor, mockIndustryContext);
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  test('handles missing industry context', () => {
    const result = calculateEnhancedAPO(mockAutomationFactor);
    expect(result.score).toBeGreaterThan(0);
    expect(result.factors.industryFactor).toBeDefined();
  });

  test('adjusts for high complexity tasks', () => {
    const highComplexityFactor: AutomationFactor = {
      ...mockAutomationFactor,
      complexity: 5
    };
    const result = calculateEnhancedAPO(highComplexityFactor);
    expect(result.score).toBeLessThan(calculateEnhancedAPO(mockAutomationFactor).score);
  });

  test('considers emerging tech impact', () => {
    const highTechImpactFactor: AutomationFactor = {
      ...mockAutomationFactor,
      emergingTechImpact: 1
    };
    const result = calculateEnhancedAPO(highTechImpactFactor);
    expect(result.score).toBeGreaterThan(calculateEnhancedAPO(mockAutomationFactor).score);
  });
});
