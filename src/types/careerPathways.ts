/**
 * Career Pathways Types
 * 
 * These types define the data structures for career advancement pathways,
 * including current occupation, advancement opportunities, and skill gaps.
 */

/**
 * Skill with level information
 */
export interface PathwaySkill {
  name: string;
  level?: number;
  current_level?: number;
  required_level?: number;
  gap?: number;
}

/**
 * Certification or credential
 */
export interface Certification {
  name: string;
  required: boolean;
  has: boolean;
}

/**
 * Education requirement
 */
export interface EducationRequirement {
  current: string;
  required: string;
  gap: boolean;
}

/**
 * Experience requirement
 */
export interface ExperienceRequirement {
  current: string;
  required: string;
  gap: boolean;
}

/**
 * Advancement criteria - what's needed to advance to the next level
 */
export interface AdvancementCriteria {
  education: EducationRequirement;
  experience: ExperienceRequirement;
  skills: PathwaySkill[];
  certifications: Certification[];
}

/**
 * Salary information
 */
export interface SalaryInfo {
  median: number;
  range: {
    low: number;
    high: number;
  };
}

/**
 * Base occupation information
 */
export interface BaseOccupation {
  id: string;
  title: string;
  description: string;
  education: string;
  experience: string;
  salary: SalaryInfo;
  skills: PathwaySkill[];
}

/**
 * Current occupation
 */
export interface CurrentOccupation extends BaseOccupation {
  level: 'current';
}

/**
 * Advancement occupation - a position that represents career advancement
 */
export interface AdvancementOccupation extends BaseOccupation {
  level: 'advancement';
  similarity: number;
  advancement_criteria: AdvancementCriteria;
}

/**
 * Related occupation - a lateral move, not necessarily advancement
 */
export interface RelatedOccupation extends BaseOccupation {
  level: 'lateral';
  similarity: number;
}

/**
 * Career pathways response from the API
 */
export interface CareerPathwaysResponse {
  current_occupation: CurrentOccupation;
  advancement_pathways: AdvancementOccupation[];
  related_occupations: RelatedOccupation[];
  last_updated: string;
  mockData?: boolean;
  error?: string;
}

/**
 * Career advancement plan
 */
export interface CareerAdvancementPlan {
  target_occupation: AdvancementOccupation;
  skill_gaps: PathwaySkill[];
  education_gap: EducationRequirement;
  experience_gap: ExperienceRequirement;
  certification_gaps: Certification[];
  estimated_time_to_achieve: string;
  recommended_steps: string[];
}
