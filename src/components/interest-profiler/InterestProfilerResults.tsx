// src/components/interest-profiler/InterestProfilerResults.tsx
// Version 1.3.0

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Chip, 
  CircularProgress, 
  Button, 
  List, 
  ListItem, 
  ListItemText,
  ListItemAvatar, 
  Avatar, 
  Divider,
  Alert,
  Card,
  CardContent,
  CardActions,
  Tabs,
  Tab
} from '@mui/material';
import { 
  WorkOutline as WorkIcon,
  School as SchoolIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  ArrowUpward as ArrowUpwardIcon,
  Bookmark as BookmarkIcon
} from '@mui/icons-material';
import { InterestProfilerResults, InterestArea, MatchedOccupation, JobZone } from '@/types/interestProfiler';
import { calculateInterestResults, getCareerMatches, getJobZones } from '@/services/InterestProfilerService';

interface InterestProfilerResultsProps {
  answers: Map<number, number>;
  onReset: () => void;
  onViewOccupation: (code: string) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`interest-tabpanel-${index}`}
      aria-labelledby={`interest-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const InterestProfilerResults: React.FC<InterestProfilerResultsProps> = ({
  answers,
  onReset,
  onViewOccupation
}) => {
  const [results, setResults] = useState<InterestProfilerResults | null>(null);
  const [jobZones, setJobZones] = useState<JobZone[]>([]);
  const [selectedJobZones, setSelectedJobZones] = useState<number[]>([1, 2, 3, 4, 5]);
  const [matchedOccupations, setMatchedOccupations] = useState<MatchedOccupation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  
  const interestAreaColors: Record<InterestArea, string> = {
    [InterestArea.Realistic]: '#4CAF50', // Green
    [InterestArea.Investigative]: '#2196F3', // Blue
    [InterestArea.Artistic]: '#9C27B0', // Purple
    [InterestArea.Social]: '#FF9800', // Orange
    [InterestArea.Enterprising]: '#F44336', // Red
    [InterestArea.Conventional]: '#795548', // Brown
  };
  
  const interestAreaDescriptions: Record<InterestArea, string> = {
    [InterestArea.Realistic]: 'People with Realistic interests like work activities that include practical, hands-on problems and solutions. They enjoy working with plants, animals, and real-world materials like wood, tools, and machinery.',
    [InterestArea.Investigative]: 'People with Investigative interests like work activities that have to do with ideas and thinking rather than physical activity. They like to search for facts and figure out problems mentally.',
    [InterestArea.Artistic]: 'People with Artistic interests like work activities that deal with the artistic side of things, such as forms, designs, and patterns. They like self-expression in their work.',
    [InterestArea.Social]: 'People with Social interests like work activities that assist others and promote learning and personal development. They like to communicate with and teach people.',
    [InterestArea.Enterprising]: 'People with Enterprising interests like work activities that have to do with starting up and carrying out projects, especially business ventures. They like persuading and leading people and making decisions.',
    [InterestArea.Conventional]: 'People with Conventional interests like work activities that follow set procedures and routines. They prefer working with data and details rather than with ideas.',
  };
  
  useEffect(() => {
    const processResults = async () => {
      try {
        setLoading(true);
        
        // Calculate results from answers
        const calculatedResults = await calculateInterestResults(answers);
        setResults(calculatedResults);
        
        // Fetch job zones
        const fetchedJobZones = await getJobZones();
        setJobZones(fetchedJobZones);
        
        // Get matched occupations
        const matches = await getCareerMatches(calculatedResults, selectedJobZones);
        setMatchedOccupations(matches);
        
        setLoading(false);
      } catch (err) {
        console.error('Error processing Interest Profiler results:', err);
        setError('Failed to process results. Please try again later.');
        setLoading(false);
      }
    };
    
    processResults();
  }, [answers]);
  
  // Handle job zone filter change
  const handleJobZoneChange = async (zoneId: number) => {
    const newSelectedZones = selectedJobZones.includes(zoneId)
      ? selectedJobZones.filter(id => id !== zoneId)
      : [...selectedJobZones, zoneId];
    
    if (newSelectedZones.length === 0) {
      return; // Prevent empty selection
    }
    
    setSelectedJobZones(newSelectedZones);
    
    try {
      setLoading(true);
      if (results) {
        const matches = await getCareerMatches(results, newSelectedZones);
        setMatchedOccupations(matches);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error updating matched occupations:', err);
      setError('Failed to update occupation matches.');
      setLoading(false);
    }
  };
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
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
  
  if (!results) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <Alert severity="warning">No results available. Please try again.</Alert>
      </Box>
    );
  }
  
  return (
    <Box sx={{ width: '100%', mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Your Interest Profile Results
      </Typography>
      
      <Box sx={{ width: '100%', mb: 4 }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab label="Your Interests" />
          <Tab label="Career Matches" />
          <Tab label="Job Zones" />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Your Holland Code: {results.hollandCode}
          </Typography>
          
          <Typography variant="body1" paragraph>
            Your Holland Code represents your top three interest areas. This code can help you find careers that match your interests.
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {Object.entries(results.scores).map(([area, score]) => (
              <Grid item xs={12} sm={6} md={4} key={area}>
                <Card 
                  elevation={2}
                  sx={{
                    height: '100%',
                    borderTop: `5px solid ${interestAreaColors[area as InterestArea]}`,
                    opacity: area === results.primary || area === results.secondary || area === results.tertiary ? 1 : 0.7
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" component="div" gutterBottom>
                      {area}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
                        <CircularProgress 
                          variant="determinate" 
                          value={(score / 5) * 100} 
                          sx={{ color: interestAreaColors[area as InterestArea] }}
                        />
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
                            {score.toFixed(1)}
                          </Typography>
                        </Box>
                      </Box>
                      
                      {area === results.primary && (
                        <Chip label="Primary" size="small" color="primary" />
                      )}
                      {area === results.secondary && (
                        <Chip label="Secondary" size="small" />
                      )}
                      {area === results.tertiary && (
                        <Chip label="Tertiary" size="small" />
                      )}
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary">
                      {interestAreaDescriptions[area as InterestArea]}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Career Matches
          </Typography>
          
          <Typography variant="body1" paragraph>
            These careers match your interest profile. Click on a career to learn more.
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Filter by Job Zone:
            </Typography>
            <Box>
              {jobZones.map((zone) => (
                <Chip
                  key={zone.id}
                  label={`Zone ${zone.id}: ${zone.name}`}
                  onClick={() => handleJobZoneChange(zone.id)}
                  color={selectedJobZones.includes(zone.id) ? "primary" : "default"}
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
          </Box>
        </Box>
        
        <List>
          {matchedOccupations.map((occupation) => (
            <React.Fragment key={occupation.code}>
              <ListItem 
                alignItems="flex-start" 
                button 
                onClick={() => onViewOccupation(occupation.code)}
                sx={{ 
                  backgroundColor: occupation.bright_outlook ? 'rgba(255, 235, 59, 0.1)' : 'transparent',
                  '&:hover': {
                    backgroundColor: occupation.bright_outlook ? 'rgba(255, 235, 59, 0.2)' : 'rgba(0, 0, 0, 0.04)',
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: interestAreaColors[results.primary] }}>
                    <WorkIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography component="span" variant="h6">
                        {occupation.title}
                      </Typography>
                      {occupation.bright_outlook && (
                        <TrendingUpIcon color="warning" sx={{ ml: 1 }} titleAccess="Bright Outlook" />
                      )}
                      {occupation.in_demand && (
                        <ArrowUpwardIcon color="success" sx={{ ml: 1 }} titleAccess="In Demand" />
                      )}
                      {occupation.green && (
                        <StarIcon sx={{ ml: 1, color: 'green' }} titleAccess="Green Occupation" />
                      )}
                    </Box>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography component="span" variant="body2" color="text.primary">
                        Match Score: {Math.round(occupation.matchScore)}%
                      </Typography>
                      <br />
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Chip
                          size="small"
                          icon={<SchoolIcon />}
                          label={`Job Zone ${occupation.jobZone}`}
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          O*NET Code: {occupation.code}
                        </Typography>
                      </Box>
                    </React.Fragment>
                  }
                />
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
        
        {matchedOccupations.length === 0 && (
          <Alert severity="info">
            No occupations match your current filter criteria. Try selecting different Job Zones.
          </Alert>
        )}
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h5" gutterBottom>
          Understanding Job Zones
        </Typography>
        
        <Typography variant="body1" paragraph>
          Job Zones group occupations based on levels of experience, education, and training needed.
        </Typography>
        
        <Grid container spacing={3}>
          {jobZones.map((zone) => (
            <Grid item xs={12} md={6} key={zone.id}>
              <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Zone {zone.id}: {zone.name}
                </Typography>
                
                <Typography variant="body2" paragraph>
                  {zone.description}
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Education:</Typography>
                  <Typography variant="body2" paragraph>
                    {zone.education}
                  </Typography>
                  
                  <Typography variant="subtitle2">Experience:</Typography>
                  <Typography variant="body2" paragraph>
                    {zone.experience}
                  </Typography>
                  
                  <Typography variant="subtitle2">Training:</Typography>
                  <Typography variant="body2" paragraph>
                    {zone.training}
                  </Typography>
                </Box>
                
                {zone.examples && zone.examples.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Examples:</Typography>
                    <List dense>
                      {zone.examples.slice(0, 3).map((example, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={example} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </TabPanel>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={onReset}
          sx={{ mr: 2 }}
        >
          Start Over
        </Button>
        
        <Button 
          variant="contained"
          color="primary"
          onClick={() => setTabValue(1)}
          disabled={tabValue === 1}
        >
          View Career Matches
        </Button>
      </Box>
    </Box>
  );
};

export default InterestProfilerResults;
