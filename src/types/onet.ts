// src/types/onet.ts

export interface APOCategories {
  tasks: Record<string, number>;
  knowledge: Record<string, number>;
  skills: Record<string, number>;
  abilities: Record<string, number>;
  technologies: Record<string, number>;
}

export interface APOItem {
  name: string;
  title?: string;
  description: string;
  importance?: number;
  level?: number;
  value: number;
  scale?: string;
  commodityCode?: string;
  hotTechnology?: boolean;
  date?: string;
  genAIImpact?: 'Low' | 'Medium' | 'High';
}

export interface Occupation {
  code: string;
  title: string;
}

export interface OccupationDetails extends Occupation {
  description: string;
  sample_of_reported_job_titles: string[];
  updated: string;
  overallAPO?: number;
  categories: CategoryData[];
  tasks: APOItem[];
  knowledge: APOItem[];
  skills: APOItem[];
  abilities: APOItem[];
  technologies: APOItem[];
}

export interface CategoryData {
  name: string;
  apo: number;
  details: APOItem[];
  icon?: React.ReactNode;
}

export interface TopCareer {
  title: string;
  apo: number;
  code: string;
}

// Add the missing type definitions
export interface DWA {
  id: string;
  description: string;
  // Add any other properties that might be relevant
}

export interface JobZoneEducation {
  jobZone: string | number;
  description: string;
  education: string;
  experience: string;
  training: string;
  // Add any other properties that might be relevant
}

export interface RelatedOccupation {
  title: string;
  similarity: number;
  // Add any other properties that might be relevant
}

export interface WagesEmploymentTrends {
  median: number;
  employment: number;
  growthRate: number;
  projectedOpenings: number;
}

export interface WorkContext {
  category: string;
  description: string;
  value: number | string; // Depending on how the value is represented, it could be a number or string
}
