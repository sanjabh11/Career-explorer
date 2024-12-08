import React from 'react';
import { ProjectAssessment } from '../../../types/assessment';

interface ProjectAssessmentCardProps {
  assessment: ProjectAssessment;
}

const ProjectAssessmentCard: React.FC<ProjectAssessmentCardProps> = ({ assessment }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Project Assessment</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Rating:</span>
          <span className="font-medium">{assessment.rating}/5</span>
        </div>
        <div>
          <span className="text-gray-600">Feedback:</span>
          <p className="mt-1 text-gray-800">{assessment.feedback}</p>
        </div>
        <div className="text-sm text-gray-500">
          {new Date(assessment.timestamp).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default ProjectAssessmentCard;
