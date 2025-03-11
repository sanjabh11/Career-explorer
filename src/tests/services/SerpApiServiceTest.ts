/**
 * SerpApiService Test Script
 * Version 1.0
 * 
 * This script tests the functionality of the SerpApiService implementation
 * for retrieving and processing automation research data.
 */

import { SerpApiService } from '../../services/api/SerpApiService';
import { AutomationResearchData, ResearchPaper, IndustryReport, NewsArticle } from '../../types/research';

// Mock API key and proxy URL for testing
const API_KEY = process.env.SERP_API_KEY || 'test_api_key';
const PROXY_URL = process.env.SERP_API_PROXY || 'http://localhost:8888/api/serp';

// Initialize service
const serpApiService = new SerpApiService(API_KEY, PROXY_URL);

/**
 * Test helper methods
 */
async function testHelperMethods() {
  console.log('Testing SerpApiService helper methods...');
  
  // Test estimateAutomationScoreFromText
  const highAutomationText = 'This occupation is highly susceptible to automation with AI and machine learning replacing many tasks.';
  const lowAutomationText = 'This occupation requires human creativity, judgment, and complex interpersonal skills that are difficult to automate.';
  const neutralText = 'This is a general description of the occupation.';
  
  // @ts-ignore - Accessing private method for testing
  const highScore = serpApiService.estimateAutomationScoreFromText(highAutomationText);
  // @ts-ignore - Accessing private method for testing
  const lowScore = serpApiService.estimateAutomationScoreFromText(lowAutomationText);
  // @ts-ignore - Accessing private method for testing
  const neutralScore = serpApiService.estimateAutomationScoreFromText(neutralText);
  
  console.log('Automation Score (High):', highScore);
  console.log('Automation Score (Low):', lowScore);
  console.log('Automation Score (Neutral):', neutralScore);
  
  // Test analyzeSentiment
  const positiveText = 'AI will create opportunities for growth and enhance productivity in this field.';
  const negativeText = 'Automation poses a significant threat to jobs in this sector, with high risk of displacement.';
  
  // @ts-ignore - Accessing private method for testing
  const positiveSentiment = serpApiService.analyzeSentiment(positiveText);
  // @ts-ignore - Accessing private method for testing
  const negativeSentiment = serpApiService.analyzeSentiment(negativeText);
  
  console.log('Sentiment (Positive):', positiveSentiment);
  console.log('Sentiment (Negative):', negativeSentiment);
  
  // Test extractKeyInsights
  const insightText = 'AI automation is transforming this field rapidly. Machine learning models are replacing routine tasks. Human oversight remains essential for complex decision-making.';
  
  // @ts-ignore - Accessing private method for testing
  const insights = serpApiService.extractKeyInsights(insightText);
  
  console.log('Key Insights:', insights);
  
  // Test calculateIndividualSourceQuality
  // @ts-ignore - Accessing private method for testing
  const highQualitySource = serpApiService.calculateIndividualSourceQuality('nature.com', 50);
  // @ts-ignore - Accessing private method for testing
  const mediumQualitySource = serpApiService.calculateIndividualSourceQuality('nytimes.com', 0);
  // @ts-ignore - Accessing private method for testing
  const lowQualitySource = serpApiService.calculateIndividualSourceQuality('unknown-blog.com', 0);
  
  console.log('Source Quality (High):', highQualitySource);
  console.log('Source Quality (Medium):', mediumQualitySource);
  console.log('Source Quality (Low):', lowQualitySource);
}

/**
 * Test the getAutomationResearch method with a mock response
 */
async function testGetAutomationResearch() {
  console.log('\nTesting getAutomationResearch method...');
  
  try {
    // Mock the API call to return test data
    // @ts-ignore - Overriding for testing
    serpApiService.fetchScholarResults = async () => {
      return {
        search_metadata: {
          id: 'test-id',
          status: 'Success',
          json_endpoint: 'test-endpoint',
          created_at: new Date().toISOString(),
          processed_at: new Date().toISOString(),
          google_scholar_url: 'test-url',
          raw_html_file: 'test-file',
          total_time_taken: 0.5
        },
        search_parameters: {
          engine: 'google_scholar',
          q: 'test query'
        },
        organic_results: [
          {
            position: 1,
            title: 'The Future of Automation in Software Development',
            result_id: 'test-id-1',
            link: 'https://example.com/paper1',
            snippet: 'This research explores how AI and machine learning are automating coding tasks and transforming software development roles.',
            publication_info: {
              summary: 'Journal of AI Research',
              authors: [
                { name: 'Jane Smith', link: 'https://example.com/author1', author_id: 'author1' }
              ],
              year: 2023
            },
            inline_links: {
              cited_by: {
                total: 45,
                link: 'https://example.com/citations1'
              }
            }
          }
        ]
      };
    };
    
    // @ts-ignore - Overriding for testing
    serpApiService.fetchIndustryResults = async () => {
      return {
        search_metadata: {
          id: 'test-id',
          status: 'Success',
          json_endpoint: 'test-endpoint',
          created_at: new Date().toISOString(),
          processed_at: new Date().toISOString(),
          google_scholar_url: 'test-url',
          raw_html_file: 'test-file',
          total_time_taken: 0.5
        },
        search_parameters: {
          engine: 'google',
          q: 'test query'
        },
        organic_results: [
          {
            position: 1,
            title: 'Industry Report: Automation in Software Development 2023',
            result_id: 'test-id-2',
            link: 'https://mckinsey.com/report1',
            snippet: 'This report analyzes the impact of automation tools on software development productivity and job roles.'
          }
        ]
      };
    };
    
    // @ts-ignore - Overriding for testing
    serpApiService.fetchNewsResults = async () => {
      return {
        search_metadata: {
          id: 'test-id',
          status: 'Success',
          json_endpoint: 'test-endpoint',
          created_at: new Date().toISOString(),
          processed_at: new Date().toISOString(),
          google_scholar_url: 'test-url',
          raw_html_file: 'test-file',
          total_time_taken: 0.5
        },
        search_parameters: {
          engine: 'google_news',
          q: 'test query'
        },
        organic_results: [
          {
            position: 1,
            title: 'AI Coding Assistants Transform Developer Productivity',
            result_id: 'test-id-3',
            link: 'https://techcrunch.com/article1',
            snippet: 'New AI coding tools are helping developers write code faster and with fewer bugs.',
            publication_info: {
              summary: 'TechCrunch',
              year: 2023
            }
          }
        ]
      };
    };
    
    // Test the getAutomationResearch method
    const result = await serpApiService.getAutomationResearch('Software Developer');
    
    console.log('Automation Research Result:');
    console.log('- Occupation:', result.occupation);
    console.log('- Research Papers:', result.researchPapers.length);
    console.log('- Industry Reports:', result.industryReports.length);
    console.log('- News Articles:', result.newsArticles.length);
    console.log('- Trends:', result.trends.length);
    console.log('- Overall Score:', result.overallScore);
    
    // Log a sample trend if available
    if (result.trends.length > 0) {
      console.log('\nSample Trend:');
      console.log('- Name:', result.trends[0].trendName);
      console.log('- Description:', result.trends[0].description);
      console.log('- Impact Score:', result.trends[0].impactScore);
      console.log('- Timeframe:', result.trends[0].timeframe);
      console.log('- Technologies:', result.trends[0].relevantTechnologies);
    }
    
    return result;
  } catch (error) {
    console.error('Error testing getAutomationResearch:', error);
    throw error;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('=== SerpApiService Test Suite ===\n');
  
  try {
    await testHelperMethods();
    const researchData = await testGetAutomationResearch();
    
    console.log('\n=== All tests completed successfully ===');
    return researchData;
  } catch (error) {
    console.error('\n=== Test suite failed ===');
    console.error(error);
  }
}

// Run the tests
if (require.main === module) {
  runTests().then(data => {
    console.log('\nTest data ready for integration with other components');
  });
}

export { testHelperMethods, testGetAutomationResearch, runTests };
