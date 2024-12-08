import React, { useState, useEffect } from 'react';

interface Skill {
  id: string;
  name: string;
  score?: number;
}

const fetchData = async (occupationCode: string): Promise<Skill[]> => {
  try {
    const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8888/.netlify/functions';
    console.log('Using API base URL:', baseUrl);
    
    const response = await fetch(`${baseUrl}/onet-proxy/occupations/${occupationCode}/summary/skills`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('API Response:', await response.text());
      throw new Error(`Failed to fetch skills: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API Response data:', data);
    return data.skills || [];
  } catch (error) {
    console.error('Error in fetchData:', error);
    throw error;
  }
};

const SkillsDevelopment: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        setError(null);
        const skillsData = await fetchData('47-4011.01');
        setSkills(skillsData);
      } catch (error) {
        console.error('Error fetching skills:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  if (loading) {
    return <div>Loading skills data...</div>;
  }

  if (error) {
    return <div>Error loading skills: {error}</div>;
  }

  return (
    <div>
      {skills.map((skill) => (
        <div key={skill.id}>
          <h3>{skill.name}</h3>
          {skill.score && <p>Score: {skill.score}</p>}
        </div>
      ))}
    </div>
  );
};

export default SkillsDevelopment;

