/**
 * Technology Skills Types - Version 1.3.0
 * Defines types for the Technology Skills Integration functionality
 */

export interface TechnologySkill {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  example_titles?: string[];
  hot_technology: boolean;
  emerging: boolean;
  adoption_rate?: number; // 0-1 scale
  first_added?: string; // Date when first added to O*NET
  last_updated?: string; // Date when last updated
}

export interface TechnologyCategory {
  id: string;
  name: string;
  description: string;
  subcategories?: {
    id: string;
    name: string;
    description: string;
  }[];
}

export interface OccupationTechnology {
  occupationCode: string;
  technologies: {
    id: string;
    name: string;
    importance: number;
    level: number;
    frequency_of_use?: number;
  }[];
}

export interface TechnologyTrend {
  technologyId: string;
  name: string;
  growthRate: number; // Percentage
  adoptionTimeline: {
    year: number;
    adoption: number; // Percentage
  }[];
  impactedOccupations: {
    code: string;
    title: string;
    impact: 'high' | 'medium' | 'low';
  }[];
}

export interface HotTechnology {
  id: string;
  name: string;
  description: string;
  reasons: string[];
  growthMetrics: {
    currentAdoption: number;
    projectedGrowth: number;
    timePeriod: string;
  };
  topOccupations: {
    code: string;
    title: string;
    score: number;
  }[];
}
