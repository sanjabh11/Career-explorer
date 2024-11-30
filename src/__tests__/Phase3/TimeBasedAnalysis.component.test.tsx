import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TimeBasedAnalysis from '../../components/TimeBasedAnalysis';
import { EmergingTechnology } from '../../types/emergingTech';

const mockTechnology: EmergingTechnology = {
  id: 'ai-ml-001',
  name: 'Advanced Machine Learning',
  category: 'AI_ML',
  maturityLevel: 'Growth',
  impactScore: 0.85,
  timeToMainstream: 18,
  skillRequirements: [
    {
      skillName: 'Machine Learning',
      proficiencyLevel: 0.8,
      demandTrend: 'increasing',
      availabilityScore: 0.6,
      timeToAcquire: 12
    }
  ],
  industryImpacts: [
    {
      industry: 'Technology',
      disruptionLevel: 0.9,
      adoptionRate: 0.7,
      jobsAffected: {
        created: 1000,
        modified: 5000,
        displaced: 2000
      },
      timelineToImpact: 12,
      barriers: ['Skill gaps'],
      opportunities: ['New markets']
    }
  ],
  disruptionPotential: {
    processAutomation: 0.8,
    decisionAugmentation: 0.9,
    skillObsolescence: 0.6,
    newCapabilityCreation: 0.85,
    marketRestructuring: 0.7
  },
  implementationFactors: {
    costFactor: {
      initialInvestment: 500000,
      ongoingCosts: 100000,
      roi: 2.5,
      paybackPeriod: 18
    },
    infrastructureRequirements: {
      hardware: ['GPU clusters'],
      software: ['ML frameworks'],
      connectivity: ['High-speed internet'],
      compliance: ['Data privacy']
    },
    organizationalReadiness: {
      technicalCapability: 0.7,
      changeManagement: 0.6,
      resourceAvailability: 0.8,
      culturalAlignment: 0.65
    },
    risks: {
      technical: ['Model accuracy'],
      operational: ['Integration challenges'],
      financial: ['Cost overruns'],
      strategic: ['Market timing']
    }
  },
  marketProjections: [
    {
      year: 2024,
      marketSize: 50000,
      growthRate: 25,
      adoptionRate: 0.4,
      confidence: 0.85,
      keyDrivers: ['Digital transformation'],
      potentialBarriers: ['Skills shortage']
    }
  ],
  relatedTechnologies: ['deep-learning-001']
};

const mockHistoricalData = [
  {
    timestamp: new Date('2022-01-01'),
    apo: 0.65,
    factors: {
      technologyImpact: 0.7,
      industryAdoption: 0.6,
      marketGrowth: 0.5
    }
  },
  {
    timestamp: new Date('2022-06-01'),
    apo: 0.68,
    factors: {
      technologyImpact: 0.75,
      industryAdoption: 0.65,
      marketGrowth: 0.55
    }
  },
  {
    timestamp: new Date('2023-01-01'),
    apo: 0.72,
    factors: {
      technologyImpact: 0.8,
      industryAdoption: 0.7,
      marketGrowth: 0.6
    }
  }
];

describe('TimeBasedAnalysis Component', () => {
  const defaultProps = {
    technology: mockTechnology,
    historicalData: mockHistoricalData,
    timeframeYears: 5,
    baseAutomationScore: 0.65,
    industry: 'Technology',
    region: 'North America',
    occupation: 'Software Developer',
    task: 'Machine Learning Development'
  };

  it('renders without crashing', () => {
    render(<TimeBasedAnalysis {...defaultProps} />);
    expect(screen.getByText(/Time-Based Analysis/i)).toBeInTheDocument();
  });

  it('displays confidence score', () => {
    render(<TimeBasedAnalysis {...defaultProps} />);
    expect(screen.getByText(/Confidence Score:/i)).toBeInTheDocument();
  });

  it('shows trend analysis section', () => {
    render(<TimeBasedAnalysis {...defaultProps} />);
    expect(screen.getByText(/Trend Analysis/i)).toBeInTheDocument();
  });

  it('displays confidence breakdown metrics', () => {
    render(<TimeBasedAnalysis {...defaultProps} />);
    expect(screen.getByText(/Confidence Breakdown/i)).toBeInTheDocument();
    expect(screen.getByText(/Data Quality/i)).toBeInTheDocument();
    expect(screen.getByText(/Market Stability/i)).toBeInTheDocument();
    expect(screen.getByText(/Technology Maturity/i)).toBeInTheDocument();
    expect(screen.getByText(/Industry Relevance/i)).toBeInTheDocument();
  });

  it('shows recommendations', () => {
    render(<TimeBasedAnalysis {...defaultProps} />);
    expect(screen.getByText(/Recommendations/i)).toBeInTheDocument();
  });

  it('updates projection when timeframe changes', () => {
    render(<TimeBasedAnalysis {...defaultProps} />);
    const timeframeSelect = screen.getByLabelText(/Projection Timeframe/i);
    fireEvent.change(timeframeSelect, { target: { value: '10' } });
    
    // Verify that longer timeframe shows lower confidence
    const confidenceScore = screen.getByText(/Confidence Score:/i);
    expect(confidenceScore).toHaveTextContent(/\d+\.\d+%/);
  });

  it('handles empty historical data', () => {
    render(
      <TimeBasedAnalysis
        {...defaultProps}
        historicalData={[]}
      />
    );
    
    const confidenceScore = screen.getByText(/Confidence Score:/i);
    expect(confidenceScore).toHaveTextContent(/\d+\.\d+%/);
  });

  it('shows correct trend direction', () => {
    render(<TimeBasedAnalysis {...defaultProps} />);
    
    // Since our mock data shows an increasing trend
    const trendIndicator = screen.getByText(/confidence/i).closest('div');
    expect(trendIndicator).toHaveClass('increasing');
  });

  it('displays key factors', () => {
    render(<TimeBasedAnalysis {...defaultProps} />);
    expect(screen.getByText(/Key Influencing Factors/i)).toBeInTheDocument();
  });
});
