export interface CareerLevel {
  id: string;
  title: string;
  description: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  requirements: {
    experience: number;
    skills: string[];
    education: string[];
    certifications?: string[];
  };
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
  id: string;
  type: 'skill' | 'education' | 'experience';
  name: string;
  description?: string;
  status: 'not-started' | 'in-progress' | 'completed';
  timeToComplete?: number; // in months
}

export interface AdvancementRequirements {
  currentLevel: CareerLevel;
  targetLevel: CareerLevel;
  requirements: {
    skillGaps: string[];
    educationGaps: string[];
    experienceGap: number;
  };
  timeEstimates: {
    skillAcquisition: number;
    education: number;
    experience: number;
  };
  totalTimeEstimate: number;
  salaryIncrease: {
    min: number;
    max: number;
    percentage: number;
  };
}
