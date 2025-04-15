// src/components/technology-skills/HotTechnologies.tsx
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
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
  IconButton,
  Avatar
} from '@mui/material';
import {
  Whatshot as WhatshotIcon,
  TrendingUp as TrendingUpIcon,
  Computer as ComputerIcon,
  Work as WorkIcon,
  Info as InfoIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { HotTechnology, TechnologyTrend } from '@/types/technologySkills';
import { getHotTechnologies } from '@/services/TechnologySkillsService';

interface HotTechnologiesProps {
  industryCode?: string;
  limit?: number;
  showRelatedOccupations?: boolean;
  onViewTechnology?: (id: string) => void;
  onViewOccupation?: (code: string) => void;
}

const HotTechnologies: React.FC<HotTechnologiesProps> = ({
  industryCode,
  limit = 10,
  showRelatedOccupations = true,
  onViewTechnology,
  onViewOccupation
}) => {
  const [hotTechnologies, setHotTechnologies] = useState<HotTechnology[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getHotTechnologies(industryCode);
        setHotTechnologies(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching hot technologies:', err);
        setError('Failed to load hot technologies');
        setLoading(false);
      }
    };

    fetchData();
  }, [industryCode]);

  const getTrendColor = (trend?: string): string => {
    if (!trend) return '#9e9e9e'; // Grey for undefined
    switch (trend) {
      case 'emerging':
        return '#4caf50'; // Green
      case 'growing':
        return '#2196f3'; // Blue
      case 'stable':
        return '#ff9800'; // Orange
      case 'declining':
        return '#f44336'; // Red
      default:
        return '#9e9e9e'; // Grey
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={2}>
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

  if (hotTechnologies.length === 0) {
    return (
      <Alert severity="info">
        No hot technologies data available.
      </Alert>
    );
  }

  // Limit the number of technologies to display
  const displayTechnologies = hotTechnologies.slice(0, limit);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Hot Technologies
        {industryCode && <Typography variant="caption" sx={{ ml: 1 }}>in Selected Industry</Typography>}
      </Typography>

      <Typography variant="body2" paragraph>
        These technologies are currently in high demand in the job market, with growing adoption rates and increasing importance across industries.
      </Typography>

      <Grid container spacing={3}>
        {displayTechnologies.map((tech) => (
          <Grid item xs={12} sm={6} md={4} key={tech.id}>
            <Card
              variant="outlined"
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: 2
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Avatar
                    sx={{
                      bgcolor: getTrendColor(tech.trend),
                      width: 32,
                      height: 32,
                      mr: 1
                    }}
                  >
                    <WhatshotIcon fontSize="small" />
                  </Avatar>
                  <Typography variant="h6" component="div">
                    {tech.name}
                  </Typography>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Typography variant="body2" color="text.secondary" paragraph>
                  {tech.description}
                </Typography>

                <Box display="flex" flexWrap="wrap" mt={2}>
                  <Chip
                    icon={<WhatshotIcon />}
                    label="Hot Technology"
                    color="error"
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />

                  <Chip
                    icon={<TrendingUpIcon />}
                    label={tech.trend}
                    color={
                      tech.trend === 'emerging' ? 'success' :
                      tech.trend === 'growing' ? 'primary' :
                      tech.trend === 'stable' ? 'warning' :
                      'default'
                    }
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />

                  {tech.category && (
                    <Chip
                      icon={<ComputerIcon />}
                      label={tech.category}
                      variant="outlined"
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  )}

                  {tech.growthRate !== undefined && (
                    <Chip
                      label={`${tech.growthRate > 0 ? '+' : ''}${tech.growthRate}% growth`}
                      variant="outlined"
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  )}
                </Box>

                {showRelatedOccupations && tech.relatedOccupations && tech.relatedOccupations.length > 0 && (
                  <Box mt={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      Related Occupations:
                    </Typography>
                    <List dense disablePadding>
                      {tech.relatedOccupations.slice(0, 3).map((occupation: {code: string; title: string; relevance: number}, index: number) => (
                        <ListItem
                          key={occupation.code}
                          disablePadding
                          disableGutters
                          sx={{ mb: 0.5 }}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <WorkIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Button
                                variant="text"
                                size="small"
                                sx={{ p: 0, textAlign: 'left', textTransform: 'none' }}
                                onClick={() => onViewOccupation && onViewOccupation(occupation.code)}
                              >
                                {occupation.title}
                              </Button>
                            }
                          />
                        </ListItem>
                      ))}

                      {tech.relatedOccupations.length > 3 && (
                        <Typography variant="caption" color="text.secondary">
                          +{tech.relatedOccupations.length - 3} more occupations
                        </Typography>
                      )}
                    </List>
                  </Box>
                )}
              </CardContent>

              <CardActions>
                {onViewTechnology && (
                  <Button
                    size="small"
                    onClick={() => onViewTechnology(tech.id)}
                  >
                    View Details
                  </Button>
                )}

                {tech.resourceUrl && (
                  <Button
                    size="small"
                    component="a"
                    href={tech.resourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Learn More
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {hotTechnologies.length > limit && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Button variant="outlined">
            View All {hotTechnologies.length} Hot Technologies
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default HotTechnologies;
