import { SkillRelationship, SkillTransferability, SkillCluster } from '../types/skills';

export const calculateSkillInterdependencies = (
  skill: string,
  relationships: SkillRelationship[],
  existingSkills: string[]
): number => {
  const relationship = relationships.find(r => r.primarySkill === skill);
  if (!relationship) return 1;

  return relationship.relatedSkills.reduce((factor, related) => {
    if (existingSkills.includes(related.skill)) {
      return factor * (1 + related.impact);
    }
    return factor;
  }, 1);
};

export const calculateTransferabilityScore = (
  sourceSkill: string,
  targetOccupation: string,
  skillTransferability: SkillTransferability[]
): number => {
  const transferability = skillTransferability.find(t => t.sourceSkill === sourceSkill);
  if (!transferability) return 0;

  const targetOccupationData = transferability.targetOccupations.find(
    t => t.occupationId === targetOccupation
  );
  return targetOccupationData?.transferabilityScore ?? 0;
};

export const identifySkillClusters = (
  skills: string[],
  relationships: SkillRelationship[]
): SkillCluster[] => {
  const clusters: SkillCluster[] = [];
  const processedSkills = new Set<string>();

  skills.forEach(skill => {
    if (processedSkills.has(skill)) return;

    const relatedSkills = findRelatedSkills(skill, relationships);
    const commonOccupations = findCommonOccupations(relatedSkills);

    clusters.push({
      id: `cluster-${clusters.length + 1}`,
      name: generateClusterName(relatedSkills),
      skills: relatedSkills,
      commonOccupations,
      growthTrend: calculateGrowthTrend(relatedSkills),
      futureRelevance: calculateFutureRelevance(relatedSkills)
    });

    relatedSkills.forEach(s => processedSkills.add(s));
  });

  return clusters;
};

// Helper functions
function findRelatedSkills(
  skill: string,
  relationships: SkillRelationship[],
  threshold: number = 0.5
): string[] {
  const related = new Set<string>([skill]);
  
  relationships
    .filter(r => r.primarySkill === skill)
    .forEach(relationship => {
      relationship.relatedSkills
        .filter(rs => rs.impact >= threshold)
        .forEach(rs => related.add(rs.skill));
    });

  return Array.from(related);
}

function findCommonOccupations(skills: string[]): string[] {
  // This would typically query an occupation database
  // Placeholder implementation
  return [];
}

function generateClusterName(skills: string[]): string {
  // Simple implementation - could be enhanced with NLP
  return `Skill Cluster (${skills[0]})`;
}

function calculateGrowthTrend(skills: string[]): number {
  // Placeholder - would typically use historical data
  return 0.5;
}

function calculateFutureRelevance(skills: string[]): number {
  // Placeholder - would typically use predictive modeling
  return 0.7;
}
