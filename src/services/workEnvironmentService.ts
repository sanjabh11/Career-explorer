import { WorkEnvironmentData, WorkCondition, SafetyRequirement, ScheduleFlexibility, RemoteWorkOpportunity } from '@/components/work-environment/types';

class WorkEnvironmentService {
  async getWorkConditions(occupationId: string): Promise<WorkCondition[]> {
    // TODO: Replace with actual API call
    return [
      {
        id: 'wc-001',
        name: 'Physical Environment',
        description: 'Indoor, climate-controlled office setting',
        level: 0.2,
        frequency: 'constant',
        impactOnPerformance: 0.3,
        adaptationOptions: ['Temperature adjustment', 'Ergonomic furniture', 'Lighting control']
      },
      {
        id: 'wc-002',
        name: 'Noise Level',
        description: 'Moderate office noise',
        level: 0.4,
        frequency: 'constant',
        impactOnPerformance: 0.5,
        adaptationOptions: ['Noise-canceling headphones', 'Quiet zones', 'Acoustic panels']
      },
      {
        id: 'wc-003',
        name: 'Lighting',
        description: 'Well-lit office environment',
        level: 0.2,
        frequency: 'constant',
        impactOnPerformance: 0.3,
        adaptationOptions: ['Task lighting', 'Window shades', 'Anti-glare screens']
      }
    ];
  }

  async getSafetyRequirements(occupationId: string): Promise<SafetyRequirement[]> {
    // TODO: Replace with actual API call
    return [
      {
        id: 'sr-001',
        category: 'Ergonomics',
        description: 'Proper ergonomic setup for computer work',
        priority: 'medium',
        complianceLevel: 'mandatory',
        trainingRequired: true,
        updateFrequency: 'annual',
        verificationMethod: 'workspace assessment',
        consequences: [
          'Reduced risk of repetitive strain injury',
          'Improved productivity',
          'Better employee comfort'
        ]
      },
      {
        id: 'sr-002',
        category: 'Visual Safety',
        description: 'Protection against digital eye strain',
        priority: 'medium',
        complianceLevel: 'recommended',
        trainingRequired: true,
        updateFrequency: 'semi-annual',
        verificationMethod: 'self-assessment',
        consequences: [
          'Reduced eye fatigue',
          'Maintained visual acuity',
          'Increased work comfort'
        ]
      }
    ];
  }

  async getScheduleFlexibility(occupationId: string): Promise<ScheduleFlexibility> {
    // TODO: Replace with actual API call
    return {
      overallFlexibility: 0.8,
      workHours: {
        type: 'flexible',
        coreHours: ['10:00', '16:00'],
        flexibleRanges: ['07:00-10:00', '16:00-19:00'],
        averageHoursPerWeek: 40
      },
      shiftPatterns: {
        hasShifts: false,
        rotationFrequency: 'none',
        typicalShifts: ['standard business hours']
      },
      timeOffPolicy: {
        paidTimeOff: 20,
        sickDays: 10,
        holidaySchedule: 'standard federal holidays',
        advanceNoticeRequired: 14
      },
      workloadDistribution: {
        peakPeriods: ['end of quarter', 'project deadlines'],
        seasonalVariation: 'minimal',
        overtimeFrequency: 'rare'
      },
      accommodations: [
        'flexible start/end times',
        'work from home options',
        'compressed work week'
      ]
    };
  }

  async getRemoteWorkOpportunities(occupationId: string): Promise<RemoteWorkOpportunity> {
    // TODO: Replace with actual API call
    return {
      remoteWorkEligibility: 0.8,
      currentStatus: 'hybrid',
      requirements: {
        technology: ['Laptop', 'VPN', 'Collaboration tools'],
        security: ['Two-factor authentication', 'Secure network'],
        workspace: ['Dedicated home office', 'Ergonomic setup']
      },
      schedule: {
        minimumOnsiteDays: 2,
        flexibleHours: true,
        timeZoneRequirements: 'overlap with EST business hours'
      },
      benefits: {
        equipmentAllowance: 1000,
        internetStipend: 50,
        coworkingAllowance: 200
      },
      limitations: [
        'Some meetings require in-person attendance',
        'Quarterly team gatherings'
      ],
      successFactors: [
        'Strong communication skills',
        'Self-motivation',
        'Time management'
      ]
    };
  }

  async getWorkEnvironmentData(occupationId: string): Promise<WorkEnvironmentData> {
    const [conditions, safetyRequirements, scheduleFlexibility, remoteWorkOpportunities] = await Promise.all([
      this.getWorkConditions(occupationId),
      this.getSafetyRequirements(occupationId),
      this.getScheduleFlexibility(occupationId),
      this.getRemoteWorkOpportunities(occupationId)
    ]);

    return {
      conditions,
      safetyRequirements,
      scheduleFlexibility,
      remoteWorkOpportunities,
      overallScore: 0.85,
      lastUpdated: new Date().toISOString(),
      nextAssessmentDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days from now
    };
  }
}

export const workEnvironmentService = new WorkEnvironmentService();
