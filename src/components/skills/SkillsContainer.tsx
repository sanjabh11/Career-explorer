import React, { useState } from 'react';
import { Box, Tab, Tabs, Typography, Paper } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SchoolIcon from '@mui/icons-material/School';
import TimelineIcon from '@mui/icons-material/Timeline';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CategoryIcon from '@mui/icons-material/Category';
import SkillsAssessment from './SkillsAssessment';
import TrainingRecommendations from './TrainingRecommendations';
import SkillsProgress from './SkillsProgress';
import SkillsTaxonomy from './SkillsTaxonomy';
import DetailedSkillsAnalysis from './DetailedSkillsAnalysis';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`skills-tabpanel-${index}`}
      aria-labelledby={`skills-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface SkillsContainerProps {
  occupationId: string;
  userId: string;
}

const SkillsContainer: React.FC<SkillsContainerProps> = ({
  occupationId,
  userId,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Paper elevation={0} sx={{ p: 2 }}>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="skills management tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              icon={<AssessmentIcon />}
              label="Skills Assessment"
              id="skills-tab-0"
              aria-controls="skills-tabpanel-0"
            />
            <Tab
              icon={<SchoolIcon />}
              label="Training"
              id="skills-tab-1"
              aria-controls="skills-tabpanel-1"
            />
            <Tab
              icon={<TimelineIcon />}
              label="Progress Tracking"
              id="skills-tab-2"
              aria-controls="skills-tabpanel-2"
            />
            <Tab
              icon={<CategoryIcon />}
              label="Skills Taxonomy"
              id="skills-tab-3"
              aria-controls="skills-tabpanel-3"
            />
            <Tab
              icon={<AnalyticsIcon />}
              label="Detailed Analysis"
              id="skills-tab-4"
              aria-controls="skills-tabpanel-4"
            />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Skills Assessment
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Assess your proficiency level for each required skill. Your assessment helps us provide personalized recommendations.
            </Typography>
          </Box>
          <SkillsAssessment occupationId={occupationId} userId={userId} />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Training Recommendations
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Based on your skills assessment, here are personalized training resources to help you develop the required skills.
            </Typography>
          </Box>
          <TrainingRecommendations occupationId={occupationId} userId={userId} />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Progress Tracking
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Track your skill development progress over time and visualize your journey towards your career goals.
            </Typography>
          </Box>
          <SkillsProgress occupationId={occupationId} userId={userId} />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <SkillsTaxonomy occupationId={occupationId} />
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Detailed Skills Analysis
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Explore detailed information about skills, including automation impact, future relevance, and skill relationships.
            </Typography>
          </Box>
          <DetailedSkillsAnalysis occupationId={occupationId} />
        </TabPanel>
      </Box>
    </Paper>
  );
};

export default SkillsContainer;
