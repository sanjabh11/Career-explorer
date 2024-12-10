import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  Paper,
  Rating,
  Slider,
  Alert,
  Chip,
  LinearProgress,
  Tooltip
} from '@mui/material';
import { Skill } from '../../types/skills';
import SkillsService from '../../services/SkillsService';

interface SkillsAssessmentProps {
  occupationId: string;
  userId: string;
}

const SkillsAssessment: React.FC<SkillsAssessmentProps> = ({ occupationId, userId }) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assessments, setAssessments] = useState<Record<string, { level: number; confidence: number }>>({});

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [requiredSkills, userSkills] = await Promise.all([
          SkillsService.getSkillsForOccupation(occupationId),
          SkillsService.getUserSkills(userId)
        ]);

        setSkills(requiredSkills);
        const existingAssessments: Record<string, { level: number; confidence: number }> = {};
        // Convert user skills record to assessments
        Object.entries(userSkills).forEach(([skillId, assessment]) => {
          existingAssessments[skillId] = {
            level: assessment.level || 0,
            confidence: assessment.confidence || 0
          };
        });
        setAssessments(existingAssessments);
      } catch (error) {
        console.error('Error fetching skills:', error);
        setError('Failed to load skills data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [occupationId, userId]);

  const handleAssessment = async (skillId: string, level: number, confidence: number) => {
    try {
      await SkillsService.assessSkill(userId, skillId, { level, confidence });
      setAssessments(prev => ({
        ...prev,
        [skillId]: { level, confidence }
      }));
    } catch (err) {
      console.error('Error saving assessment:', err);
      setError('Failed to save assessment. Please try again.');
    }
  };

  const getSkillGapColor = (current: number, required: number) => {
    const gap = required - current;
    if (gap <= 0) return 'success.main';
    if (gap <= 2) return 'warning.main';
    return 'error.main';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Skills Assessment
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Assess your proficiency level for each required skill. Your assessment helps us provide personalized recommendations.
      </Typography>

      <Grid container spacing={3}>
        {skills.map((skill) => {
          const assessment = assessments[skill.id] || { level: 0, confidence: 0 };
          const gapColor = getSkillGapColor(assessment.level || 0, skill.required_level || 0);
          const tooltipTitle = `Required Level: ${skill.required_level}`;

          return (
            <Grid item xs={12} key={skill.id}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {skill.name}
                      </Typography>
                      <Chip 
                        label={skill.category} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                      />
                    </Box>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      {skill.description}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography gutterBottom>Current Proficiency Level</Typography>
                    <Slider
                      value={assessment.level}
                      min={0}
                      max={5}
                      step={1}
                      marks
                      onChange={(_, value) => handleAssessment(skill.id, value as number, assessment.confidence)}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `Level ${value}`}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography gutterBottom>Confidence in Assessment</Typography>
                    <Rating
                      value={assessment.confidence}
                      onChange={(_, value) => handleAssessment(skill.id, assessment.level, value || 0)}
                      max={3}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography variant="body2">Skill Gap:</Typography>
                      <Box flexGrow={1}>
                        <Tooltip title={tooltipTitle}>
                          <LinearProgress
                            variant="determinate"
                            value={(assessment.level / (skill.required_level || 0)) * 100}
                            sx={{ 
                              height: 10, 
                              borderRadius: 5,
                              bgcolor: 'grey.200',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: gapColor
                              }
                            }}
                          />
                        </Tooltip>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Required Level: {skill.required_level} | Importance: {skill.importance}%
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default SkillsAssessment;
