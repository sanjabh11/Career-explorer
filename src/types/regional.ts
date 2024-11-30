export interface RegionalMarketData {
  regionCode: string;
  name: string;
  countryCode: string;
  marketIndicators: MarketIndicators;
  laborStats: LaborStatistics;
  techHubData: TechHubData;
  costOfLiving: CostOfLivingData;
}

export interface MarketIndicators {
  gdpGrowth: number;
  employmentRate: number;
  industryGrowth: number;
  innovationIndex: number;
  marketSize: number;
  competitiveIndex: number;
}

export interface LaborStatistics {
  unemploymentRate: number;
  averageSalary: number;
  skillGapIndex: number;
  workforceSize: number;
  laborDemand: number;
  skillAvailability: {
    [key: string]: number; // skill category to availability ratio
  };
}

export interface TechHubData {
  hubScore: number;
  startupDensity: number;
  ventureCapital: number;
  researchInstitutions: number;
  techCompanies: number;
}

export interface CostOfLivingData {
  index: number;
  housingCost: number;
  transportationCost: number;
  utilities: number;
  averageRent: number;
}

export interface RegionalInsight {
  type: 'opportunity' | 'challenge' | 'trend';
  description: string;
  impact: number;
  timeframe: 'short' | 'medium' | 'long';
  confidence: number;
}

export interface RegionalTrend {
  indicator: string;
  historicalData: Array<{
    date: string;
    value: number;
  }>;
  forecast: Array<{
    date: string;
    value: number;
    confidence: number;
  }>;
}

export interface RegionalComparison {
  regionCode: string;
  metrics: {
    [key: string]: number;
  };
  ranking: number;
  strengthFactors: string[];
  weaknessFactors: string[];
}
