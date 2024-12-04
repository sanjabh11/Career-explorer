import { Task, Skill, Technology } from '../types/onet';

export interface ComplexityFactors {
  taskComplexity: number;
  skillRequirements: number;
  technologicalSophistication: number;
  decisionMakingAutonomy: number;
}

interface WeightedScore {
  score: number;
  weight: number;
}

export class ComplexityService {
  private readonly WEIGHT_TASK = 0.3;
  private readonly WEIGHT_SKILL = 0.3;
  private readonly WEIGHT_TECH = 0.25;
  private readonly WEIGHT_AUTONOMY = 0.15;

  /**
   * Calculates task complexity based on task descriptions, tools used, and work activities
   * @param task Task details including description and requirements
   * @returns Normalized complexity score between 0 and 1
   */
  calculateTaskComplexity(task: Task): number {
    const scores: WeightedScore[] = [
      { score: this.analyzeTaskDescription(task.description), weight: 0.4 },
      { score: this.evaluateToolComplexity(task.tools || []), weight: 0.3 },
      { score: this.assessWorkActivities(task.workActivities || []), weight: 0.3 }
    ];

    return this.calculateWeightedAverage(scores);
  }

  /**
   * Evaluates skill requirements based on required skills, education, and experience
   * @param skills Array of required skills with proficiency levels
   * @returns Normalized skill requirement score between 0 and 1
   */
  calculateSkillRequirements(skills: Skill[]): number {
    const scores: WeightedScore[] = [
      { score: this.evaluateSkillLevels(skills), weight: 0.4 },
      { score: this.assessSkillDiversity(skills), weight: 0.3 },
      { score: this.calculateSkillRarity(skills), weight: 0.3 }
    ];

    return this.calculateWeightedAverage(scores);
  }

  /**
   * Assesses technological sophistication based on required technologies
   * @param technologies Array of required technologies
   * @returns Normalized technological sophistication score between 0 and 1
   */
  calculateTechnologicalSophistication(technologies: Technology[]): number {
    const scores: WeightedScore[] = [
      { score: this.evaluateTechComplexity(technologies), weight: 0.4 },
      { score: this.assessTechDiversity(technologies), weight: 0.3 },
      { score: this.calculateTechModernity(technologies), weight: 0.3 }
    ];

    return this.calculateWeightedAverage(scores);
  }

  /**
   * Measures independence in decision making based on responsibilities
   * @param responsibilities Array of job responsibilities
   * @returns Normalized decision-making autonomy score between 0 and 1
   */
  calculateDecisionMakingAutonomy(responsibilities: string[]): number {
    const scores: WeightedScore[] = [
      { score: this.evaluateDecisionScope(responsibilities), weight: 0.4 },
      { score: this.assessImpactLevel(responsibilities), weight: 0.3 },
      { score: this.calculateIndependenceLevel(responsibilities), weight: 0.3 }
    ];

    return this.calculateWeightedAverage(scores);
  }

  /**
   * Calculates overall complexity score combining all factors
   * @param task Task details
   * @param skills Required skills
   * @param technologies Required technologies
   * @param responsibilities Job responsibilities
   * @returns ComplexityFactors object with normalized scores
   */
  calculateOverallComplexity(
    task: Task,
    skills: Skill[],
    technologies: Technology[],
    responsibilities: string[]
  ): ComplexityFactors {
    return {
      taskComplexity: this.calculateTaskComplexity(task),
      skillRequirements: this.calculateSkillRequirements(skills),
      technologicalSophistication: this.calculateTechnologicalSophistication(technologies),
      decisionMakingAutonomy: this.calculateDecisionMakingAutonomy(responsibilities)
    };
  }

  /**
   * Normalizes a complexity score to ensure it's between 0 and 1
   * @param score Raw score
   * @returns Normalized score between 0 and 1
   */
  private normalizeScore(score: number): number {
    return Math.max(0, Math.min(1, score));
  }

  private calculateWeightedAverage(scores: WeightedScore[]): number {
    const totalWeight = scores.reduce((sum, item) => sum + item.weight, 0);
    const weightedSum = scores.reduce((sum, item) => sum + item.score * item.weight, 0);
    return this.normalizeScore(weightedSum / totalWeight);
  }

  // Task complexity helper methods
  private analyzeTaskDescription(description: string): number {
    // Analyze complexity based on keywords, sentence structure, and required actions
    const complexityIndicators = [
      'analyze', 'design', 'develop', 'evaluate', 'manage',
      'coordinate', 'strategic', 'complex', 'advanced', 'expert'
    ];
    
    const words = description.toLowerCase().split(' ');
    const indicatorCount = words.filter(word => 
      complexityIndicators.includes(word)
    ).length;
    
    return this.normalizeScore(indicatorCount / (words.length * 0.1));
  }

  private evaluateToolComplexity(tools: string[]): number {
    // Evaluate tools based on their complexity and specialization
    const toolComplexityScore = tools.length * 0.1;
    return this.normalizeScore(toolComplexityScore);
  }

  private assessWorkActivities(activities: string[]): number {
    // Assess complexity of work activities
    return this.normalizeScore(activities.length * 0.15);
  }

  // Skill requirements helper methods
  private evaluateSkillLevels(skills: Skill[]): number {
    // Evaluate average skill level requirement
    const avgLevel = skills.reduce((sum, skill) => 
      sum + (skill.level || 0), 0) / skills.length;
    return this.normalizeScore(avgLevel / 5); // Assuming skill levels are 1-5
  }

  private assessSkillDiversity(skills: Skill[]): number {
    // Assess the diversity of required skills
    const uniqueCategories = new Set(skills.map(skill => skill.category)).size;
    return this.normalizeScore(uniqueCategories * 0.2);
  }

  private calculateSkillRarity(skills: Skill[]): number {
    // Calculate how rare or specialized the required skills are
    return this.normalizeScore(skills.length * 0.1);
  }

  // Technology sophistication helper methods
  private evaluateTechComplexity(technologies: Technology[]): number {
    // Evaluate complexity of required technologies
    return this.normalizeScore(technologies.length * 0.15);
  }

  private assessTechDiversity(technologies: Technology[]): number {
    // Assess diversity of technology stack
    const uniqueCategories = new Set(
      technologies.map(tech => tech.category)
    ).size;
    return this.normalizeScore(uniqueCategories * 0.2);
  }

  private calculateTechModernity(technologies: Technology[]): number {
    // Calculate how modern/current the technologies are
    const currentYear = new Date().getFullYear();
    const avgAge = technologies.reduce((sum, tech) => 
      sum + (currentYear - (tech.yearIntroduced || currentYear)), 0) / technologies.length;
    return this.normalizeScore(1 - (avgAge / 10)); // Newer = higher score
  }

  // Decision-making autonomy helper methods
  private evaluateDecisionScope(responsibilities: string[]): number {
    // Evaluate the scope of decisions required
    const decisionKeywords = [
      'decide', 'determine', 'evaluate', 'assess',
      'choose', 'select', 'approve', 'authorize'
    ];
    
    const decisionCount = responsibilities.filter(resp =>
      decisionKeywords.some(keyword => resp.toLowerCase().includes(keyword))
    ).length;
    
    return this.normalizeScore(decisionCount / responsibilities.length);
  }

  private assessImpactLevel(responsibilities: string[]): number {
    // Assess the impact level of decisions
    const impactKeywords = [
      'strategic', 'critical', 'key', 'important',
      'significant', 'major', 'essential', 'crucial'
    ];
    
    const impactCount = responsibilities.filter(resp =>
      impactKeywords.some(keyword => resp.toLowerCase().includes(keyword))
    ).length;
    
    return this.normalizeScore(impactCount / responsibilities.length);
  }

  private calculateIndependenceLevel(responsibilities: string[]): number {
    // Calculate level of independence in decision making
    const independenceKeywords = [
      'independently', 'autonomously', 'self-directed',
      'own', 'lead', 'manage', 'oversee', 'direct'
    ];
    
    const independenceCount = responsibilities.filter(resp =>
      independenceKeywords.some(keyword => resp.toLowerCase().includes(keyword))
    ).length;
    
    return this.normalizeScore(independenceCount / responsibilities.length);
  }
}
