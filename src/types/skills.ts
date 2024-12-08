export interface SkillRelationship {
  primarySkill: string;
  relatedSkills: Array<{
    skill: string;
    impact: number; // -1 to 1
  }>;
}

export interface CategoryWeight {
  tasks: number;
  knowledge: number;
  skills: number;
  abilities: number;
  technologies: number;
}

export interface SkillTransferability {
  sourceSkill: string;
  targetOccupations: Array<{
    occupationId: string;
    transferabilityScore: number;
    requiredUpskilling: string[];
  }>;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  current_level: number;
  required_level: number;
  importance: number;
  priority?: 'high' | 'medium' | 'low';
}

export interface SkillCluster {
  id: string;
  name: string;
  skills: string[];
  commonOccupations: string[];
  growthTrend: number; // -1 to 1
  futureRelevance: number; // 0 to 1
}
