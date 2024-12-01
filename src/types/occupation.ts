import { APOItem } from './onet';

export interface BaseItem extends APOItem {
  name: string;
  description: string;
  value: number;
}

export interface Skill extends BaseItem {
  level: number;
  category: string;
}

export interface Task extends BaseItem {
  genAIImpact?: 'High' | 'Medium' | 'Low';
}

export interface WorkActivity extends BaseItem {
}

export interface Technology extends BaseItem {
}

export interface Knowledge extends BaseItem {
  level: number;
}

export interface Ability extends BaseItem {
  level: number;
}

export interface OccupationData {
  code: string;
  title: string;
  description: string;
  skills: Skill[];
  tasks: Task[];
  workActivities: WorkActivity[];
  technologies: Technology[];
  knowledge: Knowledge[];
  abilities: Ability[];
  industry_specific: boolean;
}

// For Recharts Tooltip
export interface CustomTooltipProps<TValue, TName> {
  active?: boolean;
  payload?: Array<{
    value: TValue;
    payload: {
      genAIImpact: string;
      fullName: string;
    };
  }>;
  label?: TName;
}
