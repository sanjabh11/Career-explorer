/**
 * Types for JinaAPI semantic analysis integration
 * Version 1.0
 */

import { Skill } from './skills';

export interface OccupationTask {
  id: string;
  description: string;
  importance?: number;
  frequency?: number;
  category?: string;
}

export interface TaskAutomationRanking {
  taskId: string;
  taskDescription: string;
  automationScore: number; // 0-1 score
  confidenceScore: number; // 0-1 confidence in the automation score
  timeHorizon: number; // Years until likely automation
  requiredTechnologies: string[];
  barriers: string[];
  similarAutomatedTasks?: string[];
}

export interface SkillAutomationRanking {
  skillId: string;
  skillName: string;
  automationScore: number;
  confidenceScore: number;
  timeHorizon: number;
  emergingAlternatives: Skill[];
}

/**
 * Enhanced Occupation Analysis interface for the Enhanced APO Dashboard
 * Version 1.2
 */
export interface OccupationAnalysis {
  id: string;
  occupationId: string;
  occupationTitle: string;
  semanticRanking: {
    automationPotential: number;
    skillsAnalysis: {
      technicalSkills: number;
      softSkills: number;
      cognitiveSkills: number;
      physicalSkills: number;
    };
    taskAnalysis: {
      repetitiveTasksPercentage: number;
      complexTasksPercentage: number;
      creativeTasksPercentage: number;
    };
    confidenceScore: number;
  };
  skillAlternatives: Skill[];
  lastUpdated: string; // ISO date string
  
  // Additional properties for Enhanced APO Dashboard
  taskRankings: TaskAutomationRanking[];
  skillRankings: SkillAutomationRanking[];
  keyAutomationDrivers: string[];
  keyAutomationBarriers: string[];
  overallAutomationScore: number;
  confidenceScore?: number;
  recommendedSkillDevelopment?: Skill[];
}

export interface RankedTaskResults {
  tasks: TaskAutomationRanking[];
  aggregateScore: number;
  keyDrivers: string[];
  keyBarriers: string[];
  lastUpdated: string;
}

export interface JinaEmbeddingResponse {
  object: string;
  data: Array<{
    object: string;
    embedding: number[];
    index: number;
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export interface JinaRankingResponse {
  object: string;
  data: Array<{
    object: string;
    document: string;
    score: number;
    index: number;
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}
