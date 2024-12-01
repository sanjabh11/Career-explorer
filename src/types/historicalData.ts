export interface HistoricalDataSource {
  id: string;
  name: string;
  url: string;
  type: 'api' | 'database' | 'file';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  apiKey?: string;
}

export interface HistoricalDataMetrics {
  apo: number;
  taskAutomation: number;
  skillRelevance: number;
  technologyAdoption: number;
  marketDemand: number;
}

export interface HistoricalDataPoint {
  timestamp: Date;
  occupationCode: string;
  metrics: HistoricalDataMetrics;
  source: string;
  confidence: number;
  factors: {
    technologyImpact: number;
    industryAdoption: number;
    marketGrowth: number;
  };
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface HistoricalDataResponse {
  data: HistoricalDataPoint[];
  metadata: {
    sources: string[];
    timeRange: DateRange;
    lastUpdated: Date;
    dataQuality: {
      completeness: number;
      accuracy: number;
      consistency: number;
    };
  };
}

export interface DataSourceConfig {
  apiKey?: string;
  baseUrl: string;
  headers?: Record<string, string>;
  rateLimit?: {
    requests: number;
    period: number; // in milliseconds
  };
}
