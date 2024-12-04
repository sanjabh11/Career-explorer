// src/types/onet.ts

export interface APOItem {
  id?: string;
  name: string;
  title?: string;
  description: string;
  value: number;
  level?: number;
  importance?: number;
  genAIImpact?: 'High' | 'Medium' | 'Low' | number;
  scale?: string;
  hotTechnology?: boolean;
}

export interface Task extends APOItem {
  tools?: string[];
  workActivities?: string[];
  importance?: number;
  frequency?: number;
}

export interface Skill extends APOItem {
  category: string;
  importance?: number;
}

export interface Technology extends APOItem {
  category: string;
  yearIntroduced?: number;
  proficiencyLevel?: number;
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
  tasks: Task[];
  knowledge: APOItem[];
  skills: Skill[];
  abilities: APOItem[];
  technologies: Technology[];
  responsibilities: string[];
  educationLevel?: string;
  experienceLevel?: string;
  salaryRange?: {
    min: number;
    max: number;
    median: number;
  };
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

export interface DWA {
  id: string;
  description: string;
}

export interface JobZoneEducation {
  jobZone: string | number;
  description: string;
  education: string;
  experience: string;
  training: string;
}

export interface RelatedOccupation {
  title: string;
  similarity: number;
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
  value: number | string;
}

export interface ComplexityFactors {
  taskComplexity: number;
  skillRequirements: number;
  technologicalSophistication: number;
  decisionMakingAutonomy: number;
}
