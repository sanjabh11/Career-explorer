import { SkillRelationship, SkillCluster } from '@/types/skills';

export function calculateSkillImpact(
  sourceSkill: string,
  targetSkill: string,
  relationships: SkillRelationship[]
): number {
  const directRelation = relationships
    .find(r => r.primarySkill === sourceSkill)
    ?.relatedSkills.find(r => r.skill === targetSkill);
  
  if (directRelation) return directRelation.impact;

  // Calculate indirect relationships through common connections
  const indirectImpacts = relationships
    .filter(r => r.primarySkill === sourceSkill)
    .flatMap(r => r.relatedSkills)
    .filter(r => {
      const secondaryConnection = relationships
        .find(sr => sr.primarySkill === r.skill)
        ?.relatedSkills.find(sr => sr.skill === targetSkill);
      return secondaryConnection !== undefined;
    })
    .map(r => r.impact * 0.7); // Reduce impact for indirect connections

  return indirectImpacts.length > 0 
    ? Math.max(...indirectImpacts)
    : 0;
}

export function identifySkillClusters(relationships: SkillRelationship[]): SkillCluster[] {
  const allSkills = new Set(relationships.map(r => r.primarySkill)
    .concat(relationships.flatMap(r => r.relatedSkills.map(rs => rs.skill))));
  
  const clusters: SkillCluster[] = [];
  const processedSkills = new Set<string>();

  for (const skill of allSkills) {
    if (processedSkills.has(skill)) continue;

    const cluster = new Set<string>([skill]);
    let changed = true;

    // Expand cluster until no more closely related skills are found
    while (changed) {
      changed = false;
      const currentSize = cluster.size;

      for (const s of cluster) {
        const related = relationships
          .find(r => r.primarySkill === s)
          ?.relatedSkills
          .filter(r => r.impact >= 0.6) // High impact threshold for clustering
          .map(r => r.skill) ?? [];

        related.forEach(r => cluster.add(r));
      }

      if (cluster.size > currentSize) changed = true;
    }

    // Add cluster if it has meaningful relationships
    if (cluster.size > 1) {
      clusters.push({
        id: `cluster-${clusters.length + 1}`,
        name: generateClusterName(Array.from(cluster)),
        skills: Array.from(cluster),
        commonOccupations: findCommonOccupations(Array.from(cluster)),
        growthTrend: calculateClusterGrowth(Array.from(cluster)),
        futureRelevance: calculateFutureRelevance(Array.from(cluster))
      });

      cluster.forEach(s => processedSkills.add(s));
    }
  }

  return clusters;
}

export function validateSkillRelationships(relationships: SkillRelationship[]): boolean {
  // Check for circular dependencies
  const graph = new Map<string, Set<string>>();
  
  relationships.forEach(r => {
    if (!graph.has(r.primarySkill)) {
      graph.set(r.primarySkill, new Set());
    }
    r.relatedSkills.forEach(rs => {
      graph.get(r.primarySkill)?.add(rs.skill);
    });
  });

  function hasCycle(node: string, visited: Set<string>, path: Set<string>): boolean {
    if (path.has(node)) return true;
    if (visited.has(node)) return false;

    visited.add(node);
    path.add(node);

    const neighbors = graph.get(node) ?? new Set();
    for (const neighbor of neighbors) {
      if (hasCycle(neighbor, visited, path)) return true;
    }

    path.delete(node);
    return false;
  }

  const visited = new Set<string>();
  const path = new Set<string>();

  for (const skill of graph.keys()) {
    if (hasCycle(skill, visited, path)) return false;
  }

  // Validate impact scores
  return relationships.every(r => 
    r.relatedSkills.every(rs => rs.impact >= -1 && rs.impact <= 1)
  );
}

// Helper functions
function generateClusterName(skills: string[]): string {
  // Find the most common words in skill names
  const words = skills
    .flatMap(s => s.toLowerCase().split(/[^a-z]+/))
    .filter(w => w.length > 3);
  
  const wordFreq = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topWords = Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2)
    .map(([word]) => word);

  return topWords.length > 0
    ? `${topWords.join('/')} Skills`
    : `Skill Cluster ${skills[0]}`;
}

function findCommonOccupations(skills: string[]): string[] {
  // This would typically query an occupation database
  // Placeholder implementation
  const commonOccupations = {
    'javascript': ['Frontend Developer', 'Full Stack Developer'],
    'python': ['Data Scientist', 'Backend Developer'],
    'sql': ['Database Administrator', 'Data Analyst'],
    'react': ['Frontend Developer', 'Mobile Developer'],
    'node.js': ['Backend Developer', 'Full Stack Developer']
  };

  return Array.from(new Set(
    skills.flatMap(s => 
      commonOccupations[s.toLowerCase() as keyof typeof commonOccupations] ?? []
    )
  ));
}

function calculateClusterGrowth(skills: string[]): number {
  // This would typically use historical data and market trends
  // Placeholder implementation using predefined growth rates
  const growthRates = {
    'javascript': 0.8,
    'python': 0.9,
    'sql': 0.7,
    'react': 0.85,
    'node.js': 0.8
  };

  const rates = skills.map(s => 
    growthRates[s.toLowerCase() as keyof typeof growthRates] ?? 0.5
  );

  return rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
}

function calculateFutureRelevance(skills: string[]): number {
  // This would typically use predictive modeling
  // Placeholder implementation using predefined relevance scores
  const relevanceScores = {
    'javascript': 0.9,
    'python': 0.95,
    'sql': 0.8,
    'react': 0.9,
    'node.js': 0.85
  };

  const scores = skills.map(s => 
    relevanceScores[s.toLowerCase() as keyof typeof relevanceScores] ?? 0.6
  );

  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}
