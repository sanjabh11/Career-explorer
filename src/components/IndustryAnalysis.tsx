import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IndustryContext, getIndustrySpecificFactor, getLaborMarketImpact, getTechAdoptionImpact } from '@/utils/industryFactors';
import styles from '@/styles/IndustryAnalysis.module.css';

interface IndustryAnalysisProps {
  baseAutomationScore: number;
  onIndustryFactorChange: (factor: number) => void;
}

const IndustryAnalysis: React.FC<IndustryAnalysisProps> = ({
  baseAutomationScore,
  onIndustryFactorChange
}) => {
  const [industryContext, setIndustryContext] = React.useState<IndustryContext>({
    sector: 'Technology',
    techAdoptionRate: 75,
    laborMarketFactors: 50,
    region: 'North America'
  });

  const sectors = [
    'Technology',
    'Healthcare',
    'Finance',
    'Manufacturing',
    'Retail',
    'Education',
    'Construction',
    'Agriculture'
  ];

  const regions = [
    'North America',
    'Western Europe',
    'Asia Pacific',
    'Eastern Europe',
    'Latin America',
    'Middle East',
    'Africa',
    'South Asia',
    'Southeast Asia',
    'Oceania'
  ];

  React.useEffect(() => {
    const factor = getIndustrySpecificFactor(industryContext);
    onIndustryFactorChange(factor);
  }, [industryContext, onIndustryFactorChange]);

  const adjustedScore = React.useMemo(() => {
    const industryFactor = getIndustrySpecificFactor(industryContext);
    const laborAdjusted = getLaborMarketImpact(baseAutomationScore, industryContext.laborMarketFactors);
    const finalScore = getTechAdoptionImpact(laborAdjusted, industryContext.techAdoptionRate);
    return finalScore * industryFactor;
  }, [baseAutomationScore, industryContext]);

  return (
    <div className={styles.container}>
      <Card>
        <CardHeader>
          <CardTitle>Industry & Regional Analysis</CardTitle>
        </CardHeader>
        <CardContent className={styles.cardContent}>
          <div className={styles.formControl}>
            <label htmlFor="sector" className={styles.label}>Industry Sector</label>
            <Select
              value={industryContext.sector}
              onValueChange={(value) => setIndustryContext(prev => ({ ...prev, sector: value }))}
            >
              <SelectTrigger id="sector">
                <SelectValue placeholder="Select industry sector" />
              </SelectTrigger>
              <SelectContent>
                {sectors.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className={styles.formControl}>
            <label htmlFor="region" className={styles.label}>Region</label>
            <Select
              value={industryContext.region}
              onValueChange={(value) => setIndustryContext(prev => ({ ...prev, region: value }))}
            >
              <SelectTrigger id="region">
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className={styles.formControl}>
            <label htmlFor="tech-adoption" className={styles.label}>
              Technology Adoption Rate
              <span className={styles.valueDisplay}>{industryContext.techAdoptionRate}%</span>
            </label>
            <input
              type="range"
              id="tech-adoption"
              min="0"
              max="100"
              step="1"
              value={industryContext.techAdoptionRate}
              onChange={(e) => setIndustryContext(prev => ({ 
                ...prev, 
                techAdoptionRate: parseInt(e.target.value, 10) 
              }))}
              className={styles.rangeInput}
            />
          </div>

          <div className={styles.formControl}>
            <label htmlFor="labor-market" className={styles.label}>
              Labor Market Factors
              <span className={styles.valueDisplay}>{industryContext.laborMarketFactors}%</span>
            </label>
            <input
              type="range"
              id="labor-market"
              min="0"
              max="100"
              step="1"
              value={industryContext.laborMarketFactors}
              onChange={(e) => setIndustryContext(prev => ({ 
                ...prev, 
                laborMarketFactors: parseInt(e.target.value, 10) 
              }))}
              className={styles.rangeInput}
            />
          </div>

          <div className={styles.sectionDivider}>
            <div className={styles.scoreDisplay}>
              <span className={styles.scoreLabel}>Adjusted Automation Score</span>
              <span className={styles.scoreValue}>{Math.round(adjustedScore * 100)}%</span>
            </div>
            <Progress value={adjustedScore * 100} className="w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IndustryAnalysis;
