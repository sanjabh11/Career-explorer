// src/components/TopCareers.tsx

import React from 'react';
import { useOccupationSearch } from '@/hooks/useOccupationSearch';
import { calculateAPO } from '@/utils/apoCalculations';
import { Occupation, OccupationDetails } from '@/types/onet';

interface TopCareersProps {
  onSelect: (occupation: OccupationDetails) => void;
}

const TopCareers: React.FC<TopCareersProps> = ({ onSelect }) => {
  const { results } = useOccupationSearch();

  // Sort occupations by APO score and get top 5
  const topCareers = results
    .map((occupation: Occupation) => ({
      ...occupation,
      apoScore: calculateAPO({
        name: occupation.title,
        description: '', // Add an empty description or fetch it if available
        value: 0, // Add a default value or calculate it if needed
      }, 'occupation')
    }))
    .sort((a, b) => b.apoScore - a.apoScore)
    .slice(0, 5);

  const handleSelect = (occupation: Occupation) => {
    // Here we need to fetch the full OccupationDetails before calling onSelect
    // This is a placeholder for the actual API call
    const fetchOccupationDetails = async (code: string): Promise<OccupationDetails> => {
      // Implement the API call to fetch full occupation details
      // For now, we'll return a mock object
      return {
        ...occupation,
        description: 'Placeholder description',
        sample_of_reported_job_titles: [],
        updated: new Date().toISOString(),
        categories: [],
        tasks: [],
        knowledge: [],
        skills: [],
        abilities: [],
        technologies: [],
      };
    };

    fetchOccupationDetails(occupation.code).then(details => {
      onSelect(details);
    });
  };

  return (
    <div>
      <h2>Top Career Recommendations</h2>
      <ul>
        {topCareers.map((career) => (
          <li key={career.code}>
            {career.title} - APO Score: {career.apoScore.toFixed(2)}
            <button onClick={() => handleSelect(career)}>Select</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopCareers;
