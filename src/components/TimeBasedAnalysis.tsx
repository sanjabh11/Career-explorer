import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { getTimeBasedAdjustment, getSkillObsolescenceTimeline, getIndustryAutomationTimeline } from '@/utils/timeBasedAdjustments';
import { EmergingTechnology } from '../types/emergingTech';
import { calculateEmergingTechImpact, getTechnologyRecommendations, emergingTechnologies } from '../utils/emergingTechFactors';
import { HistoricalDataPoint } from '../types/historicalData';
import { AutomationFactor } from '@/types/automation';
import { HistoricalCorrelationEngine } from '../utils/historicalCorrelation';
import { ConfidenceScoringSystem } from '../utils/confidenceScoring';
import styles from '@/styles/TimeBasedAnalysis.module.css';

interface TimeBasedAnalysisProps {
  technology: EmergingTechnology;
  historicalData: HistoricalDataPoint[];
  timeframeYears: number;
  baseAutomationScore: number;
  industry: string;
  region: string;
  occupation: string;
  task: string;
}

const TimeBasedAnalysis: React.FC<TimeBasedAnalysisProps> = ({
  technology,
  historicalData,
  timeframeYears,
  baseAutomationScore,
  industry,
  region,
  occupation,
  task
}) => {
  const correlationEngine = new HistoricalCorrelationEngine();
  const confidenceSystem = new ConfidenceScoringSystem();

  // Add historical data points
  historicalData.forEach(dataPoint => correlationEngine.addDataPoint(dataPoint));

  // Calculate correlations and confidence
  const correlation = correlationEngine.analyzeCorrelation(
    technology,
    timeframeYears * 12
  );

  const confidence = confidenceSystem.calculateConfidence(
    technology,
    timeframeYears,
    historicalData.length
  );

  const [timeframe, setTimeframe] = React.useState(5); // Default 5 years
  const [selectedTechs, setSelectedTechs] = React.useState<EmergingTechnology[]>([]);
  
  const timeframeOptions = [1, 2, 3, 5, 10];
  
  // Calculate adjusted scores
  const timeAdjustedScore = React.useMemo(() => {
    return getTimeBasedAdjustment(
      baseAutomationScore,
      timeframe,
      industry,
      region,
      occupation
    );
  }, [baseAutomationScore, timeframe, industry, region, occupation]);

  const techImpact = React.useMemo(() => {
    return calculateEmergingTechImpact(task, selectedTechs);
  }, [task, selectedTechs]);

  const finalScore = timeAdjustedScore * (1 + techImpact);
  
  // Get relevant technology recommendations
  const techRecommendations = React.useMemo(() => {
    return getTechnologyRecommendations(industry, occupation);
  }, [industry, occupation]);

  return (
    <TooltipProvider>
      <div className={styles.container}>
        <Card>
          <CardHeader>
            <CardTitle>Time-Based & Technology Impact Analysis</CardTitle>
          </CardHeader>
          <CardContent className={styles.cardContent}>
            <div className={styles.formControl}>
              <div className={styles.labelWithTooltip}>
                <label htmlFor="timeframe" className={styles.label}>Projection Timeframe</label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select the number of years to project automation potential into the future.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select
                value={timeframe.toString()}
                onValueChange={(value) => setTimeframe(parseInt(value, 10))}
              >
                <SelectTrigger id="timeframe">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  {timeframeOptions.map((years) => (
                    <SelectItem key={years} value={years.toString()}>
                      {years} {years === 1 ? 'Year' : 'Years'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className={styles.techSection}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Emerging Technologies</h3>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Technologies likely to impact this role's automation potential.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              <div className={styles.techList}>
                {techRecommendations.map((tech: EmergingTechnology) => (
                  <div key={tech.name} className={styles.techItem}>
                    <label className={styles.techLabel}>
                      <input
                        type="checkbox"
                        checked={selectedTechs.some(t => t.name === tech.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTechs([...selectedTechs, tech]);
                          } else {
                            setSelectedTechs(selectedTechs.filter(t => t.name !== tech.name));
                          }
                        }}
                        className={styles.techCheckbox}
                      />
                      <span className={styles.techName}>{tech.name}</span>
                      <span className={styles.techMaturity}>
                        ({tech.timeToMainstream} {tech.timeToMainstream === 1 ? 'month' : 'months'} to mainstream)
                      </span>
                    </label>
                    <p className={styles.techDescription}>
                      Impact Score: {(tech.impactScore * 100).toFixed(0)}% | 
                      Maturity: {tech.maturityLevel}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.scoreSection}>
              <div className={styles.scoreRow}>
                <div className={styles.labelWithTooltip}>
                  <span className={styles.scoreLabel}>Time-Adjusted Score</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Base automation score adjusted for time-based factors including industry growth and skill obsolescence.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className={styles.scoreValue}>{Math.round(timeAdjustedScore * 100)}%</span>
              </div>
              <Progress value={timeAdjustedScore * 100} className="w-full mb-4" />

              <div className={styles.scoreRow}>
                <div className={styles.labelWithTooltip}>
                  <span className={styles.scoreLabel}>Technology Impact</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Additional impact from selected emerging technologies.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className={styles.scoreValue}>+{Math.round(techImpact * 100)}%</span>
              </div>
              <Progress value={techImpact * 100} className="w-full mb-4" />

              <div className={styles.finalScore}>
                <div className={styles.labelWithTooltip}>
                  <span className={styles.scoreLabel}>Final Projected Score</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Combined automation potential considering time-based factors and emerging technologies.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className={styles.finalScoreValue}>{Math.round(finalScore * 100)}%</span>
              </div>
              <Progress value={finalScore * 100} className="w-full" />
            </div>

            <div className={styles.trendAnalysisSection}>
              <div className={styles.header}>
                <h2>Time-Based Analysis</h2>
                <div className={styles.confidenceIndicator}>
                  Confidence Score: {(confidence.overall * 100).toFixed(1)}%
                </div>
              </div>

              <div className={styles.content}>
                <div className={styles.trendAnalysis}>
                  <h3>Trend Analysis</h3>
                  <div className={styles.trendDirection}>
                    <TrendIndicator
                      direction={correlation.trendDirection}
                      strength={correlation.correlationScore}
                    />
                  </div>
                  <div className={styles.keyFactors}>
                    <h4>Key Influencing Factors</h4>
                    <ul>
                      {correlation.keyFactors.map(factor => (
                        <li key={factor}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className={styles.confidenceBreakdown}>
                  <h3>Confidence Breakdown</h3>
                  <div className={styles.metrics}>
                    <MetricBar
                      label="Data Quality"
                      value={confidence.breakdown.dataQuality}
                    />
                    <MetricBar
                      label="Market Stability"
                      value={confidence.breakdown.marketStability}
                    />
                    <MetricBar
                      label="Technology Maturity"
                      value={confidence.breakdown.technologyMaturity}
                    />
                    <MetricBar
                      label="Industry Relevance"
                      value={confidence.breakdown.industryRelevance}
                    />
                  </div>
                </div>

                <div className={styles.recommendations}>
                  <h3>Recommendations</h3>
                  <ul>
                    {confidence.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

const TrendIndicator: React.FC<{
  direction: 'increasing' | 'decreasing' | 'stable';
  strength: number;
}> = ({ direction, strength }) => (
  <div className={`${styles.trend} ${styles[direction]}`}>
    <span className={styles.arrow}>
      {direction === 'increasing' ? '↑' : 
       direction === 'decreasing' ? '↓' : '→'}
    </span>
    <span className={styles.strength}>
      {(strength * 100).toFixed(1)}% confidence
    </span>
  </div>
);

const MetricBar: React.FC<{
  label: string;
  value: number;
}> = ({ label, value }) => (
  <div className={styles.metricBar}>
    <span className={styles.label}>{label}</span>
    <div className={styles.bar}>
      <div 
        className={styles.fill}
        style={{ width: `${value * 100}%` }}
      />
    </div>
    <span className={styles.value}>
      {(value * 100).toFixed(0)}%
    </span>
  </div>
);

export default TimeBasedAnalysis;
