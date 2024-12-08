import React from 'react';
import { ProjectAssessment, PeerReview } from '../../../types/assessment';
import ProjectAssessmentCard from './ProjectAssessmentCard';
import PeerReviewCard from './PeerReviewCard';

interface AssessmentContainerProps {
  projectAssessments: ProjectAssessment[];
  peerReviews: PeerReview[];
}

const AssessmentContainer: React.FC<AssessmentContainerProps> = ({
  projectAssessments,
  peerReviews,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Project Assessments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projectAssessments.map((assessment) => (
            <ProjectAssessmentCard key={assessment.id} assessment={assessment} />
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-4">Peer Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {peerReviews.map((review) => (
            <PeerReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssessmentContainer;
