import { render, fireEvent, screen } from '@testing-library/react';
import { APOVisualization } from '@/components/APOVisualization';
import { HistoricalDataPoint } from '@/types/historicalData';

describe('APOVisualization', () => {
  const mockData: HistoricalDataPoint[] = [
    {
      timestamp: new Date('2023-01-01'),
      occupationCode: '15-1252.00',
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
    }
  ];

  it('renders without crashing', () => {
    render(<APOVisualization data={mockData} />);
    expect(screen.getByTestId('apo-visualization')).toBeInTheDocument();
  });

  it('switches chart types correctly', () => {
    render(<APOVisualization data={mockData} />);
    
    // Switch to bar chart
    fireEvent.click(screen.getByTestId('chart-type-selector'));
    fireEvent.click(screen.getByText('Bar Chart'));
    
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('applies time range filter correctly', () => {
    render(<APOVisualization data={mockData} />);
    
    // Set date range
    fireEvent.change(screen.getByTestId('date-range-start'), {
      target: { value: '2023-01-01' }
    });
    fireEvent.change(screen.getByTestId('date-range-end'), {
      target: { value: '2023-12-31' }
    });

    // Check if data is filtered
    expect(screen.getByTestId('visualization-container')).toHaveTextContent('75');
  });

  it('exports data correctly', () => {
    const mockExport = jest.fn();
    window.URL.createObjectURL = jest.fn();

    render(<APOVisualization data={mockData} onExport={mockExport} />);
    
    fireEvent.click(screen.getByTestId('export-button'));
    expect(mockExport).toHaveBeenCalled();
  });

  it('displays loading state correctly', () => {
    render(<APOVisualization data={[]} loading={true} />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    render(<APOVisualization data={[]} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('updates on data change', () => {
    const { rerender } = render(<APOVisualization data={mockData} />);
    
    const newData = [...mockData, {
      ...mockData[0],
      timestamp: new Date('2023-02-01'),
      metrics: { ...mockData[0].metrics, apo: 80 }
    }];
    
    rerender(<APOVisualization data={newData} />);
    expect(screen.getByTestId('visualization-container')).toHaveTextContent('80');
  });
});
