/**
 * Enhanced APO Visualizer Component
 * Version 1.0
 * 
 * Visualizes the results from the Factor Weighting Model and Dynamic APO Calculator
 * with interactive time projections and scenario modeling.
 */

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Tabs, 
  Tab,
  Slider,
  Button,
  Chip,
  Divider,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { ScenarioResult } from '../../utils/apo/DynamicApoCalculator';
import { APOResult, TimeProjection, Skill as APOSkill } from '../../types/apo';
import { DetailedSkillAnalysis, SkillCluster } from '../../utils/skills/SkillImpactAnalyzer';

interface EnhancedApoVisualizerProps {
  apoResult?: APOResult;
  scenarios?: ScenarioResult[];
  skillsAnalysis?: DetailedSkillAnalysis[];
  skillClusters?: SkillCluster[];
  isLoading?: boolean;
  onScenarioChange?: (scenarioIndex: number) => void;
  onTimeHorizonChange?: (years: number) => void;
}

/**
 * Component to visualize enhanced APO results with interactive visualizations
 */
const EnhancedApoVisualizer: React.FC<EnhancedApoVisualizerProps> = ({
  apoResult,
  scenarios = [],
  skillsAnalysis = [],
  skillClusters = [],
  isLoading = false,
  onScenarioChange,
  onTimeHorizonChange
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState(0);
  const [timeHorizon, setTimeHorizon] = useState(5); // Default 5 years
  
  // Colors for charts
  const colors = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    info: theme.palette.info.main,
    grey: theme.palette.grey[500]
  };
  
  // PIECHARTS COLORS
  const COLORS = [colors.primary, colors.secondary, colors.success, colors.warning, colors.error];
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  const handleScenarioChange = (index: number) => {
    setSelectedScenario(index);
    if (onScenarioChange) {
      onScenarioChange(index);
    }
  };
  
  const handleTimeHorizonChange = (event: Event, value: number | number[]) => {
    const years = value as number;
    setTimeHorizon(years);
    if (onTimeHorizonChange) {
      onTimeHorizonChange(years);
    }
  };
  
  // Format the automation potential score as a percentage
  const formatScore = (score: number): string => {
    return `${Math.round(score * 100)}%`;
  };
  
  // Get the current scenario or baseline result
  const getCurrentResult = (): APOResult | ScenarioResult | undefined => {
    if (scenarios.length > 0 && selectedScenario < scenarios.length) {
      return scenarios[selectedScenario];
    }
    return apoResult;
  };
  
  // Get time projections for the current result
  const getTimeProjections = (): TimeProjection[] => {
    const result = getCurrentResult();
    if (!result) return [];
    
    if ('timeProjections' in result) {
      return result.timeProjections;
    }
    return [];
  };
  
  // Get factor breakdown for the current result
  const getFactorBreakdown = () => {
    const result = getCurrentResult();
    if (!result) return {};
    
    if ('factorBreakdown' in result) {
      return result.factorBreakdown;
    }
    return {};
  };
  
  // Prepare data for time projection chart
  const prepareTimeProjectionData = () => {
    const projections = getTimeProjections();
    
    // Add baseline data point (current year)
    const currentYear = new Date().getFullYear();
    const currentScore = getCurrentResult()?.overallScore || 0;
    
    return [
      {
        year: currentYear,
        score: currentScore,
        confidence: 1.0 // Highest confidence for current score
      },
      ...projections.map(p => ({
        year: p.year,
        score: p.score,
        confidence: p.confidence
      }))
    ];
  };
  
  // Prepare data for factor breakdown chart
  const prepareFactorBreakdownData = () => {
    const breakdown = getFactorBreakdown();
    
    return Object.entries(breakdown).map(([key, value]) => ({
      factor: key
        .replace(/([A-Z])/g, ' $1') // Add space before capital letters
        .replace(/^./, str => str.toUpperCase()), // Capitalize first letter
      score: value
    }));
  };
  
  // Prepare data for skills impact chart
  const prepareSkillsImpactData = () => {
    if (!apoResult?.skillsImpact) return [];
    
    const { highRisk, moderateRisk, lowRisk } = apoResult.skillsImpact;
    
    return [
      { name: 'High Risk', value: highRisk.length },
      { name: 'Moderate Risk', value: moderateRisk.length },
      { name: 'Low Risk', value: lowRisk.length }
    ];
  };
  
  // Prepare data for skill clusters radar chart
  const prepareSkillClustersData = () => {
    return skillClusters.map(cluster => ({
      subject: cluster.name,
      A: cluster.averageAutomationScore,
      fullMark: 1
    }));
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }
  
  // Render empty state
  if (!apoResult) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body1" align="center">
            No automation potential data available. Please select an occupation to analyze.
          </Typography>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Enhanced Automation Potential Analysis
        </Typography>
        
        {/* Overall Score */}
        <Box mb={4} display="flex" alignItems="center">
          <Box position="relative" display="inline-flex" mr={3}>
            <CircularProgress
              variant="determinate"
              value={apoResult.overallScore * 100}
              size={80}
              thickness={4}
              color={apoResult.overallScore > 0.7 ? "error" : apoResult.overallScore > 0.4 ? "warning" : "success"}
            />
            <Box
              top={0}
              left={0}
              bottom={0}
              right={0}
              position="absolute"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Typography variant="h6" component="div" color="textSecondary">
                {formatScore(apoResult.overallScore)}
              </Typography>
            </Box>
          </Box>
          <Box>
            <Typography variant="h6">
              {apoResult.occupationTitle}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Confidence: {formatScore(apoResult.confidence)}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Based on {apoResult.dataSourceInfo?.sources || 'multiple'} sources
            </Typography>
          </Box>
        </Box>
        
        {/* Tabs */}
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="Time Projections" />
          <Tab label="Factor Analysis" />
          <Tab label="Skills Impact" />
          <Tab label="Scenarios" />
        </Tabs>
        
        {/* Time Projections Tab */}
        {activeTab === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Automation Potential Over Time
            </Typography>
            <Box mb={2}>
              <Typography gutterBottom>Time Horizon (Years)</Typography>
              <Slider
                value={timeHorizon}
                onChange={handleTimeHorizonChange}
                min={1}
                max={15}
                step={1}
                marks={[
                  { value: 1, label: '1' },
                  { value: 5, label: '5' },
                  { value: 10, label: '10' },
                  { value: 15, label: '15' }
                ]}
                valueLabelDisplay="auto"
              />
            </Box>
            
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={prepareTimeProjectionData()}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(value) => `${Math.round(value * 100)}%`} />
                <Tooltip formatter={(value) => [`${Math.round(Number(value) * 100)}%`, 'Automation Potential']} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke={colors.primary}
                  activeDot={{ r: 8 }}
                  name="Automation Potential"
                />
                <Line
                  type="monotone"
                  dataKey="confidence"
                  stroke={colors.secondary}
                  strokeDasharray="5 5"
                  name="Confidence"
                />
              </LineChart>
            </ResponsiveContainer>
            
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              This chart shows the projected automation potential over time based on current trends and research data.
            </Typography>
            
            {/* Key Factors for Selected Time Horizon */}
            <Box mt={4}>
              <Typography variant="h6" gutterBottom>
                Key Factors Affecting {timeHorizon}-Year Projection
              </Typography>
              
              {getTimeProjections()
                .filter(p => p.year === new Date().getFullYear() + timeHorizon)
                .map((projection, index) => (
                  <Box key={index} mt={2}>
                    <Typography variant="body1">
                      Projected Automation Potential in {projection.year}: {formatScore(projection.score)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Confidence: {formatScore(projection.confidence)}
                    </Typography>
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Key Factors:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {projection.keyDrivers.map((factor: string, i: number) => (
                        <Chip
                          key={i}
                          label={factor}
                          size="small"
                          color={i % 2 === 0 ? "primary" : "secondary"}
                        />
                      ))}
                    </Box>
                  </Box>
                ))}
            </Box>
          </Box>
        )}
        
        {/* Factor Analysis Tab */}
        {activeTab === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Factor Breakdown
            </Typography>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={prepareFactorBreakdownData()}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="factor" />
                <YAxis tickFormatter={(value) => `${Math.round(value * 100)}%`} />
                <Tooltip formatter={(value) => [`${Math.round(Number(value) * 100)}%`, 'Impact']} />
                <Legend />
                <Bar dataKey="score" name="Impact on Automation" fill={colors.primary} />
              </BarChart>
            </ResponsiveContainer>
            
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              This chart shows the relative impact of different factors on the overall automation potential.
            </Typography>
            
            {/* Recommendations */}
            {apoResult.recommendations && apoResult.recommendations.length > 0 && (
              <Box mt={4}>
                <Typography variant="h6" gutterBottom>
                  Recommendations
                </Typography>
                
                <Grid container spacing={2}>
                  {apoResult.recommendations.slice(0, 3).map((recommendation: any, index: number) => (
                    <Grid item xs={12} md={4} key={index}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom>
                            {recommendation.title}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            {recommendation.type} • {recommendation.timeframe}
                          </Typography>
                          <Typography variant="body2">
                            {recommendation.description}
                          </Typography>
                          <Box mt={1}>
                            <Chip
                              size="small"
                              label={`Impact: ${recommendation.impact}`}
                              color={
                                recommendation.impact === 'High' ? 'error' :
                                recommendation.impact === 'Medium' ? 'warning' : 'success'
                              }
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        )}
        
        {/* Skills Impact Tab */}
        {activeTab === 2 && (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Skills Impact Distribution
                </Typography>
                
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={prepareSkillsImpactData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {prepareSkillsImpactData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Skills Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Skill Clusters Analysis
                </Typography>
                
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart outerRadius={90} data={prepareSkillClustersData()}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 1]} />
                    <Radar
                      name="Automation Risk"
                      dataKey="A"
                      stroke={colors.primary}
                      fill={colors.primary}
                      fillOpacity={0.6}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>
            
            {/* Skills Lists */}
            <Box mt={4}>
              <Typography variant="h6" gutterBottom>
                Skills by Automation Risk
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom color="error.main">
                        High Risk Skills
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      {apoResult.skillsImpact?.highRisk.slice(0, 5).map((skill: APOSkill, index: number) => (
                        <Box key={index} mb={1}>
                          <Typography variant="body2">{skill.name}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {skill.category}
                          </Typography>
                        </Box>
                      ))}
                      {(apoResult.skillsImpact?.highRisk.length || 0) > 5 && (
                        <Typography variant="body2" color="textSecondary">
                          +{(apoResult.skillsImpact?.highRisk.length || 0) - 5} more
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom color="warning.main">
                        Moderate Risk Skills
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      {apoResult.skillsImpact?.moderateRisk.slice(0, 5).map((skill: APOSkill, index: number) => (
                        <Box key={index} mb={1}>
                          <Typography variant="body2">{skill.name}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {skill.category}
                          </Typography>
                        </Box>
                      ))}
                      {(apoResult.skillsImpact?.moderateRisk.length || 0) > 5 && (
                        <Typography variant="body2" color="textSecondary">
                          +{(apoResult.skillsImpact?.moderateRisk.length || 0) - 5} more
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom color="success.main">
                        Low Risk Skills
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      {apoResult.skillsImpact?.lowRisk.slice(0, 5).map((skill: APOSkill, index: number) => (
                        <Box key={index} mb={1}>
                          <Typography variant="body2">{skill.name}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {skill.category}
                          </Typography>
                        </Box>
                      ))}
                      {(apoResult.skillsImpact?.lowRisk.length || 0) > 5 && (
                        <Typography variant="body2" color="textSecondary">
                          +{(apoResult.skillsImpact?.lowRisk.length || 0) - 5} more
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
            
            {/* Emerging Skills */}
            {apoResult.skillsImpact?.emergingSkills && apoResult.skillsImpact.emergingSkills.length > 0 && (
              <Box mt={4}>
                <Typography variant="h6" gutterBottom>
                  Emerging Skills to Develop
                </Typography>
                
                <Grid container spacing={2}>
                  {apoResult.skillsImpact.emergingSkills.slice(0, 3).map((skill: APOSkill, index: number) => (
                    <Grid item xs={12} md={4} key={index}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom>
                            {skill.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            {skill.category}
                          </Typography>
                          <Typography variant="body2">
                            {skill.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        )}
        
        {/* Scenarios Tab */}
        {activeTab === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Scenario Analysis
            </Typography>
            
            {/* Scenario Selection */}
            <Box mb={3} display="flex" flexWrap="wrap" gap={1}>
              <Button
                variant={selectedScenario === -1 ? "contained" : "outlined"}
                onClick={() => handleScenarioChange(-1)}
                size="small"
              >
                Baseline
              </Button>
              
              {scenarios.map((scenario, index) => (
                <Button
                  key={index}
                  variant={selectedScenario === index ? "contained" : "outlined"}
                  onClick={() => handleScenarioChange(index)}
                  size="small"
                >
                  {scenario.scenarioName}
                </Button>
              ))}
            </Box>
            
            {/* Scenario Details */}
            {selectedScenario >= 0 && selectedScenario < scenarios.length && (
              <Box mb={4}>
                <Typography variant="subtitle1">
                  {scenarios[selectedScenario].scenarioName}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {scenarios[selectedScenario].scenarioDescription}
                </Typography>
                
                <Box display="flex" alignItems="center" mt={2}>
                  <Box position="relative" display="inline-flex" mr={3}>
                    <CircularProgress
                      variant="determinate"
                      value={scenarios[selectedScenario].adjustedScore * 100}
                      size={60}
                      thickness={4}
                      color={
                        scenarios[selectedScenario].adjustedScore > 0.7 ? "error" :
                        scenarios[selectedScenario].adjustedScore > 0.4 ? "warning" : "success"
                      }
                    />
                    <Box
                      top={0}
                      left={0}
                      bottom={0}
                      right={0}
                      position="absolute"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Typography variant="body2" component="div" color="textSecondary">
                        {formatScore(scenarios[selectedScenario].adjustedScore)}
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="body2">
                      Baseline: {formatScore(scenarios[selectedScenario].baselineScore)}
                    </Typography>
                    <Typography variant="body2">
                      Adjusted: {formatScore(scenarios[selectedScenario].adjustedScore)}
                    </Typography>
                    <Typography variant="body2">
                      Difference: {formatScore(scenarios[selectedScenario].adjustedScore - scenarios[selectedScenario].baselineScore)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
            
            {/* Scenario Comparison Chart */}
            <Typography variant="subtitle2" gutterBottom>
              Scenario Comparison
            </Typography>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { name: 'Baseline', score: apoResult.overallScore },
                  ...scenarios.map(s => ({ name: s.scenarioName, score: s.adjustedScore }))
                ]}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${Math.round(value * 100)}%`} />
                <Tooltip formatter={(value) => [`${Math.round(Number(value) * 100)}%`, 'Automation Potential']} />
                <Legend />
                <Bar dataKey="score" name="Automation Potential" fill={colors.primary} />
              </BarChart>
            </ResponsiveContainer>
            
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              This chart compares automation potential across different scenarios.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedApoVisualizer;
