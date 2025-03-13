/**
 * Skills Development Service
 * Version 1.2.1
 * 
 * Service for managing skills development, training recommendations,
 * and skill gap analysis with APO integration.
 */

import { Skill } from '../types/skills';
import { DynamicApoCalculator } from '../utils/apo/DynamicApoCalculator';
import { APOResult, TimeProjection } from '../types/apo';
import { OccupationTask } from '../types/semantic';

/**
 * Interface for skill gap analysis results
 */
export interface SkillGap {
  skill: Skill;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  priority: 'high' | 'medium' | 'low';
  recommendations: TrainingRecommendation[];
  timeProjections?: TimeProjection[];
  automationRisk?: number;
}

/**
 * Interface for training recommendations
 */
export interface TrainingRecommendation {
  type: 'maintenance' | 'self-directed' | 'formal-training' | 'intensive' | 'automation-resilience';
  description: string;
  timeframe?: 'Short-term' | 'Medium-term' | 'Long-term';
  impact?: 'Low' | 'Medium' | 'High';
}

/**
 * Interface for development plan
 */
export interface DevelopmentPlan {
  skills: SkillGap[];
  timeframe: {
    shortTerm: string[];
    mediumTerm: string[];
    longTerm: string[];
  };
  projectedOutcomes: {
    automationResilience: number;
    careerGrowth: number;
    marketability: number;
  };
  recommendedResources: {
    skillId: string;
    resources: Array<{
      title: string;
      url: string;
      type: string;
    }>;
  }[];
}

/**
 * Interface for performance tracking
 */
export interface PerformanceMetrics {
  executionTimeMs: number;
  memoryUsage?: number;
  timestamp: string;
}

/**
 * Service for skills development and training recommendations
 */
export class SkillsDevelopmentService {
  private apoCalculator: DynamicApoCalculator | undefined;

  /**
   * Creates a new SkillsDevelopmentService
   * @param apoCalculator Optional APO calculator for integration
   */
  constructor(apoCalculator?: DynamicApoCalculator) {
    this.apoCalculator = apoCalculator;
  }

  /**
   * Analyze skill gaps between current and required skills
   * @param currentSkills User's current skills
   * @param requiredSkills Skills required for target occupation
   * @returns Array of skill gaps with recommendations
   */
  public analyzeSkillGaps(currentSkills: Skill[], requiredSkills: Skill[]): SkillGap[] {
    // Handle null or undefined inputs
    if (!currentSkills || !requiredSkills) {
      return [];
    }

    return requiredSkills.map(requiredSkill => {
      const currentSkill = currentSkills.find(s => s.id === requiredSkill.id);
      
      // Ensure we have numeric values with defaults
      const requiredLevel = requiredSkill.required_level ?? 0;
      const currentLevel = currentSkill?.current_level ?? 0;
      const gap = Math.max(0, requiredLevel - currentLevel);
      
      // Determine priority based on gap size and importance
      const importance = requiredSkill.importance ?? 0.5;
      const priority = this.calculatePriority(gap, importance);
        
      return {
        skill: requiredSkill,
        currentLevel,
        requiredLevel,
        gap,
        priority,
        recommendations: this.generateRecommendations(requiredSkill, gap)
      };
    });
  }
  
  /**
   * Calculate priority level based on gap and importance
   * @param gap Skill gap
   * @param importance Skill importance
   * @returns Priority level
   */
  private calculatePriority(gap: number, importance: number): 'high' | 'medium' | 'low' {
    const score = (gap * 0.6) + (importance * 0.4);
    
    if (score >= 0.7) return 'high';
    if (score >= 0.4) return 'medium';
    return 'low';
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
        description: 'Your skill level meets or exceeds requirements. Focus on maintaining currency.',
        timeframe: 'Short-term',
        impact: 'Low'
      }];
    }
    
    const recommendations: TrainingRecommendation[] = [];
    
    if (gap > 0 && gap <= 2) {
      recommendations.push({
        type: 'self-directed',
        description: 'Online courses or self-study materials can help bridge this small gap.',
        timeframe: 'Short-term',
        impact: 'Medium'
      });
    }
    
    if (gap > 2 && gap <= 4) {
      recommendations.push({
        type: 'formal-training',
        description: 'Consider formal training programs or certification courses.',
        timeframe: 'Medium-term',
        impact: 'Medium'
      });
    }
    
    if (gap > 4) {
      recommendations.push({
        type: 'intensive',
        description: 'This requires significant development. Consider degree programs or intensive bootcamps.',
        timeframe: 'Long-term',
        impact: 'High'
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

  /**
   * Integrate APO calculation results into skill gap analysis
   * @param currentSkills User's current skills
   * @param requiredSkills Skills required for target occupation
   * @param occupationId Occupation ID
   * @param occupationTitle Occupation title
   * @param tasks Occupation tasks
   * @returns Enhanced skill gaps with APO insights
   */
  public integrateApoResults(
    currentSkills: Skill[],
    requiredSkills: Skill[],
    occupationId: string,
    occupationTitle: string,
    tasks: OccupationTask[]
  ): SkillGap[] {
    // If no APO calculator is available, return regular skill gaps
    if (!this.apoCalculator) {
      return this.analyzeSkillGaps(currentSkills, requiredSkills);
    }

    // Get basic skill gaps
    const skillGaps = this.analyzeSkillGaps(currentSkills, requiredSkills);

    try {
      // Calculate APO result
      const apoResult = this.apoCalculator.calculateEnhancedApo(
        occupationId,
        occupationTitle,
        tasks,
        [...currentSkills, ...requiredSkills.filter(rs => 
          !currentSkills.some(cs => cs.id === rs.id)
        )],
        { 
          occupation: occupationTitle,
          researchPapers: [],
          industryReports: [],
          newsArticles: [],
          trends: [],
          overallScore: 0,
          confidenceLevel: { overall: 0, sourceCount: 0, sourceQuality: 0, dataConsistency: 0, recency: 0 },
          regionalImpact: { 
            global: 0, 
            regional: {
              northAmerica: 0,
              europe: 0,
              asia: 0,
              other: 0
            }, 
            factorsByRegion: {
              northAmerica: [],
              europe: [],
              asia: [],
              other: []
            } 
          },
          adoptionCurves: { shortTerm: [], mediumTerm: [], longTerm: [] },
          lastUpdated: new Date().toISOString()
        }
      );

      // Enhance skill gaps with APO insights
      return skillGaps.map(gap => {
        // Check if skill is in high-risk category
        const isHighRisk = apoResult.skillsImpact.highRisk.some(s => s.id === gap.skill.id);
        
        // Check if skill is in moderate-risk category
        const isModerateRisk = apoResult.skillsImpact.moderateRisk.some(s => s.id === gap.skill.id);
        
        // Check if skill is in low-risk category
        const isLowRisk = apoResult.skillsImpact.lowRisk.some(s => s.id === gap.skill.id);
        
        // Check if skill is in emerging skills category
        const isEmergingSkill = apoResult.skillsImpact.emergingSkills.some(s => s.id === gap.skill.id);
        
        // Adjust priority based on APO insights
        let priority = gap.priority;
        let automationRisk = 0;
        
        if (isHighRisk) {
          automationRisk = 0.8;
          // Lower priority for high-risk skills unless they're also emerging
          priority = isEmergingSkill ? 'high' : 'low';
        } else if (isModerateRisk) {
          automationRisk = 0.5;
          // Maintain or slightly lower priority for moderate-risk skills
          priority = isEmergingSkill ? 'high' : 'medium';
        } else if (isLowRisk) {
          automationRisk = 0.2;
          // Maintain priority for low-risk skills
        } else if (isEmergingSkill) {
          // Elevate priority for emerging skills
          priority = 'high';
        }
        
        // Add automation resilience recommendation if needed
        const recommendations = [...gap.recommendations];
        if (isHighRisk || isModerateRisk) {
          recommendations.push({
            type: 'automation-resilience',
            description: `This skill has ${isHighRisk ? 'high' : 'moderate'} automation risk. Consider developing complementary skills that are less automatable.`,
            timeframe: isHighRisk ? 'Short-term' : 'Medium-term',
            impact: isHighRisk ? 'High' : 'Medium'
          });
        }
        
        return {
          ...gap,
          priority,
          recommendations,
          timeProjections: apoResult.timeProjections,
          automationRisk
        };
      });
    } catch (error) {
      console.error('Error integrating APO results:', error);
      return skillGaps;
    }
  }

  /**
   * Generate a comprehensive skill development plan
   * @param skillGaps Analyzed skill gaps
   * @returns Development plan with timeframes and projected outcomes
   */
  public generateDevelopmentPlan(skillGaps: SkillGap[]): DevelopmentPlan {
    // Prioritize skills
    const prioritizedSkills = this.prioritizeSkillDevelopment(skillGaps);
    
    // Categorize skills by timeframe
    const shortTermSkills = prioritizedSkills
      .filter(gap => gap.priority === 'high' || (gap.gap <= 2 && gap.priority !== 'low'))
      .map(gap => gap.skill.name);
      
    const mediumTermSkills = prioritizedSkills
      .filter(gap => gap.priority === 'medium' || (gap.gap > 2 && gap.gap <= 4))
      .map(gap => gap.skill.name);
      
    const longTermSkills = prioritizedSkills
      .filter(gap => gap.priority === 'low' || gap.gap > 4)
      .map(gap => gap.skill.name);
    
    // Calculate projected outcomes
    const automationResilience = this.calculateAutomationResilience(skillGaps);
    const careerGrowth = this.calculateCareerGrowth(skillGaps);
    const marketability = this.calculateMarketability(skillGaps);
    
    // Generate recommended resources
    const recommendedResources = skillGaps.map(gap => ({
      skillId: gap.skill.id,
      resources: this.getResourcesForSkill(gap.skill)
    }));
    
    return {
      skills: prioritizedSkills,
      timeframe: {
        shortTerm: shortTermSkills,
        mediumTerm: mediumTermSkills,
        longTerm: longTermSkills
      },
      projectedOutcomes: {
        automationResilience,
        careerGrowth,
        marketability
      },
      recommendedResources
    };
  }

  /**
   * Calculate automation resilience score
   * @param skillGaps Analyzed skill gaps
   * @returns Automation resilience score (0-1)
   */
  private calculateAutomationResilience(skillGaps: SkillGap[]): number {
    // If no automation risk data is available, use a default calculation
    if (!skillGaps.some(gap => gap.automationRisk !== undefined)) {
      const softSkillCount = skillGaps.filter(gap => 
        gap.skill.category === 'soft' || 
        gap.skill.category === 'interpersonal'
      ).length;
      
      return Math.min(1, softSkillCount / Math.max(1, skillGaps.length) * 0.8);
    }
    
    // Calculate weighted average of automation risks
    const totalRisk = skillGaps.reduce((sum, gap) => 
      sum + (gap.automationRisk ?? 0.5), 0);
      
    // Invert the risk to get resilience (1 - risk)
    return Math.max(0, Math.min(1, 1 - (totalRisk / skillGaps.length)));
  }

  /**
   * Calculate career growth potential
   * @param skillGaps Analyzed skill gaps
   * @returns Career growth potential score (0-1)
   */
  private calculateCareerGrowth(skillGaps: SkillGap[]): number {
    // Calculate based on skill importance and emerging skills
    const importanceSum = skillGaps.reduce((sum, gap) => 
      sum + (gap.skill.importance ?? 0.5), 0);
      
    return Math.min(1, importanceSum / Math.max(1, skillGaps.length) * 1.2);
  }

  /**
   * Calculate marketability score
   * @param skillGaps Analyzed skill gaps
   * @returns Marketability score (0-1)
   */
  private calculateMarketability(skillGaps: SkillGap[]): number {
    // Calculate based on skill gap closure potential
    const gapClosurePotential = skillGaps.reduce((sum, gap) => {
      const closureFactor = gap.gap <= 2 ? 0.9 : 
                           gap.gap <= 4 ? 0.7 : 0.5;
      return sum + closureFactor;
    }, 0);
    
    return Math.min(1, gapClosurePotential / Math.max(1, skillGaps.length));
  }

  /**
   * Get learning resources for a skill
   * @param skill Skill to get resources for
   * @returns Array of learning resources
   */
  private getResourcesForSkill(skill: Skill): Array<{ title: string; url: string; type: string; }> {
    // This would typically come from a database or API
    // For now, return mock data based on skill category
    const resources = [];
    
    if (skill.category === 'technical') {
      resources.push({
        title: `${skill.name} Fundamentals`,
        url: `https://example.com/courses/${skill.name.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'course'
      });
      
      resources.push({
        title: `Advanced ${skill.name}`,
        url: `https://example.com/advanced/${skill.name.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'certification'
      });
    } else {
      resources.push({
        title: `Developing ${skill.name} Skills`,
        url: `https://example.com/soft-skills/${skill.name.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'workshop'
      });
    }
    
    return resources;
  }

  /**
   * Analyze skill gaps with performance tracking
   * @param currentSkills User's current skills
   * @param requiredSkills Skills required for target occupation
   * @returns Skill gaps with performance metrics
   */
  public analyzeSkillGapsWithPerformanceTracking(
    currentSkills: Skill[],
    requiredSkills: Skill[]
  ): { gaps: SkillGap[]; performance: PerformanceMetrics } {
    const startTime = Date.now();
    
    // Perform the analysis
    const gaps = this.analyzeSkillGaps(currentSkills, requiredSkills);
    
    const endTime = Date.now();
    
    // Calculate performance metrics
    const metrics: PerformanceMetrics = {
      executionTimeMs: endTime - startTime,
      timestamp: new Date().toISOString()
    };
    
    return { gaps, performance: metrics };
  }
}

export default SkillsDevelopmentService;