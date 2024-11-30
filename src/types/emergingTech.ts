export interface EmergingTechnology {
  id: string;
  name: string;
  category: string;
  maturityLevel: 'Experimental' | 'Emerging' | 'Growth' | 'Mature' | 'Declining';
  impactScore: number;
  timeToMainstream: number; // in months
  skillRequirements: SkillRequirement[];
  industryImpacts: IndustryImpact[];
  disruptionPotential: DisruptionPotential;
  implementationFactors: ImplementationFactors;
  marketProjections: MarketProjection[];
  relatedTechnologies: string[]; // IDs of related technologies
}

export interface SkillRequirement {
  skillName: string;
  proficiencyLevel: number; // 0-1
  demandTrend: 'increasing' | 'stable' | 'decreasing';
  availabilityScore: number; // 0-1
  timeToAcquire: number; // in months
}

export interface IndustryImpact {
  industry: string;
  disruptionLevel: number; // 0-1
  adoptionRate: number; // 0-1
  jobsAffected: {
    created: number;
    modified: number;
    displaced: number;
  };
  timelineToImpact: number; // in months
  barriers: string[];
  opportunities: string[];
}

export interface DisruptionPotential {
  processAutomation: number; // 0-1
  decisionAugmentation: number; // 0-1
  skillObsolescence: number; // 0-1
  newCapabilityCreation: number; // 0-1
  marketRestructuring: number; // 0-1
}

export interface ImplementationFactors {
  costFactor: {
    initialInvestment: number;
    ongoingCosts: number;
    roi: number;
    paybackPeriod: number; // in months
  };
  infrastructureRequirements: {
    hardware: string[];
    software: string[];
    connectivity: string[];
    compliance: string[];
  };
  organizationalReadiness: {
    technicalCapability: number; // 0-1
    changeManagement: number; // 0-1
    resourceAvailability: number; // 0-1
    culturalAlignment: number; // 0-1
  };
  risks: {
    technical: string[];
    operational: string[];
    financial: string[];
    strategic: string[];
  };
}

export interface MarketProjection {
  year: number;
  marketSize: number; // in millions USD
  growthRate: number; // percentage
  adoptionRate: number; // 0-1
  confidence: number; // 0-1
  keyDrivers: string[];
  potentialBarriers: string[];
}

export interface EmergingTechAnalysis {
  technology: EmergingTechnology;
  jobImpact: JobImpactAnalysis;
  skillGapAnalysis: SkillGapAnalysis;
  implementationReadiness: ImplementationReadiness;
  timelineProjection: TimelineProjection;
}

export interface JobImpactAnalysis {
  automationRisk: number; // 0-1
  augmentationPotential: number; // 0-1
  newRoleCreation: number; // 0-1
  skillTransferability: number; // 0-1
  timeToImpact: number; // in months
  mitigationStrategies: string[];
}

export interface SkillGapAnalysis {
  currentSkills: string[];
  requiredSkills: string[];
  gapSeverity: number; // 0-1
  trainingNeeds: {
    skillName: string;
    priority: 'high' | 'medium' | 'low';
    timeToAcquire: number; // in months
    resources: string[];
  }[];
  marketAvailability: number; // 0-1
}

export interface ImplementationReadiness {
  overallScore: number; // 0-1
  technicalReadiness: number; // 0-1
  resourceReadiness: number; // 0-1
  culturalReadiness: number; // 0-1
  recommendations: {
    category: 'technical' | 'resource' | 'cultural';
    priority: 'high' | 'medium' | 'low';
    action: string;
    timeline: number; // in months
  }[];
}

export interface TimelineProjection {
  phases: {
    name: string;
    startMonth: number;
    duration: number;
    milestones: string[];
    dependencies: string[];
    risks: string[];
  }[];
  criticalPath: string[];
  totalDuration: number; // in months
  confidenceLevel: number; // 0-1
}
