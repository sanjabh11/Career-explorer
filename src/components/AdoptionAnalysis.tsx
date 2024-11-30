import React, { useState, useEffect } from 'react';
import styles from '../styles/AdoptionAnalysis.module.css';
import {
  TechnologyAdoption,
  AdoptionInsight,
  AdoptionTrend,
  AdoptionForecast
} from '../types/adoption';
import {
  calculateAdoptionImpact,
  generateAdoptionInsights,
  predictAdoptionTimeline
} from '../utils/adoptionAnalysis';

interface AdoptionAnalysisProps {
  baseScore: number;
  selectedIndustry: string;
  onAdoptionFactorChange: (factor: number) => void;
}

export const AdoptionAnalysis: React.FC<AdoptionAnalysisProps> = ({
  baseScore,
  selectedIndustry,
  onAdoptionFactorChange
}) => {
  const [adoptionData, setAdoptionData] = useState<TechnologyAdoption | null>(null);
  const [insights, setInsights] = useState<AdoptionInsight[]>([]);
  const [timeline, setTimeline] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdoptionData = async () => {
      setLoading(true);
      try {
        // Fetch adoption data from API
        const response = await fetch(`/api/adoption-data/${selectedIndustry}`);
        const data = await response.json();
        setAdoptionData(data);

        // Calculate impact and update parent
        const impact = calculateAdoptionImpact(baseScore, data, selectedIndustry);
        onAdoptionFactorChange(impact);

        // Generate insights
        setInsights(generateAdoptionInsights(data, selectedIndustry));

        // Predict timeline to reach 80% adoption
        setTimeline(predictAdoptionTimeline(data, 0.8));
      } catch (error) {
        console.error('Error fetching adoption data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdoptionData();
  }, [selectedIndustry, baseScore]);

  if (loading || !adoptionData) {
    return <div>Loading adoption analysis...</div>;
  }

  return (
    <div className={styles['adoption-analysis']}>
      <h2>Technology Adoption Analysis</h2>
      
      {/* Current Adoption Status */}
      <section className={styles['adoption-status']}>
        <h3>Current Adoption Status</h3>
        <div className={styles['status-grid']}>
          <div className={styles.metric}>
            <label>Current Rate</label>
            <span className={styles['metric-value']}>
              {(adoptionData.currentAdoptionRate * 100).toFixed(1)}%
            </span>
          </div>
          <div className={styles.metric}>
            <label>Industry Rate</label>
            <span className={styles['metric-value']}>
              {(adoptionData.industryRates.find(r => r.industry === selectedIndustry)?.rate || 0) * 100}%
            </span>
          </div>
          <div className={styles.metric}>
            <label>Time to Mainstream</label>
            <span className={styles['metric-value']}>
              {timeline !== null ? `${timeline} years` : 'N/A'}
            </span>
          </div>
        </div>
      </section>

      {/* Impact Factors */}
      <section className={styles['impact-factors']}>
        <h3>Adoption Impact Factors</h3>
        <div className={styles['factors-grid']}>
          {Object.entries(adoptionData.impactFactors).map(([factor, value]) => (
            <div key={factor} className={styles.factor}>
              <label>{factor.replace(/([A-Z])/g, ' $1').trim()}</label>
              <div className={styles['progress-bar']}>
                <div 
                  className={styles['progress-fill']}
                  style={{ width: `${value * 100}%` }}
                />
              </div>
              <span>{(value * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </section>

      {/* Adoption Insights */}
      <section className={styles['adoption-insights']}>
        <h3>Key Insights</h3>
        <div className={styles['insights-grid']}>
          {insights.map((insight, index) => (
            <div key={index} className={`${styles.insight} ${styles[insight.type]}`}>
              <h4>{insight.type.toUpperCase()}</h4>
              <p>{insight.description}</p>
              <div className={styles['action-items']}>
                <h5>Recommended Actions:</h5>
                <ul>
                  {insight.actionItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className={styles['insight-meta']}>
                <span>Impact: {(insight.impact * 100).toFixed(0)}%</span>
                <span>Timeframe: {insight.timeframe}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Adoption Forecast */}
      <section className={styles['adoption-forecast']}>
        <h3>Adoption Forecast</h3>
        <div className={styles['forecast-grid']}>
          {adoptionData.forecast.map((forecast, index) => (
            <div key={index} className={styles['forecast-card']}>
              <h4>{forecast.year}</h4>
              <div className={styles['forecast-details']}>
                <div className={styles['forecast-rate']}>
                  <label>Predicted Rate</label>
                  <span>{(forecast.predictedRate * 100).toFixed(1)}%</span>
                </div>
                <div className={styles['forecast-confidence']}>
                  <label>Confidence</label>
                  <span>{(forecast.confidence * 100).toFixed(0)}%</span>
                </div>
                <div className={styles['driving-factors']}>
                  <label>Driving Factors</label>
                  <ul>
                    {forecast.drivingFactors.map((factor, i) => (
                      <li key={i}>{factor}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
