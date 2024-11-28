import React from 'react';
import { WorkContext } from '@/types/onet';

interface WorkContextDetailsProps {
  workContext: WorkContext[];
}

const WorkContextDetails: React.FC<WorkContextDetailsProps> = ({ workContext }) => {
  return (
    <div>
      <h3>Work Context</h3>
      <ul>
        {workContext.map((item, index) => (
          <li key={index}>
            <strong>{item.category}:</strong> {item.description} - Value: {item.value}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WorkContextDetails;
