// src/services/SerpApiService.ts
import axios from 'axios';

export interface AutomationTrend {
  source: string;
  title: string;
  year: number;
  automationPercentage: number | null;
  url: string;
  snippet?: string;
  relevanceScore?: number;
}

export interface SerpApiResponse {
  trends: AutomationTrend[];
  rawData?: any;
  error?: string;
  mockData?: boolean;
}

/**
 * Fetches automation trends for a specific occupation using SERP API
 * @param occupation The occupation title or code
 * @returns Promise with automation trends data
 */
export const fetchAutomationTrends = async (occupation: string): Promise<SerpApiResponse> => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_SERP_API_KEY || process.env.SERP_API_KEY;
    console.log('Using SERP API key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'Not found');

    // Use our Netlify function proxy instead of direct API call
    const response = await axios.post('/.netlify/functions/serp-api', {
      query: `${occupation} automation potential trends`
    });

    return {
      trends: processAutomationTrendResults(response.data),
      rawData: response.data
    };
  } catch (error: any) {
    console.error('Error fetching automation trends:', error);
    // Check if we got mock data in the error response
    if (error.response?.data?.mockData && error.response?.data?.results) {
      return {
        trends: processAutomationTrendResults(error.response.data.results),
        rawData: error.response.data.results,
        mockData: true
      };
    }
    return {
      trends: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Fetches recent research about automation for a specific occupation
 * @param occupation The occupation title or code
 * @returns Promise with research data
 */
export const fetchAutomationResearch = async (occupation: string): Promise<SerpApiResponse> => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_SERP_API_KEY || process.env.SERP_API_KEY;

    // Use our Netlify function proxy instead of direct API call
    const response = await axios.post('/.netlify/functions/serp-api', {
      query: `${occupation} automation AI impact research`
    });

    return {
      trends: processResearchResults(response.data),
      rawData: response.data
    };
  } catch (error: any) {
    console.error('Error fetching automation research:', error);
    // Check if we got mock data in the error response
    if (error.response?.data?.mockData && error.response?.data?.results) {
      return {
        trends: processResearchResults(error.response.data.results),
        rawData: error.response.data.results,
        mockData: true
      };
    }
    return {
      trends: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Fetches technology adoption trends for a specific occupation
 * @param occupation The occupation title or code
 * @returns Promise with technology adoption data
 */
export const fetchTechnologyAdoption = async (occupation: string): Promise<SerpApiResponse> => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_SERP_API_KEY || process.env.SERP_API_KEY;

    // Use our Netlify function proxy instead of direct API call
    const response = await axios.post('/.netlify/functions/serp-api', {
      query: `${occupation} technology adoption trends`
    });

    return {
      trends: processTechnologyResults(response.data),
      rawData: response.data
    };
  } catch (error: any) {
    console.error('Error fetching technology adoption:', error);
    // Check if we got mock data in the error response
    if (error.response?.data?.mockData && error.response?.data?.results) {
      return {
        trends: processTechnologyResults(error.response.data.results),
        rawData: error.response.data.results,
        mockData: true
      };
    }
    return {
      trends: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Process SERP API results to extract automation trend data
 */
const processAutomationTrendResults = (data: any): AutomationTrend[] => {
  const trends: AutomationTrend[] = [];

  // Extract organic results
  if (data.organic_results) {
    data.organic_results.forEach((result: any) => {
      // Extract year from snippet if available
      const yearMatch = result.snippet?.match(/\b(20\d{2})\b/);
      const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();

      // Extract percentage if available
      const percentMatch = result.snippet?.match(/(\d+(?:\.\d+)?)%/);
      const percentage = percentMatch ? parseFloat(percentMatch[1]) : null;

      // Calculate relevance score based on position and presence of percentage
      const relevanceScore = (10 - Math.min(9, data.organic_results.indexOf(result))) / 10 *
                            (percentage !== null ? 1 : 0.7);

      trends.push({
        source: result.source || extractDomain(result.link),
        title: result.title,
        year,
        automationPercentage: percentage,
        url: result.link,
        snippet: result.snippet,
        relevanceScore
      });
    });
  }

  return trends.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
};

/**
 * Process research results from Google Scholar
 */
const processResearchResults = (data: any): AutomationTrend[] => {
  const trends: AutomationTrend[] = [];

  // Extract organic results
  if (data.organic_results) {
    data.organic_results.forEach((result: any) => {
      // Extract year from publication info if available
      const yearMatch = result.publication_info?.summary?.match(/\b(20\d{2})\b/) ||
                       result.snippet?.match(/\b(20\d{2})\b/);
      const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();

      // Extract percentage if available
      const percentMatch = result.snippet?.match(/(\d+(?:\.\d+)?)%/);
      const percentage = percentMatch ? parseFloat(percentMatch[1]) : null;

      // Calculate relevance score based on citation count and recency
      const citationCount = result.inline_links?.cited_by?.total || 0;
      const yearsAgo = new Date().getFullYear() - year;
      const relevanceScore = (citationCount > 0 ? Math.min(1, citationCount / 100) : 0.5) *
                            (1 - Math.min(0.5, yearsAgo / 10));

      trends.push({
        source: result.publication_info?.summary || extractDomain(result.link),
        title: result.title,
        year,
        automationPercentage: percentage,
        url: result.link,
        snippet: result.snippet,
        relevanceScore
      });
    });
  }

  return trends.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
};

/**
 * Process technology adoption results
 */
const processTechnologyResults = (data: any): AutomationTrend[] => {
  const trends: AutomationTrend[] = [];

  // Extract organic results
  if (data.organic_results) {
    data.organic_results.forEach((result: any) => {
      // Extract year from snippet if available
      const yearMatch = result.snippet?.match(/\b(20\d{2})\b/);
      const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();

      // Extract percentage if available
      const percentMatch = result.snippet?.match(/(\d+(?:\.\d+)?)%/);
      const percentage = percentMatch ? parseFloat(percentMatch[1]) : null;

      // Calculate relevance score
      const relevanceScore = (10 - Math.min(9, data.organic_results.indexOf(result))) / 10;

      trends.push({
        source: result.source || extractDomain(result.link),
        title: result.title,
        year,
        automationPercentage: percentage,
        url: result.link,
        snippet: result.snippet,
        relevanceScore
      });
    });
  }

  return trends.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
};

/**
 * Extract domain from URL
 */
const extractDomain = (url: string): string => {
  try {
    const domain = new URL(url).hostname;
    return domain.replace(/^www\./, '');
  } catch (e) {
    return url;
  }
};
