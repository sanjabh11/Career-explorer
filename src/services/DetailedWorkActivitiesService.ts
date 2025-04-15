// src/services/DetailedWorkActivitiesService.ts

import axios from 'axios';
import { DetailedWorkActivity, DWACategory, TaskToDWA } from '@/types/detailedWorkActivities';

const API_BASE_URL = '/.netlify/functions/onet-proxy';

/**
 * Get detailed work activities for an occupation
 * @param occupationCode O*NET occupation code
 * @returns List of detailed work activities
 */
export const getDetailedWorkActivities = async (occupationCode: string): Promise<DetailedWorkActivity[]> => {
  try {
    // In a real implementation, this would call the O*NET API
    // For now, return mock data
    return mockDetailedWorkActivities.filter((_, index) => index < 10);
  } catch (error) {
    console.error('Error fetching detailed work activities:', error);
    throw error;
  }
};

/**
 * Get detailed work activity categories
 * @param occupationCode O*NET occupation code
 * @returns List of DWA categories with activities
 */
export const getDWACategories = async (occupationCode: string): Promise<DWACategory[]> => {
  try {
    // In a real implementation, this would call the O*NET API
    // For now, return mock data
    return mockDWACategories;
  } catch (error) {
    console.error('Error fetching DWA categories:', error);
    throw error;
  }
};

/**
 * Get task to DWA mapping for an occupation
 * @param occupationCode O*NET occupation code
 * @returns Mapping between tasks and detailed work activities
 */
export const getTaskToDWAMapping = async (occupationCode: string): Promise<TaskToDWA> => {
  try {
    // In a real implementation, this would call the O*NET API
    // For now, return mock data
    return mockTaskToDWAMapping;
  } catch (error) {
    console.error('Error fetching task to DWA mapping:', error);
    throw error;
  }
};

// Mock data
const mockDetailedWorkActivities: DetailedWorkActivity[] = [
  {
    id: 'dwa-1',
    description: 'Analyze data to identify or resolve operational problems',
    category: 'Information Analysis',
    importance: 85,
    frequency: 90
  },
  {
    id: 'dwa-2',
    description: 'Develop computer or information security policies or procedures',
    category: 'Information Systems',
    importance: 80,
    frequency: 75
  },
  {
    id: 'dwa-3',
    description: 'Document operational procedures',
    category: 'Documentation',
    importance: 70,
    frequency: 65
  },
  {
    id: 'dwa-4',
    description: 'Train others on work processes',
    category: 'Training',
    importance: 65,
    frequency: 60
  },
  {
    id: 'dwa-5',
    description: 'Collaborate with others to determine technical requirements',
    category: 'Collaboration',
    importance: 90,
    frequency: 85
  },
  {
    id: 'dwa-6',
    description: 'Develop models of information or communications systems',
    category: 'System Design',
    importance: 75,
    frequency: 70
  },
  {
    id: 'dwa-7',
    description: 'Monitor system operation to detect potential problems',
    category: 'System Maintenance',
    importance: 85,
    frequency: 95
  },
  {
    id: 'dwa-8',
    description: 'Update knowledge about emerging industry or technology trends',
    category: 'Professional Development',
    importance: 80,
    frequency: 75
  },
  {
    id: 'dwa-9',
    description: 'Implement security measures for computer or information systems',
    category: 'Information Security',
    importance: 95,
    frequency: 90
  },
  {
    id: 'dwa-10',
    description: 'Communicate technical information to non-technical audiences',
    category: 'Communication',
    importance: 75,
    frequency: 80
  }
];

const mockDWACategories: DWACategory[] = [
  {
    id: 'cat-1',
    name: 'Information Analysis',
    activities: mockDetailedWorkActivities.filter(dwa => dwa.category === 'Information Analysis')
  },
  {
    id: 'cat-2',
    name: 'Information Systems',
    activities: mockDetailedWorkActivities.filter(dwa => dwa.category === 'Information Systems')
  },
  {
    id: 'cat-3',
    name: 'Documentation',
    activities: mockDetailedWorkActivities.filter(dwa => dwa.category === 'Documentation')
  },
  {
    id: 'cat-4',
    name: 'Training',
    activities: mockDetailedWorkActivities.filter(dwa => dwa.category === 'Training')
  },
  {
    id: 'cat-5',
    name: 'Collaboration',
    activities: mockDetailedWorkActivities.filter(dwa => dwa.category === 'Collaboration')
  }
];

const mockTaskToDWAMapping: TaskToDWA = {
  tasks: [
    {
      id: 'task-1',
      description: 'Identify security risks and determine security requirements',
      importance: 90
    },
    {
      id: 'task-2',
      description: 'Develop and implement security policies and procedures',
      importance: 85
    },
    {
      id: 'task-3',
      description: 'Monitor system performance and security',
      importance: 80
    },
    {
      id: 'task-4',
      description: 'Train users on security awareness and procedures',
      importance: 75
    },
    {
      id: 'task-5',
      description: 'Document system configurations and security measures',
      importance: 70
    }
  ],
  activities: mockDetailedWorkActivities,
  connections: [
    { taskId: 'task-1', activityId: 'dwa-1' },
    { taskId: 'task-1', activityId: 'dwa-5' },
    { taskId: 'task-1', activityId: 'dwa-9' },
    { taskId: 'task-2', activityId: 'dwa-2' },
    { taskId: 'task-2', activityId: 'dwa-6' },
    { taskId: 'task-2', activityId: 'dwa-9' },
    { taskId: 'task-3', activityId: 'dwa-1' },
    { taskId: 'task-3', activityId: 'dwa-7' },
    { taskId: 'task-3', activityId: 'dwa-9' },
    { taskId: 'task-4', activityId: 'dwa-4' },
    { taskId: 'task-4', activityId: 'dwa-10' },
    { taskId: 'task-5', activityId: 'dwa-3' },
    { taskId: 'task-5', activityId: 'dwa-6' }
  ]
};
