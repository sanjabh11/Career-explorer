import { EmergingTechnology } from '../types/emergingTech';

interface TimeBasedProjection {
  year: number;
  score: number;
  confidence: number;
  factors: string[];
}

interface TechnologyImpact {
  shortTerm: ImpactMetrics; // 0-2 years
  mediumTerm: ImpactMetrics; // 2-5 years
  longTerm: ImpactMetrics; // 5+ years
}

interface ImpactMetrics {
  score: number;
  confidence: number;
  keyFactors: string[];
  risks: string[];
  opportunities: string[];
}

interface MaturityAssessment {
  currentLevel: string;
  timeToNextLevel: number;
  adoptionMetrics: {
    currentAdoption: number;
    projectedGrowth: number;
    marketPenetration: number;
  };
  readinessFactors: string[];
  barriers: string[];
}

export function calculateTimeBasedAPO(
  baseAPO: number,
  technology: EmergingTechnology,
  projectionYears: number,
  historicalData?: { year: number; score: number }[]
): TimeBasedProjection[] {
  const projections: TimeBasedProjection[] = [];
  const currentYear = new Date().getFullYear();

  for (let i = 0; i < projectionYears; i++) {
    const yearOffset = i + 1;
    const projectedYear = currentYear + yearOffset;
    
    // Calculate technology maturity impact
    const maturityImpact = calculateMaturityImpact(technology, yearOffset);
    
    // Calculate adoption rate impact
    const adoptionImpact = calculateAdoptionImpact(technology, yearOffset);
    
    // Calculate market readiness impact
    const marketImpact = calculateMarketImpact(technology, yearOffset);
    
    // Combine impacts with historical trend if available
    const historicalTrend = historicalData 
      ? calculateHistoricalTrend(historicalData)
      : 0;

    const combinedImpact = (
      maturityImpact * 0.3 +
      adoptionImpact * 0.3 +
      marketImpact * 0.2 +
      historicalTrend * 0.2
    );

    const projectedScore = Math.min(1, baseAPO * (1 + combinedImpact));
    const confidence = calculateConfidence(yearOffset, historicalData !== undefined);

    projections.push({
      year: projectedYear,
      score: projectedScore,
      confidence,
      factors: generateImpactFactors(maturityImpact, adoptionImpact, marketImpact)
    });
  }

  return projections;
}

export function projectTechnologyImpact(
  technology: EmergingTechnology,
  years: number,
  industryData?: {
    adoptionRate: number;
    marketGrowth: number;
    skillAvailability: number;
  }
): TechnologyImpact {
  return {
    shortTerm: calculateTermImpact(technology, 'short', industryData),
    mediumTerm: calculateTermImpact(technology, 'medium', industryData),
    longTerm: calculateTermImpact(technology, 'long', industryData)
  };
}

export function assessTechnologyMaturity(
  technology: EmergingTechnology,
  yearsOffset: number = 0
): MaturityAssessment {
  const maturityLevels = ['Experimental', 'Emerging', 'Growth', 'Mature', 'Declining'];
  const currentIndex = maturityLevels.indexOf(technology.maturityLevel);
  
  // Calculate projected maturity level
  const projectedIndex = Math.min(
    maturityLevels.length - 1,
    currentIndex + Math.floor(yearsOffset / 2)
  );

  const adoptionMetrics = calculateAdoptionMetrics(technology, yearsOffset);
  
  return {
    currentLevel: maturityLevels[projectedIndex],
    timeToNextLevel: calculateTimeToNextLevel(technology, currentIndex),
    adoptionMetrics,
    readinessFactors: generateReadinessFactors(technology),
    barriers: identifyBarriers(technology)
  };
}

// Helper functions
function calculateMaturityImpact(
  tech: EmergingTechnology,
  yearOffset: number
): number {
  const maturityLevels = {
    'Experimental': 0.2,
    'Emerging': 0.4,
    'Growth': 0.6,
    'Mature': 0.8,
    'Declining': 0.3
  };

  const baseImpact = maturityLevels[tech.maturityLevel as keyof typeof maturityLevels];
  return Math.min(1, baseImpact * (1 + yearOffset * 0.1));
}

function calculateAdoptionImpact(
  tech: EmergingTechnology,
  yearOffset: number
): number {
  const currentAdoption = tech.marketProjections[0]?.adoptionRate || 0;
  const projectedAdoption = Math.min(1, currentAdoption * (1 + yearOffset * 0.2));
  return projectedAdoption;
}

function calculateMarketImpact(
  tech: EmergingTechnology,
  yearOffset: number
): number {
  const marketGrowth = tech.marketProjections[0]?.growthRate || 0;
  return Math.min(1, (marketGrowth / 100) * (1 + yearOffset * 0.1));
}

function calculateHistoricalTrend(
  historicalData: { year: number; score: number }[]
): number {
  if (historicalData.length < 2) return 0;
  
  const changes = historicalData
    .slice(1)
    .map((data, i) => data.score - historicalData[i].score);
  
  return average(changes);
}

function calculateConfidence(
  yearOffset: number,
  hasHistoricalData: boolean
): number {
  const baseConfidence = hasHistoricalData ? 0.8 : 0.6;
  return Math.max(0.3, baseConfidence * (1 - yearOffset * 0.1));
}

function generateImpactFactors(
  maturityImpact: number,
  adoptionImpact: number,
  marketImpact: number
): string[] {
  const factors = [];
  
  if (maturityImpact > 0.5) factors.push('Technology Maturity');
  if (adoptionImpact > 0.5) factors.push('Market Adoption');
  if (marketImpact > 0.5) factors.push('Market Growth');
  
  return factors;
}

function calculateTermImpact(
  tech: EmergingTechnology,
  term: 'short' | 'medium' | 'long',
  industryData?: {
    adoptionRate: number;
    marketGrowth: number;
    skillAvailability: number;
  }
): ImpactMetrics {
  const termMultipliers = {
    short: 1,
    medium: 0.8,
    long: 0.6
  };

  const baseScore = tech.impactScore * termMultipliers[term];
  const adoptionRate = industryData?.adoptionRate || tech.marketProjections[0]?.adoptionRate || 0.5;

  return {
    score: baseScore * adoptionRate,
    confidence: calculateTermConfidence(term, industryData !== undefined),
    keyFactors: generateTermFactors(tech, term),
    risks: generateTermRisks(tech, term),
    opportunities: generateTermOpportunities(tech, term)
  };
}

function calculateTermConfidence(
  term: 'short' | 'medium' | 'long',
  hasIndustryData: boolean
): number {
  const baseConfidence = hasIndustryData ? 0.9 : 0.7;
  const termMultipliers = {
    short: 1,
    medium: 0.8,
    long: 0.6
  };
  
  return baseConfidence * termMultipliers[term];
}

function generateTermFactors(
  tech: EmergingTechnology,
  term: 'short' | 'medium' | 'long'
): string[] {
  const factors = [];
  
  if (term === 'short') {
    factors.push('Current Market Demand');
    factors.push('Initial Adoption Rate');
  } else if (term === 'medium') {
    factors.push('Technology Maturity');
    factors.push('Skill Availability');
  } else {
    factors.push('Market Transformation');
    factors.push('Industry Evolution');
  }
  
  return factors;
}

function generateTermRisks(
  tech: EmergingTechnology,
  term: 'short' | 'medium' | 'long'
): string[] {
  if (term === 'short') return tech.implementationFactors.risks.technical;
  if (term === 'medium') return tech.implementationFactors.risks.operational;
  return tech.implementationFactors.risks.strategic;
}

function generateTermOpportunities(
  tech: EmergingTechnology,
  term: 'short' | 'medium' | 'long'
): string[] {
  const opportunities = tech.industryImpacts[0]?.opportunities || [];
  return opportunities.slice(0, 3);
}

function calculateAdoptionMetrics(
  tech: EmergingTechnology,
  yearsOffset: number
): {
  currentAdoption: number;
  projectedGrowth: number;
  marketPenetration: number;
} {
  const currentAdoption = tech.marketProjections[0]?.adoptionRate || 0;
  const growthRate = tech.marketProjections[0]?.growthRate || 0;
  
  return {
    currentAdoption,
    projectedGrowth: growthRate,
    marketPenetration: Math.min(1, currentAdoption * (1 + yearsOffset * 0.2))
  };
}

function calculateTimeToNextLevel(
  tech: EmergingTechnology,
  currentIndex: number
): number {
  if (currentIndex >= 3) return -1; // No next level for Mature or Declining
  
  const baseTime = 24; // Base time of 24 months
  const adoptionRate = tech.marketProjections[0]?.adoptionRate || 0;
  const marketGrowth = tech.marketProjections[0]?.growthRate || 0;
  
  return Math.max(
    12,
    Math.ceil(baseTime * (1 - adoptionRate) * (1 - marketGrowth/100))
  );
}

function generateReadinessFactors(tech: EmergingTechnology): string[] {
  const factors = [];
  const { organizationalReadiness } = tech.implementationFactors;
  
  if (organizationalReadiness.technicalCapability > 0.7) {
    factors.push('Strong Technical Foundation');
  }
  if (organizationalReadiness.resourceAvailability > 0.7) {
    factors.push('Adequate Resources');
  }
  if (organizationalReadiness.culturalAlignment > 0.7) {
    factors.push('Cultural Readiness');
  }
  
  return factors;
}

function identifyBarriers(tech: EmergingTechnology): string[] {
  return tech.industryImpacts[0]?.barriers || [];
}

function average(numbers: number[]): number {
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
}
