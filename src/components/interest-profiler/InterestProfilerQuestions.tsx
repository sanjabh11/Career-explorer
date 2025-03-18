// src/components/interest-profiler/InterestProfilerQuestions.tsx
// Version 1.3.0

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  Paper, 
  Stepper, 
  Step, 
  StepLabel,
  CircularProgress,
  Grid,
  Snackbar,
  Alert
} from '@mui/material';
import { InterestProfilerQuestion, InterestArea } from '@/types/interestProfiler';
import { getInterestProfilerQuestions } from '@/services/InterestProfilerService';

interface InterestProfilerQuestionsProps {
  onComplete: (answers: Map<number, number>) => void;
  formType?: 'standard' | 'short' | 'mini';
  questionsPerSection?: number;
}

const InterestProfilerQuestions: React.FC<InterestProfilerQuestionsProps> = ({
  onComplete,
  formType = 'short',
  questionsPerSection = 10
}) => {
  const [questions, setQuestions] = useState<InterestProfilerQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState<number>(0);
  const [answers, setAnswers] = useState<Map<number, number>>(new Map());
  
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const fetchedQuestions = await getInterestProfilerQuestions(formType);
        setQuestions(fetchedQuestions);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching Interest Profiler questions:', err);
        setError('Failed to load questions. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, [formType]);
  
  // Filter questions based on form type
  const filteredQuestions = questions.filter(q => {
    if (formType === 'standard') return true;
    if (formType === 'short') return q.shortForm;
    if (formType === 'mini') return q.miniForm;
    return true;
  });
  
  // Calculate number of sections
  const totalSections = Math.ceil(filteredQuestions.length / questionsPerSection);
  
  // Get current section questions
  const currentSectionQuestions = filteredQuestions.slice(
    currentSection * questionsPerSection,
    (currentSection + 1) * questionsPerSection
  );
  
  // Handle answer change
  const handleAnswerChange = (questionId: number, value: number) => {
    const newAnswers = new Map(answers);
    newAnswers.set(questionId, value);
    setAnswers(newAnswers);
  };
  
  // Handle navigation
  const handleNext = () => {
    if (currentSection < totalSections - 1) {
      setCurrentSection(currentSection + 1);
      window.scrollTo(0, 0);
    } else {
      onComplete(answers);
    }
  };
  
  const handleBack = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      window.scrollTo(0, 0);
    }
  };
  
  // Check if current section is complete
  const isCurrentSectionComplete = currentSectionQuestions.every(
    q => answers.has(q.id)
  );
  
  // Calculate progress
  const progress = Math.round((answers.size / filteredQuestions.length) * 100);
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }
  
  return (
    <Box sx={{ width: '100%', mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        O*NET Interest Profiler
      </Typography>
      
      <Typography variant="subtitle1" gutterBottom align="center" sx={{ mb: 4 }}>
        For each activity, indicate how much you would enjoy doing it.
      </Typography>
      
      <Box sx={{ width: '100%', mb: 4 }}>
        <Stepper activeStep={currentSection} alternativeLabel>
          {[...Array(totalSections)].map((_, index) => (
            <Step key={index}>
              <StepLabel>Section {index + 1}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
      
      <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
        <Typography variant="body2" sx={{ mr: 1 }}>
          Progress: {progress}%
        </Typography>
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <CircularProgress variant="determinate" value={progress} />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="caption" component="div" color="text.secondary">
              {progress}%
            </Typography>
          </Box>
        </Box>
      </Box>
      
      {currentSectionQuestions.map((question) => (
        <Paper key={question.id} sx={{ p: 3, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {question.text}
          </Typography>
          
          <RadioGroup
            value={answers.get(question.id) || ''}
            onChange={(e) => handleAnswerChange(question.id, parseInt(e.target.value, 10))}
          >
            <FormControlLabel value={1} control={<Radio />} label="Strongly Dislike" />
            <FormControlLabel value={2} control={<Radio />} label="Dislike" />
            <FormControlLabel value={3} control={<Radio />} label="Neutral" />
            <FormControlLabel value={4} control={<Radio />} label="Like" />
            <FormControlLabel value={5} control={<Radio />} label="Strongly Like" />
          </RadioGroup>
          
          <Typography variant="caption" color="textSecondary">
            Interest Area: {question.interestArea}
          </Typography>
        </Paper>
      ))}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          disabled={currentSection === 0}
          onClick={handleBack}
          variant="outlined"
        >
          Back
        </Button>
        <Button
          disabled={!isCurrentSectionComplete}
          onClick={handleNext}
          variant="contained"
          color="primary"
        >
          {currentSection < totalSections - 1 ? 'Next' : 'Submit'}
        </Button>
      </Box>
    </Box>
  );
};

export default InterestProfilerQuestions;
