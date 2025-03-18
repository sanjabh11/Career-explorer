// src/components/skills-transferability/CareerPathway.tsx
// Version 1.3.0

import React, { useState, useEffect } from 'react';
import { 
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  Button,
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  StepButton,
  LinearProgress,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  WorkOutline as WorkIcon,
  Info as InfoIcon,
  Check as CheckIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { 
  CareerPath, 
  CareerPathStep, 
  CareerTransitionGap 
} from '@/types/skillsTransferability';
import { getCareerPathways } from '@/services/SkillsTransferabilityService';
import { BrightOutlookIndicator } from '../bright-outlook';

interface CareerPathwayProps {
  occupationCode: string;
  onViewOccupation?: (code: string) => void;
  maxPathLength?: number;
}

const CareerPathway: React.FC<CareerPathwayProps> = ({
  occupationCode,
  onViewOccupation,
  maxPathLength = 5
}) => {
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPathIndex, setSelectedPathIndex] = useState<number>(0);
  const [activeStep, setActiveStep] = useState<number>(0);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!occupationCode) return;
      
      try {
        setLoading(true);
        const data = await getCareerPathways(occupationCode, maxPathLength);
        setCareerPaths(data);
        setLoading(false);
        // Reset the selected path and step when occupation changes
        setSelectedPathIndex(0);
        setActiveStep(0);
      } catch (err) {
        console.error('Error fetching career pathways:', err);
        setError('Failed to load career pathways');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [occupationCode, maxPathLength]);
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }
  
  if (careerPaths.length === 0) {
    return (
      <Alert severity="info">
        No career pathways found for this occupation.
      </Alert>
    );
  }
  
  const selectedPath = careerPaths[selectedPathIndex];
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Career Pathways
      </Typography>
      
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              {selectedPath.description || 'Explore potential career progression paths based on your skills.'}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box display="flex" flexWrap="wrap">
              {careerPaths.map((path, index) => (
                <Chip
                  key={index}
                  label={`Pathway ${index + 1}${path.name ? `: ${path.name}` : ''}`}
                  color={selectedPathIndex === index ? 'primary' : 'default'}
                  onClick={() => {
                    setSelectedPathIndex(index);
                    setActiveStep(0);
                  }}
                  sx={{ m: 0.5 }}
                />
              ))}
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Box display="flex" alignItems="center" mt={1}>
              <Typography variant="subtitle2">
                Selected: {selectedPath.name || `Pathway ${selectedPathIndex + 1}`}
              </Typography>
              <Box ml={1}>
                {selectedPath.difficulty && (
                  <Chip 
                    size="small" 
                    color={
                      selectedPath.difficulty <= 0.3 ? 'success' : 
                      selectedPath.difficulty <= 0.6 ? 'warning' : 
                      'error'
                    }
                    label={`Difficulty: ${Math.round(selectedPath.difficulty * 100)}%`}
                  />
                )}
              </Box>
              <Box ml="auto">
                <Typography variant="caption" color="text.secondary">
                  {selectedPath.steps.length} steps • Est. completion: {selectedPath.estimatedTimeYears} years
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Stepper 
        activeStep={activeStep} 
        orientation="vertical"
        nonLinear
      >
        {selectedPath.steps.map((step, index) => {
          const occupation = step.occupation;
          const gaps = step.gaps || [];
          
          return (
            <Step key={index}>
              <StepButton onClick={() => setActiveStep(index)}>
                <StepLabel 
                  optional={
                    <Typography variant="caption" color="text.secondary">
                      {step.title || occupation.title}
                      {index > 0 && step.timingMonths && (
                        ` • ${Math.round(step.timingMonths / 12 * 10) / 10} years`
                      )}
                    </Typography>
                  }
                >
                  <Box display="flex" alignItems="center">
                    <Typography variant="subtitle2">
                      {index === 0 ? 'Current' : `Step ${index}`}
                    </Typography>
                    
                    {step.brightOutlook && (
                      <Box ml={1}>
                        <BrightOutlookIndicator 
                          occupationCode={occupation.code} 
                          compact={true} 
                          showTooltip={true}
                        />
                      </Box>
                    )}
                  </Box>
                </StepLabel>
              </StepButton>
              
              <StepContent>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="h6">
                          {occupation.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          O*NET Code: {occupation.code}
                        </Typography>
                      </Box>
                      
                      {step.growthRate !== undefined && (
                        <Chip 
                          icon={<TrendingUpIcon />}
                          label={`${step.growthRate > 0 ? '+' : ''}${step.growthRate}% growth`}
                          color={step.growthRate > 7 ? 'success' : (step.growthRate > 0 ? 'primary' : 'default')}
                          variant="outlined"
                        />
                      )}
                    </Box>
                    
                    <Box mt={2}>
                      <Grid container spacing={2}>
                        {step.salary && (
                          <Grid item xs={12} sm={4}>
                            <Typography variant="body2" color="text.secondary">
                              Median Salary
                            </Typography>
                            <Typography variant="subtitle1">
                              ${step.salary.toLocaleString()}
                            </Typography>
                          </Grid>
                        )}
                        
                        {step.educationRequired && (
                          <Grid item xs={12} sm={4}>
                            <Typography variant="body2" color="text.secondary">
                              Education
                            </Typography>
                            <Box display="flex" alignItems="center">
                              <SchoolIcon fontSize="small" sx={{ mr: 0.5 }} />
                              <Typography variant="subtitle1">
                                {step.educationRequired}
                              </Typography>
                            </Box>
                          </Grid>
                        )}
                        
                        {step.experienceRequired && (
                          <Grid item xs={12} sm={4}>
                            <Typography variant="body2" color="text.secondary">
                              Experience
                            </Typography>
                            <Box display="flex" alignItems="center">
                              <WorkIcon fontSize="small" sx={{ mr: 0.5 }} />
                              <Typography variant="subtitle1">
                                {step.experienceRequired}
                              </Typography>
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                    
                    {index > 0 && gaps.length > 0 && (
                      <Box mt={3}>
                        <Typography variant="subtitle2" gutterBottom>
                          Skill Gaps to Address:
                        </Typography>
                        
                        {gaps.map((gap, gapIndex) => (
                          <Box key={gapIndex} mb={2}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2">
                                {gap.name}
                              </Typography>
                              
                              <Typography variant="caption" color="text.secondary">
                                Required level: {gap.requiredLevel.toFixed(1)}/5
                              </Typography>
                            </Box>
                            
                            <LinearProgress 
                              variant="determinate" 
                              value={(gap.currentLevel / gap.requiredLevel) * 100}
                              color={
                                gap.currentLevel / gap.requiredLevel >= 0.8 ? "success" : 
                                gap.currentLevel / gap.requiredLevel >= 0.5 ? "warning" : 
                                "error"
                              }
                              sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
                            />
                            
                            {gap.trainingOption && (
                              <Box mt={1} display="flex" alignItems="center">
                                <SchoolIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                                <Typography variant="caption" color="text.secondary">
                                  Suggested training: {gap.trainingOption}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        ))}
                      </Box>
                    )}
                    
                    {step.description && (
                      <Box mt={2}>
                        <Typography variant="body2">
                          {step.description}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                  
                  <CardActions>
                    <Button 
                      size="small" 
                      onClick={() => onViewOccupation && onViewOccupation(occupation.code)}
                    >
                      View Occupation Details
                    </Button>
                    
                    {index < selectedPath.steps.length - 1 && (
                      <Button 
                        size="small" 
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => setActiveStep(index + 1)}
                      >
                        Next Step
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </StepContent>
            </Step>
          );
        })}
      </Stepper>
      
      <Box mt={3}>
        <Typography variant="body2" color="text.secondary">
          Note: Career pathways are based on skills transferability analysis and industry data. 
          The actual transition difficulty may vary based on individual circumstances and job market conditions.
        </Typography>
      </Box>
    </Box>
  );
};

export default CareerPathway;
