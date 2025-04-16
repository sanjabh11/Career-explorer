import React from 'react';
import { JobOutlook } from '@/types/onet';
import GrowthIndicator from './GrowthIndicator';
import BrightOutlookBadge from './BrightOutlookBadge';
import SalaryChart from './SalaryChart';
import ProjectedOpeningsChart from './ProjectedOpeningsChart';
import CombinedMetricsCard from './CombinedMetricsCard';
import { calculateOverallAPO } from '@/utils/apoCalculations';

interface OutlookDisplayProps {
  jobOutlook?: JobOutlook;
  occupationTitle: string;
  apoScore?: number;
}

/**
 * Main component for displaying job outlook information
 */
const OutlookDisplay: React.FC<OutlookDisplayProps> = ({ jobOutlook, occupationTitle, apoScore = 50 }) => {
  if (!jobOutlook) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Job Outlook</h3>
        <p className="text-gray-600">Job outlook information is not available for this occupation.</p>
      </div>
    );
  }

  // If we have both APO score and job outlook data, show the combined metrics
  const showCombinedMetrics = apoScore !== undefined && jobOutlook !== undefined;

  return (
    <div className="space-y-6">
      {/* Combined Metrics Card (if we have both APO and job outlook data) */}
      {showCombinedMetrics && (
        <CombinedMetricsCard
          apoScore={apoScore}
          jobOutlook={jobOutlook}
          occupationTitle={occupationTitle}
        />
      )}

      {/* Job Outlook Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Job Outlook</h2>
          {jobOutlook.brightOutlook && <BrightOutlookBadge reasons={jobOutlook.brightOutlookReasons} />}
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Growth Rate Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Growth Rate</h3>
          <GrowthIndicator
            growthRate={jobOutlook.growthRate}
            description={jobOutlook.growthOutlookDescription}
          />
        </div>

        {/* Salary Information Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Salary Information</h3>
          <SalaryChart salaryRange={jobOutlook.salaryRange} />
        </div>
      </div>

      {/* Projected Openings Section */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-2">Projected Job Openings</h3>
        <ProjectedOpeningsChart
          projectedOpenings={jobOutlook.projectedOpenings}
          employmentData={jobOutlook.employmentData}
          occupationTitle={occupationTitle}
        />
      </div>

      {/* Additional Information */}
      <div className="text-sm text-gray-500 mt-4">
        <p>Data source: {jobOutlook.source}</p>
        <p>Last updated: {new Date(jobOutlook.lastUpdated).toLocaleDateString()}</p>
      </div>
      </div>
    </div>
  );
};

export default OutlookDisplay;
