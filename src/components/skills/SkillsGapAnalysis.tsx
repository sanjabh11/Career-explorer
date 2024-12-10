import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  currentLevel: number;
  gap: number;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
}

interface SkillsGapAnalysisProps {
  userSkills: Skill[];
  requiredSkills: Skill[];
}

const SkillsGapAnalysis: React.FC<SkillsGapAnalysisProps> = ({
  userSkills,
  requiredSkills
}) => {
  const [loading, setLoading] = useState(true);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [gaps, setGaps] = useState<{ missing: Skill[]; improvement: Skill[]; possessed: Skill[] }>({
    missing: [],
    improvement: [],
    possessed: [],
  });

  useEffect(() => {
    const analyzeSkillGaps = async () => {
      try {
        // Calculate gaps
        const gaps = requiredSkills.map(requiredSkill => {
          const currentSkill = userSkills.find(s => s.id === requiredSkill.id);
          const currentLevel = currentSkill?.current_level || 0;
          const gap = (requiredSkill.required_level || 0) - (currentLevel || 0);

          return {
            skill: requiredSkill,
            currentLevel: currentLevel,
            gap: Math.max(0, gap),
            confidence: currentSkill?.confidence || 0,
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

        const missing = requiredSkills.filter(reqSkill => !userSkills.find(userSkill => userSkill.id === reqSkill.id));
        const improvement = userSkills.filter(userSkill => {
          const reqSkill = requiredSkills.find(req => req.id === userSkill.id);
          return reqSkill && userSkill.importance !== undefined && reqSkill.importance !== undefined && userSkill.importance < reqSkill.importance;
        });
        const possessed = userSkills.filter(userSkill => requiredSkills.find(req => req.id === userSkill.id));

        setGaps({ missing, improvement, possessed });

        setLoading(false);
      } catch (error) {
        console.error('Error analyzing skill gaps:', error);
        setLoading(false);
      }
    };

    analyzeSkillGaps();
  }, [userSkills, requiredSkills]);

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
        {skillGaps.map(({ skill, currentLevel, gap, confidence, priority }) => (
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
                  Current: {currentLevel}
                </Typography>
                <Box sx={{ flexGrow: 1, mx: 2 }}>
                  <Tooltip title={`Gap: ${gap} levels`}>
                    <LinearProgress
                      variant="determinate"
                      value={((currentLevel || 0) / (skill.required_level || 0)) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Tooltip>
                </Box>
                <Typography variant="body2" sx={{ minWidth: 100 }}>
                  Required: {skill.required_level || 0}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Skills Gap Analysis</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Skill</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {gaps.missing.map(skill => (
                <TableRow key={skill.id}>
                  <TableCell>{skill.name}</TableCell>
                  <TableCell>Missing</TableCell>
                </TableRow>
              ))}
              {gaps.improvement.map(skill => (
                <TableRow key={skill.id}>
                  <TableCell>{skill.name}</TableCell>
                  <TableCell>Needs Improvement</TableCell>
                </TableRow>
              ))}
              {gaps.possessed.map(skill => (
                <TableRow key={skill.id}>
                  <TableCell>{skill.name}</TableCell>
                  <TableCell>Possessed</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default SkillsGapAnalysis;
