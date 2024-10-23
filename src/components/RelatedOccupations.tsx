import React from 'react';
import { RelatedOccupation } from '@/types/onet';

interface RelatedOccupationsProps {
  occupations: RelatedOccupation[];
}

const RelatedOccupations: React.FC<RelatedOccupationsProps> = ({ occupations }) => {
  return (
    <div>
      <h3>Related Occupations</h3>
      <ul>
        {occupations.map((occupation, index) => (
          <li key={index}>
            {occupation.title} (Similarity: {occupation.similarity}%)
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RelatedOccupations;
