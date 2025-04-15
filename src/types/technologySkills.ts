// src/types/technologySkills.ts

export interface HotTechnology {
  id: string;
  name: string;
  category: string;
  description: string;
  adoptionRate: number;
  growthRate: number;
  trend?: string;
  resourceUrl?: string;
  relatedOccupations: {
    code: string;
    title: string;
    relevance: number;
  }[];
  skills: {
    id: string;
    name: string;
    importance: number;
  }[];
}

export interface TechnologyTrend {
  id: string;
  name: string;
  category: string;
  adoptionRate: number;
  growthRate: number;
  yearIntroduced: number;
  maturityLevel: 'emerging' | 'growing' | 'mature' | 'declining';
  trend?: string;
  currentAdoption?: number;
  historicalData?: {
    year: number;
    value: number;
  }[];
  industries: {
    id: string;
    name: string;
    adoptionRate: number;
  }[];
}

export interface TechnologyTrendData {
  trends: TechnologyTrend[];
  yearlyData: {
    year: number;
    technologies: {
      id: string;
      adoptionRate: number;
    }[];
  }[];
}
