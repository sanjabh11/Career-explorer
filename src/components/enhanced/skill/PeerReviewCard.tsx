import React from 'react';
import { PeerReview } from '../../../types/assessment';

interface PeerReviewCardProps {
  review: PeerReview;
}

const PeerReviewCard: React.FC<PeerReviewCardProps> = ({ review }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Peer Review</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Rating:</span>
          <span className="font-medium">{review.rating}/5</span>
        </div>
        <div>
          <span className="text-gray-600">Feedback:</span>
          <p className="mt-1 text-gray-800">{review.feedback}</p>
        </div>
        <div className="text-sm text-gray-500">
          {new Date(review.timestamp).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default PeerReviewCard;
