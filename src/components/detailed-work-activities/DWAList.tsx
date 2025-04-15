// src/components/detailed-work-activities/DWAList.tsx
// Version 1.3.0

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  LinearProgress,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  AssessmentOutlined as AssessmentIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { DetailedWorkActivity } from '@/types/detailedWorkActivities';
import { getDetailedWorkActivities } from '@/services/DetailedWorkActivitiesService';

interface DWAListProps {
  occupationCode: string;
  maxItems?: number;
  showImportance?: boolean;
  showFrequency?: boolean;
  compact?: boolean;
}

const DWAList: React.FC<DWAListProps> = ({
  occupationCode,
  maxItems,
  showImportance = true,
  showFrequency = true,
  compact = false
}) => {
  const [activities, setActivities] = useState<DetailedWorkActivity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<DetailedWorkActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const fetchActivities = async () => {
      if (!occupationCode) return;

      try {
        setLoading(true);
        const data = await getDetailedWorkActivities(occupationCode);
        setActivities(data);
        setFilteredActivities(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching detailed work activities:', err);
        setError('Failed to load detailed work activities');
        setLoading(false);
      }
    };

    fetchActivities();
  }, [occupationCode]);

  // Filter activities based on search term
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredActivities(activities);
    } else {
      const filtered = activities.filter(activity =>
        activity.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredActivities(filtered);
    }
  }, [searchTerm, activities]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Format importance or frequency as color and width for visual representation
  const getProgressProps = (value: number | undefined) => {
    if (value === undefined) return { color: 'primary' as const, width: 0 };

    // Normalize to 0-100 scale
    const normalizedValue = Math.min(100, Math.max(0, value * 20)); // Assuming 0-5 scale

    let color: 'success' | 'primary' | 'warning' | 'error' | 'info' = 'primary';

    if (normalizedValue >= 80) color = 'success';
    else if (normalizedValue >= 60) color = 'primary';
    else if (normalizedValue >= 40) color = 'info';
    else if (normalizedValue >= 20) color = 'warning';
    else color = 'error';

    return { color, width: normalizedValue };
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

  if (activities.length === 0) {
    return (
      <Alert severity="info">
        No detailed work activities available for this occupation.
      </Alert>
    );
  }

  // Limit the number of items if maxItems is set
  const displayActivities = maxItems
    ? filteredActivities.slice(0, maxItems)
    : filteredActivities;

  // Group activities by category
  const groupedActivities: Record<string, DetailedWorkActivity[]> = {};

  displayActivities.forEach(activity => {
    const category = activity.category || 'Uncategorized';
    if (!groupedActivities[category]) {
      groupedActivities[category] = [];
    }
    groupedActivities[category].push(activity);
  });

  // Sort categories alphabetically
  const sortedCategories = Object.keys(groupedActivities).sort();

  if (compact) {
    return (
      <Box>
        <List dense>
          {displayActivities.map((activity, index) => (
            <React.Fragment key={activity.id || index}>
              <ListItem sx={{ px: 1, py: 0.5 }}>
                <ListItemText
                  primary={activity.description}
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondary={activity.category}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
              {index < displayActivities.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>

        {maxItems && activities.length > maxItems && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Showing {maxItems} of {activities.length} activities
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box>
      {!maxItems && (
        <TextField
          fullWidth
          placeholder="Search activities..."
          value={searchTerm}
          onChange={handleSearchChange}
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
      )}

      {sortedCategories.map(category => (
        <Accordion key={category} defaultExpanded={sortedCategories.length <= 3}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`${category}-content`}
            id={`${category}-header`}
          >
            <Typography variant="subtitle1">
              {category} ({groupedActivities[category].length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {groupedActivities[category].map((activity, index) => (
                <React.Fragment key={activity.id || index}>
                  <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                    <ListItemText
                      primary={activity.description}
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          {showImportance && activity.importance !== undefined && (
                            <Box sx={{ mb: 1 }}>
                              <Typography variant="body2" component="span" sx={{ mr: 1, fontWeight: 500 }}>
                                Importance:
                              </Typography>
                              <Tooltip title={`Importance: ${activity.importance.toFixed(1)}/5`} arrow>
                                <Box sx={{ display: 'inline-flex', alignItems: 'center', width: '100%', maxWidth: 200 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={getProgressProps(activity.importance).width}
                                    color={getProgressProps(activity.importance).color}
                                    sx={{ height: 8, borderRadius: 4, flex: 1, mr: 1 }}
                                  />
                                  <Typography variant="caption">
                                    {activity.importance.toFixed(1)}
                                  </Typography>
                                </Box>
                              </Tooltip>
                            </Box>
                          )}

                          {showFrequency && activity.frequency !== undefined && (
                            <Box>
                              <Typography variant="body2" component="span" sx={{ mr: 1, fontWeight: 500 }}>
                                Frequency:
                              </Typography>
                              <Tooltip title={`Frequency: ${activity.frequency.toFixed(1)}/5`} arrow>
                                <Box sx={{ display: 'inline-flex', alignItems: 'center', width: '100%', maxWidth: 200 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={getProgressProps(activity.frequency).width}
                                    color={getProgressProps(activity.frequency).color}
                                    sx={{ height: 8, borderRadius: 4, flex: 1, mr: 1 }}
                                  />
                                  <Typography variant="caption">
                                    {activity.frequency.toFixed(1)}
                                  </Typography>
                                </Box>
                              </Tooltip>
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < groupedActivities[category].length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      ))}

      {maxItems && activities.length > maxItems && (
        <Box sx={{ mt: 2 }}>
          <Chip
            label={`Showing ${maxItems} of ${activities.length} activities`}
            variant="outlined"
            size="small"
          />
        </Box>
      )}

      {filteredActivities.length === 0 && searchTerm !== '' && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No activities found matching "{searchTerm}"
        </Alert>
      )}
    </Box>
  );
};

export default DWAList;
