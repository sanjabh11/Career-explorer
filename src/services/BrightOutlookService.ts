// src/services/BrightOutlookService.ts
// Version 1.3.0

import axios from 'axios';
import { 
  BrightOutlookData, 
  BrightOutlookReason, 
  GrowthIndicator,
  IndustryTrend,
  OutlookCategory
} from '@/types/brightOutlook';

const API_BASE_URL = '/.netlify/functions/onet-proxy';

/**
 * Retrieves all occupations with Bright Outlook designation
 * @returns Promise resolving to an array of BrightOutlookData objects
 */
export const getBrightOutlookOccupations = async (): Promise<BrightOutlookData[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/bright-outlook/occupations`);
    
    if (!response.data.occupations) {
      throw new Error('Invalid response format: missing occupations array');
    }
    
    return response.data.occupations.map((occ: any) => ({
      code: occ.code,
      title: occ.title,
      reasons: occ.bright_outlook_reasons.map((reason: string) => reason as BrightOutlookReason),
      projectedGrowth: occ.projected_growth,
      projectedJobOpenings: occ.projected_job_openings,
      newOccupation: occ.new_occupation || false
    }));
  } catch (error) {
    console.error('Error fetching Bright Outlook occupations:', error);
    throw error;
  }
};

/**
 * Checks if an occupation has Bright Outlook designation
 * @param code O*NET-SOC code for the occupation
 * @returns Promise resolving to BrightOutlookData if it's a Bright Outlook occupation, or null if not
 */
export const checkBrightOutlookStatus = async (code: string): Promise<BrightOutlookData | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/bright-outlook/check?code=${encodeURIComponent(code)}`);
    
    if (!response.data.is_bright_outlook) {
      return null;
    }
    
    return {
      code: response.data.code,
      title: response.data.title,
      reasons: response.data.bright_outlook_reasons.map((reason: string) => reason as BrightOutlookReason),
      projectedGrowth: response.data.projected_growth,
      projectedJobOpenings: response.data.projected_job_openings,
      newOccupation: response.data.new_occupation || false
    };
  } catch (error) {
    console.error(`Error checking Bright Outlook status for occupation ${code}:`, error);
    throw error;
  }
};

/**
 * Gets growth indicators for a specific occupation
 * @param code O*NET-SOC code for the occupation
 * @returns Promise resolving to an array of GrowthIndicator objects
 */
export const getGrowthIndicators = async (code: string): Promise<GrowthIndicator[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/growth-indicators?code=${encodeURIComponent(code)}`);
    
    if (!response.data.indicators) {
      throw new Error('Invalid response format: missing indicators array');
    }
    
    return response.data.indicators.map((ind: any) => ({
      name: ind.name,
      description: ind.description,
      value: ind.value,
      interpretation: ind.interpretation,
      timeframe: ind.timeframe,
      source: ind.source
    }));
  } catch (error) {
    console.error(`Error fetching growth indicators for occupation ${code}:`, error);
    throw error;
  }
};

/**
 * Gets trending industries with high growth potential
 * @param limit Maximum number of industries to return
 * @returns Promise resolving to an array of IndustryTrend objects
 */
export const getTrendingIndustries = async (limit: number = 10): Promise<IndustryTrend[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/trending-industries?limit=${limit}`);
    
    if (!response.data.industries) {
      throw new Error('Invalid response format: missing industries array');
    }
    
    return response.data.industries.map((ind: any) => ({
      industryName: ind.industry_name,
      growthRate: ind.growth_rate,
      occupations: ind.occupations.map((occ: any) => ({
        code: occ.code,
        title: occ.title,
        projectedGrowth: occ.projected_growth
      }))
    }));
  } catch (error) {
    console.error('Error fetching trending industries:', error);
    throw error;
  }
};

/**
 * Gets occupations by Bright Outlook category
 * @param category Bright Outlook category to filter by
 * @returns Promise resolving to an OutlookCategory object
 */
export const getOccupationsByOutlookCategory = async (
  category: BrightOutlookReason
): Promise<OutlookCategory> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/bright-outlook/category?category=${encodeURIComponent(category)}`);
    
    if (!response.data.category) {
      throw new Error('Invalid response format: missing category information');
    }
    
    return {
      name: response.data.category.name,
      description: response.data.category.description,
      occupations: response.data.category.occupations.map((occ: any) => ({
        code: occ.code,
        title: occ.title,
        value: occ.value
      }))
    };
  } catch (error) {
    console.error(`Error fetching occupations by outlook category ${category}:`, error);
    throw error;
  }
};

// Export additional methods that will be implemented as needed
export default {
  getBrightOutlookOccupations,
  checkBrightOutlookStatus,
  getGrowthIndicators,
  getTrendingIndustries,
  getOccupationsByOutlookCategory
};
