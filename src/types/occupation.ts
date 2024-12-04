import { APOItem as ONETAPOItem } from './onet';

export interface APOItem {
  name: string;
  description: string;
  value: number;
  level?: number;
  category?: string;
  genAIImpact?: 'High' | 'Medium' | 'Low';
}

export interface BaseItem extends ONETAPOItem {
  name: string;
  description: string;
  value: number;
  level?: number;
  category?: string;
}

export interface WorkActivity {
  name: string;
  description: string;
  value: number;
}

export interface Technology extends BaseItem {
  hotTechnology?: boolean;
  category?: string;
}

export interface Skill extends BaseItem {
  category: string;
}

export interface Knowledge extends BaseItem {
}

export interface Ability extends BaseItem {
}

export interface Task extends BaseItem {
  genAIImpact?: 'High' | 'Medium' | 'Low';
}

export interface AutomationFactor {
  id: string;
  name: string;
  weight: number;
  category: string;
  complexity: number;  // 1-5 scale
  repetitiveness: number; // 0-1 scale
  humanAICollaboration: number;  // 0-1 scale
  industrySpecific: boolean;
  emergingTechImpact: number;  // 0-1 scale
}

export interface IndustryContext {
  id: string;
  name: string;
  confidenceScore: number;
  marketTrends: {
    growth: number;
    volatility: number;
    techAdoption: number;
  };
  regulations: {
    impact: number;
    changeRate: number;
  };
}

export interface OccupationData {
  code: string;
  title: string;
  description: string;
  tasks: Task[];
  skills: Skill[];
  knowledge: Knowledge[];
  abilities: Ability[];
  technologies: Technology[];
  automationFactors: AutomationFactor[];
  workActivities: WorkActivity[];
  industry: string;
  industry_specific: boolean;
  lastUpdated: Date;
}

// Alias OccupationDetails to OccupationData for backward compatibility
export interface OccupationDetails {
  code: string;
  title: string;
  description: string;
  tasks: Task[];
  skills: Skill[];
  knowledge: Knowledge[];
  abilities: Ability[];
  technologies: Technology[];
  responsibilities: string[];
  sample_of_reported_job_titles: string[];
  updated: string;
  categories: any[];
  overallAPO?: number;
  workActivities?: WorkActivity[];
  automationFactors?: AutomationFactor[];
  lastUpdated?: Date;
}

// For Recharts Tooltip
export interface CustomTooltipProps<TValue, TName> {
  active?: boolean;
  payload?: Array<{
    value: TValue;
    name: TName;
    payload: {
      genAIImpact?: string;
      fullName?: string;
    };
  }>;
  label?: string;
}
