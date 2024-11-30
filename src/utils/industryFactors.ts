export interface IndustryContext {
  sector: string;
  techAdoptionRate: number;
  laborMarketFactors: number;
  region: string;
}

interface SectorCharacteristics {
  baselineAutomation: number;
  regulatoryComplexity: number;
  skillRequirements: number;
}

const sectorBaselines: Record<string, SectorCharacteristics> = {
  'Technology': {
    baselineAutomation: 0.85,
    regulatoryComplexity: 0.6,
    skillRequirements: 0.9
  },
  'Healthcare': {
    baselineAutomation: 0.65,
    regulatoryComplexity: 0.9,
    skillRequirements: 0.85
  },
  'Finance': {
    baselineAutomation: 0.8,
    regulatoryComplexity: 0.95,
    skillRequirements: 0.8
  },
  'Manufacturing': {
    baselineAutomation: 0.9,
    regulatoryComplexity: 0.7,
    skillRequirements: 0.75
  },
  'Retail': {
    baselineAutomation: 0.75,
    regulatoryComplexity: 0.5,
    skillRequirements: 0.6
  },
  'Education': {
    baselineAutomation: 0.55,
    regulatoryComplexity: 0.7,
    skillRequirements: 0.8
  },
  'Construction': {
    baselineAutomation: 0.7,
    regulatoryComplexity: 0.75,
    skillRequirements: 0.7
  },
  'Agriculture': {
    baselineAutomation: 0.8,
    regulatoryComplexity: 0.6,
    skillRequirements: 0.65
  }
};

export const getSectorBaseline = (sector: string): number => {
  const defaultBaseline = {
    baselineAutomation: 0.7,
    regulatoryComplexity: 0.7,
    skillRequirements: 0.7
  };

  const sectorData = sectorBaselines[sector] || defaultBaseline;
  
  // Calculate weighted average of sector characteristics
  return (
    sectorData.baselineAutomation * 0.5 +
    (1 - sectorData.regulatoryComplexity) * 0.3 +
    sectorData.skillRequirements * 0.2
  );
};

export const getIndustrySpecificFactor = (context: IndustryContext): number => {
  const sectorBaseline = getSectorBaseline(context.sector);
  const regionalFactor = getRegionalFactor(context.region);
  const adoptionFactor = context.techAdoptionRate / 100;
  const laborFactor = context.laborMarketFactors / 100;

  // Weighted combination of all factors
  return (
    sectorBaseline * 0.4 +
    regionalFactor * 0.3 +
    adoptionFactor * 0.2 +
    laborFactor * 0.1
  );
};

export const getRegionalFactor = (region: string): number => {
  const regionalFactors: Record<string, number> = {
    'North America': 1.0,
    'Western Europe': 0.95,
    'Asia Pacific': 0.90,
    'Eastern Europe': 0.85,
    'Latin America': 0.80,
    'Middle East': 0.75,
    'Africa': 0.70,
    'South Asia': 0.85,
    'Southeast Asia': 0.88,
    'Oceania': 0.92
  };

  return regionalFactors[region] || 0.85; // Default factor
};

export const getLaborMarketImpact = (
  automationScore: number,
  laborMarketFactors: number
): number => {
  // Adjust automation score based on labor market conditions
  const laborMarketMultiplier = laborMarketFactors / 100;
  return automationScore * (1 + (laborMarketMultiplier - 0.5) * 0.4);
};

export const getTechAdoptionImpact = (
  baseScore: number,
  techAdoptionRate: number
): number => {
  // Adjust score based on technology adoption rate
  const adoptionMultiplier = techAdoptionRate / 100;
  return baseScore * (0.7 + adoptionMultiplier * 0.6);
};
