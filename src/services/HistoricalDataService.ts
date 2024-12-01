import axios, { AxiosInstance } from 'axios';
import {
  HistoricalDataSource,
  HistoricalDataPoint,
  HistoricalDataResponse,
  HistoricalDataMetrics
} from '@/types/historicalData';

class HistoricalDataService {
  private dataSources: HistoricalDataSource[];
  private axiosInstance: AxiosInstance;
  private cache: Map<string, { data: HistoricalDataResponse; timestamp: number }>;
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  constructor() {
    // Currently only implementing O*NET
    this.dataSources = [{
      id: 'onet',
      name: 'O*NET Database',
      url: process.env.NEXT_PUBLIC_ONET_API_URL || 'https://services.onetcenter.org/ws/',
      type: 'api',
      frequency: 'quarterly',
      apiKey: process.env.ONET_API_KEY
    }];

    this.axiosInstance = axios.create({
      baseURL: this.dataSources[0].url,
      headers: {
        'Authorization': `Bearer ${process.env.ONET_API_KEY}`,
        'Accept': 'application/json'
      }
    });

    this.cache = new Map();
  }

  private getCacheKey(occupationCode: string, startDate: Date, endDate: Date): string {
    return `${occupationCode}_${startDate.toISOString()}_${endDate.toISOString()}`;
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_TTL;
  }

  async collectHistoricalData(
    occupationCode: string,
    startDate: Date,
    endDate: Date
  ): Promise<HistoricalDataResponse> {
    const cacheKey = this.getCacheKey(occupationCode, startDate, endDate);
    const cachedData = this.cache.get(cacheKey);

    if (cachedData && this.isCacheValid(cachedData.timestamp)) {
      return cachedData.data;
    }

    try {
      const onetData = await this.fetchONETData(occupationCode);
      const historicalData = this.transformONETData(onetData, occupationCode);

      const response: HistoricalDataResponse = {
        data: historicalData,
        metadata: {
          sources: ['onet'],
          timeRange: { startDate, endDate },
          lastUpdated: new Date(),
          dataQuality: {
            completeness: this.calculateCompleteness(historicalData),
            accuracy: this.calculateAccuracy(historicalData),
            consistency: this.calculateConsistency(historicalData)
          }
        }
      };

      this.cache.set(cacheKey, { data: response, timestamp: Date.now() });
      return response;
    } catch (error) {
      console.error('Error fetching O*NET data:', error);
      throw new Error('Failed to fetch historical data');
    }
  }

  private async fetchONETData(occupationCode: string): Promise<any> {
    try {
      const [details, technology, skills, tasks] = await Promise.all([
        this.axiosInstance.get(`/occupations/${occupationCode}/details`),
        this.axiosInstance.get(`/occupations/${occupationCode}/technology`),
        this.axiosInstance.get(`/occupations/${occupationCode}/skills`),
        this.axiosInstance.get(`/occupations/${occupationCode}/tasks`)
      ]);

      return {
        details: details.data,
        technology: technology.data,
        skills: skills.data,
        tasks: tasks.data
      };
    } catch (error) {
      console.error('Error fetching O*NET data:', error);
      throw error;
    }
  }

  private transformONETData(data: any, occupationCode: string): HistoricalDataPoint[] {
    const currentDate = new Date();
    const metrics = this.calculateMetricsFromONET(data);
    
    // For now, we'll create a single data point since O*NET data is not time-series
    const dataPoint: HistoricalDataPoint = {
      timestamp: currentDate,
      occupationCode,
      metrics,
      source: 'onet',
      confidence: this.calculateDataConfidence(data),
      factors: {
        technologyImpact: this.calculateTechnologyImpactFromONET(data.technology),
        industryAdoption: this.calculateIndustryAdoptionFromONET(data.details),
        marketGrowth: this.calculateMarketGrowthFromONET(data.details)
      }
    };

    return [dataPoint];
  }

  private calculateMetricsFromONET(data: any): HistoricalDataMetrics {
    return {
      apo: this.calculateAPOFromONET(data),
      taskAutomation: this.calculateTaskAutomationFromONET(data.tasks),
      skillRelevance: this.calculateSkillRelevanceFromONET(data.skills),
      technologyAdoption: this.calculateTechnologyAdoptionFromONET(data.technology),
      marketDemand: this.calculateMarketDemandFromONET(data.details)
    };
  }

  private calculateAPOFromONET(data: any): number {
    // Calculate APO based on task automation potential and skill relevance
    const taskScore = this.calculateTaskAutomationFromONET(data.tasks);
    const skillScore = this.calculateSkillRelevanceFromONET(data.skills);
    const techScore = this.calculateTechnologyAdoptionFromONET(data.technology);
    
    return (taskScore * 0.4 + skillScore * 0.3 + techScore * 0.3);
  }

  private calculateTaskAutomationFromONET(tasks: any[]): number {
    if (!tasks || tasks.length === 0) return 50;
    // Calculate based on task complexity and repeatability
    return tasks.reduce((sum, task) => sum + (task.importance || 50), 0) / tasks.length;
  }

  private calculateSkillRelevanceFromONET(skills: any[]): number {
    if (!skills || skills.length === 0) return 50;
    // Calculate based on skill importance and level
    return skills.reduce((sum, skill) => sum + (skill.importance || 50), 0) / skills.length;
  }

  private calculateTechnologyAdoptionFromONET(technology: any[]): number {
    if (!technology || technology.length === 0) return 50;
    // Calculate based on technology complexity and importance
    return technology.reduce((sum, tech) => sum + (tech.importance || 50), 0) / technology.length;
  }

  private calculateMarketDemandFromONET(details: any): number {
    // Extract growth rate or demand indicators from details
    return details?.growth_rate || 50;
  }

  private calculateTechnologyImpactFromONET(technology: any[]): number {
    if (!technology || technology.length === 0) return 50;
    return technology.reduce((sum, tech) => sum + (tech.impact || 50), 0) / technology.length;
  }

  private calculateIndustryAdoptionFromONET(details: any): number {
    // Calculate industry adoption rate from details
    return details?.industry_adoption || 50;
  }

  private calculateMarketGrowthFromONET(details: any): number {
    // Calculate market growth from details
    return details?.market_growth || 50;
  }

  private calculateDataConfidence(data: any): number {
    // Calculate confidence based on data completeness and quality
    const hasDetails = !!data.details;
    const hasTechnology = Array.isArray(data.technology) && data.technology.length > 0;
    const hasSkills = Array.isArray(data.skills) && data.skills.length > 0;
    const hasTasks = Array.isArray(data.tasks) && data.tasks.length > 0;

    const completeness = [hasDetails, hasTechnology, hasSkills, hasTasks]
      .filter(Boolean).length / 4;

    return Math.max(0.5, completeness);
  }

  private calculateCompleteness(data: HistoricalDataPoint[]): number {
    if (data.length === 0) return 0;
    return data.reduce((sum, point) => sum + point.confidence, 0) / data.length;
  }

  private calculateAccuracy(data: HistoricalDataPoint[]): number {
    // For now, return a fixed value since we're using only O*NET
    return 0.85;
  }

  private calculateConsistency(data: HistoricalDataPoint[]): number {
    // For now, return a fixed value since we're using only O*NET
    return 0.9;
  }
}

export const historicalDataService = new HistoricalDataService();
