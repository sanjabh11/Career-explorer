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
  importance?: number;
  category: string;
  level?: number;          // User's current skill level
  confidence?: number;     // User's confidence in the skill
  required_level?: number; // Required level for the skill
  current_level?: number;  // Current level for the skill
  lastUpdated?: string;    // Add lastUpdated property
}

export interface ProficiencyCriteria {
  level: number;
  description: string;
  examples: string[];
  assessment_criteria: string[];
}

export interface LearningResource {
  title: string;
  provider: string;
  url: string;
  type: string;
  level: string;
  duration?: string;
  cost?: string;
  rating?: number;
}

export interface SkillGapAnalysis {
  skill: Skill;
  gap: number;
  recommendations: LearningResource[];
  priority: 'high' | 'medium' | 'low';
}

export interface SkillAssessmentResult {
  skillId: string;
  userId: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  assessmentDate: string;
  confidence: number;
}

export interface SkillTaxonomy {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  children?: SkillTaxonomy[];
  skills: Skill[];
}

export interface SkillCluster {
  id: string;
  name: string;
  skills: string[];
  commonOccupations: string[];
  growthTrend: number; // -1 to 1
  futureRelevance: number; // 0 to 1
}
