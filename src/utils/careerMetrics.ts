// src/utils/careerMetrics.ts

import { JobOutlook } from '@/types/onet';

/**
 * Calculates a growth-adjusted APO score that considers both automation risk and job growth
 * @param apoScore The automation potential score (0-100)
 * @param growthRate The projected growth rate (percentage)
 * @returns A growth-adjusted APO score
 */
export const calculateGrowthAdjustedAPO = (
  apoScore: number,
  growthRate: number
): number => {
  // Convert APO to a 0-1 scale where higher means more automation risk
  const normalizedAPO = apoScore / 100;
  
  // Convert growth rate to a 0-1 scale where higher means more growth
  // Assuming growth rates typically range from -30% to +30%
  const normalizedGrowth = (growthRate + 30) / 60;
  const cappedGrowth = Math.max(0, Math.min(1, normalizedGrowth));
  
  // Calculate adjustment factor
  // High growth reduces the effective APO score
  const growthAdjustmentFactor = 1 - (cappedGrowth * 0.5);
  
  // Apply adjustment to APO score
  const adjustedAPO = normalizedAPO * growthAdjustmentFactor;
  
  // Convert back to 0-100 scale
  return adjustedAPO * 100;
};

/**
 * Calculates a career viability score that combines automation risk and job outlook
 * @param apoScore The automation potential score (0-100)
 * @param jobOutlook The job outlook data
 * @returns A career viability score (0-100)
 */
export const calculateCareerViabilityScore = (
  apoScore: number,
  jobOutlook: JobOutlook
): number => {
  // Factors to consider:
  // 1. Automation risk (inverse of APO)
  // 2. Growth rate
  // 3. Projected openings
  // 4. Bright outlook status
  
  // Convert APO to automation resistance (higher is better)
  const automationResistance = 100 - apoScore;
  
  // Normalize growth rate to 0-100 scale
  // Assuming growth rates typically range from -30% to +30%
  const normalizedGrowth = Math.max(0, Math.min(100, ((jobOutlook.growthRate + 30) / 60) * 100));
  
  // Normalize projected openings to 0-100 scale
  // Assuming projected openings typically range from 0 to 500,000
  const normalizedOpenings = Math.min(100, (jobOutlook.projectedOpenings / 500000) * 100);
  
  // Bright outlook bonus
  const brightOutlookBonus = jobOutlook.brightOutlook ? 10 : 0;
  
  // Calculate weighted score
  const viabilityScore = (
    (automationResistance * 0.4) +
    (normalizedGrowth * 0.3) +
    (normalizedOpenings * 0.2) +
    brightOutlookBonus
  );
  
  // Ensure score is within 0-100 range
  return Math.max(0, Math.min(100, viabilityScore));
};

/**
 * Generates a recommendation based on APO score and job outlook
 * @param apoScore The automation potential score (0-100)
 * @param jobOutlook The job outlook data
 * @returns A recommendation string
 */
export const generateCareerRecommendation = (
  apoScore: number,
  jobOutlook: JobOutlook
): string => {
  const viabilityScore = calculateCareerViabilityScore(apoScore, jobOutlook);
  
  if (viabilityScore > 80) {
    return "This occupation shows strong future prospects with high resistance to automation and positive growth outlook. It's an excellent career choice for long-term stability.";
  } else if (viabilityScore > 60) {
    return "This occupation has good future prospects with moderate resistance to automation and decent growth. Consider developing specialized skills to enhance job security.";
  } else if (viabilityScore > 40) {
    return "This occupation has mixed prospects. While there are job opportunities, automation may impact certain aspects. Focus on developing skills that complement technology rather than compete with it.";
  } else if (viabilityScore > 20) {
    return "This occupation faces significant automation challenges despite some growth. Consider upskilling or exploring related fields with better long-term prospects.";
  } else {
    return "This occupation faces substantial challenges from both automation and limited growth. Consider exploring alternative career paths or specialized niches within this field.";
  }
};

/**
 * Categorizes an occupation based on APO and growth rate
 * @param apoScore The automation potential score (0-100)
 * @param growthRate The projected growth rate (percentage)
 * @returns A category string
 */
export const categorizeOccupation = (
  apoScore: number,
  growthRate: number
): string => {
  const highAPO = apoScore > 60;
  const highGrowth = growthRate > 7;
  
  if (highGrowth && !highAPO) {
    return "High Growth, Low Automation Risk";
  } else if (highGrowth && highAPO) {
    return "High Growth, High Automation Risk";
  } else if (!highGrowth && !highAPO) {
    return "Low Growth, Low Automation Risk";
  } else {
    return "Low Growth, High Automation Risk";
  }
};

/**
 * Calculates the time horizon for significant automation impact
 * @param apoScore The automation potential score (0-100)
 * @returns A time horizon string
 */
export const calculateAutomationTimeHorizon = (apoScore: number): string => {
  if (apoScore > 80) {
    return "Short-term (1-3 years)";
  } else if (apoScore > 60) {
    return "Medium-term (3-5 years)";
  } else if (apoScore > 40) {
    return "Long-term (5-10 years)";
  } else {
    return "Extended (10+ years)";
  }
};
