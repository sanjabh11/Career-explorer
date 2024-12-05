import {
  AutomationRiskAssessment,
  TaskAutomationRisk,
  TechnologyThreat,
  SkillVulnerability,
  FutureRequirement
} from '@/components/automation-risk/types';

class AutomationRiskService {
  async getTaskAutomationRisks(occupationId: string): Promise<TaskAutomationRisk[]> {
    // TODO: Replace with actual API call
    return [
      {
        taskId: "t1",
        taskName: "Data Analysis",
        description: "Analyzing and interpreting complex data sets",
        automationProbability: 0.75,
        timeframe: "short-term",
        impactLevel: 8,
        requiredAdaptations: [
          "Develop advanced statistical modeling skills",
          "Learn AI/ML model interpretation",
          "Focus on strategic insights derivation"
        ]
      },
      {
        taskId: "t2",
        taskName: "Report Generation",
        description: "Creating detailed reports and documentation",
        automationProbability: 0.85,
        timeframe: "immediate",
        impactLevel: 7,
        requiredAdaptations: [
          "Learn report automation tools",
          "Develop data visualization skills",
          "Focus on insight communication"
        ]
      }
    ];
  }

  async getTechnologyThreats(occupationId: string): Promise<TechnologyThreat[]> {
    // TODO: Replace with actual API call
    return [
      {
        technologyId: "tech1",
        name: "Large Language Models",
        description: "Advanced AI models capable of understanding and generating human-like text",
        maturityLevel: 0.8,
        adoptionRate: 0.7,
        impactScore: 0.85,
        affectedTasks: ["Documentation", "Code Generation", "Content Creation"],
        timeToMainstream: 6
      },
      {
        technologyId: "tech2",
        name: "AutoML Platforms",
        description: "Automated machine learning platforms for data analysis",
        maturityLevel: 0.75,
        adoptionRate: 0.6,
        impactScore: 0.7,
        affectedTasks: ["Data Analysis", "Model Building", "Feature Engineering"],
        timeToMainstream: 12
      }
    ];
  }

  async getSkillVulnerabilities(occupationId: string): Promise<SkillVulnerability[]> {
    // TODO: Replace with actual API call
    return [
      {
        skillId: "s1",
        skillName: "SQL Programming",
        currentLevel: 7,
        automationRisk: 0.6,
        marketDemand: 0.8,
        futureRelevance: 0.7,
        alternativeSkills: ["NoSQL", "Data Modeling", "Python"],
        upskillingSuggestions: [
          "Learn advanced query optimization",
          "Develop database architecture skills",
          "Study data warehouse concepts"
        ]
      },
      {
        skillId: "s2",
        skillName: "Basic Data Analysis",
        currentLevel: 6,
        automationRisk: 0.8,
        marketDemand: 0.7,
        futureRelevance: 0.5,
        alternativeSkills: ["Advanced Analytics", "Machine Learning", "Statistical Modeling"],
        upskillingSuggestions: [
          "Learn predictive analytics",
          "Study machine learning fundamentals",
          "Develop data science skills"
        ]
      }
    ];
  }

  async getFutureRequirements(occupationId: string): Promise<FutureRequirement[]> {
    // TODO: Replace with actual API call
    return [
      {
        requirementId: "fr1",
        category: "skill",
        name: "AI Systems Management",
        description: "Ability to oversee and manage AI-powered systems",
        importance: 0.9,
        timeframe: 12,
        currentGap: 0.7,
        developmentPath: [
          "Learn AI fundamentals",
          "Study MLOps practices",
          "Gain experience with AI platforms"
        ]
      },
      {
        requirementId: "fr2",
        category: "knowledge",
        name: "Data Ethics",
        description: "Understanding ethical implications of AI and data usage",
        importance: 0.85,
        timeframe: 6,
        currentGap: 0.5,
        developmentPath: [
          "Study data privacy regulations",
          "Learn about AI bias",
          "Understand ethical frameworks"
        ]
      }
    ];
  }

  async getAutomationRiskAssessment(occupationId: string): Promise<AutomationRiskAssessment> {
    const [tasks, threats, vulnerabilities, requirements] = await Promise.all([
      this.getTaskAutomationRisks(occupationId),
      this.getTechnologyThreats(occupationId),
      this.getSkillVulnerabilities(occupationId),
      this.getFutureRequirements(occupationId)
    ]);

    const overallRisk = this.calculateOverallRisk(tasks, threats, vulnerabilities);
    const confidenceScore = this.calculateConfidenceScore(tasks, threats, vulnerabilities);

    return {
      overallRisk,
      confidenceScore,
      taskRisks: tasks,
      technologyThreats: threats,
      skillVulnerabilities: vulnerabilities,
      futureRequirements: requirements,
      lastUpdated: new Date().toISOString(),
      nextReviewDate: this.calculateNextReviewDate(overallRisk)
    };
  }

  private calculateOverallRisk(
    tasks: TaskAutomationRisk[],
    threats: TechnologyThreat[],
    vulnerabilities: SkillVulnerability[]
  ): number {
    const taskRisk = tasks.reduce((acc, task) => acc + task.automationProbability, 0) / tasks.length;
    const threatRisk = threats.reduce((acc, threat) => acc + threat.impactScore, 0) / threats.length;
    const skillRisk = vulnerabilities.reduce((acc, skill) => acc + skill.automationRisk, 0) / vulnerabilities.length;

    return (taskRisk * 0.4 + threatRisk * 0.3 + skillRisk * 0.3);
  }

  private calculateConfidenceScore(
    tasks: TaskAutomationRisk[],
    threats: TechnologyThreat[],
    vulnerabilities: SkillVulnerability[]
  ): number {
    // Simple confidence calculation based on data completeness
    const hasEnoughTasks = tasks.length >= 3;
    const hasEnoughThreats = threats.length >= 2;
    const hasEnoughVulnerabilities = vulnerabilities.length >= 3;

    const confidenceFactors = [
      hasEnoughTasks ? 1 : 0.5,
      hasEnoughThreats ? 1 : 0.5,
      hasEnoughVulnerabilities ? 1 : 0.5
    ];

    return confidenceFactors.reduce((acc, factor) => acc + factor, 0) / confidenceFactors.length;
  }

  private calculateNextReviewDate(overallRisk: number): string {
    const now = new Date();
    // Higher risk = shorter review period
    const monthsToAdd = overallRisk > 0.7 ? 3 : overallRisk > 0.4 ? 6 : 12;
    now.setMonth(now.getMonth() + monthsToAdd);
    return now.toISOString();
  }
}

export const automationRiskService = new AutomationRiskService();
