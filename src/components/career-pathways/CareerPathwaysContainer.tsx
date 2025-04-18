import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import CareerLadderVisualization from './CareerLadderVisualization';
import SkillGapAnalysis from './SkillGapAnalysis';
import CareerPathwaysService from '../../services/CareerPathwaysService';
import { CareerPathwaysResponse, CareerAdvancementPlan, AdvancementOccupation } from '../../types/careerPathways';

interface CareerPathwaysContainerProps {
  occupationId: string;
}

const CareerPathwaysContainer: React.FC<CareerPathwaysContainerProps> = ({ occupationId }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pathwaysData, setPathwaysData] = useState<CareerPathwaysResponse | null>(null);
  const [selectedAdvancement, setSelectedAdvancement] = useState<AdvancementOccupation | null>(null);
  const [advancementPlan, setAdvancementPlan] = useState<CareerAdvancementPlan | null>(null);

  useEffect(() => {
    const fetchCareerPathways = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await CareerPathwaysService.getCareerPathways(occupationId);
        setPathwaysData(data);
        
        // If there are advancement pathways, select the first one by default
        if (data.advancement_pathways && data.advancement_pathways.length > 0) {
          handleAdvancementSelect(data.advancement_pathways[0]);
        }
      } catch (err) {
        console.error('Error fetching career pathways:', err);
        setError('Failed to load career pathways data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (occupationId) {
      fetchCareerPathways();
    }
  }, [occupationId]);

  const handleAdvancementSelect = (advancement: AdvancementOccupation) => {
    setSelectedAdvancement(advancement);
    
    if (pathwaysData) {
      const plan = CareerPathwaysService.createAdvancementPlan(pathwaysData, advancement.id);
      setAdvancementPlan(plan);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mb={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!pathwaysData) {
    return (
      <Box mb={3}>
        <Alert severity="info">No career pathways data available for this occupation.</Alert>
      </Box>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: 2 }}>
      <Box mb={3}>
        <Typography variant="h5" gutterBottom>
          Career Advancement Pathways
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Explore potential career advancement opportunities and understand what skills and qualifications you need to progress.
        </Typography>
      </Box>

      {pathwaysData.mockData && (
        <Box mb={3}>
          <Alert severity="info">
            This data is based on O*NET occupational information and career progression patterns. 
            Actual career paths may vary based on industry, location, and organization.
          </Alert>
        </Box>
      )}

      <Box mb={4}>
        <Typography variant="h6" gutterBottom>
          Current Position: {pathwaysData.current_occupation.title}
        </Typography>
        <Typography variant="body2" paragraph>
          {pathwaysData.current_occupation.description}
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="subtitle2">Education</Typography>
            <Typography variant="body2">{pathwaysData.current_occupation.education}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2">Experience</Typography>
            <Typography variant="body2">{pathwaysData.current_occupation.experience}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2">Median Salary</Typography>
            <Typography variant="body2">${pathwaysData.current_occupation.salary.median.toLocaleString()}/year</Typography>
          </Box>
        </Box>
      </Box>

      <Box mb={4}>
        <Typography variant="h6" gutterBottom>
          Career Ladder Visualization
        </Typography>
        <CareerLadderVisualization 
          currentOccupation={pathwaysData.current_occupation}
          advancementPathways={pathwaysData.advancement_pathways}
          selectedAdvancement={selectedAdvancement}
          onAdvancementSelect={handleAdvancementSelect}
        />
      </Box>

      {selectedAdvancement && advancementPlan && (
        <Box mb={4}>
          <Typography variant="h6" gutterBottom>
            Skill Gap Analysis for {selectedAdvancement.title}
          </Typography>
          <SkillGapAnalysis 
            advancementPlan={advancementPlan}
          />
        </Box>
      )}
    </Paper>
  );
};

export default CareerPathwaysContainer;
