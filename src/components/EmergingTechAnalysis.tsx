import React, { useState, useEffect } from 'react';
import styles from '../styles/EmergingTechAnalysis.module.css';
import {
  EmergingTechnology,
  EmergingTechAnalysis,
  JobImpactAnalysis,
  SkillGapAnalysis,
  ImplementationReadiness,
  TimelineProjection
} from '../types/emergingTech';
import { analyzeEmergingTechnology } from '../utils/emergingTechAnalysis';

interface EmergingTechAnalysisProps {
  technology: EmergingTechnology;
  currentSkills: string[];
  industryContext: string;
  onAnalysisComplete: (analysis: EmergingTechAnalysis) => void;
}

export const EmergingTechAnalysisComponent: React.FC<EmergingTechAnalysisProps> = ({
  technology,
  currentSkills,
  industryContext,
  onAnalysisComplete
}) => {
  const [analysis, setAnalysis] = useState<EmergingTechAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<'impact' | 'skills' | 'readiness' | 'timeline'>('impact');

  useEffect(() => {
    const result = analyzeEmergingTechnology(technology, currentSkills, industryContext);
    setAnalysis(result);
    onAnalysisComplete(result);
  }, [technology, currentSkills, industryContext]);

  if (!analysis) {
    return <div>Loading analysis...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2>{technology.name} Analysis</h2>
        <div className={styles.maturityBadge}>
          {technology.maturityLevel}
        </div>
      </header>

      <nav className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'impact' ? styles.active : ''}`}
          onClick={() => setActiveTab('impact')}
        >
          Job Impact
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'skills' ? styles.active : ''}`}
          onClick={() => setActiveTab('skills')}
        >
          Skills Gap
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'readiness' ? styles.active : ''}`}
          onClick={() => setActiveTab('readiness')}
        >
          Implementation
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'timeline' ? styles.active : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          Timeline
        </button>
      </nav>

      <div className={styles.content}>
        {activeTab === 'impact' && (
          <JobImpactSection impact={analysis.jobImpact} />
        )}
        {activeTab === 'skills' && (
          <SkillGapSection gap={analysis.skillGapAnalysis} />
        )}
        {activeTab === 'readiness' && (
          <ReadinessSection readiness={analysis.implementationReadiness} />
        )}
        {activeTab === 'timeline' && (
          <TimelineSection timeline={analysis.timelineProjection} />
        )}
      </div>
    </div>
  );
};

const JobImpactSection: React.FC<{ impact: JobImpactAnalysis }> = ({ impact }) => (
  <div className={styles.section}>
    <div className={styles.metrics}>
      <div className={styles.metric}>
        <label>Automation Risk</label>
        <div className={styles.progressBar}>
          <div 
            className={`${styles.progress} ${styles.risk}`}
            style={{ width: `${impact.automationRisk * 100}%` }}
          />
        </div>
        <span>{(impact.automationRisk * 100).toFixed(1)}%</span>
      </div>
      <div className={styles.metric}>
        <label>Augmentation Potential</label>
        <div className={styles.progressBar}>
          <div 
            className={`${styles.progress} ${styles.potential}`}
            style={{ width: `${impact.augmentationPotential * 100}%` }}
          />
        </div>
        <span>{(impact.augmentationPotential * 100).toFixed(1)}%</span>
      </div>
    </div>

    <div className={styles.strategies}>
      <h3>Mitigation Strategies</h3>
      <ul>
        {impact.mitigationStrategies.map((strategy, index) => (
          <li key={index}>{strategy}</li>
        ))}
      </ul>
    </div>
  </div>
);

const SkillGapSection: React.FC<{ gap: SkillGapAnalysis }> = ({ gap }) => (
  <div className={styles.section}>
    <div className={styles.gapSeverity}>
      <h3>Gap Severity</h3>
      <div className={styles.severityMeter}>
        <div 
          className={styles.severityFill}
          style={{ width: `${gap.gapSeverity * 100}%` }}
        />
      </div>
    </div>

    <div className={styles.trainingNeeds}>
      <h3>Training Needs</h3>
      {gap.trainingNeeds.map((need, index) => (
        <div key={index} className={styles.trainingNeed}>
          <h4>{need.skillName}</h4>
          <div className={styles.needDetails}>
            <span className={styles[need.priority]}>
              {need.priority.toUpperCase()}
            </span>
            <span>{need.timeToAcquire} months</span>
          </div>
          <div className={styles.resources}>
            {need.resources.map((resource, i) => (
              <span key={i} className={styles.resource}>{resource}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ReadinessSection: React.FC<{ readiness: ImplementationReadiness }> = ({ readiness }) => (
  <div className={styles.section}>
    <div className={styles.readinessScore}>
      <h3>Overall Readiness</h3>
      <div className={styles.scoreCircle}>
        <svg viewBox="0 0 36 36">
          <path
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#eee"
            strokeWidth="3"
          />
          <path
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#2196f3"
            strokeWidth="3"
            strokeDasharray={`${readiness.overallScore * 100}, 100`}
          />
          <text x="18" y="20.35" className={styles.percentage}>
            {(readiness.overallScore * 100).toFixed(0)}%
          </text>
        </svg>
      </div>
    </div>

    <div className={styles.recommendations}>
      <h3>Recommendations</h3>
      {readiness.recommendations.map((rec, index) => (
        <div key={index} className={`${styles.recommendation} ${styles[rec.priority]}`}>
          <span className={styles.category}>{rec.category}</span>
          <p>{rec.action}</p>
          <span className={styles.timeline}>{rec.timeline} months</span>
        </div>
      ))}
    </div>
  </div>
);

const TimelineSection: React.FC<{ timeline: TimelineProjection }> = ({ timeline }) => (
  <div className={styles.section}>
    <div className={styles.timelineHeader}>
      <div>
        <h3>Implementation Timeline</h3>
        <span className={styles.duration}>
          Total Duration: {timeline.totalDuration} months
        </span>
      </div>
      <div className={styles.confidence}>
        Confidence: {(timeline.confidenceLevel * 100).toFixed(0)}%
      </div>
    </div>

    <div className={styles.phases}>
      {timeline.phases.map((phase, index) => (
        <div 
          key={index}
          className={`${styles.phase} ${
            timeline.criticalPath.includes(phase.name) ? styles.critical : ''
          }`}
          style={{
            marginLeft: `${phase.startMonth * 40}px`,
            width: `${phase.duration * 40}px`
          }}
        >
          <div className={styles.phaseContent}>
            <h4>{phase.name}</h4>
            <div className={styles.milestones}>
              {phase.milestones.map((milestone, i) => (
                <span key={i} className={styles.milestone}>{milestone}</span>
              ))}
            </div>
            {phase.risks.length > 0 && (
              <div className={styles.risks}>
                <strong>Risks:</strong>
                <ul>
                  {phase.risks.map((risk, i) => (
                    <li key={i}>{risk}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);
