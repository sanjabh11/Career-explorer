import React from 'react';
import { JobZoneEducation as JobZoneEducationType } from '@/types/onet';

interface JobZoneEducationProps {
  data: JobZoneEducationType;
}

const JobZoneEducation: React.FC<JobZoneEducationProps> = ({ data }) => {
  return (
    <div>
      <h3>Job Zone and Education</h3>
      <p><strong>Job Zone:</strong> {data.jobZone}</p>
      <p><strong>Description:</strong> {data.description}</p>
      <p><strong>Education:</strong> {data.education}</p>
      <p><strong>Experience:</strong> {data.experience}</p>
      <p><strong>Training:</strong> {data.training}</p>
    </div>
  );
};

export default JobZoneEducation;
