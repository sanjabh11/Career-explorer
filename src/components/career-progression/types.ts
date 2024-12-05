export interface CareerLevel {
  id: string;
  title: string;
  level: number;
  description: string;
  requirements: {
    experience: number; // in years
    skills: string[];
    certifications?: string[];
    education?: string[];
  };
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  nextLevels: string[]; // IDs of possible next career levels
}

export interface CareerPath {
  id: string;
  name: string;
  description: string;
  domain: string;
  levels: CareerLevel[];
}

export interface ExperienceMilestone {
  id: string;
  title: string;
  description: string;
  yearsRequired: number;
  skills: string[];
  achieved: boolean;
}

export interface ProgressionRequirement {
  currentLevel: CareerLevel;
  targetLevel: CareerLevel;
  missingSkills: string[];
  missingCertifications: string[];
  experienceGap: number;
  educationGap: string[];
  estimatedTimeToAchieve: number; // in months
}
