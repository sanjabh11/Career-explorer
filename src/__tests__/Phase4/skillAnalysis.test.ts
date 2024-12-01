import {
  calculateSkillInterdependencies,
  calculateTransferabilityScore,
  identifySkillClusters
} from '../../utils/skillAnalysis';
import { SkillRelationship, SkillTransferability } from '../../types/skills';

describe('Skill Analysis', () => {
  const mockRelationships: SkillRelationship[] = [
    {
      primarySkill: 'JavaScript',
      relatedSkills: [
        { skill: 'TypeScript', impact: 0.8 },
        { skill: 'React', impact: 0.6 },
        { skill: 'Node.js', impact: 0.5 }
      ]
    }
  ];

  const mockTransferability: SkillTransferability[] = [
    {
      sourceSkill: 'JavaScript',
      targetOccupations: [
        {
          occupationId: 'frontend-dev',
          transferabilityScore: 0.9,
          requiredUpskilling: ['React', 'CSS']
        }
      ]
    }
  ];

  describe('calculateSkillInterdependencies', () => {
    it('should calculate correct interdependency score', () => {
      const score = calculateSkillInterdependencies(
        'JavaScript',
        mockRelationships,
        ['TypeScript', 'React']
      );
      expect(score).toBeGreaterThan(1);
    });

    it('should return 1 for unknown skill', () => {
      const score = calculateSkillInterdependencies(
        'Unknown',
        mockRelationships,
        ['TypeScript']
      );
      expect(score).toBe(1);
    });
  });

  describe('calculateTransferabilityScore', () => {
    it('should return correct transferability score', () => {
      const score = calculateTransferabilityScore(
        'JavaScript',
        'frontend-dev',
        mockTransferability
      );
      expect(score).toBe(0.9);
    });

    it('should return 0 for unknown skill', () => {
      const score = calculateTransferabilityScore(
        'Unknown',
        'frontend-dev',
        mockTransferability
      );
      expect(score).toBe(0);
    });
  });

  describe('identifySkillClusters', () => {
    it('should identify skill clusters correctly', () => {
      const clusters = identifySkillClusters(
        ['JavaScript', 'TypeScript', 'React'],
        mockRelationships
      );
      expect(clusters.length).toBeGreaterThan(0);
      expect(clusters[0].skills).toContain('JavaScript');
    });
  });
});
