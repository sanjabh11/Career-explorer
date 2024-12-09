import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Grid,
  Chip,
  Tooltip
} from '@mui/material';
import { Skill } from '../../types/skills';
import SkillsService from '../../services/SkillsService';

interface SkillGap {
  skill: Skill;
  gap: number;
  priority: 'high' | 'medium' | 'low';
}

interface SkillsGapAnalysisProps {
  occupationId: string;
  currentSkills: Skill[];
}

const SkillsGapAnalysis: React.FC<SkillsGapAnalysisProps> = ({
  occupationId,
  currentSkills
}) => {
  const [loading, setLoading] = useState(true);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);

  useEffect(() => {
    const analyzeSkillGaps = async () => {
      try {
        // Get required skills for the occupation
        const requiredSkills = await SkillsService.getSkillsForOccupation(occupationId);
        
        // Calculate gaps
        const gaps = requiredSkills.map(requiredSkill => {
          const currentSkill = currentSkills.find(s => s.id === requiredSkill.id);
          const currentLevel = currentSkill?.current_level || 0;
          const gap = requiredSkill.required_level - currentLevel;
          
          return {
            skill: requiredSkill,
            gap: Math.max(0, gap),
            priority: getPriority(gap, requiredSkill.importance || 0)
          };
        });

        // Sort by priority and gap size
        const sortedGaps = gaps.sort((a, b) => {
          if (a.priority === b.priority) {
            return b.gap - a.gap;
          }
          return getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
        });

        setSkillGaps(sortedGaps);
        setLoading(false);
      } catch (error) {
        console.error('Error analyzing skill gaps:', error);
        setLoading(false);
      }
    };

    analyzeSkillGaps();
  }, [occupationId, currentSkills]);

  const getPriority = (gap: number, importance: number): 'high' | 'medium' | 'low' => {
    const score = gap * importance;
    if (score > 3) return 'high';
    if (score > 1.5) return 'medium';
    return 'low';
  };

  const getPriorityWeight = (priority: 'high' | 'medium' | 'low'): number => {
    switch (priority) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
    }
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low'): 'error' | 'warning' | 'success' => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Skills Gap Analysis
      </Typography>
      <Grid container spacing={2}>
        {skillGaps.map(({ skill, gap, priority }) => (
          <Grid item xs={12} key={skill.id}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                  {skill.name}
                </Typography>
                <Chip
                  label={`Priority: ${priority}`}
                  color={getPriorityColor(priority)}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <Typography variant="body2" sx={{ minWidth: 100 }}>
                  Current: {skill.current_level}
                </Typography>
                <Box sx={{ flexGrow: 1, mx: 2 }}>
                  <Tooltip title={`Gap: ${gap} levels`}>
                    <LinearProgress
                      variant="determinate"
                      value={((skill.current_level || 0) / skill.required_level) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Tooltip>
                </Box>
                <Typography variant="body2" sx={{ minWidth: 100 }}>
                  Required: {skill.required_level}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SkillsGapAnalysis;
