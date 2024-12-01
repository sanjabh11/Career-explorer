import {
  calculateSkillImpact,
  calculateTransferabilityScore,
  identifySkillClusters,
  validateSkillRelationships
} from '../../utils/skillMapping';
import { SkillRelationship, SkillTransferability } from '../../types/skills';

describe('Skill Transferability Analysis', () => {
  const sampleSkillRelationships: SkillRelationship[] = [
    {
      primarySkill: 'JavaScript',
      relatedSkills: [
        { skill: 'TypeScript', impact: 0.8 },
        { skill: 'React', impact: 0.7 },
        { skill: 'Node.js', impact: 0.6 }
      ]
    },
    {
      primarySkill: 'TypeScript',
      relatedSkills: [
        { skill: 'JavaScript', impact: 0.8 },
        { skill: 'Angular', impact: 0.7 }
      ]
    },
    {
      primarySkill: 'React',
      relatedSkills: [
        { skill: 'JavaScript', impact: 0.7 },
        { skill: 'HTML/CSS', impact: 0.6 }
      ]
    }
  ];

  const sampleTransferability: SkillTransferability[] = [
    {
      sourceSkill: 'JavaScript',
      targetOccupations: [
        {
          occupationId: 'Frontend Developer',
          transferabilityScore: 0.9,
          requiredUpskilling: ['React', 'TypeScript']
        },
        {
          occupationId: 'Full Stack Developer',
          transferabilityScore: 0.8,
          requiredUpskilling: ['Node.js', 'MongoDB']
        }
      ]
    },
    {
      sourceSkill: 'Python',
      targetOccupations: [
        {
          occupationId: 'Data Scientist',
          transferabilityScore: 0.85,
          requiredUpskilling: ['Machine Learning', 'Statistics']
        },
        {
          occupationId: 'Backend Developer',
          transferabilityScore: 0.75,
          requiredUpskilling: ['Django', 'SQL']
        }
      ]
    }
  ];

  describe('calculateSkillImpact', () => {
    it('should calculate direct impact between skills', () => {
      const impact = calculateSkillImpact('JavaScript', 'TypeScript', sampleSkillRelationships);
      expect(impact).toBe(0.8);
    });

    it('should calculate indirect impact through common connections', () => {
      const impact = calculateSkillImpact('JavaScript', 'Angular', sampleSkillRelationships);
      expect(impact).toBeGreaterThan(0);
      expect(impact).toBeLessThan(0.8); // Should be reduced for indirect connection
    });

    it('should return 0 for unrelated skills', () => {
      const impact = calculateSkillImpact('JavaScript', 'Python', sampleSkillRelationships);
      expect(impact).toBe(0);
    });
  });

  describe('calculateTransferabilityScore', () => {
    it('should calculate correct transferability score for direct occupation match', () => {
      const score = calculateTransferabilityScore(
        'JavaScript',
        'Frontend Developer',
        sampleTransferability
      );
      expect(score).toBe(0.9);
    });

    it('should return 0 for non-existent skill', () => {
      const score = calculateTransferabilityScore(
        'NonExistentSkill',
        'Frontend Developer',
        sampleTransferability
      );
      expect(score).toBe(0);
    });

    it('should return 0 for non-existent occupation', () => {
      const score = calculateTransferabilityScore(
        'JavaScript',
        'NonExistentOccupation',
        sampleTransferability
      );
      expect(score).toBe(0);
    });
  });

  describe('identifySkillClusters', () => {
    it('should identify clusters of related skills', () => {
      const clusters = identifySkillClusters(sampleSkillRelationships);
      expect(clusters.length).toBeGreaterThan(0);

      // Check if JavaScript and TypeScript are in the same cluster
      const jsCluster = clusters.find(c => c.skills.includes('JavaScript'));
      expect(jsCluster?.skills).toContain('TypeScript');
    });

    it('should calculate cluster metrics', () => {
      const clusters = identifySkillClusters(sampleSkillRelationships);
      clusters.forEach(cluster => {
        expect(cluster.id).toBeDefined();
        expect(cluster.name).toBeDefined();
        expect(cluster.skills.length).toBeGreaterThan(0);
        expect(cluster.commonOccupations).toBeDefined();
        expect(cluster.growthTrend).toBeGreaterThanOrEqual(0);
        expect(cluster.growthTrend).toBeLessThanOrEqual(1);
        expect(cluster.futureRelevance).toBeGreaterThanOrEqual(0);
        expect(cluster.futureRelevance).toBeLessThanOrEqual(1);
      });
    });

    it('should not create clusters for isolated skills', () => {
      const isolatedSkills: SkillRelationship[] = [
        {
          primarySkill: 'IsolatedSkill1',
          relatedSkills: []
        },
        {
          primarySkill: 'IsolatedSkill2',
          relatedSkills: []
        }
      ];
      const clusters = identifySkillClusters(isolatedSkills);
      expect(clusters.length).toBe(0);
    });
  });

  describe('validateSkillRelationships', () => {
    it('should validate valid relationship graph', () => {
      expect(validateSkillRelationships(sampleSkillRelationships)).toBe(true);
    });

    it('should detect circular dependencies', () => {
      const circularRelationships: SkillRelationship[] = [
        {
          primarySkill: 'A',
          relatedSkills: [{ skill: 'B', impact: 0.5 }]
        },
        {
          primarySkill: 'B',
          relatedSkills: [{ skill: 'C', impact: 0.5 }]
        },
        {
          primarySkill: 'C',
          relatedSkills: [{ skill: 'A', impact: 0.5 }]
        }
      ];
      expect(validateSkillRelationships(circularRelationships)).toBe(false);
    });

    it('should validate impact scores are within range', () => {
      const invalidRelationships: SkillRelationship[] = [
        {
          primarySkill: 'JavaScript',
          relatedSkills: [{ skill: 'TypeScript', impact: 1.5 }] // Invalid impact score
        }
      ];
      expect(validateSkillRelationships(invalidRelationships)).toBe(false);
    });
  });
});
