import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SkillRelationship } from '@/types/skills';
import styles from '@/styles/SkillRelationshipGraph.module.css';

interface SkillRelationshipGraphProps {
  relationships: SkillRelationship[];
  selectedSkill?: string;
  onSkillSelect?: (skill: string) => void;
}

const SkillRelationshipGraph: React.FC<SkillRelationshipGraphProps> = ({
  relationships,
  selectedSkill,
  onSkillSelect
}) => {
  const selectedRelationship = relationships.find(r => r.primarySkill === selectedSkill);

  return (
    <Card className={styles.container}>
      <div className={styles.header}>
        <h3 className="text-lg font-semibold">Skill Relationships</h3>
        {selectedSkill && (
          <p className="text-sm text-muted-foreground">
            Showing relationships for {selectedSkill}
          </p>
        )}
      </div>

      <div className={styles.graph}>
        {selectedRelationship ? (
          <div className={styles.relationships}>
            {selectedRelationship.relatedSkills.map((related, index) => (
              <div key={index} className={styles.relatedSkill}>
                <div className={styles.skillInfo}>
                  <span 
                    className={styles.skillName}
                    onClick={() => onSkillSelect?.(related.skill)}
                  >
                    {related.skill}
                  </span>
                  <span className={styles.impactScore}>
                    {(related.impact * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress 
                  value={(related.impact + 1) * 50} 
                  className={styles.impactBar}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.placeholder}>
            <p>Select a skill to view its relationships</p>
          </div>
        )}
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{ backgroundColor: 'var(--primary)' }} />
          <span>Strong Relationship</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{ backgroundColor: 'var(--muted)' }} />
          <span>Weak Relationship</span>
        </div>
      </div>
    </Card>
  );
};

export default SkillRelationshipGraph;
