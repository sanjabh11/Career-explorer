/**
 * SerpApiService - Service for retrieving automation research data
 * Version 1.1
 * 
 * Enhanced with proper error handling, retry logic, and validation
 */

import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { AutomationResearchData, SerpApiResponse, ResearchPaper, IndustryReport, NewsArticle, AutomationTrend, ConfidenceScore, RegionalImpact } from '../../types/research';

// Error types for better error handling
export enum SerpApiErrorType {
  AUTHENTICATION = 'authentication_error',
  RATE_LIMIT = 'rate_limit_error',
  SERVER = 'server_error',
  NETWORK = 'network_error',
  VALIDATION = 'validation_error',
  UNKNOWN = 'unknown_error'
}

// Custom error class for SERP API errors
export class SerpApiError extends Error {
  type: SerpApiErrorType;
  statusCode?: number;
  retryable: boolean;
  
  constructor(
    message: string, 
    type: SerpApiErrorType = SerpApiErrorType.UNKNOWN, 
    statusCode?: number,
    retryable: boolean = false
  ) {
    super(message);
    this.name = 'SerpApiError';
    this.type = type;
    this.statusCode = statusCode;
    this.retryable = retryable;
  }
}

export class SerpApiService {
  private apiKey: string;
  private baseUrl: string;
  private proxyUrl?: string;
  private maxRetries: number;
  private retryDelay: number;
  private lastRequestTimestamp: number = 0;
  private requestsPerMinute: number = 60; // Default rate limit
  private logger: Console;

  constructor(
    apiKey: string, 
    baseUrl = 'https://serpapi.com/search',
    proxyUrl?: string,
    maxRetries: number = 3,
    retryDelay: number = 1000,
    logger: Console = console
  ) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.proxyUrl = proxyUrl;
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
    this.logger = logger;
    
    // Validate API key
    if (!this.apiKey || this.apiKey === 'demo-key') {
      this.logger.warn('SerpApiService initialized with demo key or empty key. API calls may fail.');
    }
  }

  /**
   * Make an API request with retry logic and rate limiting
   * @param endpoint API endpoint
   * @param method HTTP method
   * @param params Request parameters
   * @returns Promise with response data
   */
  private async makeRequest<T>(
    endpoint: string = '',
    method: string = 'GET',
    params: Record<string, any> = {}
  ): Promise<T> {
    // Implement rate limiting
    const now = Date.now();
    const timeGap = now - this.lastRequestTimestamp;
    const minGap = (60 * 1000) / this.requestsPerMinute;
    
    if (timeGap < minGap) {
      await new Promise(resolve => setTimeout(resolve, minGap - timeGap));
    }
    
    this.lastRequestTimestamp = Date.now();
    
    // Add API key to parameters
    const requestParams = {
      ...params,
      api_key: this.apiKey
    };
    
    // Setup request config
    const url = this.proxyUrl || `${this.baseUrl}${endpoint}`;
    const config: AxiosRequestConfig = {
      method,
      url,
      headers: {
        'Content-Type': 'application/json'
      },
      params: method === 'GET' ? requestParams : undefined,
      data: method !== 'GET' ? requestParams : undefined
    };
    
    // Implement retry logic
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await axios(config);
        return response.data as T;
      } catch (error) {
        lastError = this.handleApiError(error as Error | AxiosError, attempt);
        
        if (lastError instanceof SerpApiError && !lastError.retryable) {
          throw lastError;
        }
        
        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, attempt);
          this.logger.warn(`Retrying request (${attempt + 1}/${this.maxRetries}) after ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError || new SerpApiError('Maximum retries exceeded');
  }
  
  /**
   * Handle API errors and convert to appropriate error types
   * @param error Error object
   * @param attempt Current attempt number
   * @returns Processed error
   */
  private handleApiError(error: Error | AxiosError, attempt: number): Error {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      
      // Authentication errors
      if (statusCode === 401 || statusCode === 403) {
        return new SerpApiError(
          'Authentication failed. Please check your API key.',
          SerpApiErrorType.AUTHENTICATION,
          statusCode,
          false
        );
      }
      
      // Rate limit errors
      if (statusCode === 429) {
        return new SerpApiError(
          'Rate limit exceeded. Please slow down your requests.',
          SerpApiErrorType.RATE_LIMIT,
          statusCode,
          true
        );
      }
      
      // Server errors
      if (statusCode && statusCode >= 500) {
        return new SerpApiError(
          'SERP API server error. Please try again later.',
          SerpApiErrorType.SERVER,
          statusCode,
          true
        );
      }
      
      // Network errors
      if (!error.response) {
        return new SerpApiError(
          'Network error. Please check your internet connection.',
          SerpApiErrorType.NETWORK,
          undefined,
          true
        );
      }
      
      // Other errors
      return new SerpApiError(
        `API error: ${error.message}`,
        SerpApiErrorType.UNKNOWN,
        statusCode,
        attempt < this.maxRetries
      );
    }
    
    // Non-Axios errors
    return new SerpApiError(
      `Unexpected error: ${error.message}`,
      SerpApiErrorType.UNKNOWN,
      undefined,
      attempt < this.maxRetries
    );
  }

  /**
   * Retrieves automation research data for a specific occupation
   * @param occupation The occupation to research
   * @returns Automation research data
   */
  public async getAutomationResearch(occupation: string): Promise<AutomationResearchData> {
    try {
      // Construct intelligent queries for different sources
      const queries = this.constructIntelligentQueries(occupation);
      
      // Fetch results from different sources in parallel
      const scholarResults = await Promise.all(
        queries.scholar.map(query => this.fetchScholarResults(query))
      );
      
      const industryResults = await Promise.all(
        queries.industry.map(query => this.fetchIndustryResults(query))
      );
      
      const newsResults = await Promise.all(
        queries.news.map(query => this.fetchNewsResults(query))
      );
      
      // Process results into structured data
      const researchPapers = this.processScholarResults(scholarResults.flat());
      const industryReports = this.processIndustryResults(industryResults.flat());
      const newsArticles = this.processNewsResults(newsResults.flat());
      
      // Extract trends with enhanced pattern recognition
      const trends = this.extractTrendsWithPatternRecognition(
        researchPapers, 
        industryReports, 
        newsArticles
      );
      
      // Calculate overall score with confidence metrics
      const overallScore = this.calculateOverallScore(researchPapers, industryReports, newsArticles);
      const confidenceLevel = this.calculateConfidenceMetrics(researchPapers, industryReports, newsArticles);
      
      // Generate regional impact assessment
      const regionalImpact = this.generateRegionalImpactData(occupation, researchPapers, industryReports);
      
      // Generate adoption curves
      const adoptionCurves = this.generateAdoptionCurves(trends, researchPapers, industryReports);
      
      // Return comprehensive research data
      return {
        occupation,
        researchPapers,
        industryReports,
        newsArticles,
        trends,
        overallScore,
        confidenceLevel,
        regionalImpact,
        adoptionCurves,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Error retrieving automation research:', error);
      throw error;
    }
  }

  /**
   * Fetches scholarly research papers related to automation for the given occupation
   */
  private async fetchScholarResults(occupation: string): Promise<SerpApiResponse> {
    const query = `${occupation} automation potential research`;
    
    if (this.proxyUrl) {
      // Use proxy to avoid exposing API key in client
      const response = await this.makeRequest<any>(
        '',
        'POST',
        {
          apiType: 'serp',
          path: 'search',
          params: {
            q: query,
            engine: 'google_scholar',
            num: 20,
            as_ylo: 2020 // Research from 2020 onwards
          }
        }
      );
      
      return response.data;
    } else {
      // Direct API call (server-side only)
      const response = await this.makeRequest<any>(
        '',
        'GET',
        {
          api_key: this.apiKey,
          q: query,
          engine: 'google_scholar',
          num: 20,
          as_ylo: 2020
        }
      );
      
      return response.data;
    }
  }

  /**
   * Fetches industry reports related to automation for the given occupation
   */
  private async fetchIndustryResults(occupation: string): Promise<SerpApiResponse> {
    const query = `${occupation} industry automation report`;
    
    // Implementation similar to fetchScholarResults but with different parameters
    // ...
    
    // Placeholder
    return {} as SerpApiResponse;
  }

  /**
   * Fetches news articles related to automation for the given occupation
   */
  private async fetchNewsResults(occupation: string): Promise<SerpApiResponse> {
    const query = `${occupation} automation news`;
    
    // Implementation similar to fetchScholarResults but with different parameters
    // ...
    
    // Placeholder
    return {} as SerpApiResponse;
  }

  /**
   * Processes scholarly research results into structured data
   */
  private processScholarResults(results: SerpApiResponse[]): ResearchPaper[] {
    if (!results || !Array.isArray(results)) {
      return [];
    }
    
    return results.flatMap(result => {
      if (!result.organic_results || !Array.isArray(result.organic_results)) {
        return [];
      }
      
      return result.organic_results.map(resultItem => {
        // Extract authors
        const authors = resultItem.publication_info?.authors?.map(author => author.name) || [];
        
        // Extract year
        const year = resultItem.publication_info?.year || new Date().getFullYear();
        
        // Extract citation count
        const citationCount = resultItem.inline_links?.cited_by?.total || 0;
        
        // Calculate automation score based on title and snippet relevance
        const automationScore = this.calculateAutomationRelevance(resultItem.title, resultItem.snippet);
        
        // Calculate relevance score
        const relevanceScore = this.calculateRelevanceScore(resultItem.title, resultItem.snippet);
        
        // Extract key insights
        const keyInsights = this.extractKeyInsights(resultItem.snippet);
        
        return {
          title: resultItem.title,
          authors,
          publicationYear: year,
          journal: resultItem.publication_info?.summary,
          url: resultItem.link,
          abstract: resultItem.snippet,
          citationCount,
          automationScore,
          relevanceScore,
          keyInsights
        };
      });
    });
  }

  /**
   * Processes industry report results into structured data
   */
  private processIndustryResults(results: SerpApiResponse[]): IndustryReport[] {
    if (!results || results.length === 0) return [];
    
    try {
      // Extract and structure industry report data
      const reports: IndustryReport[] = [];
      
      results.forEach(result => {
        if (!result.organic_results) return;
        
        result.organic_results.forEach(item => {
          if (!item.title || !item.link) return;
          
          // Extract publication year from publication_info, snippet, or title
          let year: number;
          
          if (item.publication_info && item.publication_info.year) {
            // Use publication_info.year if available
            year = typeof item.publication_info.year === 'number' 
              ? item.publication_info.year 
              : parseInt(String(item.publication_info.year));
          } else {
            // Fall back to extracting from snippet or title
            const yearMatch = (item.snippet || item.title).match(/\b(20\d{2})\b/);
            year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
          }
          
          // Extract publisher information
          const publisherMatch = item.link.match(/https?:\/\/(?:www\.)?([^\/]+)/);
          const publisher = publisherMatch ? publisherMatch[1] : 'Unknown';
          
          // Extract automation score from snippet if available
          const automationScoreMatch = (item.snippet || '').match(/automation\s+(?:potential|score|index)[\s:]+(\d+(?:\.\d+)?)/i);
          const automationScore = automationScoreMatch 
            ? parseFloat(automationScoreMatch[1]) / 100 // Normalize to 0-1 range
            : this.estimateAutomationScoreFromText(item.snippet || item.title);
          
          // Extract key insights
          const keyInsights = this.extractKeyInsights(item.snippet || '');
          
          reports.push({
            title: item.title,
            url: item.link,
            publisher,
            year,
            summary: item.snippet || '',
            automationScore,
            relevanceScore: this.calculateIndividualSourceQuality(publisher, 0),
            keyInsights
          });
        });
      });
      
      return reports;
    } catch (error) {
      this.logger.error('Error processing industry results:', error);
      return [];
    }
  }

  /**
   * Processes news article results into structured data
   */
  private processNewsResults(results: SerpApiResponse[]): NewsArticle[] {
    if (!results || results.length === 0) return [];
    
    try {
      // Extract and structure news article data
      const articles: NewsArticle[] = [];
      
      results.forEach(result => {
        // Use organic_results for news articles
        const newsItems = result.organic_results || [];
        
        newsItems.forEach(item => {
          if (!item.title || !item.link) return;
          
          // Extract publication date from publication_info if available
          const year = item.publication_info?.year || new Date().getFullYear();
          const date = `${year}-01-01`; // Default to January 1st of the year
          
          // Extract source information from publication_info
          const source = item.publication_info?.summary || 'Unknown';
          
          // Extract automation sentiment from title and snippet
          const sentiment = this.analyzeSentiment(item.title + ' ' + (item.snippet || ''));
          
          // Extract automation score from text
          const automationScore = this.estimateAutomationScoreFromText(item.title + ' ' + (item.snippet || ''));
          
          // Extract key insights
          const keyInsights = this.extractKeyInsights(item.snippet || '');
          
          articles.push({
            title: item.title,
            url: item.link,
            source,
            date,
            summary: item.snippet || '',
            automationScore,
            relevanceScore: this.calculateIndividualSourceQuality(source, 0),
            keyInsights
          });
        });
      });
      
      return articles;
    } catch (error) {
      this.logger.error('Error processing news results:', error);
      return [];
    }
  }

  /**
   * Calculates recency score from a date string
   * @param dateString ISO date string
   * @returns Recency score (0-1)
   */
  private calculateRecencyFromDate(dateString: string): number {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const ageInDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
      
      // Newer content gets higher scores
      if (ageInDays < 30) return 1.0; // Last month
      if (ageInDays < 90) return 0.9; // Last quarter
      if (ageInDays < 180) return 0.8; // Last 6 months
      if (ageInDays < 365) return 0.7; // Last year
      if (ageInDays < 730) return 0.5; // Last 2 years
      if (ageInDays < 1095) return 0.3; // Last 3 years
      
      return 0.1; // Older than 3 years
    } catch (error) {
      return 0.5; // Default if date parsing fails
    }
  }

  /**
   * Constructs intelligent queries based on occupation title and automation context
   * @param occupation The occupation title
   * @returns Specialized queries for different research sources
   */
  private constructIntelligentQueries(occupation: string): {
    scholar: string[];
    industry: string[];
    news: string[];
  } {
    // Clean and normalize occupation title
    const normalizedOccupation = occupation.toLowerCase().trim();
    
    // Extract key terms from occupation
    const occupationTerms = normalizedOccupation.split(/\s+/);
    const keyTerms = occupationTerms.filter(term => 
      !['and', 'or', 'the', 'of', 'in', 'for', 'with', 'by', 'on', 'at'].includes(term)
    );
    
    // Generate scholar queries with academic focus
    const scholarQueries = [
      `"${occupation}" automation potential research`,
      `"${occupation}" future of work artificial intelligence`,
      `"${occupation}" tasks automation machine learning`,
      `"${occupation}" job displacement technology`,
      `"${occupation}" skills augmentation AI`
    ];
    
    // Generate industry-specific queries
    const industryQueries = [
      `"${occupation}" industry report automation`,
      `"${occupation}" workforce transformation`,
      `"${occupation}" industry outlook technology`,
      `"${occupation}" labor market trends automation`,
      `"${occupation}" professional association technology report`
    ];
    
    // Generate news queries with current events focus
    const newsQueries = [
      `"${occupation}" automation news`,
      `"${occupation}" AI impact recent`,
      `"${occupation}" technology disruption`,
      `"${occupation}" digital transformation`,
      `"${occupation}" job market technology changes`
    ];
    
    return {
      scholar: scholarQueries,
      industry: industryQueries,
      news: newsQueries
    };
  }

  /**
   * Extracts trends with enhanced pattern recognition across multiple sources
   * @param researchPapers Research papers data
   * @param industryReports Industry reports data
   * @param newsArticles News articles data
   * @returns Identified automation trends
   */
  private extractTrendsWithPatternRecognition(
    researchPapers: ResearchPaper[],
    industryReports: IndustryReport[],
    newsArticles: NewsArticle[]
  ): AutomationTrend[] {
    // Collect all insights across sources
    const allInsights: string[] = [
      ...researchPapers.flatMap(paper => paper.keyInsights || []),
      ...industryReports.flatMap(report => report.keyInsights || []),
      ...newsArticles.flatMap(article => article.keyInsights || [])
    ];
    
    // Identify common themes using frequency analysis
    const themeFrequency: Record<string, number> = {};
    const themeKeywords: Record<string, string[]> = {
      'AI Adoption': ['ai', 'artificial intelligence', 'machine learning', 'adoption', 'implementation'],
      'Robotics': ['robot', 'robotics', 'automation', 'mechanical', 'physical'],
      'Task Automation': ['task', 'workflow', 'process', 'automate', 'routine'],
      'Augmentation': ['augment', 'enhance', 'assist', 'collaboration', 'human-ai'],
      'Skill Shifts': ['skill', 'reskill', 'upskill', 'training', 'learning'],
      'Job Displacement': ['displace', 'replace', 'eliminate', 'redundant', 'layoff'],
      'New Roles': ['new role', 'emerging job', 'new position', 'creation', 'novel']
    };
    
    // Count theme occurrences in insights
    Object.entries(themeKeywords).forEach(([theme, keywords]) => {
      themeFrequency[theme] = allInsights.filter(insight => 
        keywords.some(keyword => insight.toLowerCase().includes(keyword))
      ).length;
    });
    
    // Extract top themes as trends
    const topThemes = Object.entries(themeFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([theme, frequency]): AutomationTrend => {
        // Generate description based on theme
        const descriptions: Record<string, string> = {
          'AI Adoption': 'Increasing adoption of AI technologies across various aspects of this occupation',
          'Robotics': 'Integration of robotic systems to automate physical tasks in this field',
          'Task Automation': 'Automation of routine and repetitive tasks through software and algorithms',
          'Augmentation': 'Technology augmenting human capabilities rather than replacing workers',
          'Skill Shifts': 'Changing skill requirements due to technological advancements',
          'Job Displacement': 'Potential displacement of certain roles or tasks by automated systems',
          'New Roles': 'Emergence of new job roles and specializations due to technological changes'
        };
        
        // Determine timeframe based on frequency and theme
        let timeframe = 'Medium-term';
        if (theme === 'AI Adoption' || theme === 'Task Automation') {
          timeframe = 'Short-term';
        } else if (theme === 'Job Displacement' || theme === 'New Roles') {
          timeframe = 'Long-term';
        }
        
        // Calculate impact score based on frequency and theme
        const baseImpact = frequency / (allInsights.length || 1);
        const themeMultiplier = theme === 'Job Displacement' ? 1.2 : 
                               theme === 'Task Automation' ? 1.1 : 1.0;
        const impactScore = Math.min(1, baseImpact * themeMultiplier);
        
        // Extract relevant technologies
        const relevantTechnologies = this.extractRelevantTechnologies(allInsights, theme);
        
        // Extract sources (simplified)
        const sources = [
          ...researchPapers.slice(0, 2).map(p => p.title),
          ...industryReports.slice(0, 2).map(r => r.title)
        ];
        
        return {
          trendName: theme,
          description: descriptions[theme] || `Trend related to ${theme} in this occupation`,
          impactScore,
          timeframe,
          relevantTechnologies,
          sources: sources.slice(0, 3) // Limit to top 3 sources
        };
      });
    
    return topThemes;
  }
  
  /**
   * Extracts relevant technologies from insights based on theme
   * @param insights Array of insights
   * @param theme The theme to extract technologies for
   * @returns Array of relevant technologies
   */
  private extractRelevantTechnologies(insights: string[], theme: string): string[] {
    // Technology keywords by theme
    const technologyKeywords: Record<string, string[]> = {
      'AI Adoption': ['neural networks', 'deep learning', 'nlp', 'computer vision', 'predictive analytics'],
      'Robotics': ['robotic process automation', 'cobots', 'autonomous vehicles', 'drones', 'industrial robots'],
      'Task Automation': ['workflow automation', 'business process automation', 'rpa', 'automated decision systems'],
      'Augmentation': ['decision support systems', 'augmented reality', 'virtual assistants', 'exoskeletons'],
      'Skill Shifts': ['online learning', 'digital literacy', 'data science', 'programming', 'human-ai collaboration'],
      'Job Displacement': ['full automation', 'autonomous systems', 'self-service technology', 'automated customer service'],
      'New Roles': ['ai ethics', 'human-ai oversight', 'automation managers', 'data specialists', 'robot coordinators']
    };
    
    // Get keywords for the theme
    const keywords = technologyKeywords[theme] || [];
    
    // Find insights containing these keywords
    const technologies = keywords.filter(tech => 
      insights.some(insight => insight.toLowerCase().includes(tech.toLowerCase()))
    );
    
    // If no specific technologies found, return generic ones for the theme
    if (technologies.length === 0) {
      return keywords.slice(0, 3).map(k => k.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
      );
    }
    
    // Format technologies with proper capitalization
    return technologies.slice(0, 5).map(tech => 
      tech.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    );
  }

  /**
   * Calculates confidence metrics for the automation research data
   * @param researchPapers Research papers data
   * @param industryReports Industry reports data
   * @param newsArticles News articles data
   * @returns Confidence metrics for the research data
   */
  private calculateConfidenceMetrics(
    researchPapers: ResearchPaper[],
    industryReports: IndustryReport[],
    newsArticles: NewsArticle[]
  ): ConfidenceScore {
    // Calculate source quality
    const sourceQuality = this.calculateSourceQuality(researchPapers, industryReports);
    
    // Calculate variance in findings (data consistency is inverse of variance)
    const variance = this.calculateVarianceInFindings(researchPapers, industryReports, newsArticles);
    const dataConsistency = 1 - variance;
    
    // Calculate recency
    const recency = this.calculateRecency(researchPapers, industryReports, newsArticles);
    
    // Calculate source agreement
    const agreement = this.calculateSourceAgreement(researchPapers, industryReports, newsArticles);
    
    // Calculate overall confidence score
    const overall = Math.min(1, (sourceQuality * 0.3 + dataConsistency * 0.3 + recency * 0.2 + agreement * 0.2));
    
    // Return confidence metrics
    return {
      overall,
      sourceCount: researchPapers.length + industryReports.length + newsArticles.length,
      sourceQuality,
      dataConsistency,
      recency
    };
  }

  /**
   * Calculates the overall automation score based on research results
   * @param researchPapers Research papers data
   * @param industryReports Industry reports data
   * @param newsArticles News articles data
   * @returns The overall automation score
   */
  private calculateOverallScore(
    researchPapers: ResearchPaper[],
    industryReports: IndustryReport[],
    newsArticles: NewsArticle[]
  ): number {
    // Extract individual scores with null/undefined handling
    const paperScores = researchPapers.map(paper => paper.automationScore ?? 0.5);
    const reportScores = industryReports.map(report => report.automationScore ?? 0.5);
    const newsScores = newsArticles.map(article => article.automationScore ?? 0.5);
    
    // Calculate weighted average based on source quality
    const paperWeights = researchPapers.map(paper => paper.relevanceScore ?? 0.5);
    const reportWeights = industryReports.map(report => report.relevanceScore ?? 0.5);
    const newsWeights = newsArticles.map(article => article.relevanceScore ?? 0.5);
    
    // Calculate weighted scores
    let weightedSum = 0;
    let totalWeight = 0;
    
    // Add research paper scores (highest weight)
    if (paperScores.length > 0) {
      const paperSum = paperScores.reduce((sum, score, i) => sum + score * paperWeights[i], 0);
      const paperWeightSum = paperWeights.reduce((sum, weight) => sum + weight, 0);
      weightedSum += paperSum * 0.6; // 60% weight to scholarly research
      totalWeight += paperWeightSum * 0.6;
    }
    
    // Add industry report scores (medium weight)
    if (reportScores.length > 0) {
      const reportSum = reportScores.reduce((sum, score, i) => sum + score * reportWeights[i], 0);
      const reportWeightSum = reportWeights.reduce((sum, weight) => sum + weight, 0);
      weightedSum += reportSum * 0.3; // 30% weight to industry reports
      totalWeight += reportWeightSum * 0.3;
    }
    
    // Add news article scores (lowest weight)
    if (newsScores.length > 0) {
      const newsSum = newsScores.reduce((sum, score, i) => sum + score * newsWeights[i], 0);
      const newsWeightSum = newsWeights.reduce((sum, weight) => sum + weight, 0);
      weightedSum += newsSum * 0.1; // 10% weight to news articles
      totalWeight += newsWeightSum * 0.1;
    }
    
    // Calculate final score, normalized to 0-1 range
    return totalWeight > 0 ? Math.min(1, Math.max(0, weightedSum / totalWeight)) : 0.5;
  }

  /**
   * Calculates the automation relevance score
   * @param title The title of the research item
   * @param snippet The snippet of the research item
   * @returns The automation relevance score
   */
  private calculateAutomationRelevance(title: string, snippet: string): number {
    // Implement algorithm to determine how relevant the research is to automation
    const automationKeywords = [
      'automation', 'ai', 'machine learning', 'robot', 'technological', 
      'disruption', 'replacement', 'algorithm', 'computerization'
    ];
    
    // Calculate keyword presence
    let keywordScore = 0;
    const text = `${title} ${snippet}`.toLowerCase();
    
    automationKeywords.forEach(keyword => {
      if (text.includes(keyword.toLowerCase())) {
        keywordScore += 1;
      }
    });
    
    // Normalize to 0-1 scale
    return Math.min(1, keywordScore / (automationKeywords.length * 0.6));
  }

  /**
   * Calculates the relevance score of a result to the occupation
   * @param title The title of the research item
   * @param snippet The snippet of the research item
   * @returns The relevance score
   */
  private calculateRelevanceScore(title: string, snippet: string): number {
    // Calculate how relevant the result is to the occupation
    const occupationTerms = snippet.toLowerCase().split(' ').slice(0, 5); // Use first few words as occupation terms
    let relevanceScore = 0;
    
    // Check title and snippet for occupation terms
    const textToCheck = `${title} ${snippet}`.toLowerCase();
    
    occupationTerms.forEach(term => {
      if (term.length > 3 && textToCheck.includes(term)) { // Only consider meaningful terms
        relevanceScore += 1;
      }
    });
    
    // Normalize to 0-1 scale
    const meaningfulTerms = occupationTerms.filter(term => term.length > 3).length;
    return meaningfulTerms > 0 ? Math.min(1, relevanceScore / meaningfulTerms) : 0;
  }

  /**
   * Extracts key insights from research data
   * @param snippet The snippet of the research item
   * @returns An array of key insights
   */
  private extractKeyInsights(snippet: string): string[] {
    if (!snippet || snippet.length < 20) return [];
    
    // Extract sentences that contain automation-related keywords
    const sentences = snippet.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const automationKeywords = [
      'automate', 'automation', 'automated', 'ai', 'artificial intelligence',
      'machine learning', 'robot', 'technology', 'future', 'skill', 'replace',
      'augment', 'enhance', 'transform', 'disrupt', 'impact'
    ];
    
    const insightSentences = sentences.filter(sentence => {
      const lowerSentence = sentence.toLowerCase();
      return automationKeywords.some(keyword => lowerSentence.includes(keyword));
    });
    
    // Limit to top 3 insights
    return insightSentences.slice(0, 3).map(s => s.trim());
  }

  /**
   * Analyzes sentiment of text regarding automation
   * @param text Text to analyze
   * @returns Sentiment score (-1 to 1)
   */
  private analyzeSentiment(text: string): number {
    if (!text) return 0; // Neutral sentiment
    
    // Positive sentiment keywords
    const positiveKeywords = [
      'opportunity', 'enhance', 'improve', 'benefit', 'advantage', 'efficiency',
      'productivity', 'augment', 'assist', 'help', 'advance', 'progress',
      'innovation', 'growth', 'collaborate', 'partnership'
    ];
    
    // Negative sentiment keywords
    const negativeKeywords = [
      'threat', 'risk', 'danger', 'replace', 'eliminate', 'loss', 'displace',
      'unemployment', 'obsolete', 'concern', 'fear', 'worry', 'disruption',
      'challenge', 'problem', 'difficult', 'struggle'
    ];
    
    // Count keyword occurrences
    const textLower = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;
    
    positiveKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = textLower.match(regex);
      if (matches) positiveCount += matches.length;
    });
    
    negativeKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = textLower.match(regex);
      if (matches) negativeCount += matches.length;
    });
    
    // Calculate sentiment score
    const totalCount = positiveCount + negativeCount;
    if (totalCount === 0) return 0;
    
    return (positiveCount - negativeCount) / totalCount;
  }

  /**
   * Estimates automation score from text content using keyword analysis
   * @param text Text to analyze
   * @returns Estimated automation score (0-1)
   */
  private estimateAutomationScoreFromText(text: string): number {
    if (!text) return 0.5; // Default neutral score
    
    // Keywords indicating high automation potential
    const highAutomationKeywords = [
      'automate', 'automation', 'automated', 'replace', 'replaced', 'displacement',
      'ai', 'artificial intelligence', 'machine learning', 'robot', 'robotic',
      'algorithm', 'computerized', 'technological', 'technology', 'disruption'
    ];
    
    // Keywords indicating low automation potential
    const lowAutomationKeywords = [
      'human', 'creativity', 'judgment', 'interpersonal', 'emotional', 'ethics',
      'complex', 'unpredictable', 'nuanced', 'social', 'empathy', 'care',
      'augment', 'enhance', 'collaborate', 'complement', 'assist'
    ];
    
    // Count keyword occurrences
    const textLower = text.toLowerCase();
    let highCount = 0;
    let lowCount = 0;
    
    highAutomationKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = textLower.match(regex);
      if (matches) highCount += matches.length;
    });
    
    lowAutomationKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = textLower.match(regex);
      if (matches) lowCount += matches.length;
    });
    
    // Calculate score based on keyword ratio
    const totalCount = highCount + lowCount;
    if (totalCount === 0) return 0.5;
    
    return Math.min(1, Math.max(0, 0.5 + (highCount - lowCount) / (totalCount * 2)));
  }

  /**
   * Generates regional impact data based on research findings
   * @param occupation The occupation title
   * @param researchPapers Research papers data
   * @param industryReports Industry reports data
   * @returns Regional impact assessment
   */
  private generateRegionalImpactData(
    occupation: string,
    researchPapers: ResearchPaper[],
    industryReports: IndustryReport[]
  ): RegionalImpact {
    // Calculate global impact
    const globalImpact = 0.65; // Placeholder value
    
    // Calculate regional impacts
    const northAmericaImpact = 0.7; // Placeholder value
    const europeImpact = 0.75; // Placeholder value
    const asiaImpact = 0.6; // Placeholder value
    const otherImpact = 0.5; // Placeholder value
    
    // Identify key factors by region
    const northAmericaFactors = ['Technology adoption rate', 'Labor costs'];
    const europeFactors = ['Regulatory environment', 'Social policies'];
    const asiaFactors = ['Manufacturing focus', 'Labor supply'];
    const otherFactors = ['Economic development level'];
    
    return {
      global: globalImpact,
      regional: {
        northAmerica: northAmericaImpact,
        europe: europeImpact,
        asia: asiaImpact,
        other: otherImpact
      },
      factorsByRegion: {
        northAmerica: northAmericaFactors,
        europe: europeFactors,
        asia: asiaFactors,
        other: otherFactors
      }
    };
  }

  /**
   * Generates adoption curves for automation technologies
   * @param trends Identified automation trends
   * @param researchPapers Research papers data
   * @param industryReports Industry reports data
   * @returns Adoption curves for different timeframes
   */
  private generateAdoptionCurves(
    trends: AutomationTrend[],
    researchPapers: ResearchPaper[],
    industryReports: IndustryReport[]
  ): {
    shortTerm: { year: number; adoption: number }[];
    mediumTerm: { year: number; adoption: number }[];
    longTerm: { year: number; adoption: number }[];
  } {
    // Current year as baseline
    const currentYear = new Date().getFullYear();
    
    // Calculate adoption acceleration based on trends
    const shortTermTrends = trends.filter(trend => trend.timeframe === 'Short-term');
    const mediumTermTrends = trends.filter(trend => trend.timeframe === 'Medium-term');
    const longTermTrends = trends.filter(trend => trend.timeframe === 'Long-term');
    
    const shortTermAcceleration = shortTermTrends.reduce((sum, trend) => sum + trend.impactScore, 0) / 
      (shortTermTrends.length || 1);
    
    const mediumTermAcceleration = mediumTermTrends.reduce((sum, trend) => sum + trend.impactScore, 0) / 
      (mediumTermTrends.length || 1);
    
    const longTermAcceleration = longTermTrends.reduce((sum, trend) => sum + trend.impactScore, 0) / 
      (longTermTrends.length || 1);
    
    // Generate S-curves for different timeframes
    const shortTerm = Array.from({ length: 5 }, (_, i) => {
      const year = currentYear + i;
      // Short-term: faster initial growth, plateaus earlier
      const adoption = this.calculateSCurveValue(i, 4, shortTermAcceleration);
      return { year, adoption };
    });
    
    const mediumTerm = Array.from({ length: 10 }, (_, i) => {
      const year = currentYear + i;
      // Medium-term: moderate growth throughout
      const adoption = this.calculateSCurveValue(i, 9, mediumTermAcceleration);
      return { year, adoption };
    });
    
    const longTerm = Array.from({ length: 15 }, (_, i) => {
      const year = currentYear + i;
      // Long-term: slower initial growth, continues longer
      const adoption = this.calculateSCurveValue(i, 14, longTermAcceleration);
      return { year, adoption };
    });
    
    return {
      shortTerm,
      mediumTerm,
      longTerm
    };
  }

  /**
   * Calculates a point on an S-curve for technology adoption
   * @param x Current position (0 to max)
   * @param max Maximum position
   * @param acceleration Acceleration factor (0-1)
   * @returns S-curve value at position x
   */
  private calculateSCurveValue(x: number, max: number, acceleration: number): number {
    // Convert to range -6 to 6 for sigmoid function
    const normalized = ((x / max) * 12) - 6;
    
    // Apply sigmoid function: 1 / (1 + e^-x)
    const sigmoid = 1 / (1 + Math.exp(-normalized));
    
    // Apply acceleration factor
    return sigmoid * (0.7 + (acceleration * 0.3));
  }

  /**
   * Calculates the mention score based on how frequently the occupation is mentioned
   * @param paper The research paper
   * @returns The mention score
   */
  private calculateMentionScore(paper: ResearchPaper): number {
    // Simplified implementation
    // In a real-world scenario, this would be more sophisticated
    return 0.7; // Placeholder value
  }

  /**
   * Calculates the sentiment score of research results
   * @param paper The research paper
   * @returns The sentiment score
   */
  private calculateSentimentScore(paper: ResearchPaper): number {
    // Simplified implementation
    // In a real-world scenario, this would use NLP for sentiment analysis
    return 0.6; // Placeholder value
  }

  /**
   * Calculates the quality of research sources
   * @param researchPapers Research papers data
   * @param industryReports Industry reports data
   * @returns The source quality score
   */
  private calculateSourceQuality(
    researchPapers: ResearchPaper[],
    industryReports: IndustryReport[]
  ): number {
    // Calculate source quality based on citation counts and publisher reputation
    const paperQuality = researchPapers.length > 0 
      ? researchPapers.reduce((sum, paper) => sum + (paper.citationCount || 0), 0) / (researchPapers.length * 10)
      : 0;
    
    // Simple heuristic for industry report quality
    const reportQuality = industryReports.length > 0 ? 0.7 : 0;
    
    // Weighted average
    return Math.min(1, (paperQuality * 0.7 + reportQuality * 0.3));
  }

  /**
   * Calculates the variance in findings across different sources
   * @param researchPapers Research papers data
   * @param industryReports Industry reports data
   * @param newsArticles News articles data
   * @returns The variance score
   */
  private calculateVarianceInFindings(
    researchPapers: ResearchPaper[],
    industryReports: IndustryReport[],
    newsArticles: NewsArticle[]
  ): number {
    // Extract automation scores from all sources
    const allScores: number[] = [
      ...researchPapers.map(paper => paper.automationScore || 0),
      ...industryReports.map(report => report.automationScore || 0),
      ...newsArticles.map(article => article.automationScore || 0)
    ].filter(score => score > 0);
    
    if (allScores.length < 2) {
      return 0.5; // Default variance when not enough data
    }
    
    // Calculate mean
    const mean = allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
    
    // Calculate variance
    const variance = Math.sqrt(
      allScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / allScores.length
    );
    
    // Normalize variance to 0-1 scale (lower is better)
    return Math.min(1, variance / 0.5);
  }

  /**
   * Calculates the agreement between different sources
   * @param researchPapers Research papers data
   * @param industryReports Industry reports data
   * @param newsArticles News articles data
   * @returns The source agreement score
   */
  private calculateSourceAgreement(
    researchPapers: ResearchPaper[],
    industryReports: IndustryReport[],
    newsArticles: NewsArticle[]
  ): number {
    // Inverse of normalized variance represents agreement
    const variance = this.calculateVarianceInFindings(researchPapers, industryReports, newsArticles);
    return 1 - variance;
  }

  /**
   * Calculates the recency of the research data
   * @param researchPapers Research papers data
   * @param industryReports Industry reports data
   * @param newsArticles News articles data
   * @returns The recency score
   */
  private calculateRecency(
    researchPapers: ResearchPaper[],
    industryReports: IndustryReport[],
    newsArticles: NewsArticle[]
  ): number {
    // Get current year
    const currentYear = new Date().getFullYear();
    
    // Calculate average publication year for papers
    const paperYears = researchPapers
      .map(paper => paper.publicationYear)
      .filter(year => year > 0);
    
    const averagePaperYear = paperYears.length > 0
      ? paperYears.reduce((sum, year) => sum + year, 0) / paperYears.length
      : currentYear - 5; // Default to 5 years ago if no data
    
    // Calculate average publication year for reports
    const reportYears = industryReports
      .map(report => report.year)
      .filter(year => year > 0);
    
    const averageReportYear = reportYears.length > 0
      ? reportYears.reduce((sum, year) => sum + year, 0) / reportYears.length
      : currentYear - 3; // Default to 3 years ago if no data
    
    // Calculate average publication year for news articles
    const articleYears = newsArticles
      .map(article => {
        try {
          return new Date(article.date).getFullYear();
        } catch {
          return 0;
        }
      })
      .filter(year => year > 0);
    
    const averageArticleYear = articleYears.length > 0
      ? articleYears.reduce((sum, year) => sum + year, 0) / articleYears.length
      : currentYear - 1; // Default to 1 year ago if no data
    
    // Calculate weighted average year
    const weights = [0.4, 0.3, 0.3]; // Papers, reports, articles weights
    const weightedYear = averagePaperYear * weights[0] + averageReportYear * weights[1] + averageArticleYear * weights[2];
    
    // Convert to recency score (0-1)
    // More recent = higher score, with diminishing returns for very recent data
    const yearDiff = Math.max(0, currentYear - weightedYear);
    return Math.max(0, 1 - (yearDiff / 10)); // 10 years old or older = 0 recency
  }

  /**
   * Calculates quality score for an individual source
   * @param source Source name or publisher
   * @param citationCount Citation count (if available)
   * @returns Quality score (0-1)
   */
  private calculateIndividualSourceQuality(source: string, citationCount: number = 0): number {
    // List of high-quality academic publishers and institutions
    const highQualitySources = [
      'nature.com', 'science.org', 'acm.org', 'ieee.org', 'springer.com',
      'oxford', 'cambridge', 'harvard', 'stanford', 'mit.edu',
      'mckinsey.com', 'gartner.com', 'forrester.com', 'deloitte.com', 'pwc.com'
    ];
    
    // List of reputable news sources
    const reputableSources = [
      'nytimes.com', 'wsj.com', 'economist.com', 'ft.com', 'reuters.com',
      'bloomberg.com', 'bbc.co.uk', 'cnn.com', 'washingtonpost.com', 'apnews.com'
    ];
    
    // Calculate base score based on source reputation
    let baseScore = 0.5; // Default moderate score
    
    // Check if source is a high-quality academic or research source
    if (highQualitySources.some(s => source.toLowerCase().includes(s.toLowerCase()))) {
      baseScore = 0.8;
    } 
    // Check if source is a reputable news source
    else if (reputableSources.some(s => source.toLowerCase().includes(s.toLowerCase()))) {
      baseScore = 0.7;
    }
    
    // Add bonus for citation count
    const citationBonus = Math.min(0.2, citationCount / 100);
    
    return Math.min(1, baseScore + citationBonus);
  }
}
