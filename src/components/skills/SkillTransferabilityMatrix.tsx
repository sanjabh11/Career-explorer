import React from 'react';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { SkillTransferability } from '@/types/skills';
import styles from '@/styles/SkillTransferabilityMatrix.module.css';

interface SkillTransferabilityMatrixProps {
  transferability: SkillTransferability[];
  selectedSkill?: string;
  onOccupationSelect?: (occupationId: string) => void;
}

const SkillTransferabilityMatrix: React.FC<SkillTransferabilityMatrixProps> = ({
  transferability,
  selectedSkill,
  onOccupationSelect
}) => {
  const selectedTransferability = transferability.find(t => t.sourceSkill === selectedSkill);

  const getScoreColor = (score: number): string => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className={styles.container}>
      <div className={styles.header}>
        <h3 className="text-lg font-semibold">Skill Transferability</h3>
        {selectedSkill && (
          <p className="text-sm text-muted-foreground">
            Showing transferability for {selectedSkill}
          </p>
        )}
      </div>

      <div className={styles.matrix}>
        {selectedTransferability ? (
          <div className={styles.occupations}>
            {selectedTransferability.targetOccupations.map((occupation, index) => (
              <div 
                key={index} 
                className={styles.occupation}
                onClick={() => onOccupationSelect?.(occupation.occupationId)}
              >
                <div className={styles.occupationHeader}>
                  <span className={styles.occupationName}>
                    {occupation.occupationId}
                  </span>
                  <Tooltip>
                    <TooltipTrigger>
                      <div 
                        className={`${styles.scoreIndicator} ${getScoreColor(occupation.transferabilityScore)}`}
                      >
                        {(occupation.transferabilityScore * 100).toFixed(0)}%
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Transferability Score</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div className={styles.requiredSkills}>
                  {occupation.requiredUpskilling.map((skill, skillIndex) => (
                    <span 
                      key={skillIndex} 
                      className={styles.skillTag}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.placeholder}>
            <p>Select a skill to view transferability options</p>
          </div>
        )}
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={`${styles.legendColor} bg-green-500`} />
          <span>High Transferability (80-100%)</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendColor} bg-yellow-500`} />
          <span>Medium Transferability (60-79%)</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendColor} bg-red-500`} />
          <span>Low Transferability (0-59%)</span>
        </div>
      </div>
    </Card>
  );
};

export default SkillTransferabilityMatrix;
