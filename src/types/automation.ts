export interface AutomationFactor {
  id: string;
  name: string;
  weight: number;
  category: string;
  complexity: number;  // 1-5 scale
  repetitiveness: number; // 0-1 scale
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
  marketTrends: {
    techAdoption: number;  // 0-1 scale
    growth: number;  // -1 to 1 scale
  };
  regulations: {
    impact: number;  // 0-1 scale
    complexity: number;  // 1-5 scale
  };
  humanInteractionLevel: number;  // 0-1 scale
  confidenceScore: number;  // 0-1 scale
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

export interface AutomationTrend {
  year: number;
  score: number;
  confidence: number;
  keyFactors?: string[];
  marketTrends?: string[];
  industryContext?: {
    techAdoption: number;
    growth: number;
    regulations: {
      impact: number;
      complexity: number;
    };
  };
}

export interface AutomationPrediction {
  trends: AutomationTrend[];
  confidence: number;
  factors: AutomationFactor[];
}
