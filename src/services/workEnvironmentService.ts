import { WorkEnvironmentData, WorkCondition, SafetyRequirement, ScheduleFlexibility } from '@/components/work-environment/types';

class WorkEnvironmentService {
  async getWorkConditions(occupationId: string): Promise<WorkCondition[]> {
    // TODO: Replace with actual API call
    return [
      {
        type: 'Physical Environment',
        description: 'Indoor, climate-controlled office setting',
        level: 1,
        frequency: 'constant',
        impact: 'low'
      },
      {
        type: 'Noise Level',
        description: 'Moderate office noise',
        level: 2,
        frequency: 'constant',
        impact: 'medium'
      },
      {
        type: 'Lighting',
        description: 'Well-lit office environment',
        level: 1,
        frequency: 'constant',
        impact: 'low'
      }
    ];
  }

  async getSafetyRequirements(occupationId: string): Promise<SafetyRequirement[]> {
    // TODO: Replace with actual API call
    return [
      {
        id: 'sr-001',
        name: 'Ergonomic Workspace',
        description: 'Proper ergonomic setup for computer work',
        priority: 'medium',
        equipment: ['Ergonomic chair', 'Adjustable desk', 'Monitor stand'],
        procedures: ['Proper posture maintenance', 'Regular breaks', 'Workspace assessment']
      },
      {
        id: 'sr-002',
        name: 'Eye Safety',
        description: 'Protection against digital eye strain',
        priority: 'medium',
        equipment: ['Anti-glare screen', 'Proper lighting'],
        procedures: ['20-20-20 rule', 'Screen brightness adjustment']
      }
    ];
  }

  async getScheduleFlexibility(occupationId: string): Promise<ScheduleFlexibility> {
    // TODO: Replace with actual API call
    return {
      workHours: {
        type: 'flexible',
        description: 'Flexible working hours with core hours from 10 AM to 4 PM',
        typicalHours: 40
      },
      remoteWork: {
        available: true,
        type: 'hybrid',
        percentage: 60
      },
      shifts: {
        types: ['Regular Business Hours'],
        duration: 8
      },
      flexibility: {
        schedule: 'high',
        location: 'high',
        timeOff: 'medium'
      }
    };
  }

  async getWorkEnvironmentData(occupationId: string): Promise<WorkEnvironmentData> {
    const [conditions, safety, schedule] = await Promise.all([
      this.getWorkConditions(occupationId),
      this.getSafetyRequirements(occupationId),
      this.getScheduleFlexibility(occupationId)
    ]);

    return {
      conditions,
      safety,
      schedule,
      location: {
        type: 'Office',
        description: 'Modern office environment with individual and collaborative spaces',
        requirements: [
          'Computer workstation',
          'Internet connectivity',
          'Meeting rooms access'
        ]
      }
    };
  }
}

export const workEnvironmentService = new WorkEnvironmentService();
