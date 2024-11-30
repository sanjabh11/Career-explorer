export interface TechnologyAdoption {
  id: string;
  name: string;
  currentAdoptionRate: number;
  historicalTrend: AdoptionTrend[];
  industryRates: IndustryAdoptionRate[];
  impactFactors: AdoptionImpactFactors;
  forecast: AdoptionForecast[];
}

export interface AdoptionTrend {
  date: string;
  rate: number;
  milestone?: string;
}

export interface IndustryAdoptionRate {
  industry: string;
  rate: number;
  leadingFactors: string[];
  barriers: string[];
}

export interface AdoptionImpactFactors {
  costFactor: number;
  skillRequirement: number;
  infrastructureNeeds: number;
  regulatoryCompliance: number;
  marketDemand: number;
}

export interface AdoptionForecast {
  year: number;
  predictedRate: number;
  confidence: number;
  drivingFactors: string[];
}

export interface AdoptionInsight {
  type: 'opportunity' | 'risk' | 'trend';
  description: string;
  impact: number;
  timeframe: string;
  actionItems: string[];
}
