import { render, waitFor, screen } from '@testing-library/react';
import { OccupationDetails } from '@/components/OccupationDetails';
import { historicalDataService } from '@/services/HistoricalDataService';
import { HistoricalDataPoint } from '@/types/historicalData';

describe('Historical Data Integration Flow', () => {
  const mockOccupationCode = '15-1252.00';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and display historical data correctly', async () => {
    render(<OccupationDetails occupationCode={mockOccupationCode} />);

    await waitFor(() => {
      expect(screen.getByTestId('historical-data-section')).toBeInTheDocument();
    });

    const visualizations = screen.getAllByTestId('apo-visualization');
    expect(visualizations.length).toBeGreaterThan(0);
  });

  it('should handle the complete data flow from service to UI', async () => {
    // Mock the service response
    const mockData: HistoricalDataPoint[] = [{
      timestamp: new Date(),
      occupationCode: mockOccupationCode,
      metrics: {
        apo: 75,
        taskAutomation: 80,
        skillRelevance: 70,
        technologyAdoption: 85,
        marketDemand: 90
      },
      source: 'onet',
      confidence: 0.85,
      factors: {
        technologyImpact: 80,
        industryAdoption: 75,
        marketGrowth: 85
      }
    }];

    jest.spyOn(historicalDataService, 'collectHistoricalData')
      .mockResolvedValue({
        data: mockData,
        metadata: {
          sources: ['onet'],
          timeRange: {
            startDate: new Date(),
            endDate: new Date()
          },
          lastUpdated: new Date(),
          dataQuality: {
            completeness: 0.9,
            accuracy: 0.85,
            consistency: 0.9
          }
        }
      });

    render(<OccupationDetails occupationCode={mockOccupationCode} />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('historical-data-section')).toBeInTheDocument();
    });

    // Check if visualizations are rendered
    expect(screen.getByTestId('apo-visualization')).toBeInTheDocument();
    expect(screen.getByTestId('time-based-analysis')).toBeInTheDocument();

    // Verify data quality indicators
    expect(screen.getByTestId('data-quality-indicator')).toHaveTextContent('90%');
  });

  it('should handle errors in the data flow gracefully', async () => {
    // Mock a service error
    jest.spyOn(historicalDataService, 'collectHistoricalData')
      .mockRejectedValue(new Error('Failed to fetch data'));

    render(<OccupationDetails occupationCode={mockOccupationCode} />);

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });

    // Verify error handling UI
    expect(screen.getByTestId('error-message')).toHaveTextContent('Failed to fetch data');
    expect(screen.getByTestId('retry-button')).toBeInTheDocument();
  });

  it('should update visualizations when data changes', async () => {
    const { rerender } = render(
      <OccupationDetails occupationCode={mockOccupationCode} />
    );

    await waitFor(() => {
      expect(screen.getByTestId('historical-data-section')).toBeInTheDocument();
    });

    // Update with new occupation code
    rerender(<OccupationDetails occupationCode="15-1253.00" />);

    await waitFor(() => {
      expect(historicalDataService.collectHistoricalData).toHaveBeenCalledTimes(2);
    });

    // Verify loading state during update
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });

  it('should maintain cache consistency across components', async () => {
    // First render to populate cache
    render(<OccupationDetails occupationCode={mockOccupationCode} />);

    await waitFor(() => {
      expect(screen.getByTestId('historical-data-section')).toBeInTheDocument();
    });

    // Count initial service calls
    const initialCalls = jest.spyOn(historicalDataService, 'collectHistoricalData').mock.calls.length;

    // Render another instance with same data
    render(<OccupationDetails occupationCode={mockOccupationCode} />);

    // Verify cache was used
    expect(jest.spyOn(historicalDataService, 'collectHistoricalData').mock.calls.length).toBe(initialCalls);
  });
});
