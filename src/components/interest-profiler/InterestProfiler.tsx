// src/components/interest-profiler/InterestProfiler.tsx
// Version 1.3.0

import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  CardActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import InterestProfilerQuestions from './InterestProfilerQuestions';
import InterestProfilerResults from './InterestProfilerResults';

interface InterestProfilerProps {
  onViewOccupation: (code: string) => void;
}

type FormType = 'standard' | 'short' | 'mini';

const InterestProfiler: React.FC<InterestProfilerProps> = ({ onViewOccupation }) => {
  const [started, setStarted] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);
  const [answers, setAnswers] = useState<Map<number, number>>(new Map());
  const [formType, setFormType] = useState<FormType>('short');
  
  const handleStart = () => {
    setStarted(true);
  };
  
  const handleComplete = (questionAnswers: Map<number, number>) => {
    setAnswers(questionAnswers);
    setCompleted(true);
  };
  
  const handleReset = () => {
    setStarted(false);
    setCompleted(false);
    setAnswers(new Map());
  };
  
  const handleFormTypeChange = (event: SelectChangeEvent) => {
    setFormType(event.target.value as FormType);
  };
  
  const getFormLength = (type: FormType): number => {
    switch (type) {
      case 'standard': return 180;
      case 'short': return 60;
      case 'mini': return 30;
      default: return 60;
    }
  };
  
  if (!started) {
    return (
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            O*NET Interest Profiler
          </Typography>
          
          <Typography variant="body1" paragraph>
            The O*NET Interest Profiler can help you find out what your occupational interests are and how they relate to the world of work. 
            It will help you identify which careers might be a good fit based on your interests.
          </Typography>
          
          <Typography variant="body1" paragraph>
            You'll be shown various work activities and asked to rate how much you would enjoy doing each one. 
            Your responses will be used to identify careers that match your interests.
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 2, mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Standard Version
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    180 questions
                  </Typography>
                  <Typography variant="body2" paragraph>
                    The complete assessment for the most accurate results.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Time: ~30 minutes
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', border: '2px solid #1976d2' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Short Version
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    60 questions
                  </Typography>
                  <Typography variant="body2" paragraph>
                    A condensed version with good accuracy. Recommended for most users.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Time: ~10 minutes
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Mini Version
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    30 questions
                  </Typography>
                  <Typography variant="body2" paragraph>
                    A quick version for a basic assessment of your interests.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Time: ~5 minutes
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
            <FormControl sx={{ minWidth: 200, mr: 2 }}>
              <InputLabel id="form-type-label">Select Version</InputLabel>
              <Select
                labelId="form-type-label"
                value={formType}
                label="Select Version"
                onChange={handleFormTypeChange}
              >
                <MenuItem value="standard">Standard (180 questions)</MenuItem>
                <MenuItem value="short">Short (60 questions)</MenuItem>
                <MenuItem value="mini">Mini (30 questions)</MenuItem>
              </Select>
            </FormControl>
            
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={handleStart}
            >
              Start Assessment
            </Button>
          </Box>
          
          <Typography variant="body2" color="text.secondary" align="center">
            You selected: {formType} version, {getFormLength(formType)} questions
          </Typography>
        </Paper>
      </Container>
    );
  }
  
  if (started && !completed) {
    return (
      <Container maxWidth="md">
        <InterestProfilerQuestions 
          onComplete={handleComplete} 
          formType={formType} 
          questionsPerSection={10}
        />
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <InterestProfilerResults 
        answers={answers} 
        onReset={handleReset}
        onViewOccupation={onViewOccupation}
      />
    </Container>
  );
};

export default InterestProfiler;
