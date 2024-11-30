export interface HistoricalDataPoint {
  timestamp: Date;
  apo: number;
  factors: {
    technologyImpact: number;
    industryAdoption: number;
    marketGrowth: number;
  };
}
