import { AutomationFactor } from '@/types/automation';
import { DateRange, AutomationTrend, ResearchData } from '@/types/automationTrends';
import axios from 'axios';

interface CacheData {
  data: AutomationTrend[] | ResearchData[];
  timestamp: number;
}

export class AutomationDataService {
  private baseUrl: string;
  private cache: Map<string, CacheData>;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || '') {
    this.baseUrl = baseUrl;
    this.cache = new Map();
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_TTL;
  }

  async collectHistoricalData(
    occupation: string,
    timeframe: DateRange
  ): Promise<AutomationTrend[]> {
    const cacheKey = `historical_${occupation}_${timeframe.startDate}_${timeframe.endDate}`;
    
    const cachedData = this.cache.get(cacheKey);
    if (cachedData && this.isCacheValid(cachedData.timestamp)) {
      return cachedData.data as AutomationTrend[];
    }

    try {
      const response = await axios.get<AutomationTrend[]>(`${this.baseUrl}/historical-data`, {
        params: {
          occupation,
          startDate: timeframe.startDate.toISOString(),
          endDate: timeframe.endDate.toISOString()
        }
      });

      const data = response.data.map((item: AutomationTrend) => ({
        ...item,
        date: new Date(item.date)
      }));

      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Error collecting historical data:', error);
      return [];
    }
  }

  async updateAutomationFactors(
    newData: AutomationFactor[]
  ): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/automation-factors`, newData);
      this.cache.clear();
    } catch (error) {
      console.error('Error updating automation factors:', error);
      throw error;
    }
  }

  async getLatestResearchData(): Promise<ResearchData[]> {
    const cacheKey = 'latest_research';
    
    const cachedData = this.cache.get(cacheKey);
    if (cachedData && this.isCacheValid(cachedData.timestamp)) {
      return cachedData.data as ResearchData[];
    }

    try {
      const response = await axios.get<ResearchData[]>(`${this.baseUrl}/research-data`);
      
      const data = response.data.map((item: ResearchData) => ({
        ...item,
        date: new Date(item.date)
      }));

      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Error fetching research data:', error);
      return [];
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}
