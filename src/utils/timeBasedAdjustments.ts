interface TimeBasedFactors {
  baseGrowthRate: number;
  industryGrowthRates: { [key: string]: number };
  regionalGrowthRates: { [key: string]: number };
  skillObsolescenceRates: { [key: string]: number };
}

const timeBasedFactors: TimeBasedFactors = {
  baseGrowthRate: 0.05, // 5% annual base increase
  
  industryGrowthRates: {
    Technology: 0.08,
    Healthcare: 0.06,
    Finance: 0.07,
    Manufacturing: 0.06,
    Retail: 0.05,
    Education: 0.04,
    Construction: 0.04,
    Agriculture: 0.05
  },
  
  regionalGrowthRates: {
    'North America': 0.07,
    'Western Europe': 0.06,
    'Asia Pacific': 0.08,
    'Eastern Europe': 0.05,
    'Latin America': 0.04,
    'Middle East': 0.05,
    'Africa': 0.03,
    'South Asia': 0.06,
    'Southeast Asia': 0.07,
    'Oceania': 0.05
  },
  
  skillObsolescenceRates: {
    'Technical Skills': 0.15,
    'Soft Skills': 0.05,
    'Domain Knowledge': 0.10,
    'Digital Literacy': 0.12,
    'Data Analysis': 0.14,
    'Problem Solving': 0.06,
    'Communication': 0.04,
    'Leadership': 0.03
  }
};

export function getTimeBasedAdjustment(
  baseScore: number,
  timeframe: number,
  industry: string,
  region: string,
  occupation: string
): number {
  // Calculate industry-specific time adjustment
  const industryFactor = getIndustryTimeFactor(industry, timeframe);
  
  // Calculate region-specific time adjustment
  const regionFactor = getRegionTimeFactor(region, timeframe);
  
  // Calculate occupation-specific time adjustment
  const occupationFactor = getOccupationTimeFactor(occupation, timeframe);
  
  // Combine all factors with appropriate weights
  const combinedFactor = (
    industryFactor * 0.4 +
    regionFactor * 0.3 +
    occupationFactor * 0.3
  );
  
  // Apply the combined factor to the base score
  return Math.min(1, baseScore * (1 + combinedFactor));
}

function getIndustryTimeFactor(industry: string, timeframe: number): number {
  // Industry-specific time-based adjustments
  const industryGrowthRates: Record<string, number> = {
    'Technology': 0.15,
    'Healthcare': 0.12,
    'Manufacturing': 0.08,
    'Finance': 0.10,
    'Retail': 0.06
  };
  
  const growthRate = industryGrowthRates[industry] || 0.08;
  return growthRate * Math.min(timeframe, 10);
}

function getRegionTimeFactor(region: string, timeframe: number): number {
  // Region-specific time-based adjustments
  const regionFactors: Record<string, number> = {
    'North America': 0.12,
    'Europe': 0.10,
    'Asia': 0.15,
    'South America': 0.08,
    'Africa': 0.06
  };
  
  const baseFactor = regionFactors[region] || 0.08;
  return baseFactor * Math.min(timeframe, 8);
}

function getOccupationTimeFactor(occupation: string, timeframe: number): number {
  // Occupation-specific time-based adjustments
  const occupationFactors: Record<string, number> = {
    'Software Developer': 0.15,
    'Data Scientist': 0.18,
    'Business Analyst': 0.12,
    'Project Manager': 0.08,
    'Sales Representative': 0.06
  };
  
  const baseFactor = occupationFactors[occupation] || 0.10;
  return baseFactor * Math.min(timeframe, 12);
}

export const getSkillObsolescenceTimeline = (
  skills: string[],
  timeframe: number
): { [key: string]: number[] } => {
  const timeline: { [key: string]: number[] } = {};
  
  skills.forEach(skill => {
    const obsolescenceRate = timeBasedFactors.skillObsolescenceRates[skill] || timeBasedFactors.baseGrowthRate;
    timeline[skill] = Array.from({ length: timeframe }, (_, year) => {
      return 1 - Math.pow(1 - obsolescenceRate, year + 1);
    });
  });
  
  return timeline;
};

export const getIndustryAutomationTimeline = (
  industry: string,
  timeframe: number
): number[] => {
  const growthRate = timeBasedFactors.industryGrowthRates[industry] || timeBasedFactors.baseGrowthRate;
  
  return Array.from({ length: timeframe }, (_, year) => {
    return Math.pow(1 + growthRate, year + 1);
  });
};

export const getRegionalAutomationTimeline = (
  region: string,
  timeframe: number
): number[] => {
  const growthRate = timeBasedFactors.regionalGrowthRates[region] || timeBasedFactors.baseGrowthRate;
  
  return Array.from({ length: timeframe }, (_, year) => {
    return Math.pow(1 + growthRate, year + 1);
  });
};
