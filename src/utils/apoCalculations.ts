// src/utils/apoCalculations.ts

// Import necessary types and data
import { APOItem } from '@/types/onet';
import { AutomationFactor, TaskComplexity, IndustryContext, APOResult } from '@/types/automation';
import { APO_CATEGORIES, SynonymMap } from './apoData';
import { OccupationData } from '@/types/occupation';
import {
  calculateTaskComplexity,
  calculateTaskRepetitiveness,
  calculateHumanAIInteraction,
  calculateTechImpact,
  calculateSkillComplexity,
  calculateSkillAICollaboration,
  calculateSkillTechImpact,
  calculateKnowledgeComplexity,
  calculateKnowledgeAICollaboration,
  calculateKnowledgeTechImpact,
  calculateAbilityComplexity,
  calculateAbilityRepetitiveness,
  calculateAbilityAICollaboration,
  calculateAbilityTechImpact,
} from './calculationHelpers';

const calculateSimilarity = (str1: string, str2: string): number => {
  const words1 = str1.toLowerCase().split(/\s+/);
  const words2 = str2.toLowerCase().split(/\s+/);
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  const intersection = new Set(words1.filter(x => set2.has(x)));
  return intersection.size / Math.max(set1.size, set2.size);
};

export const calculateAPO = (data: APOItem, type: string): number => {
  const categoryAPOs = APO_CATEGORIES[type as keyof typeof APO_CATEGORIES];
  if (!categoryAPOs) return 0;

  const itemName = data.name || data.title || '';
  const itemDescription = data.description || '';
  const fullText = `${itemName} ${itemDescription}`.toLowerCase();

  let bestMatch = 0;
  let bestScore = 0;

  for (const [key, value] of Object.entries(categoryAPOs)) {
    const score = calculateSimilarity(fullText, key);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = value;
    }
  }

  // If the best match score is too low, try matching with synonyms
  if (bestScore < 0.3) {
    for (const [key, synonyms] of Object.entries(SynonymMap)) {
      for (const synonym of synonyms) {
        const score = calculateSimilarity(fullText, synonym);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = categoryAPOs[key] || 0;
        }
      }
    }
  }

  return applyFactors(bestMatch, data);
};

const applyFactors = (baseAPO: number, data: APOItem): number => {
  const importanceFactor = data.importance ? data.importance / 100 : 1;
  const levelFactor = data.level ? data.level / 100 : 1;
  let genAIFactor = 1;

  if (data.genAIImpact) {
    switch (data.genAIImpact) {
      case 'Low':
        genAIFactor = 0.9;
        break;
      case 'Medium':
        genAIFactor = 1.1;
        break;
      case 'High':
        genAIFactor = 1.3;
        break;
    }
  }

  return baseAPO * importanceFactor * levelFactor * genAIFactor;
};

export const getAverageAPO = (items: APOItem[] | undefined, category: string): number => {
  if (!items || items.length === 0) {
    console.log(`No valid items found for category: ${category}`);
    return 0;
  }
  
  const totalAPO = items.reduce((sum, item) => {
    const itemAPO = calculateAPO(item, category);
    console.log(`Item: "${item.name || item.title}", APO: ${itemAPO.toFixed(2)}`);
    return sum + itemAPO;
  }, 0);
  
  const averageAPO = totalAPO / items.length;
  console.log(`Average APO for ${category}: ${averageAPO.toFixed(2)}%`);
  return averageAPO;
};

export const calculateOverallAPO = (data: {
  tasks: APOItem[];
  knowledge: APOItem[];
  skills: APOItem[];
  abilities: APOItem[];
  technologies: APOItem[];
}): number => {
  const categories = ['tasks', 'knowledge', 'skills', 'abilities', 'technologies'];
  const categoryWeights = {
    tasks: 0.3,
    knowledge: 0.2,
    skills: 0.2,
    abilities: 0.15,
    technologies: 0.15
  };

  const weightedAPOs = categories.map(category => {
    const items = data[category as keyof typeof data];
    const averageAPO = getAverageAPO(items, category);
    return averageAPO * categoryWeights[category as keyof typeof categoryWeights];
  });

  const overallAPO = weightedAPOs.reduce((sum, apo) => sum + apo, 0);
  console.log(`Overall APO: ${overallAPO.toFixed(2)}%`);
  return overallAPO;
};

export const assignGenAIImpact = (item: APOItem): APOItem => {
  const lowImpactKeywords = ['manual', 'physical', 'inspect', 'repair'];
  const highImpactKeywords = ['analyze', 'calculate', 'predict', 'optimize'];
  const text = `${item.name} ${item.description}`.toLowerCase();

  if (highImpactKeywords.some(keyword => text.includes(keyword))) {
    return { ...item, genAIImpact: 'High' };
  } else if (lowImpactKeywords.some(keyword => text.includes(keyword))) {
    return { ...item, genAIImpact: 'Low' };
  } else {
    return { ...item, genAIImpact: 'Medium' };
  }
};

// Enhanced APO Calculations
export const calculateEnhancedAPO = (
  item: AutomationFactor,
  industryContext?: IndustryContext
): APOResult => {
  const baseAPO = calculateBaseAPO(item);
  const complexityFactor = getComplexityFactor(item.complexity);
  const collaborationFactor = getHumanAICollaborationFactor(item.humanAICollaboration);
  const industryFactor = getIndustrySpecificFactor(item.industrySpecific, industryContext);
  const emergingTechFactor = getEmergingTechFactor(item.emergingTechImpact);

  const score = baseAPO * complexityFactor * collaborationFactor * industryFactor * emergingTechFactor;
  
  return {
    score,
    factors: {
      baseAPO,
      complexityFactor,
      collaborationFactor,
      industryFactor,
      emergingTechFactor
    },
    confidence: calculateConfidenceScore(item),
    recommendations: generateRecommendations(item, score)
  };
};

const calculateBaseAPO = (item: AutomationFactor): number => {
  // Base calculation considering weight and category
  const categoryMultiplier = getCategoryMultiplier(item.category);
  return item.weight * categoryMultiplier;
};

const getComplexityFactor = (complexity: number): number => {
  // Higher complexity = lower automation potential
  return 1 - (complexity * 0.15);
};

const getHumanAICollaborationFactor = (collaboration: number): number => {
  // Higher collaboration need = lower full automation potential
  return 1 - (collaboration * 0.2);
};

const getIndustrySpecificFactor = (
  isIndustrySpecific: boolean,
  context?: IndustryContext
): number => {
  if (!context) return isIndustrySpecific ? 0.8 : 1;
  
  // Consider industry context if available
  const techMaturityImpact = context.marketTrends.techAdoption * 0.4;
  const regulatoryImpact = (1 - context.regulations.impact) * 0.3;
  const humanInteractionImpact = (1 - context.humanInteractionLevel) * 0.3;
  
  return isIndustrySpecific 
    ? (techMaturityImpact + regulatoryImpact + humanInteractionImpact) * 0.8
    : 1;
};

const getEmergingTechFactor = (impact: number): number => {
  // Higher emerging tech impact = higher automation potential
  return 1 + (impact * 0.3);
};

const calculateConfidenceScore = (item: AutomationFactor): number => {
  // Calculate confidence based on data quality and completeness
  const factors = [
    item.weight !== undefined,
    item.complexity >= 1 && item.complexity <= 5,
    item.humanAICollaboration >= 0 && item.humanAICollaboration <= 1,
    item.emergingTechImpact >= 0 && item.emergingTechImpact <= 1
  ];
  
  return factors.filter(Boolean).length / factors.length;
};

const generateRecommendations = (
  item: AutomationFactor,
  score: number
): string[] => {
  const recommendations: string[] = [];

  if (score > 0.8) {
    recommendations.push("High automation potential - Consider full automation");
  } else if (score > 0.5) {
    recommendations.push("Medium automation potential - Consider partial automation");
    if (item.humanAICollaboration > 0.6) {
      recommendations.push("Focus on human-AI collaboration tools");
    }
  } else {
    recommendations.push("Low automation potential - Focus on augmentation");
    if (item.complexity > 3) {
      recommendations.push("Consider breaking down into simpler sub-tasks");
    }
  }

  if (item.emergingTechImpact > 0.7) {
    recommendations.push("Monitor emerging technologies for new automation opportunities");
  }

  return recommendations;
};

const getCategoryMultiplier = (category: string): number => {
  const categoryWeights: Record<string, number> = {
    'cognitive': 0.9,
    'manual': 0.7,
    'social': 0.5,
    'creative': 0.6,
    'analytical': 0.8
  };
  
  return categoryWeights[category.toLowerCase()] || 0.7;
};

export const calculateEnhancedAPOWithContext = async (
  occupation: OccupationData,
  industryContext: IndustryContext
): Promise<{ apo: number; factors: AutomationFactor[] }> => {
  // Convert occupation data into automation factors
  const factors: AutomationFactor[] = [
    // Task-based factor
    {
      id: 'tasks',
      name: 'Task Automation',
      weight: 0.3,
      category: 'operational',
      complexity: calculateTaskComplexity(occupation.tasks),
      repetitiveness: calculateTaskRepetitiveness(occupation.tasks),
      humanAICollaboration: calculateHumanAIInteraction(occupation.tasks),
      industrySpecific: occupation.industry_specific,
      emergingTechImpact: calculateTechImpact(occupation.technologies),
    },
    // Skills-based factor
    {
      id: 'skills',
      name: 'Skill Requirements',
      weight: 0.25,
      category: 'cognitive',
      complexity: calculateSkillComplexity(occupation.skills),
      repetitiveness: 0.4, // Skills generally have moderate repetitiveness
      humanAICollaboration: calculateSkillAICollaboration(occupation.skills),
      industrySpecific: occupation.industry_specific,
      emergingTechImpact: calculateSkillTechImpact(occupation.skills),
    },
    // Knowledge-based factor
    {
      id: 'knowledge',
      name: 'Knowledge Depth',
      weight: 0.25,
      category: 'cognitive',
      complexity: calculateKnowledgeComplexity(occupation.knowledge),
      repetitiveness: 0.3, // Knowledge work tends to be less repetitive
      humanAICollaboration: calculateKnowledgeAICollaboration(occupation.knowledge),
      industrySpecific: occupation.industry_specific,
      emergingTechImpact: calculateKnowledgeTechImpact(occupation.knowledge),
    },
    // Ability-based factor
    {
      id: 'abilities',
      name: 'Required Abilities',
      weight: 0.2,
      category: 'physical',
      complexity: calculateAbilityComplexity(occupation.abilities),
      repetitiveness: calculateAbilityRepetitiveness(occupation.abilities),
      humanAICollaboration: calculateAbilityAICollaboration(occupation.abilities),
      industrySpecific: occupation.industry_specific,
      emergingTechImpact: calculateAbilityTechImpact(occupation.abilities),
    },
  ];

  // Calculate enhanced APO for each factor
  const factorResults = factors.map(factor => {
    const result = calculateEnhancedAPO(factor, industryContext);
    return {
      ...factor,
      weight: result.score / 100, // Normalize to 0-1 range
    };
  });

  // Calculate overall APO as weighted average
  const totalAPO = factorResults.reduce((sum, factor) => sum + (factor.weight * 100), 0) / factorResults.length;

  return {
    apo: totalAPO,
    factors: factorResults,
  };
};
