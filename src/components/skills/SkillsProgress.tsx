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
  Divider,
  Stack,
  IconButton,
  Tooltip,
  Menu,
  MenuItem
} from '@mui/material';
import DateRangeIcon from '@mui/icons-material/DateRange';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Skill } from '../../types/skills';
import SkillsService from '../../services/SkillsService';

interface SkillsProgressProps {
  occupationId: string;
  userId: string;
}

interface UserSkill {
  level?: number;
  confidence?: number;
  lastUpdated?: string;
}

interface SkillProgress {
  skillId: string;
  skillName: string;
  currentLevel: number;
  targetLevel: number;
  confidence: number;
  lastUpdated?: string;
  category: string;
  importance: number;
}

const SkillsProgress: React.FC<SkillsProgressProps> = ({
  occupationId,
  userId,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<SkillProgress[]>([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'inProgress' | 'completed'>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [requiredSkills, userSkills] = await Promise.all([
          SkillsService.getSkillsForOccupation(occupationId),
          SkillsService.getUserSkills(userId)
        ]);

        // Combine user skills with required skills to create progress data
        const progress = requiredSkills.map(requiredSkill => {
          const userSkill: UserSkill = userSkills.find(skill => skill.id === requiredSkill.id) || { level: 0, confidence: 0, lastUpdated: new Date().toISOString() };
          return {
            skillId: requiredSkill.id,
            skillName: requiredSkill.name,
            currentLevel: userSkill.level ?? 0,
            targetLevel: requiredSkill.required_level ?? 0,
            confidence: userSkill.confidence ?? 0,
            lastUpdated: userSkill.lastUpdated ?? new Date().toISOString(),
            category: requiredSkill.category,
            importance: requiredSkill.importance ?? 0,
          };
        });

        setProgressData(progress);
      } catch (error) {
        console.error('Error fetching skill progress:', error);
        setError('Failed to load skill progress data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [occupationId, userId]);

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 100) return 'success';
    if (percentage >= 70) return 'info';
    if (percentage >= 40) return 'warning';
    return 'error';
  };

  const getProgressStatus = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 100) return 'Completed';
    if (percentage >= 70) return 'Advanced';
    if (percentage >= 40) return 'Intermediate';
    return 'Beginner';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not yet assessed';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  const filteredProgress = progressData.filter(progress => {
    switch (selectedFilter) {
      case 'completed':
        return progress.currentLevel >= progress.targetLevel;
      case 'inProgress':
        return progress.currentLevel < progress.targetLevel;
      default:
        return true;
    }
  });

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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Skills Progress Tracking</Typography>
        <Box>
          <Tooltip title="Filter Progress">
            <IconButton onClick={(e) => setFilterAnchorEl(e.currentTarget)}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={() => setFilterAnchorEl(null)}
          >
            <MenuItem 
              onClick={() => { setSelectedFilter('all'); setFilterAnchorEl(null); }}
              selected={selectedFilter === 'all'}
            >
              All Skills
            </MenuItem>
            <MenuItem 
              onClick={() => { setSelectedFilter('inProgress'); setFilterAnchorEl(null); }}
              selected={selectedFilter === 'inProgress'}
            >
              In Progress
            </MenuItem>
            <MenuItem 
              onClick={() => { setSelectedFilter('completed'); setFilterAnchorEl(null); }}
              selected={selectedFilter === 'completed'}
            >
              Completed
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {filteredProgress.map((progress) => (
          <Grid item xs={12} key={progress.skillId}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {progress.skillName}
                  </Typography>
                  <Chip
                    label={getProgressStatus(progress.currentLevel, progress.targetLevel)}
                    color={getProgressColor(progress.currentLevel, progress.targetLevel)}
                    size="small"
                  />
                </Box>

                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      Progress: Level {progress.currentLevel} / {progress.targetLevel}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {Math.round((progress.currentLevel / progress.targetLevel) * 100)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(progress.currentLevel / progress.targetLevel) * 100}
                    color={getProgressColor(progress.currentLevel, progress.targetLevel)}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                <Stack spacing={2} divider={<Divider flexItem />}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <DateRangeIcon color="action" />
                    <Box>
                      <Typography variant="body2">
                        Last Updated: {formatDate(progress.lastUpdated)}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>

                <Box display="flex" gap={1} mt={2}>
                  <Button
                    size="small"
                    startIcon={<TrendingUpIcon />}
                    variant="outlined"
                    onClick={() => {
                      // TODO: Implement update progress
                      console.log('Update progress');
                    }}
                  >
                    Update Progress
                  </Button>
                  <Button
                    size="small"
                    startIcon={<EmojiEventsIcon />}
                    variant="outlined"
                    onClick={() => {
                      // TODO: Implement add milestone
                      console.log('Add milestone');
                    }}
                  >
                    Add Milestone
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SkillsProgress;
