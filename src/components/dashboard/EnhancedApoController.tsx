/**
 * Enhanced APO Controller Component
 * Version 1.0
 * 
 * Integrates the Factor Weighting Model, Dynamic APO Calculator, and Skill Impact Analyzer
 * to provide a comprehensive automation potential analysis with time projections
 * and scenario modeling.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  TextField, 
  MenuItem, 
  CircularProgress,
  Alert,
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useParams, useNavigate } from 'react-router-dom';

// Import services and utilities
import { OnetApiService } from '../../services/api/OnetApiService';
import { JinaApiService } from '../../services/api/JinaApiService';
import { SerpApiService } from '../../services/api/SerpApiService';
import { FactorWeightingModel } from '../../utils/apo/FactorWeightingModel';
import { DynamicApoCalculator, ScenarioParams } from '../../utils/apo/DynamicApoCalculator';
import { SkillImpactAnalyzer } from '../../utils/skills/SkillImpactAnalyzer';

// Import types
import { Occupation } from '../../types/occupation';
import { OccupationTask } from '../../types/semantic';
import { Skill } from '../../types/skills';
import { AutomationResearchData } from '../../types/research';

// Import components
import EnhancedApoVisualizer from './EnhancedApoVisualizer';
import OccupationSearch from '../search/OccupationSearch';

// Default scenarios for modeling
const DEFAULT_SCENARIOS: ScenarioParams[] = [
  {
    name: 'Accelerated Automation',
    description: 'Scenario with faster adoption of automation technologies and increased investment in AI',
    factorAdjustments: {
      industryAdoption: 1.5,
      emergingTechImpact: 1.3,
      taskComplexity: 1.1
    },
    timeHorizonYears: [2, 5, 10]
  },
  {
    name: 'Regulatory Constraints',
    description: 'Scenario with increased regulatory oversight slowing automation adoption',
    factorAdjustments: {
      industryAdoption: 0.7,
      emergingTechImpact: 0.8,
      regionalFactors: 0.9
    },
    timeHorizonYears: [2, 5, 10]
  },
  {
    name: 'Skill Enhancement',
    description: 'Scenario where workers rapidly upskill to complement automation',
    factorAdjustments: {
      collaborationRequirements: 1.3,
      taskComplexity: 0.8
    },
    timeHorizonYears: [2, 5, 10]
  }
];

/**
 * Controller component for Enhanced APO analysis
 */
const EnhancedApoController: React.FC = () => {
  // Router hooks
  const { occupationId } = useParams<{ occupationId: string }>();
  const navigate = useNavigate();
  
  // Services
  const onetApiService = new OnetApiService();
  const jinaApiService = new JinaApiService(process.env.REACT_APP_JINA_API_KEY || 'demo-key');
  const serpApiService = new SerpApiService(process.env.REACT_APP_SERP_API_KEY || 'demo-key');
  
  // Models
  const factorWeightingModel = new FactorWeightingModel();
  const dynamicApoCalculator = new DynamicApoCalculator(factorWeightingModel);
  const skillImpactAnalyzer = new SkillImpactAnalyzer();
  
  // State
  const [occupation, setOccupation] = useState<Occupation | null>(null);
  const [tasks, setTasks] = useState<OccupationTask[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [researchData, setResearchData] = useState<AutomationResearchData | null>(null);
  const [apoResult, setApoResult] = useState<any>(null);
  const [scenarioResults, setScenarioResults] = useState<any[]>([]);
  const [skillsAnalysis, setSkillsAnalysis] = useState<any[]>([]);
  const [skillClusters, setSkillClusters] = useState<any[]>([]);
  const [scenarios, setScenarios] = useState<ScenarioParams[]>(DEFAULT_SCENARIOS);
  const [customScenario, setCustomScenario] = useState<ScenarioParams>({
    name: 'Custom Scenario',
    description: 'User-defined scenario',
    factorAdjustments: {},
    timeHorizonYears: [2, 5, 10]
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');
  
  // Load occupation data
  const loadOccupationData = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Load occupation details
      const occupationData = await onetApiService.getOccupationDetails(id);
      setOccupation(occupationData);
      
      // Load tasks
      const tasksData = await onetApiService.getOccupationTasks(id);
      setTasks(tasksData);
      
      // Load skills
      const skillsData = await onetApiService.getOccupationSkills(id);
      setSkills(skillsData);
      
      // Load research data
      const researchData = await serpApiService.getAutomationResearch(occupationData.title);
      setResearchData(researchData);
      
      // Show success message
      showMessage('Occupation data loaded successfully', 'success');
    } catch (err) {
      console.error('Error loading occupation data:', err);
      setError('Failed to load occupation data. Please try again.');
      showMessage('Error loading occupation data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [onetApiService, serpApiService]);
  
  // Calculate enhanced APO
  const calculateEnhancedApo = useCallback(async () => {
    if (!occupation || !tasks.length || !skills.length || !researchData) {
      showMessage('Missing data for APO calculation', 'warning');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get occupation analysis from Jina API
      const occupationAnalysis = await jinaApiService.getOccupationAnalysis(
        occupation.id,
        occupation.title,
        tasks,
        skills
      );
      
      // Calculate enhanced APO
      const result = dynamicApoCalculator.calculateEnhancedApo(
        occupation.id,
        occupation.title,
        tasks,
        skills,
        researchData
      );
      setApoResult(result);
      
      // Model scenarios
      const scenarioResults = dynamicApoCalculator.modelScenarios(
        occupation.id,
        occupation.title,
        tasks,
        skills,
        researchData,
        scenarios
      );
      setScenarioResults(scenarioResults);
      
      // Analyze skills
      const skillsAnalysis = skillImpactAnalyzer.analyzeSkillsGranular(
        skills,
        occupationAnalysis,
        researchData
      );
      setSkillsAnalysis(skillsAnalysis);
      
      // Cluster skills
      const skillClusters = skillImpactAnalyzer.clusterSkills(skillsAnalysis);
      setSkillClusters(skillClusters);
      
      showMessage('Analysis completed successfully', 'success');
    } catch (err) {
      console.error('Error calculating enhanced APO:', err);
      setError('Failed to calculate enhanced APO. Please try again.');
      showMessage('Error calculating automation potential', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [
    occupation, 
    tasks, 
    skills, 
    researchData, 
    jinaApiService, 
    dynamicApoCalculator, 
    skillImpactAnalyzer, 
    scenarios
  ]);
  
  // Add custom scenario
  const addCustomScenario = () => {
    // Validate custom scenario
    if (!customScenario.name) {
      showMessage('Scenario name is required', 'warning');
      return;
    }
    
    // Add custom scenario to scenarios
    setScenarios([...scenarios, { ...customScenario }]);
    
    // Reset custom scenario
    setCustomScenario({
      name: 'Custom Scenario',
      description: 'User-defined scenario',
      factorAdjustments: {},
      timeHorizonYears: [2, 5, 10]
    });
    
    showMessage('Custom scenario added', 'success');
  };
  
  // Update custom scenario
  const updateCustomScenario = (field: string, value: any) => {
    if (field.startsWith('factor.')) {
      const factor = field.split('.')[1];
      setCustomScenario({
        ...customScenario,
        factorAdjustments: {
          ...customScenario.factorAdjustments,
          [factor]: parseFloat(value)
        }
      });
    } else {
      setCustomScenario({
        ...customScenario,
        [field]: value
      });
    }
  };
  
  // Handle occupation selection
  const handleOccupationSelect = (occupation: Occupation) => {
    navigate(`/enhanced-apo/${occupation.id}`);
  };
  
  // Show snackbar message
  const showMessage = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setShowSnackbar(true);
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setShowSnackbar(false);
  };
  
  // Load occupation data when occupationId changes
  useEffect(() => {
    if (occupationId) {
      loadOccupationData(occupationId);
    }
  }, [occupationId, loadOccupationData]);
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Enhanced APO Dashboard
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Advanced automation potential analysis with ML-driven factor weighting and time projections
      </Typography>
      
      <Divider sx={{ my: 3 }} />
      
      {/* Occupation Search */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Select Occupation
        </Typography>
        <OccupationSearch onOccupationSelect={handleOccupationSelect} />
      </Paper>
      
      {/* Loading and Error States */}
      {isLoading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Occupation Details */}
      {occupation && !isLoading && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h5">
                {occupation.title}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {occupation.description}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} textAlign="right">
              <Button 
                variant="contained" 
                color="primary" 
                onClick={calculateEnhancedApo}
                disabled={isLoading}
              >
                {isLoading ? 'Calculating...' : 'Calculate Enhanced APO'}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {/* APO Results */}
      {apoResult && !isLoading && (
        <EnhancedApoVisualizer
          apoResult={apoResult}
          scenarios={scenarioResults}
          skillsAnalysis={skillsAnalysis}
          skillClusters={skillClusters}
        />
      )}
      
      {/* Custom Scenario Builder */}
      {occupation && !isLoading && (
        <Accordion sx={{ mt: 3 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Custom Scenario Builder</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Scenario Name"
                  value={customScenario.name}
                  onChange={(e) => updateCustomScenario('name', e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Description"
                  value={customScenario.description}
                  onChange={(e) => updateCustomScenario('description', e.target.value)}
                  fullWidth
                  margin="normal"
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Factor Adjustments
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                  Values above 1.0 increase the factor's impact, below 1.0 decrease it
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Task Complexity"
                      type="number"
                      value={customScenario.factorAdjustments.taskComplexity || ''}
                      onChange={(e) => updateCustomScenario('factor.taskComplexity', e.target.value)}
                      fullWidth
                      margin="normal"
                      inputProps={{ step: 0.1, min: 0.1, max: 2.0 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Collaboration Requirements"
                      type="number"
                      value={customScenario.factorAdjustments.collaborationRequirements || ''}
                      onChange={(e) => updateCustomScenario('factor.collaborationRequirements', e.target.value)}
                      fullWidth
                      margin="normal"
                      inputProps={{ step: 0.1, min: 0.1, max: 2.0 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Industry Adoption"
                      type="number"
                      value={customScenario.factorAdjustments.industryAdoption || ''}
                      onChange={(e) => updateCustomScenario('factor.industryAdoption', e.target.value)}
                      fullWidth
                      margin="normal"
                      inputProps={{ step: 0.1, min: 0.1, max: 2.0 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Emerging Tech Impact"
                      type="number"
                      value={customScenario.factorAdjustments.emergingTechImpact || ''}
                      onChange={(e) => updateCustomScenario('factor.emergingTechImpact', e.target.value)}
                      fullWidth
                      margin="normal"
                      inputProps={{ step: 0.1, min: 0.1, max: 2.0 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Regional Factors"
                      type="number"
                      value={customScenario.factorAdjustments.regionalFactors || ''}
                      onChange={(e) => updateCustomScenario('factor.regionalFactors', e.target.value)}
                      fullWidth
                      margin="normal"
                      inputProps={{ step: 0.1, min: 0.1, max: 2.0 }}
                    />
                  </Grid>
                </Grid>
              </Grid>
              
              <Grid item xs={12} textAlign="right">
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={addCustomScenario}
                >
                  Add Scenario
                </Button>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}
      
      {/* Snackbar for messages */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EnhancedApoController;
