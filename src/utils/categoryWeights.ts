import { CategoryWeight } from '../types/skills';

export const defaultCategoryWeights: CategoryWeight = {
  tasks: 0.25,
  knowledge: 0.20,
  skills: 0.25,
  abilities: 0.15,
  technologies: 0.15
};

export const validateWeights = (weights: CategoryWeight): boolean => {
  const sum = Object.values(weights).reduce((acc, val) => acc + val, 0);
  return Math.abs(sum - 1) < 0.001; // Allow for small floating-point differences
};

export const industryWeightProfiles: Record<string, Partial<CategoryWeight>> = {
  'Technology': {
    technologies: 0.25,
    skills: 0.30,
    knowledge: 0.20,
    abilities: 0.10,
    tasks: 0.15
  },
  'Healthcare': {
    knowledge: 0.30,
    abilities: 0.25,
    skills: 0.20,
    tasks: 0.15,
    technologies: 0.10
  },
  'Manufacturing': {
    tasks: 0.30,
    technologies: 0.25,
    skills: 0.20,
    abilities: 0.15,
    knowledge: 0.10
  },
  'Finance': {
    knowledge: 0.30,
    skills: 0.25,
    technologies: 0.20,
    abilities: 0.15,
    tasks: 0.10
  },
  'Education': {
    knowledge: 0.35,
    abilities: 0.25,
    skills: 0.20,
    tasks: 0.10,
    technologies: 0.10
  }
};

export const adjustWeightsByIndustry = (
  baseWeights: CategoryWeight,
  industry: string
): CategoryWeight => {
  const industryProfile = industryWeightProfiles[industry];
  if (!industryProfile) return baseWeights;

  const adjustedWeights = { ...baseWeights, ...industryProfile };
  return normalizeWeights(adjustedWeights);
};

export const calculateWeightedScore = (
  scores: Record<keyof CategoryWeight, number>,
  weights: CategoryWeight
): number => {
  return Object.entries(weights).reduce(
    (total, [category, weight]) => total + scores[category as keyof CategoryWeight] * weight,
    0
  );
};

export const calculateCategoryImpact = (
  scores: Record<keyof CategoryWeight, number>,
  weights: CategoryWeight
): Record<keyof CategoryWeight, number> => {
  const totalScore = calculateWeightedScore(scores, weights);
  
  return Object.entries(weights).reduce(
    (impacts, [category, weight]) => ({
      ...impacts,
      [category]: (scores[category as keyof CategoryWeight] * weight) / totalScore
    }),
    {} as Record<keyof CategoryWeight, number>
  );
};

export const suggestWeightOptimization = (
  currentWeights: CategoryWeight,
  scores: Record<keyof CategoryWeight, number>,
  industry: string
): CategoryWeight => {
  const industryProfile = industryWeightProfiles[industry];
  if (!industryProfile) return currentWeights;

  // Calculate current performance
  const currentScore = calculateWeightedScore(scores, currentWeights);
  
  // Try industry-recommended weights
  const industryWeights = normalizeWeights({ ...currentWeights, ...industryProfile });
  const industryScore = calculateWeightedScore(scores, industryWeights);

  // If industry weights perform better, gradually shift towards them
  if (industryScore > currentScore) {
    return Object.entries(currentWeights).reduce(
      (optimized, [category, weight]) => ({
        ...optimized,
        [category]: weight * 0.7 + (industryProfile[category as keyof CategoryWeight] || weight) * 0.3
      }),
      {} as CategoryWeight
    );
  }

  return currentWeights;
};

function normalizeWeights(weights: CategoryWeight): CategoryWeight {
  const sum = Object.values(weights).reduce((acc, val) => acc + val, 0);
  return Object.entries(weights).reduce(
    (normalized, [category, weight]) => ({
      ...normalized,
      [category]: weight / sum
    }),
    {} as CategoryWeight
  );
}
