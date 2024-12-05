import React, { useState } from 'react';
import { TrendAnalysis } from '../industry/TrendAnalysis';
import { RequirementComparison } from '../industry/RequirementComparison';
import { SectorGrowth } from '../industry/SectorGrowth';
import { MentalProcessAssessment } from '../activity/MentalProcessAssessment';
import { OutputExpectations } from '../activity/OutputExpectations';
import { AutomationRiskAnalysis } from '../automation/AutomationRiskAnalysis';

interface CareerDashboardProps {
    roleId: string;
    industryId: string;
}

type TabType = 'industry' | 'activity' | 'automation';
type SubTabType = {
    industry: 'trends' | 'requirements' | 'growth';
    activity: 'mental' | 'output';
    automation: 'risk';
};

export const CareerDashboard: React.FC<CareerDashboardProps> = ({ roleId, industryId }) => {
    const [activeTab, setActiveTab] = useState<TabType>('industry');
    const [activeSubTab, setActiveSubTab] = useState<SubTabType[TabType]>('trends');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'industry':
                switch (activeSubTab) {
                    case 'trends':
                        return <TrendAnalysis industryId={industryId} />;
                    case 'requirements':
                        return <RequirementComparison sourceIndustry={industryId} targetIndustry="" />;
                    case 'growth':
                        return <SectorGrowth industryId={industryId} />;
                    default:
                        return null;
                }
            case 'activity':
                switch (activeSubTab) {
                    case 'mental':
                        return <MentalProcessAssessment roleId={roleId} />;
                    case 'output':
                        return <OutputExpectations roleId={roleId} />;
                    default:
                        return null;
                }
            case 'automation':
                return <AutomationRiskAnalysis roleId={roleId} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow">
                    {/* Main Navigation */}
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            {['industry', 'activity', 'automation'].map((tab) => (
                                <button
                                    key={tab}
                                    className={`
                                        py-4 px-8 font-medium text-sm border-b-2 
                                        ${
                                            activeTab === tab
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }
                                    `}
                                    onClick={() => {
                                        setActiveTab(tab as TabType);
                                        // Set default sub-tab for each main tab
                                        switch (tab) {
                                            case 'industry':
                                                setActiveSubTab('trends');
                                                break;
                                            case 'activity':
                                                setActiveSubTab('mental');
                                                break;
                                            case 'automation':
                                                setActiveSubTab('risk');
                                                break;
                                        }
                                    }}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)} Analysis
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Sub Navigation for Industry and Activity */}
                    {(activeTab === 'industry' || activeTab === 'activity') && (
                        <div className="border-b border-gray-200 bg-gray-50">
                            <nav className="flex space-x-4 px-4 py-3">
                                {activeTab === 'industry' ? (
                                    <>
                                        <SubTabButton
                                            active={activeSubTab === 'trends'}
                                            onClick={() => setActiveSubTab('trends')}
                                            label="Industry Trends"
                                        />
                                        <SubTabButton
                                            active={activeSubTab === 'requirements'}
                                            onClick={() => setActiveSubTab('requirements')}
                                            label="Requirements"
                                        />
                                        <SubTabButton
                                            active={activeSubTab === 'growth'}
                                            onClick={() => setActiveSubTab('growth')}
                                            label="Sector Growth"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <SubTabButton
                                            active={activeSubTab === 'mental'}
                                            onClick={() => setActiveSubTab('mental')}
                                            label="Mental Process"
                                        />
                                        <SubTabButton
                                            active={activeSubTab === 'output'}
                                            onClick={() => setActiveSubTab('output')}
                                            label="Performance Metrics"
                                        />
                                    </>
                                )}
                            </nav>
                        </div>
                    )}

                    {/* Content Area */}
                    <div className="p-6">{renderTabContent()}</div>
                </div>
            </div>
        </div>
    );
};

interface SubTabButtonProps {
    active: boolean;
    onClick: () => void;
    label: string;
}

const SubTabButton: React.FC<SubTabButtonProps> = ({ active, onClick, label }) => (
    <button
        className={`
            px-3 py-2 text-sm font-medium rounded-md
            ${
                active
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
            }
        `}
        onClick={onClick}
    >
        {label}
    </button>
);
