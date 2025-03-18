/**
 * Skills Transferability Types - Version 1.3.0
 * Defines types for the enhanced Skills Transferability visualization
 */

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  level: number;
  value: number;
  category: string;
  subcategory?: string;
  importance: number;
}

export interface SkillEdge {
  source: string;
  target: string;
  strength: number; // 0-1 indicating relationship strength
  type: 'direct' | 'indirect' | 'complementary';
}

export interface SkillTransferability {
  sourceOccupation: string;
  targetOccupation: string;
  overallScore: number; // 0-100 score of transferability
  matchedSkills: {
    skill: string;
    sourceLevel: number;
    targetLevel: number;
    gapScore: number; // Negative if target requires higher level
  }[];
  missingSkills: {
    skill: string;
    requiredLevel: number;
    difficulty: number; // 1-5 rating of how difficult to acquire
  }[];
  excessSkills: {
    skill: string;
    currentLevel: number;
    utilization: number; // 0-1 rating of how utilized in target occupation
  }[];
}

export interface SkillCluster {
  id: string;
  name: string;
  skills: string[]; // Skill IDs
  relatedClusters: string[]; // Related cluster IDs
  occupations: string[]; // Occupation codes that heavily use this cluster
}

export interface TransferPathway {
  start: string; // Occupation code
  end: string; // Occupation code
  intermediateSteps: {
    occupation: string;
    skillsToAcquire: string[];
    skillsToLeverage: string[];
  }[];
  totalTransferScore: number;
  estimatedTimeToTransfer: string; // e.g., "2-3 years"
}

export interface SkillGapVisualization {
  matched: SkillNode[];
  missing: SkillNode[];
  excess: SkillNode[];
  connections: SkillEdge[];
}
