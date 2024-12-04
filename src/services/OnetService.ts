// src/services/OnetService.ts

import axios from 'axios';
import { Occupation, OccupationDetails } from '@/types/onet';

const API_BASE_URL = '/.netlify/functions/onet-proxy';

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
    const response = await axios.get(`${API_BASE_URL}/details?code=${encodeURIComponent(code)}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.ONET_USERNAME}:${process.env.ONET_PASSWORD}`).toString('base64')}`,
        'Accept': 'application/json'
      }
    });
    console.log('Raw occupation details:', response.data);
    return {
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
      responsibilities: response.data.tasks?.map((task: any) => task.description) || []
    };
  } catch (error) {
    console.error('Error fetching occupation details:', error);
    throw error;
  }
};