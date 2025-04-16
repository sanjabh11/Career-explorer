import { AutomationFactor } from '@/types/automation';
import { DateRange, AutomationTrend, ResearchData } from '@/types/automationTrends';
import { OccupationData } from '@/types/occupation';
import { calculateDynamicAPO, DynamicAPOResult, APOContext } from '@/utils/dynamicApoCalculations';
import axios from 'axios';

interface CacheData {
  data: AutomationTrend[] | ResearchData[] | DynamicAPOResult[];
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
      // Use the Netlify function for historical data
      const response = await fetch(`/.netlify/functions/historical-data?occupation=${occupation}&startDate=${timeframe.startDate.toISOString()}&endDate=${timeframe.endDate.toISOString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch historical data: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      const formattedData = data.map((item: AutomationTrend) => ({
        ...item,
        date: new Date(item.date)
      }));

      this.cache.set(cacheKey, { data: formattedData, timestamp: Date.now() });
      return formattedData;
    } catch (error) {
      console.error('Error collecting historical data:', error);
      // Generate mock data as fallback
      const mockData = this.generateMockHistoricalData(occupation, timeframe);
      this.cache.set(cacheKey, { data: mockData, timestamp: Date.now() });
      return mockData;
    }
  }

  /**
   * Generate mock historical data as a fallback
   */
  private generateMockHistoricalData(occupation: string, timeframe: DateRange): AutomationTrend[] {
    const trends: AutomationTrend[] = [];
    const startDate = new Date(timeframe.startDate);
    const endDate = new Date(timeframe.endDate);

    // Generate one data point per month
    const currentDate = new Date(startDate);

    // Base APO value - different for different occupations
    let baseApo = 45; // Default value

    // Adjust base APO based on occupation keywords
    const occupationLower = occupation.toLowerCase();
    if (occupationLower.includes('software') || occupationLower.includes('developer')) {
      baseApo = 45;
    } else if (occupationLower.includes('data') || occupationLower.includes('analyst')) {
      baseApo = 60;
    } else if (occupationLower.includes('manager') || occupationLower.includes('director')) {
      baseApo = 35;
    } else if (occupationLower.includes('clerk') || occupationLower.includes('assistant')) {
      baseApo = 70;
    }

    while (currentDate <= endDate) {
      // Calculate months since start
      const monthsSinceStart = (currentDate.getFullYear() - startDate.getFullYear()) * 12 +
                              (currentDate.getMonth() - startDate.getMonth());

      // Create a slight upward trend with some randomness
      const trend = monthsSinceStart * 0.2; // 0.2% increase per month
      const random = (Math.random() * 2 - 1) * 2; // Random fluctuation of ±2%
      const apo = Math.min(95, Math.max(5, baseApo + trend + random)); // Keep between 5% and 95%

      trends.push({
        date: new Date(currentDate),
        apoScore: parseFloat(apo.toFixed(2)),
        factors: ['AI Advancement', 'Task Complexity', 'Human Interaction'],
        confidence: 0.7 + (Math.random() * 0.2), // Random confidence between 0.7 and 0.9
        industryImpact: 0.6 + Math.random() * 0.2,
        technologyAdoption: 0.7 + Math.random() * 0.2
      });

      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return trends;
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

  async getLatestResearchData(occupation?: string): Promise<ResearchData[]> {
    const cacheKey = occupation ? `latest_research_${occupation}` : 'latest_research';

    const cachedData = this.cache.get(cacheKey);
    if (cachedData && this.isCacheValid(cachedData.timestamp)) {
      return cachedData.data as ResearchData[];
    }

    try {
      // Use the Netlify function for research data
      const url = occupation
        ? `/.netlify/functions/research-data?occupation=${encodeURIComponent(occupation)}`
        : '/.netlify/functions/research-data';

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch research data: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Error fetching research data:', error);
      // Generate mock research data as fallback
      const mockData = this.generateMockResearchData(occupation);
      this.cache.set(cacheKey, { data: mockData, timestamp: Date.now() });
      return mockData;
    }
  }

  /**
   * Generate mock research data as a fallback
   */
  private generateMockResearchData(occupation?: string): ResearchData[] {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format

    // Create a single research data entry
    const researchData: ResearchData = {
      id: 'mock-research-1',
      title: occupation
        ? `Automation Impact on ${occupation} Roles`
        : 'Automation Impact on Labor Market',
      date: new Date(),
      source: 'Mock Research Institute',
      findings: occupation
        ? `Recent research indicates that ${occupation} roles are experiencing significant transformation due to automation technologies. Approximately 45-55% of tasks currently performed in these roles could be automated with existing technology, though complete job displacement is unlikely in the near term.`
        : 'Recent research indicates that automation technologies are transforming the labor market across multiple sectors. While routine and predictable tasks face high automation potential, jobs requiring creativity, complex problem-solving, and interpersonal skills remain relatively resistant.',
      impactScore: occupation ? 48.5 : 45.2,
      relevantOccupations: occupation ? [occupation] : ['Software Developers', 'Data Analysts', 'Administrative Assistants'],
      confidenceLevel: 0.75
    };

    return [researchData];
  }

  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Calculate APO for an occupation with all available data sources
   * @param occupation The occupation data
   * @param context Additional context for calculation
   * @returns Promise with APO result
   */
  async calculateOccupationAPO(
    occupation: OccupationData,
    context: APOContext = {}
  ): Promise<DynamicAPOResult> {
    const cacheKey = `apo_${occupation.code}_${JSON.stringify(context)}`;

    const cachedData = this.cache.get(cacheKey);
    if (cachedData && this.isCacheValid(cachedData.timestamp)) {
      console.log('Using cached APO data');
      return cachedData.data[0] as DynamicAPOResult;
    }

    try {
      // Check if we should use dynamic calculation
      const useDynamic = process.env.NEXT_PUBLIC_USE_DYNAMIC_APO === 'true';
      const useSERP = process.env.NEXT_PUBLIC_USE_SERP === 'true';
      const useJina = process.env.NEXT_PUBLIC_USE_JINA === 'true';
      const useFireCrawl = process.env.NEXT_PUBLIC_USE_FIRECRAWL === 'true';

      console.log(`Calculating APO with settings - Dynamic: ${useDynamic}, SERP: ${useSERP}, JINA: ${useJina}, FireCrawl: ${useFireCrawl}`);

      let result;
      if (useDynamic) {
        // Use dynamic calculation with available APIs
        result = await calculateDynamicAPO(occupation, {
          ...context,
          useSERP,
          useJina,
          useFireCrawl,
          fallbackToStatic: true
        });
      } else {
        // Use static calculation with fallback
        result = await calculateDynamicAPO(occupation, {
          ...context,
          useSERP: false,
          useJina: false,
          useFireCrawl: false,
          fallbackToStatic: true
        });
      }

      this.cache.set(cacheKey, { data: [result], timestamp: Date.now() });
      return result;
    } catch (error) {
      console.error('Error calculating occupation APO:', error);

      // Fall back to static calculation
      console.log('Falling back to static APO calculation due to error');
      const fallbackResult = await calculateDynamicAPO(occupation, {
        ...context,
        useSERP: false,
        useJina: false,
        useFireCrawl: false,
        fallbackToStatic: true
      });

      return fallbackResult;
    }
  }
}
