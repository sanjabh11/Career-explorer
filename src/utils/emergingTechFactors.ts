import { AutomationFactor } from '@/types/automation';

export interface EmergingTechnology {
  name: string;
  impactFactor: number; // 0-1 scale
  timeToMaturity: number; // years
  relevanceScore: number; // 0-1 scale
  description: string;
  applicableIndustries: string[];
  skillsImpacted: string[];
}

// Predefined emerging technologies that affect automation
export const emergingTechnologies: EmergingTechnology[] = [
  {
    name: "Advanced AI/ML",
    impactFactor: 0.9,
    timeToMaturity: 2,
    relevanceScore: 0.95,
    description: "Next-generation AI systems with enhanced cognitive capabilities",
    applicableIndustries: ["Technology", "Finance", "Healthcare", "Manufacturing"],
    skillsImpacted: ["Data Analysis", "Decision Making", "Pattern Recognition"]
  },
  {
    name: "Robotic Process Automation",
    impactFactor: 0.85,
    timeToMaturity: 1,
    relevanceScore: 0.9,
    description: "Software robots automating repetitive tasks and processes",
    applicableIndustries: ["Finance", "Manufacturing", "Retail", "Technology"],
    skillsImpacted: ["Data Entry", "Document Processing", "Customer Service"]
  },
  {
    name: "Natural Language Processing",
    impactFactor: 0.8,
    timeToMaturity: 2,
    relevanceScore: 0.85,
    description: "Advanced language understanding and generation capabilities",
    applicableIndustries: ["Technology", "Healthcare", "Education", "Finance"],
    skillsImpacted: ["Communication", "Content Creation", "Customer Support"]
  },
  {
    name: "Computer Vision",
    impactFactor: 0.75,
    timeToMaturity: 3,
    relevanceScore: 0.8,
    description: "Advanced visual recognition and processing systems",
    applicableIndustries: ["Manufacturing", "Healthcare", "Retail", "Agriculture"],
    skillsImpacted: ["Visual Inspection", "Quality Control", "Security"]
  },
  {
    name: "IoT Automation",
    impactFactor: 0.7,
    timeToMaturity: 2,
    relevanceScore: 0.75,
    description: "Connected devices and sensors enabling automated operations",
    applicableIndustries: ["Manufacturing", "Agriculture", "Construction", "Retail"],
    skillsImpacted: ["Monitoring", "Maintenance", "Supply Chain Management"]
  }
];

export const isRelevantForTask = (task: AutomationFactor, tech: EmergingTechnology): boolean => {
  // Normalize complexity from 1-5 scale to 0-1 scale
  const normalizedComplexity = (task.complexity - 1) / 4;
  const repetitiveness = task.repetitiveness; // Already on 0-1 scale
  
  // Determine technology relevance based on task characteristics
  switch (tech.name) {
    case "Advanced AI/ML":
      // Highly relevant for complex, non-repetitive tasks
      return normalizedComplexity > 0.6;
      
    case "Robotic Process Automation":
      // Most relevant for repetitive tasks with low to medium complexity
      return repetitiveness > 0.7 && normalizedComplexity < 0.6;
      
    case "Natural Language Processing":
      // Relevant for moderately complex tasks involving language
      return normalizedComplexity > 0.4 && normalizedComplexity < 0.8;
      
    case "Computer Vision":
      // Relevant for visual tasks with moderate complexity
      return normalizedComplexity > 0.3 && normalizedComplexity < 0.7;
      
    case "IoT Automation":
      // Most relevant for repetitive monitoring and control tasks
      return repetitiveness > 0.6 && normalizedComplexity < 0.5;
      
    default:
      // Default relevance check for other technologies
      return repetitiveness > 0.5 || normalizedComplexity < 0.7;
  }
};

export const calculateEmergingTechImpact = (
  task: AutomationFactor,
  selectedTechs: EmergingTechnology[] = emergingTechnologies
): number => {
  const relevantTechs = selectedTechs.filter(tech => isRelevantForTask(task, tech));
  
  if (relevantTechs.length === 0) {
    return 0;
  }

  const weightedImpact = relevantTechs.reduce((impact, tech) => {
    const maturityDiscount = 1 - (tech.timeToMaturity / 10); // Discount future impacts
    return impact + (tech.impactFactor * tech.relevanceScore * maturityDiscount);
  }, 0);

  return weightedImpact / relevantTechs.length;
};

export const getTechnologyRecommendations = (
  industry: string,
  skillset: string[]
): EmergingTechnology[] => {
  return emergingTechnologies.filter(tech => {
    const industryMatch = tech.applicableIndustries.includes(industry);
    const skillMatch = tech.skillsImpacted.some(skill => skillset.includes(skill));
    return industryMatch && skillMatch;
  });
};

export const getEmergingTechTrends = (
  timeframe: number // years
): { [key: string]: number } => {
  const trends: { [key: string]: number } = {};
  
  emergingTechnologies.forEach(tech => {
    const maturityProgress = Math.min(1, timeframe / tech.timeToMaturity);
    trends[tech.name] = tech.impactFactor * maturityProgress;
  });
  
  return trends;
};
