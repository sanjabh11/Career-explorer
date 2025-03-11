/**
 * O*NET API Service
 * Version 1.0
 * 
 * Service for interacting with the O*NET API to retrieve occupation data,
 * tasks, skills, and other occupation-related information.
 */

import axios from 'axios';
import { Occupation } from '../../types/occupation';
import { OccupationTask } from '../../types/semantic';
import { Skill } from '../../types/skills';

/**
 * Service for interacting with the O*NET API
 */
export class OnetApiService {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  
  /**
   * Constructor for OnetApiService
   */
  constructor() {
    this.baseUrl = process.env.REACT_APP_ONET_API_URL || 'https://services.onetcenter.org/ws/';
    this.apiKey = process.env.REACT_APP_ONET_API_KEY || '';
  }
  
  /**
   * Get occupation details by ID
   * @param occupationId O*NET occupation code
   * @returns Occupation details
   */
  public async getOccupationDetails(occupationId: string): Promise<Occupation> {
    try {
      // In a real implementation, this would call the O*NET API
      // For now, return mock data
      return {
        id: occupationId,
        title: this.getMockTitle(occupationId),
        description: this.getMockDescription(occupationId),
        code: occupationId,
        category: 'Technology',
        educationLevel: 'Bachelor\'s degree',
        salary: {
          median: 85000,
          range: {
            min: 65000,
            max: 120000
          }
        },
        outlook: {
          growth: 0.11,
          category: 'Faster than average'
        },
        automationRisk: 0.65
      };
    } catch (error) {
      console.error('Error fetching occupation details:', error);
      throw new Error('Failed to fetch occupation details');
    }
  }
  
  /**
   * Get occupation tasks by ID
   * @param occupationId O*NET occupation code
   * @returns List of occupation tasks
   */
  public async getOccupationTasks(occupationId: string): Promise<OccupationTask[]> {
    try {
      // In a real implementation, this would call the O*NET API
      // For now, return mock data
      return [
        {
          id: `${occupationId}-task-1`,
          description: 'Analyze user needs and software requirements to determine feasibility of design within time and cost constraints.'
        },
        {
          id: `${occupationId}-task-2`,
          description: 'Design, build, or maintain web sites, using authoring or scripting languages, content creation tools, management tools, and digital media.'
        },
        {
          id: `${occupationId}-task-3`,
          description: 'Perform or direct web site updates.'
        },
        {
          id: `${occupationId}-task-4`,
          description: 'Write, design, or edit web page content, or direct others producing content.'
        },
        {
          id: `${occupationId}-task-5`,
          description: 'Confer with management or development teams to prioritize needs, resolve conflicts, develop content criteria, or choose solutions.'
        }
      ];
    } catch (error) {
      console.error('Error fetching occupation tasks:', error);
      throw new Error('Failed to fetch occupation tasks');
    }
  }
  
  /**
   * Get occupation skills by ID
   * @param occupationId O*NET occupation code
   * @returns List of occupation skills
   */
  public async getOccupationSkills(occupationId: string): Promise<Skill[]> {
    try {
      // In a real implementation, this would call the O*NET API
      // For now, return mock data
      return [
        {
          id: `${occupationId}-skill-1`,
          name: 'Programming',
          category: 'technical',
          description: 'Writing computer programs for various purposes.'
        },
        {
          id: `${occupationId}-skill-2`,
          name: 'Critical Thinking',
          category: 'cognitive',
          description: 'Using logic and reasoning to identify the strengths and weaknesses of alternative solutions, conclusions, or approaches to problems.'
        },
        {
          id: `${occupationId}-skill-3`,
          name: 'Active Learning',
          category: 'cognitive',
          description: 'Understanding the implications of new information for both current and future problem-solving and decision-making.'
        },
        {
          id: `${occupationId}-skill-4`,
          name: 'Complex Problem Solving',
          category: 'cognitive',
          description: 'Identifying complex problems and reviewing related information to develop and evaluate options and implement solutions.'
        },
        {
          id: `${occupationId}-skill-5`,
          name: 'Systems Analysis',
          category: 'technical',
          description: 'Determining how a system should work and how changes in conditions, operations, and the environment will affect outcomes.'
        },
        {
          id: `${occupationId}-skill-6`,
          name: 'Communication',
          category: 'soft',
          description: 'Talking to others to convey information effectively.'
        },
        {
          id: `${occupationId}-skill-7`,
          name: 'Judgment and Decision Making',
          category: 'cognitive',
          description: 'Considering the relative costs and benefits of potential actions to choose the most appropriate one.'
        }
      ];
    } catch (error) {
      console.error('Error fetching occupation skills:', error);
      throw new Error('Failed to fetch occupation skills');
    }
  }
  
  /**
   * Search for occupations by keyword
   * @param query Search query
   * @returns List of matching occupations
   */
  public async searchOccupations(query: string): Promise<Occupation[]> {
    try {
      // In a real implementation, this would call the O*NET API
      // For now, return mock data
      return [
        {
          id: '15-1252.00',
          title: 'Software Developers',
          description: 'Develop, create, and modify general computer applications software or specialized utility programs.',
          code: '15-1252.00',
          category: 'Technology',
          educationLevel: 'Bachelor\'s degree',
          salary: {
            median: 110000,
            range: {
              min: 85000,
              max: 160000
            }
          },
          outlook: {
            growth: 0.22,
            category: 'Much faster than average'
          },
          automationRisk: 0.4
        },
        {
          id: '15-1257.00',
          title: 'Web Developers',
          description: 'Develop and implement websites, web applications, application databases, and interactive web interfaces.',
          code: '15-1257.00',
          category: 'Technology',
          educationLevel: 'Associate\'s degree',
          salary: {
            median: 77200,
            range: {
              min: 55000,
              max: 107000
            }
          },
          outlook: {
            growth: 0.13,
            category: 'Faster than average'
          },
          automationRisk: 0.55
        },
        {
          id: '15-1211.00',
          title: 'Computer Systems Analysts',
          description: 'Analyze science, engineering, business, and other data processing problems to develop and implement solutions to complex applications problems.',
          code: '15-1211.00',
          category: 'Technology',
          educationLevel: 'Bachelor\'s degree',
          salary: {
            median: 93000,
            range: {
              min: 70000,
              max: 120000
            }
          },
          outlook: {
            growth: 0.07,
            category: 'Average'
          },
          automationRisk: 0.65
        }
      ].filter(occupation => 
        occupation.title.toLowerCase().includes(query.toLowerCase()) ||
        occupation.description.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching occupations:', error);
      throw new Error('Failed to search occupations');
    }
  }
  
  /**
   * Get mock occupation title based on ID
   * @param occupationId Occupation ID
   * @returns Mock occupation title
   */
  private getMockTitle(occupationId: string): string {
    const titles: Record<string, string> = {
      '15-1252.00': 'Software Developers',
      '15-1257.00': 'Web Developers',
      '15-1211.00': 'Computer Systems Analysts',
      '15-1299.00': 'Computer Occupations, All Other',
      '15-2051.00': 'Data Scientists',
      '11-9041.00': 'Architectural and Engineering Managers',
      '17-2061.00': 'Computer Hardware Engineers'
    };
    
    return titles[occupationId] || 'Unknown Occupation';
  }
  
  /**
   * Get mock occupation description based on ID
   * @param occupationId Occupation ID
   * @returns Mock occupation description
   */
  private getMockDescription(occupationId: string): string {
    const descriptions: Record<string, string> = {
      '15-1252.00': 'Develop, create, and modify general computer applications software or specialized utility programs.',
      '15-1257.00': 'Develop and implement websites, web applications, application databases, and interactive web interfaces.',
      '15-1211.00': 'Analyze science, engineering, business, and other data processing problems to develop and implement solutions to complex applications problems.',
      '15-1299.00': 'All computer occupations not listed separately.',
      '15-2051.00': 'Develop and implement a set of techniques or analytics applications to transform raw data into meaningful information using data-oriented programming languages and visualization software.',
      '11-9041.00': 'Plan, direct, or coordinate activities in such fields as architecture and engineering or research and development in these fields.',
      '17-2061.00': 'Research, design, develop, or test computer or computer-related equipment for commercial, industrial, military, or scientific use.'
    };
    
    return descriptions[occupationId] || 'No description available.';
  }
}
