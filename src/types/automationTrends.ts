export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface AutomationTrend {
  date: Date;
  apoScore: number;
  factors: string[];
  confidence: number;
  industryImpact: number;
  technologyAdoption: number;
}

export interface ResearchData {
  id: string;
  title: string;
  date: Date;
  source: string;
  findings: string;
  impactScore: number;
  relevantOccupations: string[];
  confidenceLevel: number;
}

export interface PredictedAPO {
  predictedAPO: number;
  confidence: number;
  factors: {
    name: string;
    impact: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }[];
  timeframe: number;
  lastUpdated: Date;
}
