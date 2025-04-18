import React from 'react';
import {
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Chip,
  Grid,
  Card,
  CardContent,
  Stack,
  Alert
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import VerifiedIcon from '@mui/icons-material/Verified';
import { CareerAdvancementPlan } from '../../types/careerPathways';

interface SkillGapAnalysisProps {
  advancementPlan: CareerAdvancementPlan;
}

const SkillGapAnalysis: React.FC<SkillGapAnalysisProps> = ({ advancementPlan }) => {
  const {
    target_occupation,
    skill_gaps,
    education_gap,
    experience_gap,
    certification_gaps,
    estimated_time_to_achieve,
    recommended_steps
  } = advancementPlan;

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="subtitle1" gutterBottom>
          To advance to <strong>{target_occupation.title}</strong>, you'll need to develop the following:
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          {/* Skills section */}
          <Card sx={{ mb: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Skills to Develop
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {skill_gaps.length > 0 ? (
                <List disablePadding>
                  {skill_gaps.map((skill, index) => (
                    <ListItem
                      key={index}
                      disablePadding
                      sx={{
                        mb: 2,
                        flexDirection: 'column',
                        alignItems: 'flex-start'
                      }}
                    >
                      <Box width="100%" mb={1}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                          <Typography variant="subtitle2">{skill.name}</Typography>
                          <Typography variant="body2">
                            Level {skill.current_level} → {skill.required_level}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" width="100%">
                          <Box width="100%" mr={1}>
                            <LinearProgress
                              variant="determinate"
                              value={((skill.current_level || 0) / (skill.required_level || 1)) * 100}
                              sx={{
                                height: 8,
                                borderRadius: 1,
                                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: '#2196f3'
                                }
                              }}
                            />
                          </Box>
                          <Chip
                            label={`Gap: ${skill.gap}`}
                            size="small"
                            color={(skill.gap || 0) > 2 ? "error" : (skill.gap || 0) > 1 ? "warning" : "info"}
                          />
                        </Box>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No skill gaps identified.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          {/* Education and Experience section */}
          <Card sx={{ mb: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Education & Experience
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                <Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <SchoolIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="subtitle2">Education</Typography>
                  </Box>
                  <Box pl={4}>
                    <Typography variant="body2" gutterBottom>
                      Current: {education_gap.current}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Required: {education_gap.required}
                    </Typography>
                    {education_gap.gap ? (
                      <Chip
                        label="Gap exists"
                        size="small"
                        color="warning"
                        sx={{ mt: 0.5 }}
                      />
                    ) : (
                      <Chip
                        label="Requirement met"
                        size="small"
                        color="success"
                        sx={{ mt: 0.5 }}
                      />
                    )}
                  </Box>
                </Box>

                <Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <WorkIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="subtitle2">Experience</Typography>
                  </Box>
                  <Box pl={4}>
                    <Typography variant="body2" gutterBottom>
                      Current: {experience_gap.current}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Required: {experience_gap.required}
                    </Typography>
                    {experience_gap.gap ? (
                      <Chip
                        label="Gap exists"
                        size="small"
                        color="warning"
                        sx={{ mt: 0.5 }}
                      />
                    ) : (
                      <Chip
                        label="Requirement met"
                        size="small"
                        color="success"
                        sx={{ mt: 0.5 }}
                      />
                    )}
                  </Box>
                </Box>

                {certification_gaps.length > 0 && (
                  <Box>
                    <Box display="flex" alignItems="center" mb={1}>
                      <VerifiedIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="subtitle2">Certifications Needed</Typography>
                    </Box>
                    <Box pl={4}>
                      <List disablePadding dense>
                        {certification_gaps.map((cert, index) => (
                          <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                            <ListItemText primary={cert.name} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          {/* Advancement Plan section */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Advancement Plan
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Estimated Time to Achieve:
                </Typography>
                <Chip
                  label={estimated_time_to_achieve}
                  color="primary"
                  sx={{ fontWeight: 'medium' }}
                />
              </Box>

              <Typography variant="subtitle2" gutterBottom>
                Recommended Steps:
              </Typography>
              <List>
                {recommended_steps.map((step, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemText
                      primary={`${index + 1}. ${step}`}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>

              <Alert severity="info" sx={{ mt: 2 }}>
                This plan is a general guideline. Actual requirements may vary by employer and location.
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SkillGapAnalysis;
