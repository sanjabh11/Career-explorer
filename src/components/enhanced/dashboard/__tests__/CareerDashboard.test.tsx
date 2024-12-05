import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CareerDashboard } from '../CareerDashboard';
import '@testing-library/jest-dom';

// Mock child components
jest.mock('../../industry/TrendAnalysis', () => ({
    TrendAnalysis: () => <div data-testid="trend-analysis">Trend Analysis Component</div>,
}));

jest.mock('../../industry/RequirementComparison', () => ({
    RequirementComparison: () => <div data-testid="requirement-comparison">Requirement Comparison Component</div>,
}));

jest.mock('../../industry/SectorGrowth', () => ({
    SectorGrowth: () => <div data-testid="sector-growth">Sector Growth Component</div>,
}));

jest.mock('../../activity/MentalProcessAssessment', () => ({
    MentalProcessAssessment: () => <div data-testid="mental-process">Mental Process Component</div>,
}));

jest.mock('../../activity/OutputExpectations', () => ({
    OutputExpectations: () => <div data-testid="output-expectations">Output Expectations Component</div>,
}));

jest.mock('../../automation/AutomationRiskAnalysis', () => ({
    AutomationRiskAnalysis: () => <div data-testid="automation-risk">Automation Risk Component</div>,
}));

describe('CareerDashboard', () => {
    const defaultProps = {
        roleId: 'test-role-1',
        industryId: 'test-industry-1',
    };

    beforeEach(() => {
        render(<CareerDashboard {...defaultProps} />);
    });

    it('renders the dashboard with default industry tab and trends subtab', () => {
        expect(screen.getByText('Industry Analysis')).toHaveClass('text-blue-600');
        expect(screen.getByTestId('trend-analysis')).toBeInTheDocument();
    });

    describe('Main Tab Navigation', () => {
        it('switches to activity tab and shows mental process by default', async () => {
            fireEvent.click(screen.getByText('Activity Analysis'));
            await waitFor(() => {
                expect(screen.getByTestId('mental-process')).toBeInTheDocument();
            });
        });

        it('switches to automation tab and shows risk analysis', async () => {
            fireEvent.click(screen.getByText('Automation Analysis'));
            await waitFor(() => {
                expect(screen.getByTestId('automation-risk')).toBeInTheDocument();
            });
        });
    });

    describe('Industry Tab Navigation', () => {
        beforeEach(() => {
            fireEvent.click(screen.getByText('Industry Analysis'));
        });

        it('shows requirements comparison when clicking Requirements', async () => {
            fireEvent.click(screen.getByText('Requirements'));
            await waitFor(() => {
                expect(screen.getByTestId('requirement-comparison')).toBeInTheDocument();
            });
        });

        it('shows sector growth when clicking Sector Growth', async () => {
            fireEvent.click(screen.getByText('Sector Growth'));
            await waitFor(() => {
                expect(screen.getByTestId('sector-growth')).toBeInTheDocument();
            });
        });

        it('returns to trends when clicking Industry Trends', async () => {
            // First switch to another tab
            fireEvent.click(screen.getByText('Requirements'));
            // Then switch back to trends
            fireEvent.click(screen.getByText('Industry Trends'));
            await waitFor(() => {
                expect(screen.getByTestId('trend-analysis')).toBeInTheDocument();
            });
        });
    });

    describe('Activity Tab Navigation', () => {
        beforeEach(() => {
            fireEvent.click(screen.getByText('Activity Analysis'));
        });

        it('shows mental process assessment by default', () => {
            expect(screen.getByTestId('mental-process')).toBeInTheDocument();
        });

        it('switches to output expectations', async () => {
            fireEvent.click(screen.getByText('Performance Metrics'));
            await waitFor(() => {
                expect(screen.getByTestId('output-expectations')).toBeInTheDocument();
            });
        });

        it('returns to mental process when clicking Mental Process', async () => {
            // First switch to performance metrics
            fireEvent.click(screen.getByText('Performance Metrics'));
            // Then switch back to mental process
            fireEvent.click(screen.getByText('Mental Process'));
            await waitFor(() => {
                expect(screen.getByTestId('mental-process')).toBeInTheDocument();
            });
        });
    });

    describe('Tab Styling', () => {
        it('applies correct styling to active main tab', () => {
            const industryTab = screen.getByText('Industry Analysis');
            expect(industryTab).toHaveClass('border-blue-500');
            
            fireEvent.click(screen.getByText('Activity Analysis'));
            expect(industryTab).not.toHaveClass('border-blue-500');
            expect(screen.getByText('Activity Analysis')).toHaveClass('border-blue-500');
        });

        it('applies correct styling to active subtab', () => {
            const trendsTab = screen.getByText('Industry Trends');
            expect(trendsTab).toHaveClass('bg-white');
            
            fireEvent.click(screen.getByText('Requirements'));
            expect(trendsTab).not.toHaveClass('bg-white');
            expect(screen.getByText('Requirements')).toHaveClass('bg-white');
        });
    });

    describe('Error Handling', () => {
        it('gracefully handles missing props', () => {
            const { container } = render(<CareerDashboard roleId="" industryId="" />);
            expect(container).toBeInTheDocument();
        });
    });
});
