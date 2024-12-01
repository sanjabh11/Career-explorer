export interface CategoryData {
  name: string;
  value: number;
  color?: string;
}

export interface TrendData {
  date: string;
  value: number;
  category: string;
}

export interface APOData {
  categories?: CategoryData[];
  trends?: TrendData[];
  overallScore?: number;
  confidence?: number;
  lastUpdated?: string;
}

export interface ChartConfig {
  type: 'radar' | 'bar' | 'pie';
  timeRange: '1M' | '3M' | '6M' | '1Y' | 'ALL';
  sortBy: 'value' | 'name';
  showLegend: boolean;
  showTooltips: boolean;
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'png';
  includeMetadata: boolean;
}

export interface FilterOptions {
  minValue?: number;
  maxValue?: number;
  categories?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}
