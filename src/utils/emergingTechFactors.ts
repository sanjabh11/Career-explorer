import { EmergingTechnology } from '../types/emergingTech';
import { AutomationFactor } from '../types/automation';

// Sample emerging technologies data
export const emergingTechnologies: EmergingTechnology[] = [
  {
    id: 'ai-ml-001',
    name: 'Advanced Machine Learning',
    category: 'AI_ML',
    maturityLevel: 'Growth',
    impactScore: 0.85,
    timeToMainstream: 18,
    skillRequirements: [
      {
        skillName: 'Machine Learning',
        proficiencyLevel: 0.8,
        demandTrend: 'increasing',
        availabilityScore: 0.6,
        timeToAcquire: 12
      }
    ],
    industryImpacts: [
      {
        industry: 'Technology',
        disruptionLevel: 0.9,
        adoptionRate: 0.7,
        jobsAffected: {
          created: 1000,
          modified: 5000,
          displaced: 2000
        },
        timelineToImpact: 12,
        barriers: ['Skill gaps'],
        opportunities: ['New markets']
      }
    ],
    disruptionPotential: {
      processAutomation: 0.8,
      decisionAugmentation: 0.9,
      skillObsolescence: 0.6,
      newCapabilityCreation: 0.85,
      marketRestructuring: 0.7
    },
    implementationFactors: {
      costFactor: {
        initialInvestment: 500000,
        ongoingCosts: 100000,
        roi: 2.5,
        paybackPeriod: 18
      },
      infrastructureRequirements: {
        hardware: ['GPU clusters'],
        software: ['ML frameworks'],
        connectivity: ['High-speed internet'],
        compliance: ['Data privacy']
      },
      organizationalReadiness: {
        technicalCapability: 0.7,
        changeManagement: 0.6,
        resourceAvailability: 0.8,
        culturalAlignment: 0.65
      },
      risks: {
        technical: ['Model accuracy'],
        operational: ['Integration challenges'],
        financial: ['Cost overruns'],
        strategic: ['Market timing']
      }
    },
    marketProjections: [
      {
        year: 2024,
        marketSize: 50000,
        growthRate: 25,
        adoptionRate: 0.4,
        confidence: 0.85,
        keyDrivers: ['Digital transformation'],
        potentialBarriers: ['Skills shortage']
      }
    ],
    relatedTechnologies: ['deep-learning-001']
  }
  // Add more technologies as needed
];

export function calculateEmergingTechImpact(
  task: string,
  selectedTechnologies: EmergingTechnology[]
): number {
  if (!selectedTechnologies.length) return 0;

  const relevantTechs = selectedTechnologies.filter(tech => 
    tech.industryImpacts.some(impact => 
      impact.jobsAffected.modified > 0 || 
      impact.jobsAffected.created > 0
    )
  );

  if (!relevantTechs.length) return 0;

  const weightedImpact = relevantTechs.reduce((total, tech) => {
    const taskRelevance = calculateTaskRelevance(task, tech);
    const timeToImpact = tech.timeToMainstream;
    const impactWeight = 1 / (1 + timeToImpact / 12); // Discount factor based on time
    
    return total + (tech.impactScore * taskRelevance * impactWeight);
  }, 0);

  return weightedImpact / relevantTechs.length;
}

function calculateTaskRelevance(task: string, technology: EmergingTechnology): number {
  // Simple keyword matching for now - could be enhanced with NLP
  const taskWords = task.toLowerCase().split(' ');
  const techKeywords = [
    technology.name.toLowerCase(),
    ...technology.skillRequirements.map(s => s.skillName.toLowerCase())
  ];

  const matchCount = taskWords.filter(word => 
    techKeywords.some(keyword => keyword.includes(word))
  ).length;

  return Math.min(1, matchCount / taskWords.length);
}

export function getTechnologyRecommendations(
  industry: string,
  occupation: string
): EmergingTechnology[] {
  return emergingTechnologies.filter(tech => {
    const industryImpact = tech.industryImpacts.find(
      impact => impact.industry === industry
    );
    
    if (!industryImpact) return false;
    
    const isRelevantForOccupation = tech.skillRequirements.some(
      skill => occupationSkillMap[occupation]?.includes(skill.skillName)
    );
    
    return isRelevantForOccupation && industryImpact.disruptionLevel > 0.5;
  });
}

const occupationSkillMap: Record<string, string[]> = {
  'Software Developer': [
    'Machine Learning',
    'Cloud Computing',
    'DevOps',
    'Software Architecture'
  ],
  'Data Scientist': [
    'Machine Learning',
    'Statistical Analysis',
    'Data Visualization',
    'Big Data'
  ],
  'Business Analyst': [
    'Data Analysis',
    'Process Modeling',
    'Requirements Engineering',
    'Business Intelligence'
  ],
  'Project Manager': [
    'Project Management',
    'Agile Methodologies',
    'Risk Management',
    'Team Leadership'
  ],
  'Sales Representative': [
    'CRM Systems',
    'Sales Analytics',
    'Digital Marketing',
    'Communication'
  ]
};

export { occupationSkillMap };
