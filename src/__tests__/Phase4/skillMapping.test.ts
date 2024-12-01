import {
  calculateSkillImpact,
  identifySkillClusters,
  validateSkillRelationships
} from '@/utils/skillMapping';
import { SkillRelationship } from '@/types/skills';

describe('Skill Mapping', () => {
  const sampleRelationships: SkillRelationship[] = [
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

  describe('calculateSkillImpact', () => {
    it('should calculate direct impact between skills', () => {
      const impact = calculateSkillImpact('JavaScript', 'TypeScript', sampleRelationships);
      expect(impact).toBe(0.8);
    });

    it('should calculate indirect impact through common connections', () => {
      const impact = calculateSkillImpact('JavaScript', 'Angular', sampleRelationships);
      expect(impact).toBeGreaterThan(0);
      expect(impact).toBeLessThan(0.8); // Should be reduced for indirect connection
    });

    it('should return 0 for unrelated skills', () => {
      const impact = calculateSkillImpact('JavaScript', 'Python', sampleRelationships);
      expect(impact).toBe(0);
    });
  });

  describe('identifySkillClusters', () => {
    it('should identify clusters of related skills', () => {
      const clusters = identifySkillClusters(sampleRelationships);
      expect(clusters.length).toBeGreaterThan(0);
      
      // Check if JavaScript and TypeScript are in the same cluster
      const jsCluster = clusters.find(c => c.skills.includes('JavaScript'));
      expect(jsCluster?.skills).toContain('TypeScript');
    });

    it('should generate meaningful cluster names', () => {
      const clusters = identifySkillClusters(sampleRelationships);
      clusters.forEach(cluster => {
        expect(cluster.name).toBeTruthy();
        expect(cluster.name.length).toBeGreaterThan(0);
      });
    });

    it('should calculate growth trends and future relevance', () => {
      const clusters = identifySkillClusters(sampleRelationships);
      clusters.forEach(cluster => {
        expect(cluster.growthTrend).toBeGreaterThanOrEqual(0);
        expect(cluster.growthTrend).toBeLessThanOrEqual(1);
        expect(cluster.futureRelevance).toBeGreaterThanOrEqual(0);
        expect(cluster.futureRelevance).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('validateSkillRelationships', () => {
    it('should validate valid relationship graph', () => {
      expect(validateSkillRelationships(sampleRelationships)).toBe(true);
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
