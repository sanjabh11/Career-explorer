/**
 * API Connection Test Utility
 * Version 1.0
 * 
 * Tests connections to external APIs used in the Career Explorer application
 */

import { JinaApiService } from '../../services/api/JinaApiService';
import { SerpApiService } from '../../services/api/SerpApiService';
import { OccupationTask } from '../../types/semantic';
import { Skill } from '../../types/skills';

/**
 * Test Jina API connection
 * @returns Promise with test results
 */
export async function testJinaApiConnection(): Promise<{
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}> {
  try {
    const jinaApiKey = process.env.REACT_APP_JINA_API_KEY;
    
    if (!jinaApiKey) {
      return {
        success: false,
        message: 'Jina API key not found in environment variables'
      };
    }
    
    const jinaApiService = new JinaApiService(jinaApiKey);
    
    // Create a mock occupation for testing
    const mockOccupation = {
      id: 'test-occupation',
      title: 'Software Developer',
      tasks: [
        { id: 'task1', description: 'Write code for applications' },
        { id: 'task2', description: 'Debug software issues' }
      ] as OccupationTask[],
      skills: [
        { id: 'skill1', name: 'Programming', category: 'technical' },
        { id: 'skill2', name: 'Problem Solving', category: 'cognitive' }
      ] as Skill[]
    };
    
    // Test query - analyze a mock occupation
    const testResult = await jinaApiService.analyzeOccupation(mockOccupation);
    
    if (!testResult || !testResult.semanticRanking) {
      return {
        success: false,
        message: 'Jina API returned invalid response',
        data: testResult
      };
    }
    
    return {
      success: true,
      message: 'Jina API connection successful',
      data: {
        timestamp: new Date().toISOString(),
        occupationId: testResult.occupationId,
        automationPotential: testResult.semanticRanking.automationPotential,
        taskRankingsCount: testResult.taskRankings?.length || 0,
        skillRankingsCount: testResult.skillRankings?.length || 0
      }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Jina API connection failed',
      error
    };
  }
}

/**
 * Test SERP API connection
 * @returns Promise with test results
 */
export async function testSerpApiConnection(): Promise<{
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}> {
  try {
    const serpApiKey = process.env.REACT_APP_SERP_API_KEY;
    
    if (!serpApiKey) {
      return {
        success: false,
        message: 'SERP API key not found in environment variables'
      };
    }
    
    const serpApiService = new SerpApiService(serpApiKey);
    
    // Test query - get automation research for a simple occupation
    const testResult = await serpApiService.getAutomationResearch('Software Developer');
    
    if (!testResult || !testResult.researchPapers) {
      return {
        success: false,
        message: 'SERP API returned invalid response',
        data: testResult
      };
    }
    
    return {
      success: true,
      message: 'SERP API connection successful',
      data: {
        timestamp: new Date().toISOString(),
        researchPaperCount: testResult.researchPapers.length,
        trendsCount: testResult.trends.length,
        lastUpdated: testResult.lastUpdated
      }
    };
  } catch (error) {
    return {
      success: false,
      message: 'SERP API connection failed',
      error
    };
  }
}

/**
 * Run all API connection tests
 * @returns Promise with all test results
 */
export async function testAllApiConnections(): Promise<{
  jinaApi: {
    success: boolean;
    message: string;
    data?: any;
    error?: any;
  };
  serpApi: {
    success: boolean;
    message: string;
    data?: any;
    error?: any;
  };
}> {
  const jinaResult = await testJinaApiConnection();
  const serpResult = await testSerpApiConnection();
  
  return {
    jinaApi: jinaResult,
    serpApi: serpResult
  };
}
