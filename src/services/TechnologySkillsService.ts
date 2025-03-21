// src/services/TechnologySkillsService.ts
// Version 1.3.0

import axios from 'axios';
import { 
  TechnologySkill,
  TechnologyCategory,
  OccupationTechnology,
  TechnologyTrend,
  HotTechnology,
  TechnologyTrendType,
  TechnologyTrendData
} from '@/types/technologySkills';

const API_BASE_URL = '/.netlify/functions/onet-proxy';

/**
 * Retrieves technology skills for a specific occupation
 * @param code O*NET-SOC code for the occupation
 * @returns Promise resolving to an OccupationTechnology object
 */
export const getOccupationTechnologies = async (
  code: string
): Promise<OccupationTechnology> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/technologies?code=${encodeURIComponent(code)}`);
    
    if (!response.data.technologies) {
      throw new Error('Invalid response format: missing technologies data');
    }
    
    return {
      occupationCode: code,
      technologies: response.data.technologies.map((tech: any) => ({
        id: tech.id,
        name: tech.name,
        importance: tech.importance,
        level: tech.level,
        frequency_of_use: tech.frequency_of_use
      }))
    };
  } catch (error) {
    console.error(`Error fetching technologies for occupation ${code}:`, error);
    throw error;
  }
};

/**
 * Gets detailed information about a specific technology
 * @param technologyId ID of the technology
 * @returns Promise resolving to a TechnologySkill object
 */
export const getTechnologyDetails = async (
  technologyId: string
): Promise<TechnologySkill> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/technology/details?id=${encodeURIComponent(technologyId)}`);
    
    if (!response.data.technology) {
      throw new Error('Invalid response format: missing technology data');
    }
    
    return {
      id: response.data.technology.id,
      name: response.data.technology.name,
      description: response.data.technology.description,
      category: response.data.technology.category,
      subcategory: response.data.technology.subcategory,
      example_titles: response.data.technology.example_titles,
      hot_technology: response.data.technology.hot_technology || false,
      emerging: response.data.technology.emerging || false,
      adoption_rate: response.data.technology.adoption_rate,
      first_added: response.data.technology.first_added,
      last_updated: response.data.technology.last_updated
    };
  } catch (error) {
    console.error(`Error fetching details for technology ${technologyId}:`, error);
    throw error;
  }
};

/**
 * Retrieves all technology categories
 * @returns Promise resolving to an array of TechnologyCategory objects
 */
export const getTechnologyCategories = async (): Promise<TechnologyCategory[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/technology/categories`);
    
    if (!response.data.categories) {
      throw new Error('Invalid response format: missing categories array');
    }
    
    return response.data.categories.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      subcategories: cat.subcategories?.map((sub: any) => ({
        id: sub.id,
        name: sub.name,
        description: sub.description
      }))
    }));
  } catch (error) {
    console.error('Error fetching technology categories:', error);
    throw error;
  }
};

/**
 * Gets trending technologies with adoption patterns
 * @param limit Maximum number of technology trends to return
 * @returns Promise resolving to an array of TechnologyTrend objects
 */
export const getTrendingTechnologies = async (
  limit: number = 10
): Promise<TechnologyTrend[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/technology/trends?limit=${limit}`);
    
    if (!response.data.trends) {
      throw new Error('Invalid response format: missing trends array');
    }
    
    return response.data.trends.map((trend: any) => ({
      technologyId: trend.technology_id,
      name: trend.name,
      growthRate: trend.growth_rate,
      adoptionTimeline: trend.adoption_timeline.map((point: any) => ({
        year: point.year,
        adoption: point.adoption
      })),
      impactedOccupations: trend.impacted_occupations.map((occ: any) => ({
        code: occ.code,
        title: occ.title,
        impact: occ.impact
      }))
    }));
  } catch (error) {
    console.error('Error fetching trending technologies:', error);
    throw error;
  }
};

/**
 * Gets hot technologies that are in high demand
 * @param limit Maximum number of hot technologies to return
 * @returns Promise resolving to an array of HotTechnology objects
 */
export const getHotTechnologies = async (
  limit: number = 20
): Promise<HotTechnology[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/technology/hot?limit=${limit}`);
    
    if (!response.data.hot_technologies) {
      throw new Error('Invalid response format: missing hot_technologies array');
    }
    
    return response.data.hot_technologies.map((tech: any) => ({
      id: tech.id,
      name: tech.name,
      description: tech.description,
      reasons: tech.reasons,
      growthMetrics: {
        currentAdoption: tech.growth_metrics.current_adoption,
        projectedGrowth: tech.growth_metrics.projected_growth,
        timePeriod: tech.growth_metrics.time_period
      },
      topOccupations: tech.top_occupations.map((occ: any) => ({
        code: occ.code,
        title: occ.title,
        score: occ.score
      })),
      trend: tech.trend ? tech.trend as TechnologyTrendType : TechnologyTrendType.Growing,
      category: tech.category,
      growthRate: tech.growth_rate,
      relatedOccupations: tech.related_occupations?.map((occ: any) => ({
        code: occ.code,
        title: occ.title
      })),
      resourceUrl: tech.resource_url
    }));
  } catch (error) {
    console.error('Error fetching hot technologies:', error);
    throw error;
  }
};

/**
 * Retrieves technology skills for a specific occupation with enhanced details
 * @param code O*NET-SOC code for the occupation
 * @returns Promise resolving to an array of TechnologySkill objects
 */
export const getTechnologySkills = async (
  code: string
): Promise<TechnologySkill[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/technology/skills?code=${encodeURIComponent(code)}`);
    
    if (!response.data.skills) {
      throw new Error('Invalid response format: missing skills array');
    }
    
    return response.data.skills.map((skill: any) => ({
      id: skill.id,
      name: skill.name,
      description: skill.description,
      category: skill.category,
      subcategory: skill.subcategory,
      example_titles: skill.example_titles,
      hot_technology: skill.hot_technology || false,
      emerging: skill.emerging || false,
      adoption_rate: skill.adoption_rate,
      first_added: skill.first_added,
      last_updated: skill.last_updated,
      hot: skill.hot || skill.hot_technology || false,
      skillLevel: skill.skill_level || 'Intermediate',
      importance: skill.importance || 0
    }));
  } catch (error) {
    console.error(`Error fetching technology skills for occupation ${code}:`, error);
    throw error;
  }
};

/**
 * Gets technology trend data for visualization
 * @param technologyId ID of the technology to get trend data for
 * @returns Promise resolving to a TechnologyTrendData object
 */
export const getTechnologyTrendData = async (
  technologyId: string
): Promise<TechnologyTrendData> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/technology/trend-data?id=${encodeURIComponent(technologyId)}`);
    
    if (!response.data.trend_data) {
      throw new Error('Invalid response format: missing trend_data object');
    }
    
    return {
      id: response.data.trend_data.id,
      name: response.data.trend_data.name,
      category: response.data.trend_data.category,
      trend: response.data.trend_data.trend as TechnologyTrendType,
      currentAdoption: response.data.trend_data.current_adoption,
      growthRate: response.data.trend_data.growth_rate,
      historicalData: response.data.trend_data.historical_data.map((point: any) => ({
        year: point.year,
        value: point.value
      }))
    };
  } catch (error) {
    console.error(`Error fetching technology trend data for ${technologyId}:`, error);
    throw error;
  }
};

// Export additional methods that will be implemented as needed
export default {
  getOccupationTechnologies,
  getTechnologyDetails,
  getTechnologyCategories,
  getTrendingTechnologies,
  getHotTechnologies,
  getTechnologySkills,
  getTechnologyTrendData
};
