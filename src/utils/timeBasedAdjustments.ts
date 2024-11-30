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

export const getTimeBasedAdjustment = (
  baseAPO: number,
  timeframe: number, // years
  industry: string,
  region: string,
  skillset: string[]
): number => {
  // Get industry-specific growth rate
  const industryGrowth = timeBasedFactors.industryGrowthRates[industry] || timeBasedFactors.baseGrowthRate;
  
  // Get region-specific growth rate
  const regionalGrowth = timeBasedFactors.regionalGrowthRates[region] || timeBasedFactors.baseGrowthRate;
  
  // Calculate skill obsolescence impact
  const skillObsolescence = skillset.reduce((total, skill) => {
    return total + (timeBasedFactors.skillObsolescenceRates[skill] || 0);
  }, 0) / skillset.length;
  
  // Combined growth rate
  const combinedGrowthRate = (
    timeBasedFactors.baseGrowthRate +
    industryGrowth +
    regionalGrowth +
    skillObsolescence
  ) / 4;
  
  // Apply compound growth
  return baseAPO * Math.pow(1 + combinedGrowthRate, timeframe);
};

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
