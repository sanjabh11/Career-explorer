export interface WorkCondition {
  type: string;
  description: string;
  level: number;
  frequency: string;
  impact: string;
}

export interface SafetyRequirement {
  id: string;
  name: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  equipment: string[];
  procedures: string[];
}

export interface ScheduleFlexibility {
  workHours: {
    type: 'fixed' | 'flexible' | 'shift-based';
    description: string;
    typicalHours: number;
  };
  remoteWork: {
    available: boolean;
    type: 'fully-remote' | 'hybrid' | 'occasional' | 'on-site-only';
    percentage?: number;
  };
  shifts: {
    types: string[];
    rotation?: string;
    duration: number;
  };
  flexibility: {
    schedule: 'high' | 'medium' | 'low';
    location: 'high' | 'medium' | 'low';
    timeOff: 'high' | 'medium' | 'low';
  };
}

export interface WorkEnvironmentData {
  conditions: WorkCondition[];
  safety: SafetyRequirement[];
  schedule: ScheduleFlexibility;
  location: {
    type: string;
    description: string;
    requirements: string[];
  };
}
