/**
 * Detailed Work Activities Types - Version 1.3.0
 * Defines types for the Detailed Work Activities (DWA) functionality
 */

export interface DetailedWorkActivity {
  id: string;
  description: string;
  category: string; // Functional area
  frequency?: number; // How frequently this DWA is performed
  importance?: number; // How important this DWA is to the occupation
  parentActivity?: string; // ID of parent work activity if hierarchical
  relatedOccupations?: string[]; // Occupation codes that share this DWA
}

export interface WorkActivityCategory {
  id: string;
  name: string;
  description: string;
  activities: DetailedWorkActivity[];
}

export interface TaskToDWAMapping {
  taskId: string;
  taskDescription: string;
  detailedWorkActivities: DetailedWorkActivity[];
}

export interface DWAHierarchy {
  id: string;
  name: string;
  description: string;
  children: DWAHierarchy[];
  level: number; // Hierarchy level (1 for highest)
}

export interface DWAFrequencyData {
  dwaId: string;
  description: string;
  frequency: {
    daily: number;
    weekly: number;
    monthly: number;
    rarely: number;
  };
}
