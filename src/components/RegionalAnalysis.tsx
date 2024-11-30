import React, { useState, useEffect } from 'react';
import styles from '../styles/RegionalAnalysis.module.css';
import {
  RegionalMarketData,
  RegionalInsight,
  RegionalTrend,
  RegionalComparison
} from '../types/regional';
import {
  calculateRegionalImpact,
  generateRegionalInsights,
  analyzeRegionalTrends,
  compareRegions
} from '../utils/regionalAnalysis';

interface RegionalAnalysisProps {
  baseScore: number;
  selectedRegion: string;
  onRegionalFactorChange: (factor: number) => void;
}

export const RegionalAnalysis: React.FC<RegionalAnalysisProps> = ({
  baseScore,
  selectedRegion,
  onRegionalFactorChange
}) => {
  const [regionalData, setRegionalData] = useState<RegionalMarketData | null>(null);
  const [insights, setInsights] = useState<RegionalInsight[]>([]);
  const [trends, setTrends] = useState<RegionalTrend[]>([]);
  const [comparisons, setComparisons] = useState<RegionalComparison[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegionalData = async () => {
      setLoading(true);
      try {
        // Fetch regional data from API
        const response = await fetch(`/api/regional-data/${selectedRegion}`);
        const data = await response.json();
        setRegionalData(data);

        // Calculate regional impact
        const impact = calculateRegionalImpact(baseScore, data);
        onRegionalFactorChange(impact);

        // Generate insights and trends
        setInsights(generateRegionalInsights(data));
        setTrends(analyzeRegionalTrends([data], 5)); // 5-year forecast

        // Fetch and compare nearby regions
        const nearbyResponse = await fetch(`/api/nearby-regions/${selectedRegion}`);
        const nearbyData = await nearbyResponse.json();
        setComparisons(compareRegions([data, ...nearbyData]));
      } catch (error) {
        console.error('Error fetching regional data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegionalData();
  }, [selectedRegion, baseScore]);

  if (loading || !regionalData) {
    return <div>Loading regional analysis...</div>;
  }

  return (
    <div className={styles['regional-analysis']}>
      <h2>Regional Market Analysis</h2>
      
      {/* Market Indicators */}
      <section className={styles['market-indicators']}>
        <h3>Market Indicators</h3>
        <div className={styles['indicator-grid']}>
          <div className={styles.indicator}>
            <label>GDP Growth</label>
            <span className={styles['indicator-value']}>{regionalData.marketIndicators.gdpGrowth}%</span>
          </div>
          <div className={styles.indicator}>
            <label>Employment Rate</label>
            <span className={styles['indicator-value']}>{regionalData.marketIndicators.employmentRate}%</span>
          </div>
          <div className={styles.indicator}>
            <label>Innovation Index</label>
            <span className={styles['indicator-value']}>{regionalData.marketIndicators.innovationIndex}</span>
          </div>
        </div>
      </section>

      {/* Regional Insights */}
      <section className={styles['regional-insights']}>
        <h3>Key Insights</h3>
        <div className={styles['insights-list']}>
          {insights.map((insight, index) => (
            <div key={index} className={`${styles.insight} ${styles[insight.type]}`}>
              <h4>{insight.type.toUpperCase()}</h4>
              <p>{insight.description}</p>
              <div className={styles['insight-meta']}>
                <span>Impact: {insight.impact * 100}%</span>
                <span>Timeframe: {insight.timeframe}</span>
                <span>Confidence: {insight.confidence * 100}%</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trend Analysis */}
      <section className={styles['trend-analysis']}>
        <h3>Market Trends</h3>
        <div className={styles['trends-grid']}>
          {trends.map((trend, index) => (
            <div key={index} className={styles['trend-card']}>
              <h4>{trend.indicator}</h4>
              {/* Add trend visualization here */}
              <div className={styles['trend-forecast']}>
                <h5>Forecast</h5>
                <ul>
                  {trend.forecast.map((point, i) => (
                    <li key={i}>
                      {point.date}: {point.value} 
                      (Confidence: {point.confidence * 100}%)
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Regional Comparison */}
      <section className={styles['regional-comparison']}>
        <h3>Regional Comparison</h3>
        <div className={styles['comparison-table']}>
          <table>
            <thead>
              <tr>
                <th>Region</th>
                <th>Ranking</th>
                <th>Strengths</th>
                <th>Weaknesses</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((comparison, index) => (
                <tr key={index}>
                  <td>{comparison.regionCode}</td>
                  <td>{comparison.ranking}</td>
                  <td>{comparison.strengthFactors.join(', ')}</td>
                  <td>{comparison.weaknessFactors.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
