// src/types/detailedWorkActivities.ts

export interface DetailedWorkActivity {
  id: string;
  description: string;
  category?: string;
  importance?: number;
  frequency?: number;
}

export interface DWACategory {
  id: string;
  name: string;
  description?: string;
  activities: DetailedWorkActivity[];
  activitiesCount?: number;
  mostImportant?: string;
}

export interface Task {
  id: string;
  description: string;
  importance?: number;
}

export interface TaskToDWA {
  tasks: Task[];
  activities: DetailedWorkActivity[];
  connections: {
    taskId: string;
    activityId: string;
    strength?: number;
  }[];
}
