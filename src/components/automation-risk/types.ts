export interface TaskAutomationRisk {
  taskId: string;
  taskName: string;
  description: string;
  automationProbability: number;
  timeframe: 'immediate' | 'short-term' | 'medium-term' | 'long-term';
  impactLevel: number;
  requiredAdaptations: string[];
}

export interface TechnologyThreat {
  technologyId: string;
  name: string;
  description: string;
  maturityLevel: number;
  adoptionRate: number;
  impactScore: number;
  affectedTasks: string[];
  timeToMainstream: number;
}

export interface SkillVulnerability {
  skillId: string;
  skillName: string;
  currentLevel: number;
  automationRisk: number;
  marketDemand: number;
  futureRelevance: number;
  alternativeSkills: string[];
  upskillingSuggestions: string[];
}

export interface FutureRequirement {
  requirementId: string;
  category: 'skill' | 'knowledge' | 'ability';
  name: string;
  description: string;
  importance: number;
  timeframe: number;
  currentGap: number;
  developmentPath: string[];
}

export interface AutomationRiskAssessment {
  overallRisk: number;
  confidenceScore: number;
  taskRisks: TaskAutomationRisk[];
  technologyThreats: TechnologyThreat[];
  skillVulnerabilities: SkillVulnerability[];
  futureRequirements: FutureRequirement[];
  lastUpdated: string;
  nextReviewDate: string;
}
