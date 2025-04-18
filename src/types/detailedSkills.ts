/**
 * Detailed Skills Analysis Types
 * 
 * These types extend the basic skill types with more detailed information
 * about automation impact, future relevance, proficiency criteria, and
 * skill relationships.
 */

import { Skill as BaseSkill } from './skills';

/**
 * Automation impact on a skill
 */
export interface AutomationImpact {
  score: number;           // 0-100 scale, higher means more impact from automation
  category: 'Low' | 'Medium' | 'High';
  description: string;
}

/**
 * Future relevance of a skill
 */
export interface FutureRelevance {
  score: number;           // 0-100 scale, higher means more relevant in the future
  trend: 'Increasing' | 'Stable' | 'Decreasing';
  horizon: string;         // Time horizon for the projection (e.g., "5-10 years")
}

/**
 * Proficiency criteria for a skill level
 */
export interface ProficiencyCriteria {
  level: number;           // Skill level (1-5)
  description: string;     // Description of this proficiency level
  examples: string[];      // Examples of what someone at this level can do
  assessment_criteria: string[]; // Criteria for assessing this level
}

/**
 * Related skill information
 */
export interface RelatedSkill {
  id: string;
  name: string;
  relationship_strength: number; // 0-100 scale
  relationship_type: 'complementary' | 'prerequisite' | 'alternative';
}

/**
 * Detailed skill information
 */
export interface DetailedSkill extends BaseSkill {
  automation_impact: AutomationImpact;
  future_relevance: FutureRelevance;
  proficiency_criteria: ProficiencyCriteria[];
  related_skills: RelatedSkill[];
}

/**
 * Response from the detailed skills API
 */
export interface DetailedSkillsResponse {
  occupation_id: string;
  occupation_title: string;
  skills: DetailedSkill[];
  skill_categories: string[];
  last_updated: string;
  mockData?: boolean;
  error?: string;
}

/**
 * Skill gap analysis with detailed information
 */
export interface DetailedSkillGap {
  skill: DetailedSkill;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  priority: 'high' | 'medium' | 'low';
  automationRisk: number;
  futureRelevance: number;
}

/**
 * Skill development recommendation
 */
export interface SkillDevelopmentRecommendation {
  skill: DetailedSkill;
  currentLevel: number;
  targetLevel: number;
  priority: 'high' | 'medium' | 'low';
  estimatedTimeToAchieve: string;
  learningResources: LearningResource[];
}

/**
 * Learning resource for skill development
 */
export interface LearningResource {
  title: string;
  provider: string;
  url: string;
  type: 'course' | 'book' | 'video' | 'article' | 'certification' | 'other';
  level: 'beginner' | 'intermediate' | 'advanced';
  duration?: string;
  cost?: string | number;
  rating?: number;
}
