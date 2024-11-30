import { getIndustrySpecificFactor, getLaborMarketImpact, getTechAdoptionImpact } from '../../utils/industryFactors';
import { IndustryContext } from '../../types/automation';

describe('Industry-Specific Calculations', () => {
  const mockContext: IndustryContext = {
    sector: 'Technology',
    techAdoptionRate: 75,
    laborMarketFactors: 50,
    region: 'North America'
  };

  describe('getIndustrySpecificFactor', () => {
    it('should return valid factor for known industry', () => {
      const factor = getIndustrySpecificFactor(mockContext);
      expect(factor).toBeGreaterThan(0);
      expect(factor).toBeLessThanOrEqual(1);
    });

    it('should handle unknown industry gracefully', () => {
      const unknownContext = { ...mockContext, sector: 'Unknown' };
      expect(() => getIndustrySpecificFactor(unknownContext)).not.toThrow();
    });

    it('should consider regional variations', () => {
      const asiaContext = { ...mockContext, region: 'Asia Pacific' };
      const factor1 = getIndustrySpecificFactor(mockContext);
      const factor2 = getIndustrySpecificFactor(asiaContext);
      expect(factor1).not.toBe(factor2);
    });
  });

  describe('getLaborMarketImpact', () => {
    it('should calculate correct impact based on labor factors', () => {
      const baseScore = 0.7;
      const impact = getLaborMarketImpact(baseScore, mockContext.laborMarketFactors);
      expect(impact).toBeGreaterThan(0);
      expect(impact).toBeLessThanOrEqual(1);
    });

    it('should handle edge cases', () => {
      expect(getLaborMarketImpact(0.5, 0)).toBeLessThan(getLaborMarketImpact(0.5, 100));
    });
  });

  describe('getTechAdoptionImpact', () => {
    it('should increase impact with higher adoption rate', () => {
      const baseScore = 0.6;
      const highAdoption = getTechAdoptionImpact(baseScore, 90);
      const lowAdoption = getTechAdoptionImpact(baseScore, 10);
      expect(highAdoption).toBeGreaterThan(lowAdoption);
    });

    it('should maintain score bounds', () => {
      const score = getTechAdoptionImpact(0.5, mockContext.techAdoptionRate);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  });
});
