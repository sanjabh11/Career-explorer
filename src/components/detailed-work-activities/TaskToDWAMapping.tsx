// src/components/detailed-work-activities/TaskToDWAMapping.tsx
// Version 1.3.0

import React, { useState, useEffect, useMemo } from 'react';
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Link as LinkIcon,
  ArrowRight as ArrowRightIcon,
  Assignment as AssignmentIcon,
  CompareArrows as CompareArrowsIcon
} from '@mui/icons-material';
import { TaskToDWA, Task, DetailedWorkActivity } from '@/types/detailedWorkActivities';
import { getTaskToDWAMapping } from '@/services/DetailedWorkActivitiesService';

interface TaskToDWAMappingProps {
  occupationCode: string;
  mode?: 'matrix' | 'list' | 'grouped';
}

const TaskToDWAMapping: React.FC<TaskToDWAMappingProps> = ({
  occupationCode,
  mode = 'grouped'
}) => {
  const [mapping, setMapping] = useState<TaskToDWA | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMapping = async () => {
      if (!occupationCode) return;

      try {
        setLoading(true);
        const data = await getTaskToDWAMapping(occupationCode);
        setMapping(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching task to DWA mapping:', err);
        setError('Failed to load task to DWA mapping');
        setLoading(false);
      }
    };

    fetchMapping();
  }, [occupationCode]);

  // Organize the data for matrix view
  const matrixData = useMemo(() => {
    if (!mapping) return { tasks: [], activities: [], connections: [] };

    const tasks = [...mapping.tasks].sort((a, b) => (b.importance || 0) - (a.importance || 0));
    const activities = [...mapping.activities].sort((a, b) => {
      const aImportance = a.importance || 0;
      const bImportance = b.importance || 0;
      return bImportance - aImportance;
    });

    return {
      tasks,
      activities,
      connections: mapping.connections
    };
  }, [mapping]);

  // Group activities by task
  const groupedByTask = useMemo(() => {
    if (!mapping) return new Map<string, DetailedWorkActivity[]>();

    const grouped = new Map<string, DetailedWorkActivity[]>();

    for (const task of mapping.tasks) {
      const connectedActivityIds = mapping.connections
        .filter((conn: {taskId: string; activityId: string}) => conn.taskId === task.id)
        .map((conn: {taskId: string; activityId: string}) => conn.activityId);

      const connectedActivities = mapping.activities
        .filter((activity: DetailedWorkActivity) => connectedActivityIds.includes(activity.id))
        .sort((a: DetailedWorkActivity, b: DetailedWorkActivity) => {
          const aImportance = a.importance || 0;
          const bImportance = b.importance || 0;
          return bImportance - aImportance;
        });

      grouped.set(task.id, connectedActivities);
    }

    return grouped;
  }, [mapping]);

  // Group tasks by activity
  const groupedByActivity = useMemo(() => {
    if (!mapping) return new Map<string, Task[]>();

    const grouped = new Map<string, Task[]>();

    for (const activity of mapping.activities) {
      const connectedTaskIds = mapping.connections
        .filter((conn: {taskId: string; activityId: string}) => conn.activityId === activity.id)
        .map((conn: {taskId: string; activityId: string}) => conn.taskId);

      const connectedTasks = mapping.tasks
        .filter((task: Task) => connectedTaskIds.includes(task.id))
        .sort((a: Task, b: Task) => (b.importance || 0) - (a.importance || 0));

      grouped.set(activity.id, connectedTasks);
    }

    return grouped;
  }, [mapping]);

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

  if (!mapping || mapping.connections.length === 0) {
    return (
      <Alert severity="info">
        No task to DWA mapping available for this occupation.
      </Alert>
    );
  }

  // Matrix view
  if (mode === 'matrix') {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Task to Detailed Work Activity Matrix
        </Typography>

        <Paper variant="outlined" sx={{ overflow: 'auto', maxHeight: 600 }}>
          <TableContainer>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: 300, fontWeight: 'bold' }}>Tasks</TableCell>
                  {matrixData.activities.map((activity) => (
                    <TableCell
                      key={activity.id}
                      align="center"
                      sx={{ minWidth: 120, maxWidth: 150, p: 1 }}
                    >
                      <Tooltip title={activity.description} arrow>
                        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center' }}>
                          {activity.description.length > 40
                            ? `${activity.description.substring(0, 40)}...`
                            : activity.description}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {matrixData.tasks.map((task) => (
                  <TableRow key={task.id} hover>
                    <TableCell sx={{ p: 1 }}>
                      <Tooltip title={`Importance: ${(task.importance || 0).toFixed(1)}/5`} arrow>
                        <Typography variant="body2">
                          {task.description}
                        </Typography>
                      </Tooltip>
                    </TableCell>

                    {matrixData.activities.map((activity) => {
                      const connection = matrixData.connections.find(
                        (conn: {taskId: string; activityId: string}) => conn.taskId === task.id && conn.activityId === activity.id
                      );

                      return (
                        <TableCell key={`${task.id}-${activity.id}`} align="center" padding="none">
                          {connection ? (
                            <Tooltip title="Connected" arrow>
                              <LinkIcon color="primary" fontSize="small" />
                            </Tooltip>
                          ) : null}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    );
  }

  // List view
  if (mode === 'list') {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Task to Detailed Work Activity Connections
        </Typography>

        <List>
          {mapping.connections.map((connection: {taskId: string; activityId: string}, index: number) => {
            const task = mapping.tasks.find((t: Task) => t.id === connection.taskId);
            const activity = mapping.activities.find((a: DetailedWorkActivity) => a.id === connection.activityId);

            if (!task || !activity) return null;

            return (
              <React.Fragment key={`${connection.taskId}-${connection.activityId}`}>
                <ListItem alignItems="flex-start">
                  <Grid container spacing={2}>
                    <Grid item xs={5}>
                      <Typography variant="subtitle2" color="primary">
                        Task:
                      </Typography>
                      <Typography variant="body2">
                        {task.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Importance: {(task.importance || 0).toFixed(1)}/5
                      </Typography>
                    </Grid>

                    <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <ArrowRightIcon fontSize="large" color="action" />
                    </Grid>

                    <Grid item xs={5}>
                      <Typography variant="subtitle2" color="primary">
                        Detailed Work Activity:
                      </Typography>
                      <Typography variant="body2">
                        {activity.description}
                      </Typography>
                      {activity.importance !== undefined && (
                        <Typography variant="caption" color="text.secondary">
                          Importance: {activity.importance.toFixed(1)}/5
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </ListItem>
                {index < mapping.connections.length - 1 && <Divider />}
              </React.Fragment>
            );
          })}
        </List>
      </Box>
    );
  }

  // Grouped view (default)
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Tasks and Related Detailed Work Activities
      </Typography>

      {/* Tasks with their related activities */}
      {mapping.tasks
        .sort((a: Task, b: Task) => (b.importance || 0) - (a.importance || 0))
        .map((task: Task) => {
          const relatedActivities = groupedByTask.get(task.id) || [];

          return (
            <Accordion
              key={task.id}
              expanded={selectedTaskId === task.id}
              onChange={() => setSelectedTaskId(selectedTaskId === task.id ? null : task.id)}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <AssignmentIcon sx={{ mr: 1 }} color="primary" />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1">
                      {task.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Chip
                        label={`Importance: ${(task.importance || 0).toFixed(1)}/5`}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={`${relatedActivities.length} related activities`}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    </Box>
                  </Box>
                </Box>
              </AccordionSummary>

              <AccordionDetails>
                <List sx={{ pl: 4 }}>
                  {relatedActivities.map((activity) => (
                    <ListItem key={activity.id} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CompareArrowsIcon fontSize="small" color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.description}
                        secondary={activity.category && `Category: ${activity.category}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          );
        })}

      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Detailed Work Activities and Related Tasks
        </Typography>

        {/* Activities with their related tasks */}
        {mapping.activities
          .sort((a: DetailedWorkActivity, b: DetailedWorkActivity) => {
            const aImportance = a.importance || 0;
            const bImportance = b.importance || 0;
            return bImportance - aImportance;
          })
          .map((activity: DetailedWorkActivity) => {
            const relatedTasks = groupedByActivity.get(activity.id) || [];

            return (
              <Card key={activity.id} variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <CompareArrowsIcon sx={{ mr: 1, mt: 0.5 }} color="primary" />
                    <Box>
                      <Typography variant="subtitle1">
                        {activity.description}
                      </Typography>

                      {activity.category && (
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Category: {activity.category}
                        </Typography>
                      )}

                      {activity.importance !== undefined && (
                        <Chip
                          label={`Importance: ${activity.importance.toFixed(1)}/5`}
                          size="small"
                          variant="outlined"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2" gutterBottom>
                    Related Tasks ({relatedTasks.length}):
                  </Typography>

                  <List dense>
                    {relatedTasks.map((task) => (
                      <ListItem key={task.id}>
                        <ListItemText
                          primary={task.description}
                          secondary={`Importance: ${(task.importance || 0).toFixed(1)}/5`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            );
          })}
      </Box>
    </Box>
  );
};

export default TaskToDWAMapping;
