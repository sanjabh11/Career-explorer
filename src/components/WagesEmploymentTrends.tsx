import React from 'react';
import { WagesEmploymentTrends as WagesEmploymentTrendsType } from '@/types/onet';

interface WagesEmploymentTrendsProps {
  data: WagesEmploymentTrendsType;
}

const WagesEmploymentTrends: React.FC<WagesEmploymentTrendsProps> = ({ data }) => {
  return (
    <div>
      <h3>Wages and Employment Trends</h3>
      <p><strong>Median Wage:</strong> ${data.median.toLocaleString()}</p>
      <p><strong>Current Employment:</strong> {data.employment.toLocaleString()}</p>
      <p><strong>Projected Growth Rate:</strong> {data.growthRate}%</p>
      <p><strong>Projected Job Openings:</strong> {data.projectedOpenings.toLocaleString()}</p>
    </div>
  );
};

export default WagesEmploymentTrends;
