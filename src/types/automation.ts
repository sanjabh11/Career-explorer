export interface AutomationFactor {
  id: string;
  name: string;
  weight: number;
  category: string;
  complexity: number;  // 1-5 scale
  humanAICollaboration: number;  // 0-1 scale
  industrySpecific: boolean;
  emergingTechImpact: number;  // 0-1 scale
}

export interface TaskComplexity {
  level: number;  // 1-5 scale
  description: string;
  automationPotential: number;  // 0-1 scale
}

export interface IndustryContext {
  name: string;
  techMaturity: number;  // 0-1 scale
  regulatoryComplexity: number;  // 0-1 scale
  humanInteractionLevel: number;  // 0-1 scale
}

export interface APOResult {
  score: number;
  factors: {
    baseAPO: number;
    complexityFactor: number;
    collaborationFactor: number;
    industryFactor: number;
    emergingTechFactor: number;
  };
  confidence: number;
  recommendations: string[];
}
