import { 
  calculateEmergingTechImpact,
  isRelevantForTask,
  getTechnologyRecommendations,
  emergingTechnologies
} from '../../utils/emergingTechFactors';
import { AutomationFactor } from '../../types/automation';

describe('Emerging Technology Impact Calculations', () => {
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

  describe('calculateEmergingTechImpact', () => {
    it('should calculate impact for relevant technologies', () => {
      const impact = calculateEmergingTechImpact(mockTask);
      expect(impact).toBeGreaterThan(0);
      expect(impact).toBeLessThanOrEqual(1);
    });

    it('should handle empty technology list', () => {
      const impact = calculateEmergingTechImpact(mockTask, []);
      expect(impact).toBe(0);
    });

    it('should weight impact by relevance score', () => {
      const highRelevanceTech = emergingTechnologies.map(tech => ({
        ...tech,
        relevanceScore: 1
      }));
      const highImpact = calculateEmergingTechImpact(mockTask, highRelevanceTech);
      const lowRelevanceTech = emergingTechnologies.map(tech => ({
        ...tech,
        relevanceScore: 0.1
      }));
      const lowImpact = calculateEmergingTechImpact(mockTask, lowRelevanceTech);
      expect(highImpact).toBeGreaterThan(lowImpact);
    });
  });

  describe('isRelevantForTask', () => {
    it('should identify relevant technologies for repetitive tasks', () => {
      const repetitiveTask = { ...mockTask, repetitiveness: 0.9, complexity: 2 };
      const tech = emergingTechnologies.find(t => t.name === 'Robotic Process Automation');
      expect(tech && isRelevantForTask(repetitiveTask, tech)).toBe(true);
    });

    it('should identify AI relevance for complex tasks', () => {
      const complexTask = { ...mockTask, complexity: 5, repetitiveness: 0.1 };
      const tech = emergingTechnologies.find(t => t.name === 'Advanced AI/ML');
      expect(tech && isRelevantForTask(complexTask, tech)).toBe(true);
    });
  });

  describe('getTechnologyRecommendations', () => {
    it('should return relevant technologies for industry', () => {
      const recommendations = getTechnologyRecommendations('Technology', ['Data Analysis']);
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0]).toHaveProperty('name');
      expect(recommendations[0]).toHaveProperty('impactFactor');
    });

    it('should filter by skill relevance', () => {
      const techRecommendations = getTechnologyRecommendations('Technology', ['Data Analysis']);
      const manufacturingRecommendations = getTechnologyRecommendations('Manufacturing', ['Quality Control']);
      expect(techRecommendations).not.toEqual(manufacturingRecommendations);
    });

    it('should handle unknown industry/skills', () => {
      const recommendations = getTechnologyRecommendations('Unknown', ['Unknown Skill']);
      expect(recommendations).toHaveLength(0);
    });
  });
});
