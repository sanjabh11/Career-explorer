import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { getTimeBasedAdjustment, getSkillObsolescenceTimeline, getIndustryAutomationTimeline } from '@/utils/timeBasedAdjustments';
import { EmergingTechnology, calculateEmergingTechImpact, getTechnologyRecommendations, emergingTechnologies } from '@/utils/emergingTechFactors';
import { AutomationFactor } from '@/types/automation';
import styles from '@/styles/TimeBasedAnalysis.module.css';

interface TimeBasedAnalysisProps {
  baseAutomationScore: number;
  industry: string;
  region: string;
  skillset: string[];
  task: AutomationFactor;
}

const TimeBasedAnalysis: React.FC<TimeBasedAnalysisProps> = ({
  baseAutomationScore,
  industry,
  region,
  skillset,
  task
}) => {
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
      skillset
    );
  }, [baseAutomationScore, timeframe, industry, region, skillset]);

  const techImpact = React.useMemo(() => {
    return calculateEmergingTechImpact(task, selectedTechs);
  }, [task, selectedTechs]);

  const finalScore = timeAdjustedScore * (1 + techImpact);
  
  // Get relevant technology recommendations
  const techRecommendations = React.useMemo(() => {
    return getTechnologyRecommendations(industry, skillset);
  }, [industry, skillset]);

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
                {techRecommendations.map((tech) => (
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
                        ({tech.timeToMaturity} {tech.timeToMaturity === 1 ? 'year' : 'years'} to maturity)
                      </span>
                    </label>
                    <p className={styles.techDescription}>{tech.description}</p>
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
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default TimeBasedAnalysis;
