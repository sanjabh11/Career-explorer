import React, { useState } from 'react';
import {
  Box,
  Typography,
  Slider,
  Button,
  Paper,
  Grid,
  Rating,
  Tooltip
} from '@mui/material';
import { Skill } from '../../types/skills';

interface SkillAssessmentProps {
  skill: Skill;
  onAssessmentComplete: (skillId: string, level: number) => void;
}

const proficiencyLevels = [
  { value: 1, label: 'Novice', description: 'Basic understanding, needs guidance' },
  { value: 2, label: 'Advanced Beginner', description: 'Can perform with some supervision' },
  { value: 3, label: 'Competent', description: 'Works independently on routine tasks' },
  { value: 4, label: 'Proficient', description: 'Handles complex situations well' },
  { value: 5, label: 'Expert', description: 'Deep understanding, can teach others' }
];

const SkillAssessment: React.FC<SkillAssessmentProps> = ({
  skill,
  onAssessmentComplete
}) => {
  const [currentLevel, setCurrentLevel] = useState<number>(skill.current_level);
  const [confidence, setConfidence] = useState<number>(3);

  const handleLevelChange = (event: Event, newValue: number | number[]) => {
    setCurrentLevel(newValue as number);
  };

  const handleSubmit = () => {
    onAssessmentComplete(skill.id, currentLevel);
  };

  const getCurrentLevelDescription = () => {
    const level = proficiencyLevels.find(l => l.value === currentLevel);
    return level ? level.description : '';
  };

  return (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        {skill.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        {skill.description}
      </Typography>

      <Box sx={{ mt: 4 }}>
        <Typography gutterBottom>Current Proficiency Level</Typography>
        <Slider
          value={currentLevel}
          onChange={handleLevelChange}
          step={1}
          marks={proficiencyLevels.map(level => ({
            value: level.value,
            label: level.label
          }))}
          min={1}
          max={5}
          valueLabelDisplay="auto"
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {getCurrentLevelDescription()}
        </Typography>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography gutterBottom>How confident are you in this assessment?</Typography>
        <Rating
          value={confidence}
          onChange={(event, newValue) => {
            setConfidence(newValue || 3);
          }}
          max={5}
        />
      </Box>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="body2" color="text.secondary">
          Required level: {skill.required_level}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={currentLevel === skill.current_level}
        >
          Save Assessment
        </Button>
      </Box>
    </Paper>
  );
};

export default SkillAssessment;
