/**
 * JinaApiService - Service for semantic analysis of occupation tasks
 * Version 1.1
 * 
 * Enhanced with proper error handling, retry logic, and validation
 */

import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { 
  OccupationTask, 
  TaskAutomationRanking,
  RankedTaskResults,
  JinaEmbeddingResponse,
  OccupationAnalysis,
  SkillAutomationRanking
} from '../../types/semantic';
import { Skill } from '../../types/skills';

// Error types for better error handling
export enum JinaApiErrorType {
  AUTHENTICATION = 'authentication_error',
  RATE_LIMIT = 'rate_limit_error',
  SERVER = 'server_error',
  NETWORK = 'network_error',
  VALIDATION = 'validation_error',
  UNKNOWN = 'unknown_error'
}

// Custom error class for Jina API errors
export class JinaApiError extends Error {
  type: JinaApiErrorType;
  statusCode?: number;
  retryable: boolean;
  
  constructor(
    message: string, 
    type: JinaApiErrorType = JinaApiErrorType.UNKNOWN, 
    statusCode?: number,
    retryable: boolean = false
  ) {
    super(message);
    this.name = 'JinaApiError';
    this.type = type;
    this.statusCode = statusCode;
    this.retryable = retryable;
  }
}

/**
 * Service for interacting with the Jina API for semantic analysis
 */
export class JinaApiService {
  private apiKey: string;
  private baseUrl: string;
  private maxRetries: number;
  private retryDelay: number;
  private lastRequestTimestamp: number = 0;
  private requestsPerMinute: number = 60; // Default rate limit
  private logger: Console;

  constructor(
    apiKey: string, 
    baseUrl: string = 'https://api.jina.ai/v1',
    maxRetries: number = 3,
    retryDelay: number = 1000,
    logger: Console = console
  ) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
    this.logger = logger;
    
    // Validate API key
    if (!this.apiKey || this.apiKey === 'demo-key') {
      this.logger.warn('JinaApiService initialized with demo key or empty key. API calls may fail.');
    }
  }

  /**
   * Make an API request with retry logic and rate limiting
   * @param endpoint API endpoint
   * @param method HTTP method
   * @param data Request data
   * @returns Promise with response data
   */
  private async makeRequest<T>(
    endpoint: string, 
    method: string = 'GET', 
    data?: any
  ): Promise<T> {
    // Implement rate limiting
    const now = Date.now();
    const timeGap = now - this.lastRequestTimestamp;
    const minGap = (60 * 1000) / this.requestsPerMinute;
    
    if (timeGap < minGap) {
      await new Promise(resolve => setTimeout(resolve, minGap - timeGap));
    }
    
    this.lastRequestTimestamp = Date.now();
    
    // Setup request config
    const config: AxiosRequestConfig = {
      method,
      url: `${this.baseUrl}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      data: method !== 'GET' ? data : undefined,
      params: method === 'GET' ? data : undefined
    };
    
    // Implement retry logic
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await axios(config);
        return response.data as T;
      } catch (error) {
        lastError = this.handleApiError(error as Error | AxiosError, attempt);
        
        if (lastError instanceof JinaApiError && !lastError.retryable) {
          throw lastError;
        }
        
        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, attempt);
          this.logger.warn(`Retrying request (${attempt + 1}/${this.maxRetries}) after ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError || new JinaApiError('Maximum retries exceeded');
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
        return new JinaApiError(
          'Authentication failed. Please check your API key.',
          JinaApiErrorType.AUTHENTICATION,
          statusCode,
          false
        );
      }
      
      // Rate limit errors
      if (statusCode === 429) {
        return new JinaApiError(
          'Rate limit exceeded. Please slow down your requests.',
          JinaApiErrorType.RATE_LIMIT,
          statusCode,
          true
        );
      }
      
      // Server errors
      if (statusCode && statusCode >= 500) {
        return new JinaApiError(
          'Jina API server error. Please try again later.',
          JinaApiErrorType.SERVER,
          statusCode,
          true
        );
      }
      
      // Network errors
      if (!error.response) {
        return new JinaApiError(
          'Network error. Please check your internet connection.',
          JinaApiErrorType.NETWORK,
          undefined,
          true
        );
      }
      
      // Other errors
      return new JinaApiError(
        `API error: ${error.message}`,
        JinaApiErrorType.UNKNOWN,
        statusCode,
        attempt < this.maxRetries
      );
    }
    
    // Non-Axios errors
    return new JinaApiError(
      `Unexpected error: ${error.message}`,
      JinaApiErrorType.UNKNOWN,
      undefined,
      attempt < this.maxRetries
    );
  }

  /**
   * Ranks occupation tasks by automation potential
   * @param tasks List of occupation tasks to analyze
   * @returns Ranked tasks with automation scores and aggregate score
   */
  async rankAutomationPotential(tasks: OccupationTask[]): Promise<{
    tasks: TaskAutomationRanking[];
    aggregateScore: number;
  }> {
    try {
      // For testing purposes, return mock task automation rankings
      const rankedTasks: TaskAutomationRanking[] = tasks.map(task => ({
        taskId: task.id,
        taskDescription: task.description,
        automationScore: 0.5 + (Math.random() * 0.4), // Random score between 0.5 and 0.9
        confidenceScore: 0.75,
        timeHorizon: Math.floor(Math.random() * 10) + 1, // 1-10 years
        requiredTechnologies: [
          'Machine Learning',
          'Computer Vision',
          'Natural Language Processing'
        ].slice(0, Math.floor(Math.random() * 3) + 1), // 1-3 technologies
        barriers: [
          'Regulatory Constraints',
          'Technical Limitations',
          'Cost of Implementation'
        ].slice(0, Math.floor(Math.random() * 3) + 1), // 1-3 barriers
        similarAutomatedTasks: [
          'Data Entry',
          'Document Processing',
          'Customer Support'
        ].slice(0, Math.floor(Math.random() * 3) + 1) // 1-3 similar tasks
      }));
      
      // Calculate aggregate score (average of individual scores)
      const aggregateScore = rankedTasks.reduce((sum, task) => sum + task.automationScore, 0) / rankedTasks.length;
      
      return {
        tasks: rankedTasks,
        aggregateScore
      };
    } catch (error) {
      this.logger.error('Error ranking automation potential:', error);
      throw new JinaApiError(`Failed to rank automation potential: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Calculates cosine similarity between two embedding vectors
   * @param vec1 First embedding vector
   * @param vec2 Second embedding vector
   * @returns Cosine similarity score (0-1)
   */
  private calculateCosineSimilarity(vec1: number[], vec2: number[]): number {
    try {
      // Calculate dot product
      let dotProduct = 0;
      for (let i = 0; i < vec1.length; i++) {
        dotProduct += vec1[i] * vec2[i];
      }
      
      // Calculate magnitudes
      let mag1 = 0;
      let mag2 = 0;
      for (let i = 0; i < vec1.length; i++) {
        mag1 += vec1[i] * vec1[i];
        mag2 += vec2[i] * vec2[i];
      }
      mag1 = Math.sqrt(mag1);
      mag2 = Math.sqrt(mag2);
      
      // Calculate cosine similarity
      const similarity = dotProduct / (mag1 * mag2);
      
      // Handle potential numerical issues
      if (isNaN(similarity)) {
        return 0;
      }
      
      // Normalize to 0-1 range
      return (similarity + 1) / 2;
    } catch (error) {
      this.logger.error('Error calculating cosine similarity:', error);
      return 0; // Return 0 similarity on error
    }
  }

  /**
   * Applies task-specific adjustments to automation scores
   * @param task The task to adjust score for
   * @param baseScore The initial automation score
   * @returns Adjusted automation score
   */
  private applyTaskSpecificAdjustments(task: OccupationTask, baseScore: number): number {
    // In a real implementation, this would apply domain-specific rules
    // For now, return the base score with minor random adjustment
    const adjustment = (Math.random() * 0.2) - 0.1; // Random adjustment between -0.1 and 0.1
    let adjustedScore = baseScore + adjustment;
    
    // Ensure score stays within 0-1 range
    adjustedScore = Math.max(0, Math.min(1, adjustedScore));
    
    return adjustedScore;
  }

  /**
   * Estimates time horizon for automation based on automation score
   * @param automationScore Automation score (0-1)
   * @returns Estimated years until automation
   */
  private estimateTimeHorizon(automationScore: number): number {
    // Higher automation score = shorter time horizon
    if (automationScore >= 0.8) {
      return Math.floor(Math.random() * 3) + 1; // 1-3 years
    } else if (automationScore >= 0.6) {
      return Math.floor(Math.random() * 3) + 4; // 4-6 years
    } else if (automationScore >= 0.4) {
      return Math.floor(Math.random() * 4) + 7; // 7-10 years
    } else if (automationScore >= 0.2) {
      return Math.floor(Math.random() * 5) + 11; // 11-15 years
    } else {
      return Math.floor(Math.random() * 10) + 16; // 16-25 years
    }
  }

  /**
   * Identifies key automation drivers from ranked tasks
   * @param rankedTasks Ranked tasks with automation scores
   * @returns List of key automation drivers
   */
  private identifyKeyAutomationDrivers(rankedTasks: TaskAutomationRanking[]): string[] {
    // In a real implementation, this would analyze patterns across tasks
    // For now, return predefined drivers
    return [
      'Repetitive nature of tasks',
      'Structured data processing',
      'Rule-based decision making',
      'Limited need for creativity',
      'Minimal requirement for human interaction'
    ].slice(0, Math.floor(Math.random() * 3) + 2); // Return 2-4 drivers
  }

  /**
   * Identifies key automation barriers from ranked tasks
   * @param rankedTasks Ranked tasks with automation scores
   * @returns List of key automation barriers
   */
  private identifyKeyAutomationBarriers(rankedTasks: TaskAutomationRanking[]): string[] {
    // In a real implementation, this would analyze patterns across tasks
    // For now, return predefined barriers
    return [
      'Regulatory constraints',
      'Need for human judgment',
      'Complex decision making',
      'Emotional intelligence requirements',
      'High variability in task execution'
    ].slice(0, Math.floor(Math.random() * 3) + 2); // Return 2-4 barriers
  }

  /**
   * Calculates weighted aggregate score based on task importance
   * @param rankedTasks Ranked tasks with automation scores
   * @param originalTasks Original tasks with importance metadata
   * @returns Weighted aggregate score
   */
  private calculateWeightedAggregateScore(rankedTasks: TaskAutomationRanking[], originalTasks: OccupationTask[]): number {
    // In a real implementation, this would use task importance weights
    // For now, calculate simple average
    return rankedTasks.reduce((sum, task) => sum + task.automationScore, 0) / rankedTasks.length;
  }

  /**
   * Extracts unique values from an array
   * @param values Array of values
   * @returns Array of unique values
   */
  private extractUniqueValues(values: string[]): string[] {
    return [...new Set(values)];
  }

  /**
   * Gets embeddings for a list of text descriptions
   * @param descriptions List of text descriptions to get embeddings for
   * @returns Array of embedding vectors
   */
  private async getEmbeddings(descriptions: string[]): Promise<number[][]> {
    try {
      // In a real implementation, this would call the Jina API to get embeddings
      // For testing purposes, return mock embeddings
      return descriptions.map(() => {
        // Generate a random 768-dimensional embedding vector
        return Array(768).fill(0).map(() => Math.random());
      });
    } catch (error) {
      this.logger.error('Error getting embeddings:', error);
      throw new JinaApiError(`Failed to get embeddings: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Gets embeddings for automation database
   * @returns Object containing embeddings for high, medium, and low automation tasks
   */
  private async getAutomationDatabaseEmbeddings(): Promise<{
    highAutomation: number[][];
    mediumAutomation: number[][];
    lowAutomation: number[][];
  }> {
    // In a real implementation, this would retrieve pre-computed embeddings from a database
    // For testing purposes, return mock embeddings
    return {
      highAutomation: Array(10).fill(0).map(() => Array(768).fill(0).map(() => Math.random())),
      mediumAutomation: Array(10).fill(0).map(() => Array(768).fill(0).map(() => Math.random())),
      lowAutomation: Array(10).fill(0).map(() => Array(768).fill(0).map(() => Math.random()))
    };
  }

  /**
   * Analyzes skills for automation potential
   * @param skills List of occupation skills to analyze
   * @returns Analysis of skills with automation scores
   */
  async analyzeSkillsAutomation(skills: Skill[]): Promise<SkillAutomationRanking[]> {
    try {
      // For testing purposes, return mock skill automation rankings
      return skills.map(skill => ({
        skillId: skill.id,
        skillName: skill.name,
        automationScore: 0.5 + (Math.random() * 0.4), // Random score between 0.5 and 0.9
        confidenceScore: 0.75,
        timeHorizon: 5,
        emergingAlternatives: [
          {
            id: 'skill-ai-collab-1',
            name: 'Human-AI Collaboration',
            category: 'soft',
            description: 'Working effectively alongside AI systems to achieve enhanced outcomes'
          }
        ]
      }));
    } catch (error) {
      this.logger.error('Error analyzing skills automation:', error);
      throw new JinaApiError(`Failed to analyze skills automation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Recommends alternative skills that are less likely to be automated
   * @param skill The skill to find alternatives for
   * @returns List of alternative skills with lower automation potential
   */
  async recommendSkillAlternatives(skill: Skill): Promise<Skill[]> {
    try {
      // In a real implementation, this would use embeddings to find semantically similar skills
      // with lower automation potential
      
      // For now, return predefined alternatives based on skill category
      const alternativesByCategory: Record<string, Skill[]> = {
        'technical': [
          {
            id: 'tech-alt-1',
            name: 'AI System Design',
            category: 'technical',
            description: 'Designing AI systems that augment human capabilities rather than replace them'
          },
          {
            id: 'tech-alt-2',
            name: 'Human-Centered Technology Development',
            category: 'technical',
            description: 'Developing technology solutions that prioritize human needs and experiences'
          },
          {
            id: 'tech-alt-3',
            name: 'Responsible AI Implementation',
            category: 'technical',
            description: 'Implementing AI systems with consideration for ethics, bias, and societal impact'
          }
        ],
        'soft': [
          {
            id: 'soft-alt-1',
            name: 'Creative Problem Solving',
            category: 'soft',
            description: 'Approaching problems with innovative thinking and novel solutions'
          },
          {
            id: 'soft-alt-2',
            name: 'Emotional Intelligence',
            category: 'soft',
            description: 'Understanding and managing emotions in self and others to guide thinking and behavior'
          },
          {
            id: 'soft-alt-3',
            name: 'Cross-Cultural Communication',
            category: 'soft',
            description: 'Effectively communicating across diverse cultural contexts and perspectives'
          }
        ],
        'cognitive': [
          {
            id: 'cog-alt-1',
            name: 'Systems Thinking',
            category: 'cognitive',
            description: 'Understanding complex systems and how components interact to produce emergent behaviors'
          },
          {
            id: 'cog-alt-2',
            name: 'Critical Analysis',
            category: 'cognitive',
            description: 'Evaluating information, arguments, and beliefs to form well-reasoned judgments'
          },
          {
            id: 'cog-alt-3',
            name: 'Adaptive Learning',
            category: 'cognitive',
            description: 'Quickly adapting to new information, technologies, and changing circumstances'
          }
        ]
      };
      
      // Return alternatives based on skill category, or default to cognitive if category not found
      return alternativesByCategory[skill.category] || alternativesByCategory['cognitive'];
    } catch (error) {
      this.logger.error('Error recommending skill alternatives:', error);
      throw new JinaApiError(`Failed to recommend skill alternatives: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Analyzes an occupation for automation potential
   * @param occupation The occupation to analyze
   * @returns Comprehensive analysis of the occupation
   */
  async analyzeOccupation(occupation: {
    id: string;
    title: string;
    tasks: OccupationTask[];
    skills: Skill[];
  }): Promise<OccupationAnalysis> {
    try {
      // Rank tasks by automation potential
      const taskRankings = await this.rankAutomationPotential(occupation.tasks);
      
      // Analyze skills for automation potential
      const skillRankings = await this.analyzeSkillsAutomation(occupation.skills);
      
      // Calculate overall automation score (weighted average of task and skill scores)
      const taskWeight = 0.7; // Tasks have higher weight in overall score
      const skillWeight = 0.3;
      
      const overallAutomationScore = 
        (taskRankings.aggregateScore * taskWeight) + 
        (skillRankings.reduce((sum, skill) => sum + skill.automationScore, 0) / skillRankings.length * skillWeight);
      
      // Identify key automation drivers and barriers
      const keyAutomationDrivers = this.identifyKeyAutomationDrivers(taskRankings.tasks);
      const keyAutomationBarriers = this.identifyKeyAutomationBarriers(taskRankings.tasks);
      
      // Generate recommended skill development
      const recommendedSkillDevelopment = this.generateRecommendedSkillDevelopment(skillRankings);
      
      // Generate skill alternatives
      const skillAlternatives = await this.recommendSkillAlternatives(occupation.skills[0]);
      
      return {
        id: `analysis-${occupation.id}`,
        occupationId: occupation.id,
        occupationTitle: occupation.title,
        overallAutomationScore,
        confidenceScore: 0.75,
        taskRankings: taskRankings.tasks,
        skillRankings,
        keyAutomationDrivers,
        keyAutomationBarriers,
        recommendedSkillDevelopment,
        lastUpdated: new Date().toISOString(),
        // Add missing properties required by the interface
        semanticRanking: {
          automationPotential: overallAutomationScore,
          skillsAnalysis: {
            technicalSkills: this.calculateCategoryScore(occupation.skills, 'technical'),
            softSkills: this.calculateCategoryScore(occupation.skills, 'soft'),
            cognitiveSkills: this.calculateCategoryScore(occupation.skills, 'cognitive'),
            physicalSkills: this.calculateCategoryScore(occupation.skills, 'physical')
          },
          taskAnalysis: {
            repetitiveTasksPercentage: this.calculateRepetitiveTasksPercentage(taskRankings.tasks),
            complexTasksPercentage: this.calculateComplexTasksPercentage(taskRankings.tasks),
            creativeTasksPercentage: this.calculateCreativeTasksPercentage(taskRankings.tasks)
          },
          confidenceScore: this.calculateAverageConfidence(taskRankings.tasks)
        },
        skillAlternatives
      };
    } catch (error) {
      this.logger.error('Error analyzing occupation:', error);
      throw new JinaApiError(`Failed to analyze occupation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generates recommended skill development based on automation analysis
   * @param skillRankings Analyzed skills with automation scores
   * @returns List of recommended skills to develop
   */
  private generateRecommendedSkillDevelopment(skillRankings: SkillAutomationRanking[]): Skill[] {
    // In a real implementation, this would analyze the skills and recommend
    // complementary skills that are less likely to be automated
    
    // For now, return predefined recommendations
    return [
      {
        id: 'skill-rec-1',
        name: 'Human-AI Collaboration',
        category: 'soft',
        description: 'Working effectively alongside AI systems to achieve enhanced outcomes'
      },
      {
        id: 'skill-rec-2',
        name: 'Complex Problem Solving',
        category: 'cognitive',
        description: 'Solving novel, ill-defined problems in complex, real-world settings'
      },
      {
        id: 'skill-rec-3',
        name: 'Ethical Decision Making',
        category: 'soft',
        description: 'Making decisions that balance technological capabilities with ethical considerations'
      }
    ];
  }

  /**
   * Gets a comprehensive analysis of an occupation including automation potential,
   * skills analysis, and task analysis
   * @param occupationId Occupation ID
   * @param occupationTitle Occupation title
   * @param tasks List of occupation tasks
   * @param skills List of occupation skills
   * @returns Comprehensive occupation analysis
   */
  async getOccupationAnalysis(
    occupationId: string,
    occupationTitle: string,
    tasks: OccupationTask[],
    skills: Skill[]
  ): Promise<OccupationAnalysis> {
    try {
      // Get task automation ranking
      const taskRanking = await this.rankAutomationPotential(tasks);
      
      // Analyze skills
      const skillsAnalysis = await this.analyzeSkillsAutomation(skills);
      
      // Calculate semantic ranking
      const automationPotential = taskRanking.aggregateScore;
      
      // Create skill alternatives
      const skillAlternatives = await this.recommendSkillAlternatives(skills[0]);
      
      // Get key automation drivers and barriers
      const keyAutomationDrivers = this.identifyKeyAutomationDrivers(taskRanking.tasks);
      const keyAutomationBarriers = this.identifyKeyAutomationBarriers(taskRanking.tasks);
      
      // Generate recommended skill development
      const recommendedSkillDevelopment = this.generateRecommendedSkillDevelopment(skillsAnalysis);
      
      // Create occupation analysis
      return {
        id: `analysis-${occupationId}`,
        occupationId,
        occupationTitle,
        semanticRanking: {
          automationPotential,
          skillsAnalysis: {
            technicalSkills: this.calculateCategoryScore(skills, 'technical'),
            softSkills: this.calculateCategoryScore(skills, 'soft'),
            cognitiveSkills: this.calculateCategoryScore(skills, 'cognitive'),
            physicalSkills: this.calculateCategoryScore(skills, 'physical')
          },
          taskAnalysis: {
            repetitiveTasksPercentage: this.calculateRepetitiveTasksPercentage(taskRanking.tasks),
            complexTasksPercentage: this.calculateComplexTasksPercentage(taskRanking.tasks),
            creativeTasksPercentage: this.calculateCreativeTasksPercentage(taskRanking.tasks)
          },
          confidenceScore: this.calculateAverageConfidence(taskRanking.tasks)
        },
        skillAlternatives,
        lastUpdated: new Date().toISOString(),
        // Add the missing properties
        taskRankings: taskRanking.tasks,
        skillRankings: skillsAnalysis,
        keyAutomationDrivers,
        keyAutomationBarriers,
        overallAutomationScore: automationPotential,
        confidenceScore: this.calculateAverageConfidence(taskRanking.tasks),
        recommendedSkillDevelopment
      };
    } catch (error) {
      this.logger.error('Error getting occupation analysis:', error);
      throw new JinaApiError(`Failed to get occupation analysis: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Calculate score for a specific skill category
   * @param skills List of skills
   * @param category Skill category
   * @returns Score for the category (0-1)
   */
  private calculateCategoryScore(skills: Skill[], category: string): number {
    const categorySkills = skills.filter(skill => skill.category === category);
    
    if (categorySkills.length === 0) {
      return 0;
    }
    
    // In a real implementation, this would use actual automation scores
    // For now, use mock scores based on category
    const categoryScores: Record<string, number> = {
      'technical': 0.7,
      'soft': 0.4,
      'cognitive': 0.5,
      'physical': 0.8
    };
    
    return categoryScores[category] || 0.5;
  }
  
  /**
   * Calculate percentage of repetitive tasks
   * @param tasks Ranked tasks
   * @returns Percentage of repetitive tasks (0-1)
   */
  private calculateRepetitiveTasksPercentage(tasks: TaskAutomationRanking[]): number {
    // Consider tasks with high automation score as repetitive
    const repetitiveTasks = tasks.filter(task => task.automationScore > 0.7);
    return repetitiveTasks.length / tasks.length;
  }
  
  /**
   * Calculate percentage of complex tasks
   * @param tasks Ranked tasks
   * @returns Percentage of complex tasks (0-1)
   */
  private calculateComplexTasksPercentage(tasks: TaskAutomationRanking[]): number {
    // Consider tasks with medium automation score as complex
    const complexTasks = tasks.filter(task => task.automationScore > 0.4 && task.automationScore <= 0.7);
    return complexTasks.length / tasks.length;
  }
  
  /**
   * Calculate percentage of creative tasks
   * @param tasks Ranked tasks
   * @returns Percentage of creative tasks (0-1)
   */
  private calculateCreativeTasksPercentage(tasks: TaskAutomationRanking[]): number {
    // Consider tasks with low automation score as creative
    const creativeTasks = tasks.filter(task => task.automationScore <= 0.4);
    return creativeTasks.length / tasks.length;
  }
  
  /**
   * Calculate average confidence score
   * @param tasks Ranked tasks
   * @returns Average confidence score (0-1)
   */
  private calculateAverageConfidence(tasks: TaskAutomationRanking[]): number {
    return tasks.reduce((sum, task) => sum + task.confidenceScore, 0) / tasks.length;
  }
}
