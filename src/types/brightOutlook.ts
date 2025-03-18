/**
 * Bright Outlook Types - Version 1.3.0
 * Defines types for the Bright Outlook and Growth Indicators functionality
 */

export enum BrightOutlookReason {
  RapidGrowth = 'rapid_growth',
  NumeroursJobOpenings = 'numerous_job_openings',
  NewAndEmerging = 'new_and_emerging'
}

export interface BrightOutlookData {
  code: string;
  title: string;
  reasons: BrightOutlookReason[];
  projectedGrowth?: number; // Percentage growth over 10 years
  projectedJobOpenings?: number; // Number of projected annual job openings
  newOccupation?: boolean; // Whether this is a new occupation in the O*NET database
}

export interface GrowthIndicator {
  name: string;
  description: string;
  value: number; // Could be a percentage growth or a raw number
  interpretation: 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative';
  timeframe: string; // e.g., '2022-2032'
  source: string; // e.g., 'BLS' or 'O*NET'
}

export interface IndustryTrend {
  industryName: string;
  growthRate: number; // Percentage
  occupations: {
    code: string;
    title: string;
    projectedGrowth: number;
  }[];
}

export interface OutlookCategory {
  name: string;
  description: string;
  occupations: {
    code: string;
    title: string;
    value: number; // For sorting/display
  }[];
}
