// src/types/skillsTransferability.ts

export interface SkillNode {
  id: string;
  label: string;
  type: 'skill' | 'occupation';
  category?: string;
  level?: number;
  importance?: number;
  x?: number;
  y?: number;
  description?: string;
}

export interface SkillEdge {
  source: string;
  target: string;
  weight: number;
  type: 'requires' | 'similar' | 'transferable';
}

export interface SkillTransferabilityData {
  nodes: SkillNode[];
  edges: SkillEdge[];
  sourceOccupation?: {
    code: string;
    title: string;
  };
  targetOccupation?: {
    code: string;
    title: string;
  };
}

export interface SkillComparison {
  skillId: string;
  skillName: string;
  sourceLevel: number;
  targetLevel: number;
  gap: number;
  transferability: number;
}

export interface OccupationSkillComparison {
  sourceOccupation: {
    code: string;
    title: string;
  };
  targetOccupation: {
    code: string;
    title: string;
  };
  skillComparisons: SkillComparison[];
  overallTransferability: number;
}
