// src/services/InterestProfilerService.ts
// Version 1.3.0

import axios from 'axios';
import { 
  InterestProfilerQuestion, 
  InterestProfilerResults,
  InterestArea,
  MatchedOccupation,
  JobZone
} from '@/types/interestProfiler';

const API_BASE_URL = '/.netlify/functions/onet-proxy';

/**
 * Retrieves the list of Interest Profiler questions
 * @param formType The type of form to get questions for (standard, short, mini)
 * @returns A promise resolving to an array of InterestProfilerQuestion objects
 */
export const getInterestProfilerQuestions = async (
  formType: 'standard' | 'short' | 'mini' = 'short'
): Promise<InterestProfilerQuestion[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/interest-profiler/questions?formType=${formType}`);
    
    if (!response.data.questions) {
      throw new Error('Invalid response format: missing questions array');
    }
    
    return response.data.questions.map((q: any) => ({
      id: q.id,
      text: q.text,
      interestArea: q.interest_area as InterestArea,
      shortForm: q.short_form || false,
      miniForm: q.mini_form || false
    }));
  } catch (error) {
    console.error('Error fetching Interest Profiler questions:', error);
    throw error;
  }
};

/**
 * Calculates Interest Profiler results based on user answers
 * @param answers Map of question IDs to answer values (1-5)
 * @returns Interest Profiler results with scores and Holland code
 */
export const calculateInterestResults = async (
  answers: Map<number, number>
): Promise<InterestProfilerResults> => {
  try {
    // Convert Map to format expected by API
    const answersArray = Array.from(answers.entries()).map(([id, value]) => ({
      question_id: id,
      answer: value
    }));
    
    const response = await axios.post(`${API_BASE_URL}/interest-profiler/calculate`, {
      answers: answersArray
    });
    
    if (!response.data.results) {
      throw new Error('Invalid response format: missing results object');
    }
    
    return {
      scores: response.data.results.scores,
      primary: response.data.results.primary,
      secondary: response.data.results.secondary,
      tertiary: response.data.results.tertiary,
      hollandCode: response.data.results.holland_code
    };
  } catch (error) {
    console.error('Error calculating Interest Profiler results:', error);
    throw error;
  }
};

/**
 * Gets information about job zones
 * @returns Array of JobZone objects
 */
export const getJobZones = async (): Promise<JobZone[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/job-zones`);
    
    if (!response.data.job_zones) {
      throw new Error('Invalid response format: missing job_zones array');
    }
    
    return response.data.job_zones.map((zone: any) => ({
      id: zone.id,
      name: zone.name,
      description: zone.description,
      education: zone.education,
      experience: zone.experience,
      training: zone.training,
      examples: zone.examples || []
    }));
  } catch (error) {
    console.error('Error fetching job zones:', error);
    throw error;
  }
};

/**
 * Gets career matches based on interest results and job zone preferences
 * @param results Interest profiler results
 * @param jobZones Array of job zone IDs to include in results (1-5)
 * @param limit Maximum number of results to return
 * @returns Array of matched occupations
 */
export const getCareerMatches = async (
  results: InterestProfilerResults,
  jobZones: number[] = [1, 2, 3, 4, 5],
  limit: number = 50
): Promise<MatchedOccupation[]> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/interest-profiler/matches`, {
      holland_code: results.hollandCode,
      primary_interest: results.primary,
      job_zones: jobZones,
      limit
    });
    
    if (!response.data.occupations) {
      throw new Error('Invalid response format: missing occupations array');
    }
    
    return response.data.occupations.map((occ: any) => ({
      code: occ.code,
      title: occ.title,
      interestAreas: occ.interest_areas,
      jobZone: occ.job_zone,
      bright_outlook: occ.bright_outlook || false,
      in_demand: occ.in_demand || false,
      green: occ.green || false,
      matchScore: occ.match_score
    }));
  } catch (error) {
    console.error('Error fetching career matches:', error);
    throw error;
  }
};

// Export additional methods that will be implemented as needed
export default {
  getInterestProfilerQuestions,
  calculateInterestResults,
  getJobZones,
  getCareerMatches
};
