// src/services/DetailedWorkActivitiesService.ts
// Version 1.3.0

import axios from 'axios';
import { 
  DetailedWorkActivity,
  WorkActivityCategory,
  TaskToDWAMapping,
  DWAHierarchy,
  DWAFrequencyData
} from '@/types/detailedWorkActivities';

const API_BASE_URL = '/.netlify/functions/onet-proxy';

/**
 * Retrieves detailed work activities for a specific occupation
 * @param code O*NET-SOC code for the occupation
 * @returns Promise resolving to an array of DetailedWorkActivity objects
 */
export const getDetailedWorkActivities = async (
  code: string
): Promise<DetailedWorkActivity[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/dwa?code=${encodeURIComponent(code)}`);
    
    if (!response.data.detailed_work_activities) {
      throw new Error('Invalid response format: missing detailed_work_activities array');
    }
    
    return response.data.detailed_work_activities.map((dwa: any) => ({
      id: dwa.id,
      description: dwa.description,
      category: dwa.category,
      frequency: dwa.frequency,
      importance: dwa.importance,
      parentActivity: dwa.parent_activity,
      relatedOccupations: dwa.related_occupations
    }));
  } catch (error) {
    console.error(`Error fetching detailed work activities for occupation ${code}:`, error);
    throw error;
  }
};

/**
 * Retrieves work activity categories with their included detailed work activities
 * @param code O*NET-SOC code for the occupation
 * @returns Promise resolving to an array of WorkActivityCategory objects
 */
export const getWorkActivityCategories = async (
  code: string
): Promise<WorkActivityCategory[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/dwa/categories?code=${encodeURIComponent(code)}`);
    
    if (!response.data.categories) {
      throw new Error('Invalid response format: missing categories array');
    }
    
    return response.data.categories.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      activities: cat.activities.map((act: any) => ({
        id: act.id,
        description: act.description,
        category: cat.id, // Set the category to match the parent
        frequency: act.frequency,
        importance: act.importance
      }))
    }));
  } catch (error) {
    console.error(`Error fetching work activity categories for occupation ${code}:`, error);
    throw error;
  }
};

/**
 * Maps tasks to their associated detailed work activities
 * @param code O*NET-SOC code for the occupation
 * @returns Promise resolving to an array of TaskToDWAMapping objects
 */
export const getTaskToDWAMappings = async (
  code: string
): Promise<TaskToDWAMapping[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/dwa/task-mappings?code=${encodeURIComponent(code)}`);
    
    if (!response.data.mappings) {
      throw new Error('Invalid response format: missing mappings array');
    }
    
    return response.data.mappings.map((mapping: any) => ({
      taskId: mapping.task_id,
      taskDescription: mapping.task_description,
      detailedWorkActivities: mapping.detailed_work_activities.map((dwa: any) => ({
        id: dwa.id,
        description: dwa.description,
        category: dwa.category,
        importance: dwa.importance,
        frequency: dwa.frequency
      }))
    }));
  } catch (error) {
    console.error(`Error fetching task to DWA mappings for occupation ${code}:`, error);
    throw error;
  }
};

/**
 * Retrieves the hierarchical structure of detailed work activities
 * @returns Promise resolving to an array of DWAHierarchy objects representing the top level
 */
export const getDWAHierarchy = async (): Promise<DWAHierarchy[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/dwa/hierarchy`);
    
    if (!response.data.hierarchy) {
      throw new Error('Invalid response format: missing hierarchy array');
    }
    
    // The hierarchical structure should already be nested in the response
    return response.data.hierarchy.map((h: any) => ({
      id: h.id,
      name: h.name,
      description: h.description,
      children: h.children || [],
      level: h.level || 1
    }));
  } catch (error) {
    console.error('Error fetching DWA hierarchy:', error);
    throw error;
  }
};

/**
 * Gets frequency data for detailed work activities
 * @param dwaIds Array of detailed work activity IDs
 * @returns Promise resolving to an array of DWAFrequencyData objects
 */
export const getDWAFrequencyData = async (
  dwaIds: string[]
): Promise<DWAFrequencyData[]> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/dwa/frequency`, {
      dwa_ids: dwaIds
    });
    
    if (!response.data.frequency_data) {
      throw new Error('Invalid response format: missing frequency_data array');
    }
    
    return response.data.frequency_data.map((data: any) => ({
      dwaId: data.dwa_id,
      description: data.description,
      frequency: {
        daily: data.frequency.daily,
        weekly: data.frequency.weekly,
        monthly: data.frequency.monthly,
        rarely: data.frequency.rarely
      }
    }));
  } catch (error) {
    console.error('Error fetching DWA frequency data:', error);
    throw error;
  }
};

// Export additional methods that will be implemented as needed
export default {
  getDetailedWorkActivities,
  getWorkActivityCategories,
  getTaskToDWAMappings,
  getDWAHierarchy,
  getDWAFrequencyData
};
