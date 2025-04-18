import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  Paper,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Card,
  CardContent,
  Tab,
  Tabs
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import AutomationIcon from '@mui/icons-material/SmartToy';
import FutureIcon from '@mui/icons-material/Update';
import RelationshipIcon from '@mui/icons-material/Link';
import { DetailedSkill, DetailedSkillsResponse } from '../../types/detailedSkills';
import detailedSkillsService from '../../services/DetailedSkillsService';

interface DetailedSkillsAnalysisProps {
  occupationId: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`skills-tabpanel-${index}`}
      aria-labelledby={`skills-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const DetailedSkillsAnalysis: React.FC<DetailedSkillsAnalysisProps> = ({ occupationId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailedSkills, setDetailedSkills] = useState<DetailedSkillsResponse | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<DetailedSkill | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetailedSkills = async () => {
      try {
        setLoading(true);
        const data = await detailedSkillsService.getDetailedSkills(occupationId);
        setDetailedSkills(data);

        // Select the first skill by default
        if (data.skills.length > 0) {
          setSelectedSkill(data.skills[0]);
        }
      } catch (error) {
        console.error('Error fetching detailed skills:', error);
        setError('Failed to load detailed skills data');
      } finally {
        setLoading(false);
      }
    };

    fetchDetailedSkills();
  }, [occupationId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSkillClick = (skill: DetailedSkill) => {
    setSelectedSkill(skill);
  };

  const handleCategoryFilter = (category: string | null) => {
    setFilterCategory(category);
  };

  const getAutomationImpactColor = (score: number) => {
    if (score < 30) return 'success.main';
    if (score < 70) return 'warning.main';
    return 'error.main';
  };

  const getFutureRelevanceColor = (score: number) => {
    if (score > 70) return 'success.main';
    if (score > 40) return 'warning.main';
    return 'error.main';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'Increasing':
        return <TrendingUpIcon color="success" />;
      case 'Decreasing':
        return <TrendingDownIcon color="error" />;
      default:
        return <TrendingFlatIcon color="warning" />;
    }
  };

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

  if (!detailedSkills) {
    return <Alert severity="warning">No detailed skills data available</Alert>;
  }

  // Filter skills by category if a filter is selected
  const filteredSkills = filterCategory
    ? detailedSkills.skills.filter(skill => skill.category === filterCategory)
    : detailedSkills.skills;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Detailed Skills Analysis for {detailedSkills.occupation_title}
      </Typography>

      {detailedSkills.mockData && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Using mock data for demonstration purposes
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Filter by Category:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip
            label="All Categories"
            onClick={() => handleCategoryFilter(null)}
            color={filterCategory === null ? 'primary' : 'default'}
            variant={filterCategory === null ? 'filled' : 'outlined'}
          />
          {detailedSkills.skill_categories.map(category => (
            <Chip
              key={category}
              label={category}
              onClick={() => handleCategoryFilter(category)}
              color={filterCategory === category ? 'primary' : 'default'}
              variant={filterCategory === category ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Skills List
            </Typography>
            <List sx={{ maxHeight: 500, overflow: 'auto' }}>
              {filteredSkills.map(skill => (
                <ListItem
                  key={skill.id}
                  button
                  selected={selectedSkill?.id === skill.id}
                  onClick={() => handleSkillClick(skill)}
                  sx={{
                    borderLeft: selectedSkill?.id === skill.id ? 4 : 0,
                    borderColor: 'primary.main',
                    mb: 1
                  }}
                >
                  <ListItemText
                    primary={skill.name}
                    secondary={skill.category}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Tooltip title={`Automation Impact: ${skill.automation_impact.category}`}>
                      <Box sx={{ mr: 1 }}>
                        <AutomationIcon
                          fontSize="small"
                          sx={{ color: getAutomationImpactColor(skill.automation_impact.score) }}
                        />
                      </Box>
                    </Tooltip>
                    <Tooltip title={`Future Relevance: ${skill.future_relevance.trend}`}>
                      <Box>
                        {getTrendIcon(skill.future_relevance.trend)}
                      </Box>
                    </Tooltip>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          {selectedSkill ? (
            <Paper elevation={2} sx={{ p: 2 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="skill details tabs">
                  <Tab label="Overview" id="skill-tab-0" aria-controls="skill-tabpanel-0" />
                  <Tab label="Automation Impact" id="skill-tab-1" aria-controls="skill-tabpanel-1" />
                  <Tab label="Future Relevance" id="skill-tab-2" aria-controls="skill-tabpanel-2" />
                  <Tab label="Proficiency Levels" id="skill-tab-3" aria-controls="skill-tabpanel-3" />
                  <Tab label="Related Skills" id="skill-tab-4" aria-controls="skill-tabpanel-4" />
                </Tabs>
              </Box>

              <TabPanel value={activeTab} index={0}>
                <Typography variant="h6" gutterBottom>
                  {selectedSkill.name}
                </Typography>
                <Chip
                  label={selectedSkill.category}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
                <Typography variant="body1" paragraph>
                  {selectedSkill.description}
                </Typography>

                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          Required Level
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={(selectedSkill.required_level || 0) * 20}
                              color="primary"
                            />
                          </Box>
                          <Typography variant="body2">
                            {selectedSkill.required_level}/5
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          Importance
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={selectedSkill.importance || 0}
                              color="secondary"
                            />
                          </Box>
                          <Typography variant="body2">
                            {selectedSkill.importance}%
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={activeTab} index={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AutomationIcon fontSize="large" sx={{ mr: 1, color: getAutomationImpactColor(selectedSkill.automation_impact.score) }} />
                  <Typography variant="h6">
                    Automation Impact: {selectedSkill.automation_impact.category}
                  </Typography>
                </Box>

                <Typography variant="body1" paragraph>
                  {selectedSkill.automation_impact.description}
                </Typography>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Automation Impact Score
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={selectedSkill.automation_impact.score}
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: 'rgba(0, 0, 0, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getAutomationImpactColor(selectedSkill.automation_impact.score)
                          }
                        }}
                      />
                    </Box>
                    <Typography variant="body2">
                      {selectedSkill.automation_impact.score}/100
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption" color="success.main">Low Impact</Typography>
                    <Typography variant="caption" color="warning.main">Medium Impact</Typography>
                    <Typography variant="caption" color="error.main">High Impact</Typography>
                  </Box>
                </Box>

                <Box sx={{ mt: 4 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    What This Means
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary={selectedSkill.automation_impact.category === 'Low' ?
                          "This skill is relatively resistant to automation" :
                          selectedSkill.automation_impact.category === 'Medium' ?
                          "This skill may be partially automated" :
                          "This skill is highly susceptible to automation"
                        }
                        secondary={selectedSkill.automation_impact.category === 'Low' ?
                          "Focus on developing expertise in this skill as it will remain valuable" :
                          selectedSkill.automation_impact.category === 'Medium' ?
                          "Focus on advanced applications of this skill that require human judgment" :
                          "Consider developing complementary skills that are more resistant to automation"
                        }
                      />
                    </ListItem>
                  </List>
                </Box>
              </TabPanel>

              <TabPanel value={activeTab} index={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <FutureIcon fontSize="large" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Future Relevance: {selectedSkill.future_relevance.trend}
                    <Box component="span" sx={{ ml: 1 }}>
                      {getTrendIcon(selectedSkill.future_relevance.trend)}
                    </Box>
                  </Typography>
                </Box>

                <Typography variant="body1" paragraph>
                  This skill is projected to {selectedSkill.future_relevance.trend.toLowerCase()} in relevance over the next {selectedSkill.future_relevance.horizon}.
                </Typography>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Future Relevance Score
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={selectedSkill.future_relevance.score}
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: 'rgba(0, 0, 0, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getFutureRelevanceColor(selectedSkill.future_relevance.score)
                          }
                        }}
                      />
                    </Box>
                    <Typography variant="body2">
                      {selectedSkill.future_relevance.score}/100
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption" color="error.main">Low Relevance</Typography>
                    <Typography variant="caption" color="warning.main">Medium Relevance</Typography>
                    <Typography variant="caption" color="success.main">High Relevance</Typography>
                  </Box>
                </Box>

                <Box sx={{ mt: 4 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Strategic Implications
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary={selectedSkill.future_relevance.trend === 'Increasing' ?
                          "Prioritize developing this skill" :
                          selectedSkill.future_relevance.trend === 'Stable' ?
                          "Maintain proficiency in this skill" :
                          "Consider focusing on more future-relevant skills"
                        }
                        secondary={selectedSkill.future_relevance.trend === 'Increasing' ?
                          "This skill will become more valuable in the future job market" :
                          selectedSkill.future_relevance.trend === 'Stable' ?
                          "This skill will continue to be relevant but won't significantly increase in value" :
                          "While still important now, this skill may become less valuable over time"
                        }
                      />
                    </ListItem>
                  </List>
                </Box>
              </TabPanel>

              <TabPanel value={activeTab} index={3}>
                <Typography variant="h6" gutterBottom>
                  Proficiency Levels
                </Typography>

                {selectedSkill.proficiency_criteria.map((criteria) => (
                  <Accordion key={criteria.level}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>
                        Level {criteria.level}: {criteria.description}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="subtitle2" gutterBottom>
                        Examples:
                      </Typography>
                      <List dense>
                        {criteria.examples.map((example, index) => (
                          <ListItem key={index}>
                            <ListItemText primary={example} />
                          </ListItem>
                        ))}
                      </List>

                      <Divider sx={{ my: 2 }} />

                      <Typography variant="subtitle2" gutterBottom>
                        Assessment Criteria:
                      </Typography>
                      <List dense>
                        {criteria.assessment_criteria.map((criterion, index) => (
                          <ListItem key={index}>
                            <ListItemText primary={criterion} />
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </TabPanel>

              <TabPanel value={activeTab} index={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <RelationshipIcon fontSize="large" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Related Skills
                  </Typography>
                </Box>

                {selectedSkill.related_skills.length === 0 ? (
                  <Alert severity="info">No related skills information available</Alert>
                ) : (
                  <Grid container spacing={2}>
                    {selectedSkill.related_skills.map((relatedSkill) => (
                      <Grid item xs={12} sm={6} key={relatedSkill.id}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle1" gutterBottom>
                              {relatedSkill.name}
                            </Typography>
                            <Chip
                              label={relatedSkill.relationship_type === 'complementary' ? 'Complementary' : 'Prerequisite'}
                              size="small"
                              color={relatedSkill.relationship_type === 'complementary' ? 'primary' : 'secondary'}
                              variant="outlined"
                              sx={{ mb: 2 }}
                            />
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="body2" gutterBottom>
                                Relationship Strength
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box sx={{ width: '100%', mr: 1 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={relatedSkill.relationship_strength}
                                    color="primary"
                                  />
                                </Box>
                                <Typography variant="body2">
                                  {relatedSkill.relationship_strength}%
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </TabPanel>
            </Paper>
          ) : (
            <Paper elevation={2} sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography variant="body1" color="textSecondary">
                Select a skill to view detailed information
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default DetailedSkillsAnalysis;
