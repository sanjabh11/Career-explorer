// src/components/skills-transferability/SkillGapVisualization.tsx
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
  Divider,
  LinearProgress,
  Chip,
  Button,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import { SkillGap, SkillMatch } from '@/types/skillsTransferability';
import { analyzeSkillGaps } from '@/services/SkillsTransferabilityService';

interface SkillGapVisualizationProps {
  sourceOccupationCode: string;
  targetOccupationCode: string;
  onViewSkillDetails?: (skillId: string) => void;
}

const SkillGapVisualization: React.FC<SkillGapVisualizationProps> = ({
  sourceOccupationCode,
  targetOccupationCode,
  onViewSkillDetails
}) => {
  const [skillGapData, setSkillGapData] = useState<{
    matchedSkills: SkillMatch[];
    gapSkills: SkillGap[];
    sourceOccupation: { code: string; title: string };
    targetOccupation: { code: string; title: string };
    overallMatch: number;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!sourceOccupationCode || !targetOccupationCode) return;
      
      try {
        setLoading(true);
        const data = await analyzeSkillGaps(sourceOccupationCode, targetOccupationCode);
        setSkillGapData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching skill gap data:', err);
        setError('Failed to load skill gap data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [sourceOccupationCode, targetOccupationCode]);
  
  if (loading) {
    return <CircularProgress />;
  }
  
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }
  
  if (!skillGapData) {
    return <Alert severity="info">No skill gap data available.</Alert>;
  }
  
  const { matchedSkills, gapSkills, sourceOccupation, targetOccupation, overallMatch } = skillGapData;
  
  return (
    <Box>
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5}>
            <Typography variant="subtitle1">{sourceOccupation.title}</Typography>
            <Typography variant="caption" color="text.secondary">
              Current Occupation (Code: {sourceOccupation.code})
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={2} sx={{ textAlign: 'center' }}>
            <Typography variant="h5">→</Typography>
          </Grid>
          
          <Grid item xs={12} sm={5}>
            <Typography variant="subtitle1">{targetOccupation.title}</Typography>
            <Typography variant="caption" color="text.secondary">
              Target Occupation (Code: {targetOccupation.code})
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Overall Skills Match: {Math.round(overallMatch * 100)}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={overallMatch * 100} 
                sx={{ 
                  height: 10, 
                  borderRadius: 5,
                  backgroundColor: '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: overallMatch >= 0.7 ? '#4caf50' : overallMatch >= 0.4 ? '#ff9800' : '#f44336'
                  }
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Matched Skills ({matchedSkills.length})
          </Typography>
          
          {matchedSkills.length === 0 ? (
            <Alert severity="info">No matched skills found.</Alert>
          ) : (
            <Card variant="outlined">
              <CardContent>
                {matchedSkills.map((skill, index) => (
                  <React.Fragment key={skill.id}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', py: 1 }}>
                      <CheckCircleIcon color="success" sx={{ mr: 1, mt: 0.5 }} />
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2">{skill.name}</Typography>
                          <Button 
                            size="small" 
                            onClick={() => onViewSkillDetails && onViewSkillDetails(skill.id)}
                          >
                            Details
                          </Button>
                        </Box>
                        
                        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            Your Level: {skill.currentLevel.toFixed(1)}
                          </Typography>
                          
                          {skill.currentLevel < skill.requiredLevel ? (
                            <Chip 
                              size="small" 
                              color="warning" 
                              label={`Need +${(skill.requiredLevel - skill.currentLevel).toFixed(1)}`}
                              icon={<ArrowUpwardIcon />}
                            />
                          ) : skill.currentLevel > skill.requiredLevel ? (
                            <Chip 
                              size="small" 
                              color="success" 
                              label={`+${(skill.currentLevel - skill.requiredLevel).toFixed(1)} higher`}
                              icon={<ArrowDownwardIcon />}
                            />
                          ) : (
                            <Chip 
                              size="small" 
                              color="primary" 
                              label="Exact Match"
                            />
                          )}
                        </Box>
                        
                        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant="caption" sx={{ width: 100 }}>
                            Required: {skill.requiredLevel.toFixed(1)}/5
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={(skill.requiredLevel / 5) * 100}
                            sx={{ flex: 1, mx: 1, height: 6 }}
                          />
                        </Box>
                        
                        <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center' }}>
                          <Typography variant="caption" sx={{ width: 100 }}>
                            Your level: {skill.currentLevel.toFixed(1)}/5
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={(skill.currentLevel / 5) * 100}
                            color={skill.currentLevel >= skill.requiredLevel ? "success" : "warning"}
                            sx={{ flex: 1, mx: 1, height: 6 }}
                          />
                        </Box>
                      </Box>
                    </Box>
                    {index < matchedSkills.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </CardContent>
            </Card>
          )}
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Missing Skills ({gapSkills.length})
          </Typography>
          
          {gapSkills.length === 0 ? (
            <Alert severity="success">No skill gaps found! You have all required skills.</Alert>
          ) : (
            <Card variant="outlined">
              <CardContent>
                {gapSkills.map((skill, index) => (
                  <React.Fragment key={skill.id}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', py: 1 }}>
                      <ErrorIcon color="error" sx={{ mr: 1, mt: 0.5 }} />
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2">{skill.name}</Typography>
                          <Button 
                            size="small" 
                            onClick={() => onViewSkillDetails && onViewSkillDetails(skill.id)}
                          >
                            Details
                          </Button>
                        </Box>
                        
                        <Typography variant="body2" sx={{ mt: 0.5 }} color="text.secondary">
                          {skill.description?.length > 120 
                            ? `${skill.description.substring(0, 120)}...` 
                            : skill.description}
                        </Typography>
                        
                        <Box sx={{ mt: 1 }}>
                          <Chip 
                            size="small" 
                            color="error" 
                            label={`Required Level: ${skill.requiredLevel.toFixed(1)}/5`}
                          />
                          {skill.importance && (
                            <Chip 
                              size="small" 
                              color="primary" 
                              label={`Importance: ${skill.importance.toFixed(1)}/5`}
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                        
                        {skill.trainingOptions && skill.trainingOptions.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              Training options available
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                    {index < gapSkills.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default SkillGapVisualization;
