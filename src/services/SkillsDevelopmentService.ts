/**
 * Skills Development Service
 * Version 1.1
 * 
 * Service for managing skills development, training recommendations,
 * and skill gap analysis.
 */

import { Skill } from '../types/skills';

/**
 * Interface for skill gap analysis results
 */
export interface SkillGap {
  skill: Skill;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  recommendations: TrainingRecommendation[];
}

/**
 * Interface for training recommendations
 */
export interface TrainingRecommendation {
  type: 'maintenance' | 'self-directed' | 'formal-training' | 'intensive';
  description: string;
}

/**
 * Service for skills development and training recommendations
 */
export class SkillsDevelopmentService {
  /**
   * Analyze skill gaps between current and required skills
   * @param currentSkills User's current skills
   * @param requiredSkills Skills required for target occupation
   * @returns Array of skill gaps with recommendations
   */
  public analyzeSkillGaps(currentSkills: Skill[], requiredSkills: Skill[]): SkillGap[] {
    return requiredSkills.map(requiredSkill => {
      const currentSkill = currentSkills.find(s => s.id === requiredSkill.id);
      
      // Ensure we have numeric values with defaults
      const requiredLevel = requiredSkill.required_level ?? 0;
      const currentLevel = currentSkill?.current_level ?? 0;
      const gap = Math.max(0, requiredLevel - currentLevel);
        
      return {
        skill: requiredSkill,
        currentLevel,
        requiredLevel,
        gap,
        recommendations: this.generateRecommendations(requiredSkill, gap)
      };
    });
  }
  
  /**
   * Generate training recommendations for a skill gap
   * @param skill The skill that needs development
   * @param gap The gap between current and required level
   * @returns Array of training recommendations
   */
  private generateRecommendations(skill: Skill, gap: number): TrainingRecommendation[] {
    if (gap <= 0) {
      return [{
        type: 'maintenance',
        description: 'Your skill level meets or exceeds requirements. Focus on maintaining currency.'
      }];
    }
    
    const recommendations: TrainingRecommendation[] = [];
    
    if (gap > 0 && gap <= 2) {
      recommendations.push({
        type: 'self-directed',
        description: 'Online courses or self-study materials can help bridge this small gap.'
      });
    }
    
    if (gap > 2 && gap <= 4) {
      recommendations.push({
        type: 'formal-training',
        description: 'Consider formal training programs or certification courses.'
      });
    }
    
    if (gap > 4) {
      recommendations.push({
        type: 'intensive',
        description: 'This requires significant development. Consider degree programs or intensive bootcamps.'
      });
    }
    
    return recommendations;
  }
  
  /**
   * Prioritize skills for development based on importance and gap
   * @param skillGaps Array of skill gaps
   * @returns Prioritized list of skills to develop
   */
  public prioritizeSkillDevelopment(skillGaps: SkillGap[]): SkillGap[] {
    return [...skillGaps].sort((a, b) => {
      // Calculate priority score based on importance and gap size
      const importanceA = a.skill.importance ?? 0;
      const importanceB = b.skill.importance ?? 0;
      
      const scoreA = (importanceA * 0.7) + (a.gap * 0.3);
      const scoreB = (importanceB * 0.7) + (b.gap * 0.3);
      
      return scoreB - scoreA; // Sort descending
    });
  }
}

export default SkillsDevelopmentService;