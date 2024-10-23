// src/utils/apoCalculations.ts

// Import necessary types and data
import { APOItem } from '@/types/onet';
import { APO_CATEGORIES, SynonymMap } from './apoData';

const findBestMatch = (text: string, categories: Record<string, number>): number => {
  let bestMatch = 0;
  let bestScore = 0;

  for (const [key, value] of Object.entries(categories)) {
    const score = calculateSimilarity(text, key);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = value;
    }
  }

  return bestMatch;
};

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
