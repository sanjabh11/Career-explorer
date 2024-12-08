import React from 'react';
import { WorkEnvironmentTab } from './WorkEnvironmentTab';

interface WorkEnvironmentAnalysisProps {
  roleId: string;
  userId: string;
}

export const WorkEnvironmentAnalysis: React.FC<WorkEnvironmentAnalysisProps> = ({
  roleId,
  userId,
}) => {
  return (
    <div className="container mx-auto py-6">
      <WorkEnvironmentTab occupationId={roleId} />
    </div>
  );
};

export default WorkEnvironmentAnalysis;
