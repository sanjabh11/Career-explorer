export interface CategoryData {
  name: string;
  value: number;
  color?: string;
}

export interface TrendData {
  date: string;
  value: number;
  category: string;
}

export interface APOData {
  categories?: CategoryData[];
  trends?: TrendData[];
  overallScore?: number;
  confidence?: number;
  lastUpdated?: string;
}

export interface ChartConfig {
  type: 'radar' | 'bar' | 'pie';
  timeRange: '1M' | '3M' | '6M' | '1Y' | 'ALL';
  sortBy: 'value' | 'name';
  showLegend: boolean;
  showTooltips: boolean;
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'png';
  includeMetadata: boolean;
}

export interface FilterOptions {
  minValue?: number;
  maxValue?: number;
  categories?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

/**
 * Enhanced APO Calculation Types
 * Version 1.0
 */

export interface TimeProjection {
  year: number;             // Target year
  score: number;            // Projected APO score
  confidence: number;       // Confidence level
  keyDrivers: string[];     // Key driving factors
}

export interface RegionalFactors {
  highIncome: number;       // High-income regions
  middleIncome: number;     // Middle-income regions
  lowIncome: number;        // Low-income regions
}

export interface FactorBreakdown {
  taskComplexity: number;           // Impact of task complexity
  collaborationRequirements: number; // Impact of collaboration needs
  industryAdoption: number;         // Industry technology adoption rate
  emergingTechImpact: number;       // Impact of emerging technologies
  regionalFactors: RegionalFactors; // Regional variations
}

export interface Skill {
  id: string;
  name: string;
  type: 'hard' | 'soft';
  description: string;
  category: string;
}

export interface AnalyzedTask {
  id: string;
  description: string;
  automationPotential: number;
  reason: string;
  timeframe: 'Short-term' | 'Medium-term' | 'Long-term';
}

export interface TaskAnalysis {
  highRiskTasks: AnalyzedTask[];    // Tasks with high automation potential
  moderateRiskTasks: AnalyzedTask[]; // Tasks with moderate automation potential
  lowRiskTasks: AnalyzedTask[];     // Tasks with low automation potential
  overallTaskAutomationScore: number; // Overall task automation score
}

export interface SkillsImpact {
  highRisk: Skill[];        // Skills at high automation risk
  moderateRisk: Skill[];    // Skills at moderate automation risk
  lowRisk: Skill[];         // Skills at low automation risk
  emergingSkills: Skill[];  // Recommended emerging skills
}

export interface CareerRecommendation {
  type: 'skill_development' | 'career_pivot' | 'education' | 'industry_change';
  title: string;
  description: string;
  timeframe: 'Short-term' | 'Medium-term' | 'Long-term';
  impact: 'Low' | 'Medium' | 'High';
}

export interface APOResult {
  occupationId: string;
  occupationTitle: string;
  overallScore: number;           // Current APO score (0-1)
  confidence: number;             // Confidence level (0-1)
  timeProjections: TimeProjection[]; // Future projections
  factorBreakdown: FactorBreakdown;  // Contributing factors
  taskAnalysis: TaskAnalysis;      // Task automation analysis
  skillsImpact: SkillsImpact;     // Impact on skills
  recommendations: CareerRecommendation[]; // Career guidance
  dataSourceInfo: {
    onetDataDate: string;         // Date of O*NET data
    researchDataDate: string;     // Date of research data
    semanticAnalysisDate: string; // Date of semantic analysis
    sources?: string[];           // Sources of the data
  };
}
