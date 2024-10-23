import React from 'react';
import { useOccupationSearch } from '@/hooks/useOccupationSearch';
import { calculateAPO } from '@/utils/apoCalculations';
import { Occupation, OccupationDetails } from '@/types/onet';
import { Button } from "@/components/ui/button";

interface TopCareerProps {
  onSelect: (occupation: OccupationDetails) => void;
}

const TopCareer: React.FC<TopCareerProps> = ({ onSelect }) => {
  const { results } = useOccupationSearch();

  // Sort occupations by APO score and get top 5
  const topCareers = results
    .map((occupation: Occupation) => ({
      ...occupation,
      apoScore: calculateAPO({
        name: occupation.title,
        description: '',
        value: 0,
      }, 'occupation')
    }))
    .sort((a, b) => b.apoScore - a.apoScore)
    .slice(0, 5);

  const handleSelect = async (occupation: Occupation) => {
    // Fetch full occupation details here
    // This is a placeholder implementation
    const fullDetails: OccupationDetails = {
      ...occupation,
      description: 'Placeholder description',
      sample_of_reported_job_titles: [],
      updated: '',
      categories: [],
      tasks: [],
      knowledge: [],
      skills: [],
      abilities: [],
      technologies: [],
    };
    onSelect(fullDetails);
  };

  return (
    <div>
      <h2>Top Career Recommendations</h2>
      <ul>
        {topCareers.map((career) => (
          <li key={career.code}>
            {career.title} - APO Score: {career.apoScore.toFixed(2)}
            <Button onClick={() => handleSelect(career)}>Select</Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopCareer;
