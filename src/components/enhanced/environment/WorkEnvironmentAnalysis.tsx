import React, { useEffect, useState } from 'react';

interface WorkEnvironmentFactor {
  id: string;
  name: string;
  description: string;
  score: number;
}

interface WorkEnvironmentAnalysisProps {
  roleId: string; // Using string type for O*NET code
}

export const WorkEnvironmentAnalysis: React.FC<WorkEnvironmentAnalysisProps> = ({ roleId }) => {
  const [factors, setFactors] = useState<WorkEnvironmentFactor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkEnvironment = async () => {
      try {
        const response = await fetch(`/api/v2/environment/${roleId}`);
        if (!response.ok) throw new Error('Failed to fetch work environment data');
        const data = await response.json();
        setFactors(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkEnvironment();
  }, [roleId]);

  if (loading) return <div>Loading work environment analysis...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="work-environment-analysis">
      <h2>Work Environment Analysis</h2>
      <div className="factors-grid">
        {factors.map((factor) => (
          <div key={factor.id} className="factor-card">
            <h3>{factor.name}</h3>
            <p>{factor.description}</p>
            <div className="score-bar">
              <div 
                className="score-fill"
                style={{ width: `${factor.score * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkEnvironmentAnalysis;
