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
  ArrowDownward as ArrowDownwardIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { SkillGap, SkillMatch } from '@/types/skillsTransferability';
import { getSkillGaps, getSkillMatches } from '@/services/SkillsTransferabilityService';

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
      if (!sourceOccupationCode || !targetOccupationCode) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch skill gaps and matches
        const gapSkills = await getSkillGaps(sourceOccupationCode, targetOccupationCode);
        const matchedSkills = await getSkillMatches(sourceOccupationCode, targetOccupationCode);
        
        // In a real app, we would get these from an API
        // For now, we'll use placeholder data for occupation titles
        const sourceOccupation = {
          code: sourceOccupationCode,
          title: 'Source Occupation' // This would come from API
        };
        
        const targetOccupation = {
          code: targetOccupationCode,
          title: 'Target Occupation' // This would come from API
        };
        
        // Calculate overall match percentage based on matched vs. gap skills
        const totalSkills = matchedSkills.length + gapSkills.length;
        const overallMatch = totalSkills > 0 
          ? Math.round((matchedSkills.length / totalSkills) * 100) 
          : 0;
        
        setSkillGapData({
          matchedSkills,
          gapSkills,
          sourceOccupation,
          targetOccupation,
          overallMatch
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching skill gap data:', err);
        setError('Failed to load skill gap data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [sourceOccupationCode, targetOccupationCode]);
  
  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Analyzing skill gaps...
        </Typography>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }
  
  if (!skillGapData) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        Please select both source and target occupations to analyze skill gaps.
      </Alert>
    );
  }
  
  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Skills Transferability Analysis
        </Typography>
        <Typography variant="body1" paragraph>
          Comparing skills from {skillGapData.sourceOccupation.title} to {skillGapData.targetOccupation.title}
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Overall Match: {skillGapData.overallMatch}%
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={skillGapData.overallMatch} 
            sx={{ 
              height: 10, 
              borderRadius: 5,
              bgcolor: 'grey.300',
              '& .MuiLinearProgress-bar': {
                bgcolor: skillGapData.overallMatch > 70 
                  ? 'success.main' 
                  : skillGapData.overallMatch > 40 
                    ? 'warning.main' 
                    : 'error.main'
              }
            }}
          />
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Grid container spacing={3}>
          {/* Matched Skills */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Matched Skills ({skillGapData.matchedSkills.length})
                  </Typography>
                </Box>
                
                {skillGapData.matchedSkills.length === 0 ? (
                  <Alert severity="info">No matched skills found.</Alert>
                ) : (
                  <Box>
                    {skillGapData.matchedSkills.map((skill) => (
                      <Box 
                        key={skill.id}
                        sx={{ 
                          mb: 2, 
                          p: 1.5, 
                          borderRadius: 1, 
                          bgcolor: 'success.light',
                          color: 'success.contrastText'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1">{skill.name}</Typography>
                          <Chip 
                            label={`${Math.round(skill.transferability * 100)}% transferable`}
                            size="small"
                            color="success"
                          />
                        </Box>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {skill.description}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Chip 
                            label={`Level: ${skill.level}`}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <Chip 
                            label={skill.category}
                            size="small"
                            variant="outlined"
                          />
                          {onViewSkillDetails && (
                            <Button 
                              size="small" 
                              sx={{ ml: 1 }}
                              onClick={() => onViewSkillDetails(skill.id)}
                            >
                              Details
                            </Button>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Gap Skills */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ErrorIcon color="error" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Skill Gaps ({skillGapData.gapSkills.length})
                  </Typography>
                </Box>
                
                {skillGapData.gapSkills.length === 0 ? (
                  <Alert severity="success">No skill gaps found!</Alert>
                ) : (
                  <Box>
                    {skillGapData.gapSkills.map((skill) => (
                      <Box 
                        key={skill.id}
                        sx={{ 
                          mb: 2, 
                          p: 1.5, 
                          borderRadius: 1, 
                          bgcolor: 'error.light',
                          color: 'error.contrastText'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1">{skill.name}</Typography>
                          <Tooltip title={`Difficulty: ${skill.difficulty * 10}/10`}>
                            <Chip 
                              label={`Difficulty: ${Math.round(skill.difficulty * 10)}/10`}
                              size="small"
                              color="error"
                            />
                          </Tooltip>
                        </Box>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {skill.description}
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                          <Chip 
                            icon={<ArrowUpwardIcon />}
                            label={`Current: ${skill.currentLevel}`}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <ArrowForwardIcon sx={{ mx: 0.5 }} />
                          <Chip 
                            icon={<ArrowDownwardIcon />}
                            label={`Required: ${skill.requiredLevel}`}
                            size="small"
                          />
                        </Box>
                        <Box sx={{ mt: 1 }}>
                          <Chip 
                            label={skill.category}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 1 }}
                          />
                          {skill.trainingOption && (
                            <Chip 
                              label={`Training: ${skill.trainingOption}`}
                              size="small"
                              color="secondary"
                            />
                          )}
                          {onViewSkillDetails && (
                            <Button 
                              size="small" 
                              sx={{ ml: 1 }}
                              onClick={() => onViewSkillDetails(skill.id)}
                            >
                              Details
                            </Button>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default SkillGapVisualization;
