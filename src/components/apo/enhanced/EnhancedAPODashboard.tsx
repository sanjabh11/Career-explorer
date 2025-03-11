/**
 * Enhanced APO Dashboard Component
 * Version 1.0
 * 
 * This component displays the enhanced APO calculation results
 * with time-based projections and factor breakdowns.
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { APOResult, TimeProjection } from '../../../types/apo';
import { SerpApiService } from '../../../services/api/SerpApiService';
import { JinaApiService } from '../../../services/api/JinaApiService';
import { calculateEnhancedAPO } from '../../../utils/apo/enhancedApoCalculation';

// Import existing services for O*NET data
import { getOccupationDetails } from '../../../services/OnetService';

// Import styles
import './EnhancedAPODashboard.css';

// Component version tracking
const VERSION = '1.0';

interface EnhancedAPODashboardProps {
  occupationId?: string;
}

const EnhancedAPODashboard: React.FC<EnhancedAPODashboardProps> = ({ occupationId: propOccupationId }) => {
  // Get occupationId from route params if not provided as prop
  const { occupationId: paramOccupationId } = useParams<{ occupationId: string }>();
  const occupationId = propOccupationId || paramOccupationId;
  
  // State for API data and loading status
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [apoResult, setApoResult] = useState<APOResult | null>(null);
  
  // API service instances
  const serpApiService = new SerpApiService(
    '', // API key not needed as we're using the proxy
    '' // Base URL not needed as we're using the proxy
  );
  
  const jinaApiService = new JinaApiService(
    '', // API key not needed as we're using the proxy
    '' // Base URL not needed as we're using the proxy
  );
  
  // Fetch data and calculate APO
  useEffect(() => {
    const fetchData = async () => {
      if (!occupationId) {
        setError('No occupation ID provided');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // 1. Fetch occupation details from O*NET
        const occupationDetails = await getOccupationDetails(occupationId);
        
        // 2. Fetch automation research from SerpAPI
        const researchData = await serpApiService.getAutomationResearch(occupationDetails.title);
        
        // 3. Perform semantic analysis with JinaAPI
        const tasks = occupationDetails.tasks.map(task => ({
          id: task.id || `task-${Math.random().toString(36).substr(2, 9)}`,
          description: task.description
        }));
        
        // Convert O*NET skills to the format expected by JinaApiService
        const skillsForJina = occupationDetails.skills.map(skill => ({
          id: skill.id || `skill-${Math.random().toString(36).substr(2, 9)}`,
          name: skill.name,
          description: skill.description || '',
          category: skill.category
        }));
        
        const jinaAnalysis = await jinaApiService.analyzeOccupation({
          id: occupationId,
          title: occupationDetails.title,
          tasks,
          skills: skillsForJina
        });
        
        // 4. Calculate enhanced APO
        // Convert O*NET occupation details to the format expected by calculateEnhancedAPO
        const formattedOccupationDetails = {
          id: occupationId,
          title: occupationDetails.title,
          description: occupationDetails.description,
          tasks: occupationDetails.tasks.map(task => ({
            id: task.id || `task-${Math.random().toString(36).substr(2, 9)}`,
            description: task.description,
            importance: task.importance
          })),
          skills: occupationDetails.skills.map(skill => ({
            id: skill.id || `skill-${Math.random().toString(36).substr(2, 9)}`,
            name: skill.name,
            importance: skill.importance,
            level: skill.level,
            category: skill.category || 'General'
          }))
        };
        
        const result = calculateEnhancedAPO(
          formattedOccupationDetails,
          researchData,
          jinaAnalysis
        );
        
        setApoResult(result);
        setError(null);
      } catch (err) {
        console.error('Error calculating enhanced APO:', err);
        setError('Failed to calculate enhanced APO. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [occupationId]);
  
  // Render loading state
  if (loading) {
    return (
      <div className="enhanced-apo-dashboard loading">
        <h2>Calculating Enhanced APO</h2>
        <p>Please wait while we analyze automation potential using AI...</p>
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="enhanced-apo-dashboard error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }
  
  // Render empty state
  if (!apoResult) {
    return (
      <div className="enhanced-apo-dashboard empty">
        <h2>No Data Available</h2>
        <p>Please select an occupation to view its automation potential.</p>
      </div>
    );
  }
  
  // Render dashboard with data
  return (
    <div className="enhanced-apo-dashboard">
      <header className="dashboard-header">
        <h1>{apoResult.occupationTitle}</h1>
        <div className="version-tag">v{VERSION}</div>
      </header>
      
      <section className="apo-overview">
        <h2>Automation Potential Overview</h2>
        <div className="apo-score-container">
          <div className="apo-score">
            <h3>Overall Score</h3>
            <div className="score-circle">
              {Math.round(apoResult.overallScore * 100)}%
            </div>
            <div className="confidence-indicator">
              Confidence: {Math.round(apoResult.confidence * 100)}%
            </div>
          </div>
          
          <div className="apo-summary">
            <h3>Summary</h3>
            <p>
              {apoResult.overallScore < 0.3 ? 
                `This occupation has a low automation risk (${Math.round(apoResult.overallScore * 100)}%).` :
                apoResult.overallScore < 0.7 ?
                `This occupation has a moderate automation risk (${Math.round(apoResult.overallScore * 100)}%).` :
                `This occupation has a high automation risk (${Math.round(apoResult.overallScore * 100)}%).`
              }
            </p>
            <p>
              Based on our analysis of task complexity, industry trends, and emerging technologies,
              this occupation is likely to experience {getAutomationImpactText(apoResult.overallScore)}.
            </p>
          </div>
        </div>
      </section>
      
      <section className="time-projections">
        <h2>Automation Projections</h2>
        <div className="projections-chart">
          {/* Placeholder for time projections chart */}
          <div className="chart-placeholder">
            <table className="projections-table">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Projected Score</th>
                  <th>Confidence</th>
                  <th>Key Drivers</th>
                </tr>
              </thead>
              <tbody>
                {apoResult.timeProjections.map((projection: TimeProjection) => (
                  <tr key={projection.year}>
                    <td>{projection.year}</td>
                    <td>{Math.round(projection.score * 100)}%</td>
                    <td>{Math.round(projection.confidence * 100)}%</td>
                    <td>{projection.keyDrivers.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      
      <section className="factor-breakdown">
        <h2>Factor Breakdown</h2>
        <div className="factors-grid">
          <div className="factor-card">
            <h3>Task Complexity</h3>
            <div className="factor-score">
              {Math.round(apoResult.factorBreakdown.taskComplexity * 100)}%
            </div>
            <p>Impact of task complexity on automation potential</p>
          </div>
          
          <div className="factor-card">
            <h3>Collaboration</h3>
            <div className="factor-score">
              {Math.round(apoResult.factorBreakdown.collaborationRequirements * 100)}%
            </div>
            <p>Impact of human collaboration requirements</p>
          </div>
          
          <div className="factor-card">
            <h3>Industry Adoption</h3>
            <div className="factor-score">
              {Math.round(apoResult.factorBreakdown.industryAdoption * 100)}%
            </div>
            <p>Rate of technology adoption in the industry</p>
          </div>
          
          <div className="factor-card">
            <h3>Emerging Tech</h3>
            <div className="factor-score">
              {Math.round(apoResult.factorBreakdown.emergingTechImpact * 100)}%
            </div>
            <p>Impact of emerging technologies</p>
          </div>
        </div>
        
        {/* New interactive radar chart for factor breakdown */}
        <div className="radar-chart-container">
          <h3>Factor Analysis</h3>
          <div className="radar-chart">
            {/* Placeholder for radar chart - would be implemented with a charting library like Chart.js */}
            <div className="chart-placeholder">
              <p>Interactive radar chart showing the relationship between different factors</p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="interactive-analysis-tools">
        <h2>Interactive Analysis Tools</h2>
        
        <div className="tools-container">
          <div className="what-if-scenario">
            <h3>What-If Scenario Modeling</h3>
            <p>Adjust factors to see how they might impact automation potential over time.</p>
            
            <div className="scenario-controls">
              <div className="control-group">
                <label>Industry Adoption Rate:</label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  defaultValue={Math.round(apoResult.factorBreakdown.industryAdoption * 100)} 
                  className="slider"
                />
                <span className="value-display">{Math.round(apoResult.factorBreakdown.industryAdoption * 100)}%</span>
              </div>
              
              <div className="control-group">
                <label>Emerging Technology Impact:</label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  defaultValue={Math.round(apoResult.factorBreakdown.emergingTechImpact * 100)} 
                  className="slider"
                />
                <span className="value-display">{Math.round(apoResult.factorBreakdown.emergingTechImpact * 100)}%</span>
              </div>
              
              <div className="control-group">
                <label>Task Complexity:</label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  defaultValue={Math.round(apoResult.factorBreakdown.taskComplexity * 100)} 
                  className="slider"
                />
                <span className="value-display">{Math.round(apoResult.factorBreakdown.taskComplexity * 100)}%</span>
              </div>
              
              <div className="control-group">
                <label>Collaboration Requirements:</label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  defaultValue={Math.round(apoResult.factorBreakdown.collaborationRequirements * 100)} 
                  className="slider"
                />
                <span className="value-display">{Math.round(apoResult.factorBreakdown.collaborationRequirements * 100)}%</span>
              </div>
              
              <button className="recalculate-button">Recalculate Projection</button>
            </div>
            
            <div className="scenario-results">
              <h4>Projected Outcome</h4>
              <div className="projection-chart-placeholder">
                <p>Interactive chart showing projected automation potential based on adjusted factors</p>
              </div>
            </div>
          </div>
          
          <div className="skill-development-simulator">
            <h3>Skill Development Simulator</h3>
            <p>Explore how developing specific skills might impact your career resilience.</p>
            
            <div className="skill-selection">
              <h4>Select Skills to Develop</h4>
              
              <div className="skill-category">
                <h5>Emerging Skills</h5>
                <div className="skill-options">
                  {apoResult.skillsImpact.emergingSkills.map((skill, index) => (
                    <div key={index} className="skill-option">
                      <input type="checkbox" id={`skill-${skill.id}`} />
                      <label htmlFor={`skill-${skill.id}`}>{skill.name}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="skill-category">
                <h5>Low Risk Skills</h5>
                <div className="skill-options">
                  {apoResult.skillsImpact.lowRisk.map((skill, index) => (
                    <div key={index} className="skill-option">
                      <input type="checkbox" id={`skill-${skill.id}`} />
                      <label htmlFor={`skill-${skill.id}`}>{skill.name}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="development-timeline">
                <h4>Development Timeline</h4>
                <select className="timeline-select">
                  <option value="6months">6 Months</option>
                  <option value="1year">1 Year</option>
                  <option value="2years">2 Years</option>
                  <option value="5years">5 Years</option>
                </select>
                
                <button className="simulate-button">Simulate Career Impact</button>
              </div>
            </div>
            
            <div className="simulation-results">
              <h4>Simulation Results</h4>
              <div className="results-chart-placeholder">
                <p>Interactive chart showing projected career resilience based on skill development</p>
              </div>
              
              <div className="career-paths">
                <h4>Potential Career Paths</h4>
                <ul className="path-list">
                  <li className="path-item">
                    <span className="path-title">Data Science Specialist</span>
                    <span className="path-match">85% Match</span>
                  </li>
                  <li className="path-item">
                    <span className="path-title">AI Implementation Consultant</span>
                    <span className="path-match">78% Match</span>
                  </li>
                  <li className="path-item">
                    <span className="path-title">Digital Transformation Manager</span>
                    <span className="path-match">72% Match</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="skills-impact">
        <h2>Skills Impact</h2>
        <div className="skills-grid">
          <div className="skills-column high-risk">
            <h3>High Risk Skills</h3>
            <ul>
              {apoResult.skillsImpact.highRisk.map(skill => (
                <li key={skill.id}>
                  <span className="skill-name">{skill.name}</span>
                  <span className="skill-type">{skill.type}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="skills-column moderate-risk">
            <h3>Moderate Risk Skills</h3>
            <ul>
              {apoResult.skillsImpact.moderateRisk.map(skill => (
                <li key={skill.id}>
                  <span className="skill-name">{skill.name}</span>
                  <span className="skill-type">{skill.type}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="skills-column low-risk">
            <h3>Low Risk Skills</h3>
            <ul>
              {apoResult.skillsImpact.lowRisk.map(skill => (
                <li key={skill.id}>
                  <span className="skill-name">{skill.name}</span>
                  <span className="skill-type">{skill.type}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="skills-column emerging">
            <h3>Emerging Skills</h3>
            <ul>
              {apoResult.skillsImpact.emergingSkills.map(skill => (
                <li key={skill.id}>
                  <span className="skill-name">{skill.name}</span>
                  <span className="skill-type">{skill.type}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      
      <section className="comprehensive-assessment">
        <h2>Comprehensive Automation Assessment</h2>
        
        <div className="assessment-tabs">
          <div className="tab-headers">
            <button className="tab-button active">Task Analysis</button>
            <button className="tab-button">Skill Impact</button>
            <button className="tab-button">Technology Trends</button>
            <button className="tab-button">Industry Context</button>
          </div>
          
          <div className="tab-content active">
            <h3>Task Analysis</h3>
            <div className="task-analysis-grid">
              <div className="task-category">
                <h4>Highly Automatable Tasks</h4>
                <ul className="task-list">
                  {apoResult.taskAnalysis?.highRiskTasks?.map((task, index) => (
                    <li key={index} className="task-item">
                      <div className="task-name">{task.description}</div>
                      <div className="task-score">{Math.round(task.automationPotential * 100)}%</div>
                      <div className="task-reason">{task.reason}</div>
                    </li>
                  )) || <li>No data available</li>}
                </ul>
              </div>
              
              <div className="task-category">
                <h4>Partially Automatable Tasks</h4>
                <ul className="task-list">
                  {apoResult.taskAnalysis?.moderateRiskTasks?.map((task, index) => (
                    <li key={index} className="task-item">
                      <div className="task-name">{task.description}</div>
                      <div className="task-score">{Math.round(task.automationPotential * 100)}%</div>
                      <div className="task-reason">{task.reason}</div>
                    </li>
                  )) || <li>No data available</li>}
                </ul>
              </div>
              
              <div className="task-category">
                <h4>Human-Centric Tasks</h4>
                <ul className="task-list">
                  {apoResult.taskAnalysis?.lowRiskTasks?.map((task, index) => (
                    <li key={index} className="task-item">
                      <div className="task-name">{task.description}</div>
                      <div className="task-score">{Math.round(task.automationPotential * 100)}%</div>
                      <div className="task-reason">{task.reason}</div>
                    </li>
                  )) || <li>No data available</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="recommendations">
        <h2>Career Recommendations</h2>
        <div className="recommendations-list">
          {apoResult.recommendations.map((recommendation, index) => (
            <div key={index} className={`recommendation-card ${recommendation.impact.toLowerCase()}-impact`}>
              <h3>{recommendation.title}</h3>
              <div className="recommendation-meta">
                <span className="timeframe">{recommendation.timeframe}</span>
                <span className="impact">{recommendation.impact} Impact</span>
              </div>
              <p>{recommendation.description}</p>
            </div>
          ))}
        </div>
      </section>
      
      <footer className="dashboard-footer">
        <div className="data-sources">
          <h4>Data Sources</h4>
          <ul>
            <li>O*NET Data: {formatDate(apoResult.dataSourceInfo.onetDataDate)}</li>
            <li>Research Data: {formatDate(apoResult.dataSourceInfo.researchDataDate)}</li>
            <li>Semantic Analysis: {formatDate(apoResult.dataSourceInfo.semanticAnalysisDate)}</li>
          </ul>
        </div>
      </footer>
    </div>
  );
};

// Helper functions
function getAutomationImpactText(score: number): string {
  if (score < 0.3) {
    return 'minimal changes in the next 5-10 years';
  } else if (score < 0.5) {
    return 'gradual changes over the next 5-7 years';
  } else if (score < 0.7) {
    return 'significant changes in the next 3-5 years';
  } else {
    return 'rapid transformation in the next 1-3 years';
  }
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch (e) {
    return 'Unknown';
  }
}

export default EnhancedAPODashboard;
