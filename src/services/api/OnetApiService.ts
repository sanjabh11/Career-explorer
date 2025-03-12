/**
 * O*NET API Service
 * Version 1.2
 * 
 * Service for interacting with the O*NET API to retrieve occupation data,
 * tasks, skills, and other occupation-related information.
 */

import axios from 'axios';
import { Occupation } from '../../types/occupation';
import { OccupationTask } from '../../types/semantic';
import { Skill } from '../../types/skills';
import { EnvironmentConfig } from '@/config/environment';

/**
 * Service for interacting with the O*NET API
 */
export class OnetApiService {
  private readonly config: ReturnType<typeof EnvironmentConfig.prototype.getOnetConfig>;
  private readonly headers: Headers;
  private readonly apiBaseUrl: string;

  constructor() {
    this.config = EnvironmentConfig.getInstance().getOnetConfig();
    this.headers = this.getAuthHeaders();
    this.apiBaseUrl = this.config.baseUrl || 'https://services.onetcenter.org/ws/online';
  }

  private getAuthHeaders(): Headers {
    const authString = Buffer.from(
      `${this.config.username}:${this.config.password}`
    ).toString('base64');
    
    return new Headers({
      'Authorization': `Basic ${authString}`,
      'Accept': 'application/json'
    });
  }

  /**
   * Fetch raw occupation data from O*NET API
   */
  public async fetchOccupationData(code: string) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/occupations/${code}`, {
        headers: this.headers
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching occupation data:', error);
      throw error;
    }
  }

  /**
   * Get detailed information about an occupation
   * @param id O*NET occupation code (e.g. "13-1151.00")
   * @returns Occupation details
   */
  public async getOccupationDetails(id: string): Promise<Occupation> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/occupations/${id}/details`, {
        headers: this.headers
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch occupation details: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform the API response to match the Occupation type
      return {
        id,
        title: data.title || '',
        description: data.description || '',
        code: id,
        category: data.category || '',
        educationLevel: data.education_requirements || '',
        salary: {
          median: data.salary?.median || 0,
          range: {
            min: data.salary?.range?.min || 0,
            max: data.salary?.range?.max || 0
          }
        },
        outlook: {
          growth: data.outlook?.growth || 0,
          category: data.outlook?.category || ''
        },
        automationRisk: data.automation_risk || 0
      };
    } catch (error) {
      console.error('Error fetching occupation details:', error);
      throw error;
    }
  }

  /**
   * Get tasks associated with an occupation
   * @param id O*NET occupation code
   * @returns Array of occupation tasks
   */
  public async getOccupationTasks(id: string): Promise<OccupationTask[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/occupations/${id}/tasks`, {
        headers: this.headers
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch occupation tasks: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform the API response to match the OccupationTask type
      return Array.isArray(data.tasks) ? data.tasks.map((task: any) => ({
        id: task.id || `task-${Math.random().toString(36).substr(2, 9)}`,
        description: task.description || '',
        category: task.category || 'Core Task',
        importance: task.importance || 0,
        frequency: task.frequency || 0
      })) : [];
    } catch (error) {
      console.error('Error fetching occupation tasks:', error);
      throw error;
    }
  }

  /**
   * Get skills associated with an occupation
   * @param id O*NET occupation code
   * @returns Array of skills
   */
  public async getOccupationSkills(id: string): Promise<Skill[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/occupations/${id}/skills`, {
        headers: this.headers
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch occupation skills: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform the API response to match the Skill type
      return Array.isArray(data.skills) ? data.skills.map((skill: any) => ({
        id: skill.id || `skill-${Math.random().toString(36).substr(2, 9)}`,
        name: skill.name || '',
        description: skill.description || '',
        category: skill.category || 'Core Skill',
        importance: skill.importance || 0,
        level: skill.level || 0,
        required_level: skill.required_level || 0,
        current_level: skill.current_level || 0
      })) : [];
    } catch (error) {
      console.error('Error fetching occupation skills:', error);
      throw error;
    }
  }

  /**
   * Search for occupations by keyword
   * @param query Search query
   * @returns Array of matching occupations
   */
  public async searchOccupations(query: string): Promise<Occupation[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/occupations/search?keyword=${encodeURIComponent(query)}`, {
        headers: this.headers
      });
      
      if (!response.ok) {
        throw new Error(`Failed to search occupations: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform the API response to match the Occupation type
      return Array.isArray(data.occupations) ? data.occupations.map((occ: any) => ({
        id: occ.code || '',
        title: occ.title || '',
        description: occ.description || '',
        code: occ.code || '',
        category: occ.category || '',
        educationLevel: '',
        salary: {
          median: 0,
          range: {
            min: 0,
            max: 0
          }
        },
        outlook: {
          growth: 0,
          category: ''
        },
        automationRisk: 0
      })) : [];
    } catch (error) {
      console.error('Error searching occupations:', error);
      throw error;
    }
  }
}