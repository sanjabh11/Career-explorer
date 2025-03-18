/**
 * Interest Profiler Types - Version 1.3.0
 * Defines types for the O*NET Interest Profiler functionality
 */

export enum InterestArea {
  Realistic = 'Realistic',
  Investigative = 'Investigative',
  Artistic = 'Artistic',
  Social = 'Social',
  Enterprising = 'Enterprising',
  Conventional = 'Conventional'
}

export interface InterestAreaDefinition {
  code: InterestArea;
  title: string;
  description: string;
  shortDescription: string;
  examples: string[];
  mostImportantSkills: string[];
  color: string; // Hex color code for visual representation
}

export interface InterestProfilerQuestion {
  id: number;
  text: string;
  interestArea: InterestArea;
  shortForm: boolean; // Whether it's included in the short form (60 questions)
  miniForm: boolean;  // Whether it's included in the mini form (30 questions)
}

export interface InterestProfilerResults {
  scores: Record<InterestArea, number>;
  primary: InterestArea;
  secondary: InterestArea;
  tertiary: InterestArea;
  hollandCode: string; // 3-letter code of top interests (e.g., "RIA")
}

export interface JobZone {
  id: number;
  name: string;
  description: string;
  education: string;
  experience: string;
  training: string;
  examples: string[];
}

export interface MatchedOccupation {
  code: string;
  title: string;
  interestAreas: Record<InterestArea, number>;
  jobZone: number;
  bright_outlook: boolean;
  in_demand: boolean;
  green: boolean; // Green occupation (environmentally focused)
  matchScore: number;
}

export interface InterestProfilerState {
  answers: Map<number, number>; // Question ID to answer (1-5)
  currentSection: number;
  questionsPerSection: number;
  totalQuestions: number;
  formType: 'standard' | 'short' | 'mini';
  selectedJobZones: number[];
  results: InterestProfilerResults | null;
  matchedOccupations: MatchedOccupation[];
}
