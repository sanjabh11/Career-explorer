import { historicalDataService } from '@/services/HistoricalDataService';
import { HistoricalDataPoint } from '@/types/historicalData';

describe('HistoricalDataService', () => {
  const mockOccupationCode = '15-1252.00';
  const startDate = new Date('2023-01-01');
  const endDate = new Date('2023-12-31');

  beforeEach(() => {
    // Reset mocks and cache
    jest.clearAllMocks();
  });

  describe('collectHistoricalData', () => {
    it('should fetch and transform O*NET data correctly', async () => {
      const result = await historicalDataService.collectHistoricalData(
        mockOccupationCode,
        startDate,
        endDate
      );

      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
      expect(result.metadata).toBeDefined();
      expect(result.metadata.sources).toContain('onet');
    });

    it('should handle missing data gracefully', async () => {
      const result = await historicalDataService.collectHistoricalData(
        'invalid-code',
        startDate,
        endDate
      );

      expect(result.data).toHaveLength(0);
      expect(result.metadata.dataQuality.completeness).toBe(0);
    });

    it('should use cached data when available', async () => {
      // First call to populate cache
      await historicalDataService.collectHistoricalData(
        mockOccupationCode,
        startDate,
        endDate
      );

      // Second call should use cache
      const startTime = Date.now();
      await historicalDataService.collectHistoricalData(
        mockOccupationCode,
        startDate,
        endDate
      );
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(50); // Cache retrieval should be fast
    });
  });

  describe('data transformation', () => {
    it('should calculate metrics correctly', async () => {
      const result = await historicalDataService.collectHistoricalData(
        mockOccupationCode,
        startDate,
        endDate
      );

      const dataPoint = result.data[0];
      expect(dataPoint.metrics.apo).toBeGreaterThanOrEqual(0);
      expect(dataPoint.metrics.apo).toBeLessThanOrEqual(100);
      expect(dataPoint.confidence).toBeGreaterThanOrEqual(0.5);
    });

    it('should handle invalid data gracefully', async () => {
      // Mock invalid data response
      jest.spyOn(global, 'fetch').mockImplementationOnce(() => 
        Promise.resolve(new Response(JSON.stringify({ error: 'Invalid data' })))
      );

      await expect(
        historicalDataService.collectHistoricalData(
          'invalid-code',
          startDate,
          endDate
        )
      ).rejects.toThrow();
    });
  });

  describe('data quality', () => {
    it('should calculate data quality metrics correctly', async () => {
      const result = await historicalDataService.collectHistoricalData(
        mockOccupationCode,
        startDate,
        endDate
      );

      expect(result.metadata.dataQuality.completeness).toBeGreaterThanOrEqual(0);
      expect(result.metadata.dataQuality.completeness).toBeLessThanOrEqual(1);
      expect(result.metadata.dataQuality.accuracy).toBeGreaterThanOrEqual(0);
      expect(result.metadata.dataQuality.consistency).toBeGreaterThanOrEqual(0);
    });
  });
});
