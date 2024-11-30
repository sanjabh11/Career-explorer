import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmergingTechAnalysisComponent } from '../../components/EmergingTechAnalysis';
import { EmergingTechnology } from '../../types/emergingTech';

describe('EmergingTechAnalysis Component', () => {
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

  const mockCurrentSkills = ['Python Programming', 'Data Analysis'];
  const mockIndustryContext = 'Technology';
  const mockOnAnalysisComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <EmergingTechAnalysisComponent
        technology={mockTechnology}
        currentSkills={mockCurrentSkills}
        industryContext={mockIndustryContext}
        onAnalysisComplete={mockOnAnalysisComplete}
      />
    );

    expect(screen.getByText('Advanced Machine Learning Analysis')).toBeInTheDocument();
  });

  it('displays all tabs', () => {
    render(
      <EmergingTechAnalysisComponent
        technology={mockTechnology}
        currentSkills={mockCurrentSkills}
        industryContext={mockIndustryContext}
        onAnalysisComplete={mockOnAnalysisComplete}
      />
    );

    expect(screen.getByText('Job Impact')).toBeInTheDocument();
    expect(screen.getByText('Skills Gap')).toBeInTheDocument();
    expect(screen.getByText('Implementation')).toBeInTheDocument();
    expect(screen.getByText('Timeline')).toBeInTheDocument();
  });

  it('switches between tabs correctly', () => {
    render(
      <EmergingTechAnalysisComponent
        technology={mockTechnology}
        currentSkills={mockCurrentSkills}
        industryContext={mockIndustryContext}
        onAnalysisComplete={mockOnAnalysisComplete}
      />
    );

    // Initially shows Job Impact
    expect(screen.getByText('Automation Risk')).toBeInTheDocument();

    // Switch to Skills Gap
    fireEvent.click(screen.getByText('Skills Gap'));
    expect(screen.getByText('Gap Severity')).toBeInTheDocument();

    // Switch to Implementation
    fireEvent.click(screen.getByText('Implementation'));
    expect(screen.getByText('Overall Readiness')).toBeInTheDocument();

    // Switch to Timeline
    fireEvent.click(screen.getByText('Timeline'));
    expect(screen.getByText('Implementation Timeline')).toBeInTheDocument();
  });

  it('calls onAnalysisComplete with analysis results', () => {
    render(
      <EmergingTechAnalysisComponent
        technology={mockTechnology}
        currentSkills={mockCurrentSkills}
        industryContext={mockIndustryContext}
        onAnalysisComplete={mockOnAnalysisComplete}
      />
    );

    expect(mockOnAnalysisComplete).toHaveBeenCalledTimes(1);
    expect(mockOnAnalysisComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        jobImpact: expect.any(Object),
        skillGapAnalysis: expect.any(Object),
        implementationReadiness: expect.any(Object),
        timelineProjection: expect.any(Object)
      })
    );
  });

  it('displays maturity level badge', () => {
    render(
      <EmergingTechAnalysisComponent
        technology={mockTechnology}
        currentSkills={mockCurrentSkills}
        industryContext={mockIndustryContext}
        onAnalysisComplete={mockOnAnalysisComplete}
      />
    );

    expect(screen.getByText('Growth')).toBeInTheDocument();
  });

  it('shows mitigation strategies in job impact section', () => {
    render(
      <EmergingTechAnalysisComponent
        technology={mockTechnology}
        currentSkills={mockCurrentSkills}
        industryContext={mockIndustryContext}
        onAnalysisComplete={mockOnAnalysisComplete}
      />
    );

    expect(screen.getByText('Mitigation Strategies')).toBeInTheDocument();
  });

  it('displays training needs in skills gap section', () => {
    render(
      <EmergingTechAnalysisComponent
        technology={mockTechnology}
        currentSkills={mockCurrentSkills}
        industryContext={mockIndustryContext}
        onAnalysisComplete={mockOnAnalysisComplete}
      />
    );

    fireEvent.click(screen.getByText('Skills Gap'));
    expect(screen.getByText('Training Needs')).toBeInTheDocument();
  });

  it('shows implementation recommendations', () => {
    render(
      <EmergingTechAnalysisComponent
        technology={mockTechnology}
        currentSkills={mockCurrentSkills}
        industryContext={mockIndustryContext}
        onAnalysisComplete={mockOnAnalysisComplete}
      />
    );

    fireEvent.click(screen.getByText('Implementation'));
    expect(screen.getByText('Recommendations')).toBeInTheDocument();
  });

  it('displays timeline phases', () => {
    render(
      <EmergingTechAnalysisComponent
        technology={mockTechnology}
        currentSkills={mockCurrentSkills}
        industryContext={mockIndustryContext}
        onAnalysisComplete={mockOnAnalysisComplete}
      />
    );

    fireEvent.click(screen.getByText('Timeline'));
    expect(screen.getByText('Implementation Timeline')).toBeInTheDocument();
    expect(screen.getByText(/Total Duration/)).toBeInTheDocument();
  });
});
