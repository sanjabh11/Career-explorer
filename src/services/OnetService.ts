// src/services/OnetService.ts

import axios from 'axios';
import { Occupation, OccupationDetails, JobOutlook } from '@/types/onet';
import { jobOutlookService } from './JobOutlookService';

// Use the current window location to determine the base URL
const API_BASE_URL = window.location.origin + '/.netlify/functions/onet-proxy';

export const searchOccupations = async (keyword: string): Promise<Occupation[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}?keyword=${encodeURIComponent(keyword)}`);
    console.log('Raw search response:', response.data);
    // Adjust this based on the actual structure of the API response
    return response.data.occupations.map((occupation: any) => ({
      code: occupation.code,
      title: occupation.title
    }));
  } catch (error) {
    console.error('Error searching occupations:', error);
    throw error;
  }
};

export const getOccupationDetails = async (code: string): Promise<OccupationDetails> => {
  try {
    // Fetch basic occupation details
    const response = await axios.get(`${API_BASE_URL}/details?code=${encodeURIComponent(code)}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.ONET_USERNAME}:${process.env.ONET_PASSWORD}`).toString('base64')}`,
        'Accept': 'application/json'
      }
    });
    console.log('Raw occupation details:', response.data);

    // Fetch job outlook data in parallel
    const jobOutlookPromise = getJobOutlook(code);

    // Process basic occupation details
    const occupationDetails: OccupationDetails = {
      code: response.data.code,
      title: response.data.title,
      description: response.data.description,
      sample_of_reported_job_titles: response.data.sample_of_reported_job_titles,
      updated: response.data.updated,
      overallAPO: 0,
      categories: [],
      tasks: response.data.tasks?.map((task: any) => ({
        name: task.name,
        description: task.description,
        value: task.value || 0,
        level: task.level,
        genAIImpact: undefined
      })) || [],
      knowledge: response.data.knowledge?.map((item: any) => ({
        name: item.name,
        description: item.description,
        value: item.value || 0,
        level: item.level,
        category: item.category || ''
      })) || [],
      skills: response.data.skills?.map((item: any) => ({
        name: item.name,
        description: item.description,
        value: item.value || 0,
        level: item.level,
        category: item.category || ''
      })) || [],
      abilities: response.data.abilities?.map((item: any) => ({
        name: item.name,
        description: item.description,
        value: item.value || 0,
        level: item.level
      })) || [],
      technologies: response.data.technology_skills?.map((item: any) => ({
        name: item.name,
        description: item.description,
        value: item.value || 0,
        level: item.level,
        hotTechnology: item.hotTechnology,
        category: item.category || ''
      })) || [],
      responsibilities: response.data.tasks?.map((task: any) => task.description) || [],
      jobZone: response.data.job_zone || 0
    };

    // Add job outlook data if available
    try {
      const jobOutlook = await jobOutlookPromise;
      occupationDetails.jobOutlook = jobOutlook;
    } catch (outlookError) {
      console.error(`Error fetching job outlook for ${code}:`, outlookError);
      // Continue without job outlook data
    }

    return occupationDetails;
  } catch (error) {
    console.error('Error fetching occupation details:', error);
    throw error;
  }
};

/**
 * Fetches job outlook data for a specific occupation
 * @param code The O*NET-SOC code for the occupation
 * @returns Job outlook data including growth projections and salary information
 */
export const getJobOutlook = async (code: string): Promise<JobOutlook> => {
  return jobOutlookService.getJobOutlook(code);
};

/**
 * Fetches all occupations with a bright outlook designation
 * @returns Array of occupation codes with bright outlook
 */
export const getBrightOutlookOccupations = async (): Promise<string[]> => {
  return jobOutlookService.getBrightOutlookOccupations();
};

/**
 * Searches for occupations with specific criteria including bright outlook
 * @param keyword Search keyword
 * @param brightOutlookOnly Whether to only return bright outlook occupations
 * @returns Array of matching occupations
 */
export const searchOccupationsWithFilters = async (
  keyword: string,
  brightOutlookOnly: boolean = false
): Promise<Occupation[]> => {
  try {
    // First get all matching occupations
    const allOccupations = await searchOccupations(keyword);

    // If not filtering by bright outlook, return all results
    if (!brightOutlookOnly) {
      return allOccupations;
    }

    // Get all bright outlook occupations
    const brightOutlookCodes = await getBrightOutlookOccupations();

    // Filter to only include bright outlook occupations
    return allOccupations.filter(occupation =>
      brightOutlookCodes.includes(occupation.code)
    );
  } catch (error) {
    console.error('Error searching occupations with filters:', error);
    return [];
  }
};