import {
  EmergingTechnology,
  EmergingTechAnalysis,
  JobImpactAnalysis,
  SkillGapAnalysis,
  ImplementationReadiness,
  TimelineProjection
} from '../types/emergingTech';

export function analyzeEmergingTechnology(
  technology: EmergingTechnology,
  currentSkills: string[],
  industryContext: string
): EmergingTechAnalysis {
  return {
    technology,
    jobImpact: analyzeJobImpact(technology, industryContext),
    skillGapAnalysis: analyzeSkillGap(technology, currentSkills),
    implementationReadiness: assessImplementationReadiness(technology),
    timelineProjection: projectTimeline(technology)
  };
}

function analyzeJobImpact(
  tech: EmergingTechnology,
  industry: string
): JobImpactAnalysis {
  const industryImpact = tech.industryImpacts.find(i => i.industry === industry);
  if (!industryImpact) {
    throw new Error(`No impact data found for industry: ${industry}`);
  }

  const automationRisk = calculateAutomationRisk(tech, industryImpact);
  const augmentationPotential = calculateAugmentationPotential(tech, industryImpact);

  return {
    automationRisk,
    augmentationPotential,
    newRoleCreation: calculateNewRoleCreation(tech, industryImpact),
    skillTransferability: calculateSkillTransferability(tech),
    timeToImpact: industryImpact.timelineToImpact,
    mitigationStrategies: generateMitigationStrategies(tech, automationRisk, augmentationPotential)
  };
}

function analyzeSkillGap(
  tech: EmergingTechnology,
  currentSkills: string[]
): SkillGapAnalysis {
  const requiredSkills = tech.skillRequirements.map(s => s.skillName);
  const gapSeverity = calculateGapSeverity(tech.skillRequirements, currentSkills);

  return {
    currentSkills,
    requiredSkills,
    gapSeverity,
    trainingNeeds: generateTrainingNeeds(tech.skillRequirements, currentSkills),
    marketAvailability: calculateMarketAvailability(tech.skillRequirements)
  };
}

function assessImplementationReadiness(
  tech: EmergingTechnology
): ImplementationReadiness {
  const technicalReadiness = calculateTechnicalReadiness(tech);
  const resourceReadiness = calculateResourceReadiness(tech);
  const culturalReadiness = calculateCulturalReadiness(tech);

  return {
    overallScore: (technicalReadiness + resourceReadiness + culturalReadiness) / 3,
    technicalReadiness,
    resourceReadiness,
    culturalReadiness,
    recommendations: generateImplementationRecommendations(tech, {
      technicalReadiness,
      resourceReadiness,
      culturalReadiness
    })
  };
}

function projectTimeline(tech: EmergingTechnology): TimelineProjection {
  const phases = generateImplementationPhases(tech);
  const criticalPath = identifyCriticalPath(phases);

  return {
    phases,
    criticalPath,
    totalDuration: calculateTotalDuration(phases, criticalPath),
    confidenceLevel: calculateConfidenceLevel(tech, phases)
  };
}

// Helper functions for risk and potential calculations
function calculateAutomationRisk(
  tech: EmergingTechnology,
  industryImpact: any
): number {
  const factors = [
    tech.disruptionPotential.processAutomation * 0.4,
    tech.disruptionPotential.skillObsolescence * 0.3,
    (industryImpact.jobsAffected.displaced / 
     (industryImpact.jobsAffected.created + industryImpact.jobsAffected.modified)) * 0.3
  ];
  
  return Math.min(1, factors.reduce((sum, factor) => sum + factor, 0));
}

function calculateAugmentationPotential(
  tech: EmergingTechnology,
  industryImpact: any
): number {
  const factors = [
    tech.disruptionPotential.decisionAugmentation * 0.4,
    tech.disruptionPotential.newCapabilityCreation * 0.3,
    (industryImpact.jobsAffected.modified / 
     (industryImpact.jobsAffected.created + industryImpact.jobsAffected.displaced)) * 0.3
  ];
  
  return Math.min(1, factors.reduce((sum, factor) => sum + factor, 0));
}

function calculateNewRoleCreation(
  tech: EmergingTechnology,
  industryImpact: any
): number {
  return Math.min(1, 
    (industryImpact.jobsAffected.created / 
     (industryImpact.jobsAffected.modified + industryImpact.jobsAffected.displaced)) * 
    tech.disruptionPotential.newCapabilityCreation
  );
}

function calculateSkillTransferability(tech: EmergingTechnology): number {
  const avgTimeToAcquire = average(tech.skillRequirements.map(s => s.timeToAcquire));
  const avgAvailability = average(tech.skillRequirements.map(s => s.availabilityScore));
  
  return Math.min(1, (1 - (avgTimeToAcquire / 24)) * 0.6 + avgAvailability * 0.4);
}

function generateMitigationStrategies(
  tech: EmergingTechnology,
  automationRisk: number,
  augmentationPotential: number
): string[] {
  const strategies: string[] = [];

  if (automationRisk > 0.7) {
    strategies.push(
      'Prioritize upskilling in complementary technologies',
      'Focus on human-centric skills development',
      'Explore hybrid human-AI workflows'
    );
  }

  if (augmentationPotential > 0.7) {
    strategies.push(
      'Develop expertise in AI-human collaboration',
      'Create training programs for augmented workflows',
      'Identify opportunities for process optimization'
    );
  }

  return strategies;
}

// Helper functions for skill gap analysis
function calculateGapSeverity(
  required: any[],
  current: string[]
): number {
  const missingSkills = required.filter(
    skill => !current.includes(skill.skillName)
  );
  
  if (missingSkills.length === 0) return 0;
  
  const severityScore = missingSkills.reduce((sum, skill) => 
    sum + (skill.proficiencyLevel * (skill.demandTrend === 'increasing' ? 1.2 : 1)),
    0
  ) / missingSkills.length;
  
  return Math.min(1, severityScore);
}

function generateTrainingNeeds(
  required: any[],
  current: string[]
): any[] {
  return required
    .filter(skill => !current.includes(skill.skillName))
    .map(skill => ({
      skillName: skill.skillName,
      priority: determinePriority(skill),
      timeToAcquire: skill.timeToAcquire,
      resources: generateTrainingResources(skill)
    }));
}

function calculateMarketAvailability(
  skills: any[]
): number {
  return average(skills.map(s => s.availabilityScore));
}

// Helper functions for implementation readiness
function calculateTechnicalReadiness(tech: EmergingTechnology): number {
  const { organizationalReadiness, infrastructureRequirements } = tech.implementationFactors;
  
  return Math.min(1, 
    organizationalReadiness.technicalCapability * 0.6 +
    (1 - complexity(infrastructureRequirements)) * 0.4
  );
}

function calculateResourceReadiness(tech: EmergingTechnology): number {
  const { organizationalReadiness, costFactor } = tech.implementationFactors;
  
  return Math.min(1,
    organizationalReadiness.resourceAvailability * 0.5 +
    (costFactor.roi / 100) * 0.3 +
    (1 - (costFactor.paybackPeriod / 36)) * 0.2
  );
}

function calculateCulturalReadiness(tech: EmergingTechnology): number {
  const { organizationalReadiness } = tech.implementationFactors;
  
  return Math.min(1,
    organizationalReadiness.culturalAlignment * 0.6 +
    organizationalReadiness.changeManagement * 0.4
  );
}

// Helper functions for timeline projection
function generateImplementationPhases(tech: EmergingTechnology): any[] {
  const basePhases = [
    {
      name: 'Planning and Assessment',
      startMonth: 0,
      duration: 2,
      milestones: ['Requirements gathered', 'Implementation plan approved'],
      dependencies: [],
      risks: ['Incomplete requirements', 'Stakeholder alignment']
    },
    {
      name: 'Infrastructure Setup',
      startMonth: 2,
      duration: calculateInfrastructureDuration(tech),
      milestones: ['Infrastructure deployed', 'Security validation complete'],
      dependencies: ['Planning and Assessment'],
      risks: ['Technical complications', 'Resource availability']
    },
    {
      name: 'Training and Skill Development',
      startMonth: 2,
      duration: calculateTrainingDuration(tech),
      milestones: ['Core team trained', 'Knowledge transfer complete'],
      dependencies: ['Planning and Assessment'],
      risks: ['Learning curve challenges', 'Staff availability']
    },
    {
      name: 'Pilot Implementation',
      startMonth: Math.max(
        2 + calculateInfrastructureDuration(tech),
        2 + calculateTrainingDuration(tech)
      ),
      duration: 3,
      milestones: ['Pilot launched', 'Initial feedback gathered'],
      dependencies: ['Infrastructure Setup', 'Training and Skill Development'],
      risks: ['Integration issues', 'User adoption challenges']
    },
    {
      name: 'Full Deployment',
      startMonth: Math.max(
        5 + calculateInfrastructureDuration(tech),
        5 + calculateTrainingDuration(tech)
      ),
      duration: 4,
      milestones: ['Full rollout complete', 'Performance metrics achieved'],
      dependencies: ['Pilot Implementation'],
      risks: ['Scale-related issues', 'Business disruption']
    }
  ];

  return basePhases;
}

function generateImplementationRecommendations(
  tech: EmergingTechnology,
  scores: {
    technicalReadiness: number;
    resourceReadiness: number;
    culturalReadiness: number;
  }
): {
  category: 'technical' | 'resource' | 'cultural';
  priority: 'high' | 'medium' | 'low';
  action: string;
  timeline: number;
}[] {
  const recommendations: {
    category: 'technical' | 'resource' | 'cultural';
    priority: 'high' | 'medium' | 'low';
    action: string;
    timeline: number;
  }[] = [];

  // Technical recommendations
  if (scores.technicalReadiness < 0.6) {
    recommendations.push({
      category: 'technical',
      priority: 'high',
      action: 'Enhance technical infrastructure and capabilities',
      timeline: 6
    });
  }

  // Resource recommendations
  if (scores.resourceReadiness < 0.6) {
    recommendations.push({
      category: 'resource',
      priority: 'high',
      action: 'Allocate additional resources and budget',
      timeline: 3
    });
  }

  // Cultural recommendations
  if (scores.culturalReadiness < 0.6) {
    recommendations.push({
      category: 'cultural',
      priority: 'high',
      action: 'Implement change management program',
      timeline: 4
    });
  }

  // Add general recommendations
  recommendations.push({
    category: 'technical' as const,
    priority: 'medium' as const,
    action: 'Establish monitoring and feedback mechanisms',
    timeline: 2
  });

  return recommendations;
}

// Utility functions
function average(numbers: number[]): number {
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
}

function complexity(requirements: Record<string, string[]>): number {
  const totalRequirements = Object.values(requirements)
    .reduce((sum, reqs) => sum + reqs.length, 0);
  return Math.min(1, totalRequirements / 20);
}

function calculateInfrastructureDuration(tech: EmergingTechnology): number {
  const requirements = tech.implementationFactors.infrastructureRequirements;
  return Math.max(3, Math.ceil(complexity(requirements) * 6));
}

function calculateTrainingDuration(tech: EmergingTechnology): number {
  return Math.max(
    2,
    Math.ceil(
      average(tech.skillRequirements.map(s => s.timeToAcquire)) * 0.7
    )
  );
}

function determinePriority(skill: any): 'high' | 'medium' | 'low' {
  const score = skill.proficiencyLevel * 
    (skill.demandTrend === 'increasing' ? 1.2 : 1) *
    (1 - skill.availabilityScore);
  
  if (score > 0.7) return 'high';
  if (score > 0.4) return 'medium';
  return 'low';
}

function generateTrainingResources(skill: any): string[] {
  const resources = ['Online courses', 'Documentation'];
  
  if (skill.proficiencyLevel > 0.7) {
    resources.push('Expert mentoring', 'Hands-on workshops');
  }
  
  if (skill.demandTrend === 'increasing') {
    resources.push('Industry certifications', 'Professional training');
  }
  
  return resources;
}

function identifyCriticalPath(phases: any[]): string[] {
  // Simple critical path identification based on dependencies
  const sorted = [...phases].sort((a, b) => 
    (a.startMonth + a.duration) - (b.startMonth + b.duration)
  );
  
  return sorted.map(phase => phase.name);
}

function calculateTotalDuration(phases: any[], criticalPath: string[]): number {
  const lastPhase = phases.find(phase => phase.name === criticalPath[criticalPath.length - 1]);
  return lastPhase.startMonth + lastPhase.duration;
}

function calculateConfidenceLevel(tech: EmergingTechnology, phases: any[]): number {
  const factors = [
    1 - complexity(tech.implementationFactors.infrastructureRequirements),
    tech.implementationFactors.organizationalReadiness.technicalCapability,
    tech.implementationFactors.organizationalReadiness.changeManagement,
    1 - (phases.reduce((sum, phase) => sum + phase.risks.length, 0) / (phases.length * 5))
  ];
  
  return Math.min(1, average(factors));
}
