/**
 * Skill Impact Analyzer
 * Version 1.0
 * 
 * Implements granular skill impact assessment for automation potential.
 * Analyzes skills at a sub-component level and provides detailed
 * development recommendations.
 */

import { Skill } from '../../types/skills';
import { AutomationResearchData } from '../../types/research';
import { OccupationAnalysis } from '../../types/semantic';

/**
 * Skill component representing a sub-element of a skill
 */
export interface SkillComponent {
  name: string;
  description: string;
  automationScore: number;
  confidenceScore: number;
  timeHorizon: number; // years until automation
}

/**
 * Detailed skill analysis with sub-components
 */
export interface DetailedSkillAnalysis {
  skill: Skill;
  overallScore: number;
  confidenceScore: number;
  timeHorizon: number;
  components: SkillComponent[];
  alternativeSkills: Skill[];
  developmentPath: SkillDevelopmentPath;
  resilience: number; // 0-1 score of long-term resilience
}

/**
 * Skill development path with milestones
 */
export interface SkillDevelopmentPath {
  targetSkill: Skill;
  milestones: {
    name: string;
    description: string;
    timeframe: string; // e.g., "1-3 months", "3-6 months"
    resources: string[];
  }[];
  estimatedTimeToMastery: string;
  complementarySkills: Skill[];
}

/**
 * Skill cluster representing a group of related skills
 */
export interface SkillCluster {
  name: string;
  description: string;
  skills: Skill[];
  averageAutomationScore: number;
  averageTimeHorizon: number;
  trendDirection: 'increasing' | 'stable' | 'decreasing';
}

/**
 * Skill gap analysis result
 */
export interface SkillGapAnalysis {
  currentSkills: Skill[];
  missingCriticalSkills: Skill[];
  skillGaps: {
    category: string;
    currentLevel: number; // 0-1
    requiredLevel: number; // 0-1
    gap: number; // 0-1
    recommendedActions: string[];
  }[];
  overallGapScore: number; // 0-1
}

/**
 * Implements granular skill impact assessment
 */
export class SkillImpactAnalyzer {
  // Skill categories for classification
  private readonly skillCategories = [
    'technical', 'soft', 'cognitive', 'physical', 'domain-specific'
  ];
  
  // Automation resistance factors by category
  private readonly automationResistanceFactors: Record<string, number> = {
    'technical': 0.6,
    'soft': 0.3,
    'cognitive': 0.5,
    'physical': 0.7,
    'domain-specific': 0.6
  };
  
  /**
   * Analyzes skills with granular assessment
   * @param skills List of occupation skills
   * @param occupationAnalysis Occupation analysis from JinaAPI
   * @param researchData Research data for the occupation
   * @returns Detailed analysis of each skill
   */
  public analyzeSkillsGranular(
    skills: Skill[],
    occupationAnalysis: OccupationAnalysis,
    researchData: AutomationResearchData
  ): DetailedSkillAnalysis[] {
    return skills.map(skill => this.analyzeSkill(skill, occupationAnalysis, researchData));
  }
  
  /**
   * Analyzes a single skill with detailed assessment
   * @param skill Skill to analyze
   * @param occupationAnalysis Occupation analysis from JinaAPI
   * @param researchData Research data for the occupation
   * @returns Detailed analysis of the skill
   */
  private analyzeSkill(
    skill: Skill,
    occupationAnalysis: OccupationAnalysis,
    researchData: AutomationResearchData
  ): DetailedSkillAnalysis {
    // Extract skill components
    const components = this.extractSkillComponents(skill);
    
    // Calculate overall automation score
    const overallScore = components.reduce(
      (sum, component) => sum + component.automationScore,
      0
    ) / components.length;
    
    // Calculate confidence score
    const confidenceScore = components.reduce(
      (sum, component) => sum + component.confidenceScore,
      0
    ) / components.length;
    
    // Calculate time horizon
    const timeHorizon = components.reduce(
      (sum, component) => sum + component.timeHorizon,
      0
    ) / components.length;
    
    // Find alternative skills
    const alternativeSkills = this.findAlternativeSkills(skill, overallScore);
    
    // Generate development path
    const developmentPath = this.generateDevelopmentPath(skill, alternativeSkills);
    
    // Calculate resilience score
    const resilience = this.calculateResilienceScore(skill, components, researchData);
    
    return {
      skill,
      overallScore,
      confidenceScore,
      timeHorizon,
      components,
      alternativeSkills,
      developmentPath,
      resilience
    };
  }
  
  /**
   * Extracts skill components for granular analysis
   * @param skill Skill to extract components from
   * @returns List of skill components
   */
  private extractSkillComponents(skill: Skill): SkillComponent[] {
    // In a real implementation, this would use NLP to extract
    // sub-components from the skill description
    // For now, generate mock components
    
    // Generate 3-5 components
    const numComponents = Math.floor(Math.random() * 3) + 3;
    
    // Component templates based on skill category
    const componentTemplates: Record<string, string[]> = {
      'technical': [
        'Technical knowledge of {topic}',
        'Application of {topic} in practical scenarios',
        'Problem-solving using {topic}',
        'Integration of {topic} with other systems',
        'Optimization of {topic} for performance'
      ],
      'soft': [
        'Communication of {topic} to diverse audiences',
        'Collaboration in {topic}-related projects',
        'Leadership in {topic} initiatives',
        'Adaptability to changes in {topic}',
        'Emotional intelligence in {topic} contexts'
      ],
      'cognitive': [
        'Critical thinking about {topic}',
        'Creative application of {topic}',
        'Analysis of {topic}-related problems',
        'Synthesis of {topic} with other knowledge',
        'Evaluation of {topic} effectiveness'
      ],
      'physical': [
        'Manual dexterity in {topic}',
        'Physical stamina for {topic}',
        'Spatial awareness in {topic}',
        'Hand-eye coordination for {topic}',
        'Fine motor skills in {topic}'
      ],
      'domain-specific': [
        'Domain knowledge of {topic}',
        'Industry-specific application of {topic}',
        'Regulatory compliance in {topic}',
        'Best practices in {topic}',
        'Specialized tools for {topic}'
      ]
    };
    
    // Get templates for this skill's category
    const category = skill.category || 'technical';
    const templates = componentTemplates[category] || componentTemplates['technical'];
    
    // Generate components
    return Array(numComponents).fill(0).map((_, index) => {
      // Select a template
      const template = templates[index % templates.length];
      
      // Replace {topic} with skill name
      const name = template.replace('{topic}', skill.name);
      
      // Generate description
      const description = `Ability to ${name.toLowerCase()} in professional contexts`;
      
      // Generate automation score
      // Base on category resistance factor with some randomness
      const baseFactor = this.automationResistanceFactors[category] || 0.5;
      const automationScore = Math.min(
        1,
        Math.max(
          0,
          baseFactor + (Math.random() * 0.4 - 0.2) // +/- 0.2 randomness
        )
      );
      
      // Generate confidence score
      const confidenceScore = 0.6 + (Math.random() * 0.3); // 0.6-0.9
      
      // Generate time horizon based on automation score
      // Lower score = longer horizon
      const timeHorizon = Math.round(20 - (automationScore * 15));
      
      return {
        name,
        description,
        automationScore,
        confidenceScore,
        timeHorizon
      };
    });
  }
  
  /**
   * Finds alternative skills with lower automation potential
   * @param skill Skill to find alternatives for
   * @param automationScore Current automation score
   * @returns List of alternative skills
   */
  private findAlternativeSkills(skill: Skill, automationScore: number): Skill[] {
    // In a real implementation, this would use semantic similarity
    // to find related skills with lower automation potential
    // For now, return predefined alternatives based on skill category
    
    const category = skill.category || 'technical';
    
    // Alternative skill templates by category
    const alternativeTemplates: Record<string, Skill[]> = {
      'technical': [
        {
          id: 'tech-alt-1',
          name: 'AI System Design',
          category: 'technical',
          description: 'Designing AI systems that augment human capabilities rather than replace them'
        },
        {
          id: 'tech-alt-2',
          name: 'Human-Centered Technology Development',
          category: 'technical',
          description: 'Developing technology solutions that prioritize human needs and experiences'
        },
        {
          id: 'tech-alt-3',
          name: 'Responsible AI Implementation',
          category: 'technical',
          description: 'Implementing AI systems with consideration for ethics, bias, and societal impact'
        }
      ],
      'soft': [
        {
          id: 'soft-alt-1',
          name: 'Creative Problem Solving',
          category: 'soft',
          description: 'Approaching problems with innovative thinking and novel solutions'
        },
        {
          id: 'soft-alt-2',
          name: 'Emotional Intelligence',
          category: 'soft',
          description: 'Understanding and managing emotions in self and others to guide thinking and behavior'
        },
        {
          id: 'soft-alt-3',
          name: 'Cross-Cultural Communication',
          category: 'soft',
          description: 'Effectively communicating across diverse cultural contexts and perspectives'
        }
      ],
      'cognitive': [
        {
          id: 'cog-alt-1',
          name: 'Systems Thinking',
          category: 'cognitive',
          description: 'Understanding complex systems and how components interact to produce emergent behaviors'
        },
        {
          id: 'cog-alt-2',
          name: 'Critical Analysis',
          category: 'cognitive',
          description: 'Evaluating information, arguments, and beliefs to form well-reasoned judgments'
        },
        {
          id: 'cog-alt-3',
          name: 'Ethical Decision Making',
          category: 'cognitive',
          description: 'Making decisions that consider ethical implications and align with moral principles'
        }
      ],
      'physical': [
        {
          id: 'phys-alt-1',
          name: 'Complex Physical Manipulation',
          category: 'physical',
          description: 'Performing intricate physical tasks requiring dexterity and adaptability'
        },
        {
          id: 'phys-alt-2',
          name: 'Human-Machine Collaboration',
          category: 'physical',
          description: 'Working alongside machines to leverage complementary strengths'
        },
        {
          id: 'phys-alt-3',
          name: 'Adaptive Physical Problem Solving',
          category: 'physical',
          description: 'Solving physical challenges in unpredictable or unstructured environments'
        }
      ],
      'domain-specific': [
        {
          id: 'domain-alt-1',
          name: 'Interdisciplinary Knowledge Integration',
          category: 'domain-specific',
          description: 'Combining knowledge from multiple domains to address complex challenges'
        },
        {
          id: 'domain-alt-2',
          name: 'Domain Innovation',
          category: 'domain-specific',
          description: 'Developing novel approaches and solutions within a specific domain'
        },
        {
          id: 'domain-alt-3',
          name: 'Human-Centered Domain Expertise',
          category: 'domain-specific',
          description: 'Applying domain knowledge with a focus on human needs and experiences'
        }
      ]
    };
    
    // Get alternatives for this skill's category
    const alternatives = alternativeTemplates[category] || alternativeTemplates['technical'];
    
    // Return 2-3 alternatives
    return alternatives.slice(0, Math.floor(Math.random() * 2) + 2);
  }
  
  /**
   * Generates a development path for a skill
   * @param skill Skill to generate path for
   * @param alternativeSkills Alternative skills
   * @returns Skill development path
   */
  private generateDevelopmentPath(skill: Skill, alternativeSkills: Skill[]): SkillDevelopmentPath {
    // Select target skill (either the original or an alternative)
    const targetSkill = Math.random() > 0.5 && alternativeSkills.length > 0
      ? alternativeSkills[0]
      : skill;
    
    // Generate milestones
    const milestones = [
      {
        name: 'Foundation Building',
        description: `Develop basic understanding and competency in ${targetSkill.name}`,
        timeframe: '1-3 months',
        resources: [
          'Online courses',
          'Introductory books',
          'Community forums'
        ]
      },
      {
        name: 'Practical Application',
        description: `Apply ${targetSkill.name} in real-world scenarios`,
        timeframe: '3-6 months',
        resources: [
          'Project-based learning',
          'Mentorship',
          'Case studies'
        ]
      },
      {
        name: 'Advanced Mastery',
        description: `Develop expertise in ${targetSkill.name} and ability to teach others`,
        timeframe: '6-12 months',
        resources: [
          'Advanced workshops',
          'Professional certification',
          'Teaching opportunities'
        ]
      }
    ];
    
    // Generate complementary skills
    const complementarySkills = alternativeSkills.slice(0, 2);
    
    return {
      targetSkill,
      milestones,
      estimatedTimeToMastery: '12-18 months',
      complementarySkills
    };
  }
  
  /**
   * Calculates resilience score for a skill
   * @param skill Skill to calculate resilience for
   * @param components Skill components
   * @param researchData Research data for the occupation
   * @returns Resilience score (0-1)
   */
  private calculateResilienceScore(
    skill: Skill,
    components: SkillComponent[],
    researchData: AutomationResearchData
  ): number {
    // Base resilience on automation scores of components
    // Lower automation score = higher resilience
    const automationBasedResilience = 1 - (
      components.reduce((sum, component) => sum + component.automationScore, 0) / components.length
    );
    
    // Adjust based on skill category
    const category = skill.category || 'technical';
    const categoryFactor = 1 - (this.automationResistanceFactors[category] || 0.5);
    
    // Adjust based on research trends
    // In a real implementation, this would analyze trends from research data
    // For now, use a random adjustment
    const trendAdjustment = (Math.random() * 0.2) - 0.1; // -0.1 to 0.1
    
    // Calculate final resilience score
    let resilience = (automationBasedResilience * 0.6) + (categoryFactor * 0.3) + trendAdjustment;
    
    // Ensure score is within 0-1 range
    resilience = Math.min(1, Math.max(0, resilience));
    
    return resilience;
  }
  
  /**
   * Clusters skills based on automation potential
   * @param skillsAnalysis Detailed analysis of skills
   * @returns Clusters of related skills
   */
  public clusterSkills(skillsAnalysis: DetailedSkillAnalysis[]): SkillCluster[] {
    // In a real implementation, this would use clustering algorithms
    // to group skills based on similarity and automation potential
    // For now, cluster by category
    
    // Group skills by category
    const skillsByCategory: Record<string, DetailedSkillAnalysis[]> = {};
    
    skillsAnalysis.forEach(analysis => {
      const category = analysis.skill.category || 'technical';
      if (!skillsByCategory[category]) {
        skillsByCategory[category] = [];
      }
      skillsByCategory[category].push(analysis);
    });
    
    // Create clusters
    return Object.entries(skillsByCategory).map(([category, analyses]) => {
      // Calculate average automation score
      const averageAutomationScore = analyses.reduce(
        (sum, analysis) => sum + analysis.overallScore,
        0
      ) / analyses.length;
      
      // Calculate average time horizon
      const averageTimeHorizon = analyses.reduce(
        (sum, analysis) => sum + analysis.timeHorizon,
        0
      ) / analyses.length;
      
      // Determine trend direction
      // In a real implementation, this would analyze historical data
      // For now, use a random direction
      const trendDirections: Array<'increasing' | 'stable' | 'decreasing'> = [
        'increasing', 'stable', 'decreasing'
      ];
      const trendDirection = trendDirections[Math.floor(Math.random() * trendDirections.length)];
      
      return {
        name: `${category.charAt(0).toUpperCase() + category.slice(1)} Skills`,
        description: `Skills related to ${category} capabilities`,
        skills: analyses.map(analysis => analysis.skill),
        averageAutomationScore,
        averageTimeHorizon,
        trendDirection
      };
    });
  }
  
  /**
   * Analyzes skill gaps based on current skills and future requirements
   * @param currentSkills Current skills
   * @param requiredSkills Skills required for future resilience
   * @returns Skill gap analysis
   */
  public analyzeSkillGaps(
    currentSkills: Skill[],
    requiredSkills: Skill[]
  ): SkillGapAnalysis {
    // Identify missing critical skills
    const currentSkillIds = new Set(currentSkills.map(skill => skill.id));
    const missingCriticalSkills = requiredSkills.filter(
      skill => !currentSkillIds.has(skill.id)
    );
    
    // Group skills by category
    const currentByCategory: Record<string, Skill[]> = {};
    const requiredByCategory: Record<string, Skill[]> = {};
    
    // Process current skills
    currentSkills.forEach(skill => {
      const category = skill.category || 'technical';
      if (!currentByCategory[category]) {
        currentByCategory[category] = [];
      }
      currentByCategory[category].push(skill);
    });
    
    // Process required skills
    requiredSkills.forEach(skill => {
      const category = skill.category || 'technical';
      if (!requiredByCategory[category]) {
        requiredByCategory[category] = [];
      }
      requiredByCategory[category].push(skill);
    });
    
    // Calculate gaps by category
    const skillGaps = Object.keys({
      ...currentByCategory,
      ...requiredByCategory
    }).map(category => {
      const currentCount = (currentByCategory[category] || []).length;
      const requiredCount = (requiredByCategory[category] || []).length;
      
      // Calculate levels (0-1)
      const currentLevel = currentCount / Math.max(1, requiredCount);
      const requiredLevel = 1.0;
      const gap = Math.max(0, requiredLevel - currentLevel);
      
      // Generate recommended actions
      const recommendedActions = this.generateGapRecommendations(
        category,
        gap,
        missingCriticalSkills.filter(skill => (skill.category || 'technical') === category)
      );
      
      return {
        category,
        currentLevel,
        requiredLevel,
        gap,
        recommendedActions
      };
    });
    
    // Calculate overall gap score
    const overallGapScore = skillGaps.reduce(
      (sum, gap) => sum + gap.gap,
      0
    ) / skillGaps.length;
    
    return {
      currentSkills,
      missingCriticalSkills,
      skillGaps,
      overallGapScore
    };
  }
  
  /**
   * Generates recommendations for addressing skill gaps
   * @param category Skill category
   * @param gapSize Size of the gap (0-1)
   * @param missingSkills Missing skills in this category
   * @returns Recommended actions
   */
  private generateGapRecommendations(
    category: string,
    gapSize: number,
    missingSkills: Skill[]
  ): string[] {
    const recommendations: string[] = [];
    
    // Add recommendations based on gap size
    if (gapSize > 0.7) {
      recommendations.push(`Prioritize developing ${category} skills through formal education or training programs`);
    } else if (gapSize > 0.4) {
      recommendations.push(`Enhance ${category} skills through targeted workshops and projects`);
    } else if (gapSize > 0.1) {
      recommendations.push(`Refine ${category} skills through continuous learning and practice`);
    }
    
    // Add recommendations for specific missing skills
    if (missingSkills.length > 0) {
      const skillNames = missingSkills.map(skill => skill.name).join(', ');
      recommendations.push(`Focus on developing these specific skills: ${skillNames}`);
    }
    
    // Add general recommendations
    recommendations.push(`Seek mentorship from experts in ${category}`);
    
    return recommendations;
  }
}
