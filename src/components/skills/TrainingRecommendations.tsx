import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  Paper,
  Chip,
  Alert,
  Card,
  CardContent,
  CardActions,
  Button,
  Rating,
  LinearProgress,
  Link,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SchoolIcon from '@mui/icons-material/School';
import TimerIcon from '@mui/icons-material/Timer';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { LearningResource } from '../../types/skills';
import SkillsService from '../../services/SkillsService';

interface TrainingRecommendationsProps {
  occupationId: string;
  userId: string;
}

interface RecommendationGroup {
  skill: string;
  gap: number;
  training_resources: LearningResource[];
}

const TrainingRecommendations: React.FC<TrainingRecommendationsProps> = ({
  occupationId,
  userId,
}) => {
  const [recommendations, setRecommendations] = useState<RecommendationGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, [occupationId, userId]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const data = await SkillsService.getTrainingRecommendations(userId, occupationId);
      setRecommendations(data);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to fetch training recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getGapSeverity = (gap: number) => {
    if (gap <= 1) return { color: 'success', label: 'Minor Gap' };
    if (gap <= 2) return { color: 'warning', label: 'Moderate Gap' };
    return { color: 'error', label: 'Significant Gap' };
  };

  const renderResourceTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'course':
        return <SchoolIcon />;
      case 'certification':
        return <SchoolIcon />;
      default:
        return <SchoolIcon />;
    }
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

  if (!recommendations.length) {
    return (
      <Alert severity="info">
        No training recommendations available at this time. Your skills may already meet the requirements!
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Training Recommendations
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Based on your skill assessment, here are personalized training recommendations to help you develop the required skills.
      </Typography>

      {recommendations.map((group, index) => {
        const { color, label } = getGapSeverity(group.gap);
        
        return (
          <Accordion key={index} defaultExpanded={index === 0}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                  {group.skill}
                </Typography>
                <Chip 
                  label={label}
                  color={color as any}
                  size="small"
                  sx={{ minWidth: 100 }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box mb={2}>
                    <Typography variant="body2" gutterBottom>Skill Gap Progress</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.max(0, Math.min(100, (5 - group.gap) * 20))}
                      sx={{ height: 8, borderRadius: 4 }}
                      color={color as any}
                    />
                  </Box>
                </Grid>

                {group.training_resources.map((resource, resourceIndex) => (
                  <Grid item xs={12} md={6} key={resourceIndex}>
                    <Card>
                      <CardContent>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          {renderResourceTypeIcon(resource.type)}
                          <Typography variant="subtitle1">
                            {resource.title}
                          </Typography>
                        </Box>

                        <Typography variant="body2" color="textSecondary" paragraph>
                          {resource.provider}
                        </Typography>

                        <Box display="flex" gap={2} mb={1}>
                          {resource.duration && (
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <TimerIcon fontSize="small" />
                              <Typography variant="body2">{resource.duration}</Typography>
                            </Box>
                          )}
                          {resource.level && (
                            <Chip 
                              label={resource.level}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>

                        {resource.cost && (
                          <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                            <AttachMoneyIcon fontSize="small" />
                            <Typography variant="body2">{resource.cost}</Typography>
                          </Box>
                        )}
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          component={Link}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Learn More
                        </Button>
                        <Rating 
                          size="small"
                          value={0}
                          onChange={(_, value) => {
                            // TODO: Implement resource rating
                            console.log('Rating:', value);
                          }}
                        />
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

export default TrainingRecommendations;
