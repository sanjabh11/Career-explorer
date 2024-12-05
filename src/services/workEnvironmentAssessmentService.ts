import { 
  WorkCondition, 
  SafetyRequirement, 
  ScheduleFlexibility, 
  WorkEnvironmentData,
  RemoteWorkOpportunity
} from '@/components/work-environment/types';

class WorkEnvironmentAssessmentService {
  async getWorkConditions(occupationId: string): Promise<WorkCondition[]> {
    // TODO: Replace with actual API call
    return [
      {
        id: "wc1",
        name: "Physical Demands",
        level: 0.7,
        description: "Requires standing for long periods and occasional heavy lifting",
        frequency: "daily",
        impactOnPerformance: 0.8,
        adaptationOptions: [
          "Ergonomic equipment",
          "Regular breaks",
          "Proper lifting techniques"
        ]
      },
      {
        id: "wc2",
        name: "Environmental Conditions",
        level: 0.5,
        description: "Indoor office environment with controlled temperature",
        frequency: "constant",
        impactOnPerformance: 0.3,
        adaptationOptions: [
          "Adjustable lighting",
          "Temperature control",
          "Air quality monitoring"
        ]
      }
    ];
  }

  async getSafetyRequirements(occupationId: string): Promise<SafetyRequirement[]> {
    // TODO: Replace with actual API call
    return [
      {
        id: "sr1",
        category: "Personal Protective Equipment",
        description: "Safety glasses and steel-toed boots required",
        priority: "high",
        complianceLevel: "mandatory",
        trainingRequired: true,
        updateFrequency: "annual",
        verificationMethod: "supervisor check",
        consequences: [
          "Workplace injury risk",
          "Regulatory non-compliance",
          "Insurance implications"
        ]
      },
      {
        id: "sr2",
        category: "Health Protocols",
        description: "Regular health screenings and vaccinations",
        priority: "medium",
        complianceLevel: "recommended",
        trainingRequired: true,
        updateFrequency: "bi-annual",
        verificationMethod: "health records",
        consequences: [
          "Health risk exposure",
          "Team health impact",
          "Productivity loss"
        ]
      }
    ];
  }

  async getScheduleFlexibility(occupationId: string): Promise<ScheduleFlexibility> {
    // TODO: Replace with actual API call
    return {
      overallFlexibility: 0.6,
      workHours: {
        type: "flexible",
        coreHours: ["09:00", "15:00"],
        flexibleRanges: ["07:00-19:00"],
        averageHoursPerWeek: 40
      },
      shiftPatterns: {
        hasShifts: false,
        rotationFrequency: "none",
        typicalShifts: []
      },
      timeOffPolicy: {
        paidTimeOff: 20,
        sickDays: 10,
        holidaySchedule: "standard",
        advanceNoticeRequired: 14
      },
      workloadDistribution: {
        peakPeriods: ["quarter-end", "year-end"],
        seasonalVariation: "moderate",
        overtimeFrequency: "occasional"
      },
      accommodations: [
        "Part-time options available",
        "Compressed work week possible",
        "Job sharing considered"
      ]
    };
  }

  async getRemoteWorkOpportunities(occupationId: string): Promise<RemoteWorkOpportunity> {
    // TODO: Replace with actual API call
    return {
      remoteWorkEligibility: 0.8,
      currentStatus: "hybrid",
      requirements: {
        technology: [
          "High-speed internet",
          "VPN access",
          "Video conferencing setup"
        ],
        security: [
          "Secure home network",
          "Company-provided laptop",
          "2FA authentication"
        ],
        workspace: [
          "Dedicated office space",
          "Ergonomic setup",
          "Proper lighting"
        ]
      },
      schedule: {
        minimumOnsiteDays: 2,
        flexibleHours: true,
        timeZoneRequirements: "EST ± 3 hours"
      },
      benefits: {
        equipmentAllowance: 1000,
        internetStipend: 50,
        coworkingAllowance: 200
      },
      limitations: [
        "Some in-person meetings required",
        "Quarterly team gatherings",
        "Client-facing roles may need more office time"
      ],
      successFactors: [
        "Strong self-management",
        "Excellent communication skills",
        "Results-oriented mindset"
      ]
    };
  }

  async calculateEnvironmentScore(conditions: WorkCondition[]): Promise<number> {
    // Calculate a normalized score based on work conditions
    const weights = {
      level: 0.4,
      impactOnPerformance: 0.6
    };

    const scores = conditions.map(condition => {
      return (condition.level * weights.level) + 
             (condition.impactOnPerformance * weights.impactOnPerformance);
    });

    return scores.reduce((acc, score) => acc + score, 0) / scores.length;
  }

  async calculateSafetyScore(requirements: SafetyRequirement[]): Promise<number> {
    // Calculate safety score based on requirements priority and compliance
    const priorityWeights = {
      high: 1.0,
      medium: 0.7,
      low: 0.4
    };

    const complianceWeights = {
      mandatory: 1.0,
      recommended: 0.7,
      optional: 0.4
    };

    const scores = requirements.map(req => {
      const priorityWeight = priorityWeights[req.priority as keyof typeof priorityWeights];
      const complianceWeight = complianceWeights[req.complianceLevel as keyof typeof complianceWeights];
      return (priorityWeight + complianceWeight) / 2;
    });

    return scores.reduce((acc, score) => acc + score, 0) / scores.length;
  }

  async getWorkEnvironmentAssessment(occupationId: string): Promise<WorkEnvironmentData> {
    const [conditions, safety, flexibility, remote] = await Promise.all([
      this.getWorkConditions(occupationId),
      this.getSafetyRequirements(occupationId),
      this.getScheduleFlexibility(occupationId),
      this.getRemoteWorkOpportunities(occupationId)
    ]);

    const environmentScore = await this.calculateEnvironmentScore(conditions);
    const safetyScore = await this.calculateSafetyScore(safety);

    return {
      conditions,
      safetyRequirements: safety,
      scheduleFlexibility: flexibility,
      remoteWorkOpportunities: remote,
      overallScore: (environmentScore + safetyScore + flexibility.overallFlexibility + remote.remoteWorkEligibility) / 4,
      lastUpdated: new Date().toISOString(),
      nextAssessmentDate: this.calculateNextAssessmentDate()
    };
  }

  private calculateNextAssessmentDate(): string {
    const date = new Date();
    date.setMonth(date.getMonth() + 6); // Set next assessment to 6 months from now
    return date.toISOString();
  }
}

export const workEnvironmentAssessmentService = new WorkEnvironmentAssessmentService();
