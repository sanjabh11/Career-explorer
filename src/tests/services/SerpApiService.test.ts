/**
 * SerpApiService Tests
 * Version 1.0
 * 
 * This file contains tests for the SerpApiService implementation
 * to verify the functionality of automation research data retrieval and processing.
 */

import { SerpApiService } from '../../services/api/SerpApiService';
import { SerpApiResponse, AutomationResearchData } from '../../types/research';

// Mock API key and proxy URL for testing
const API_KEY = 'test_api_key';
const PROXY_URL = 'http://localhost:8888/api/serp';

describe('SerpApiService', () => {
  let serpApiService: SerpApiService;
  
  beforeEach(() => {
    serpApiService = new SerpApiService(API_KEY, PROXY_URL);
    
    // Mock the API call methods to return test data
    jest.spyOn(serpApiService as any, 'fetchScholarResults').mockImplementation(async () => {
      return mockScholarResponse;
    });
    
    jest.spyOn(serpApiService as any, 'fetchIndustryResults').mockImplementation(async () => {
      return mockIndustryResponse;
    });
    
    jest.spyOn(serpApiService as any, 'fetchNewsResults').mockImplementation(async () => {
      return mockNewsResponse;
    });
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  test('getAutomationResearch should return properly structured data', async () => {
    const result = await serpApiService.getAutomationResearch('Software Developer');
    
    // Verify the structure of the result
    expect(result).toBeDefined();
    expect(result.occupation).toBe('Software Developer');
    expect(result.researchPapers).toBeInstanceOf(Array);
    expect(result.industryReports).toBeInstanceOf(Array);
    expect(result.newsArticles).toBeInstanceOf(Array);
    expect(result.trends).toBeInstanceOf(Array);
    expect(typeof result.overallScore).toBe('number');
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(1);
    
    // Verify research papers processing
    expect(result.researchPapers.length).toBeGreaterThan(0);
    const paper = result.researchPapers[0];
    expect(paper.title).toBeDefined();
    expect(paper.authors).toBeInstanceOf(Array);
    expect(paper.url).toBeDefined();
    expect(typeof paper.automationScore).toBe('number');
    expect(typeof paper.relevanceScore).toBe('number');
    
    // Verify industry reports processing
    expect(result.industryReports.length).toBeGreaterThan(0);
    const report = result.industryReports[0];
    expect(report.title).toBeDefined();
    expect(report.publisher).toBeDefined();
    expect(report.url).toBeDefined();
    expect(typeof report.automationScore).toBe('number');
    expect(typeof report.relevanceScore).toBe('number');
    
    // Verify news articles processing
    expect(result.newsArticles.length).toBeGreaterThan(0);
    const article = result.newsArticles[0];
    expect(article.title).toBeDefined();
    expect(article.source).toBeDefined();
    expect(article.url).toBeDefined();
    expect(typeof article.automationScore).toBe('number');
    expect(typeof article.relevanceScore).toBe('number');
    
    // Verify trends extraction
    expect(result.trends.length).toBeGreaterThan(0);
    const trend = result.trends[0];
    expect(trend.trendName).toBeDefined();
    expect(trend.description).toBeDefined();
    expect(typeof trend.impactScore).toBe('number');
    expect(trend.timeframe).toBeDefined();
    expect(trend.relevantTechnologies).toBeInstanceOf(Array);
    expect(trend.sources).toBeInstanceOf(Array);
  });
  
  test('processScholarResults should extract research papers correctly', async () => {
    // @ts-ignore - Accessing private method for testing
    const papers = serpApiService.processScholarResults([mockScholarResponse]);
    
    expect(papers).toBeInstanceOf(Array);
    expect(papers.length).toBeGreaterThan(0);
    
    const paper = papers[0];
    expect(paper.title).toBe('The Future of Automation in Software Development');
    expect(paper.authors).toContain('Jane Smith');
    expect(paper.publicationYear).toBe(2023);
    expect(paper.journal).toBe('Journal of AI Research');
    expect(paper.citationCount).toBe(45);
    expect(typeof paper.automationScore).toBe('number');
    expect(typeof paper.relevanceScore).toBe('number');
    expect(paper.keyInsights).toBeInstanceOf(Array);
  });
  
  test('processIndustryResults should extract industry reports correctly', async () => {
    // @ts-ignore - Accessing private method for testing
    const reports = serpApiService.processIndustryResults([mockIndustryResponse]);
    
    expect(reports).toBeInstanceOf(Array);
    expect(reports.length).toBeGreaterThan(0);
    
    const report = reports[0];
    expect(report.title).toBe('Industry Report: Automation in Software Development 2023');
    expect(report.publisher).toBe('mckinsey.com');
    expect(report.year).toBe(2023);
    expect(typeof report.automationScore).toBe('number');
    expect(typeof report.relevanceScore).toBe('number');
    expect(report.keyInsights).toBeInstanceOf(Array);
  });
  
  test('processNewsResults should extract news articles correctly', async () => {
    // @ts-ignore - Accessing private method for testing
    const articles = serpApiService.processNewsResults([mockNewsResponse]);
    
    expect(articles).toBeInstanceOf(Array);
    expect(articles.length).toBeGreaterThan(0);
    
    const article = articles[0];
    expect(article.title).toBe('AI Coding Assistants Transform Developer Productivity');
    expect(article.source).toBe('TechCrunch');
    expect(typeof article.automationScore).toBe('number');
    expect(typeof article.relevanceScore).toBe('number');
    expect(article.keyInsights).toBeInstanceOf(Array);
  });
});

// Mock data for testing
const mockScholarResponse: SerpApiResponse = {
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

const mockIndustryResponse: SerpApiResponse = {
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
      snippet: 'This report analyzes the impact of automation tools on software development productivity and job roles.',
      publication_info: {
        summary: 'McKinsey & Company',
        year: 2023
      }
    }
  ]
};

const mockNewsResponse: SerpApiResponse = {
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
