export interface WorkCondition {
  id: string;
  name: string;
  level: number;
  description: string;
  frequency: string;
  impactOnPerformance: number;
  adaptationOptions: string[];
}

export interface SafetyRequirement {
  id: string;
  category: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  complianceLevel: 'mandatory' | 'recommended' | 'optional';
  trainingRequired: boolean;
  updateFrequency: string;
  verificationMethod: string;
  consequences: string[];
}

export interface ScheduleFlexibility {
  overallFlexibility: number;
  workHours: {
    type: 'flexible' | 'fixed' | 'shift-based';
    coreHours: string[];
    flexibleRanges: string[];
    averageHoursPerWeek: number;
  };
  shiftPatterns: {
    hasShifts: boolean;
    rotationFrequency: string;
    typicalShifts: string[];
  };
  timeOffPolicy: {
    paidTimeOff: number;
    sickDays: number;
    holidaySchedule: string;
    advanceNoticeRequired: number;
  };
  workloadDistribution: {
    peakPeriods: string[];
    seasonalVariation: string;
    overtimeFrequency: string;
  };
  accommodations: string[];
}

export interface RemoteWorkOpportunity {
  remoteWorkEligibility: number;
  currentStatus: 'remote' | 'hybrid' | 'onsite';
  requirements: {
    technology: string[];
    security: string[];
    workspace: string[];
  };
  schedule: {
    minimumOnsiteDays: number;
    flexibleHours: boolean;
    timeZoneRequirements: string;
  };
  benefits: {
    equipmentAllowance: number;
    internetStipend: number;
    coworkingAllowance: number;
  };
  limitations: string[];
  successFactors: string[];
}

export interface WorkEnvironmentData {
  conditions: WorkCondition[];
  safetyRequirements: SafetyRequirement[];
  scheduleFlexibility: ScheduleFlexibility;
  remoteWorkOpportunities: RemoteWorkOpportunity;
  overallScore: number;
  lastUpdated: string;
  nextAssessmentDate: string;
}
