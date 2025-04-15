// src/services/SkillsTransferabilityService.ts

import axios from 'axios';
import { 
  SkillTransferabilityData, 
  OccupationSkillComparison,
  SkillNode,
  SkillEdge
} from '@/types/skillsTransferability';

const API_BASE_URL = '/.netlify/functions/onet-proxy';

/**
 * Get skill transferability data for visualization
 * @param occupationCode O*NET occupation code
 * @returns Skill transferability data with nodes and edges
 */
export const getSkillTransferabilityData = async (occupationCode: string): Promise<SkillTransferabilityData> => {
  try {
    // In a real implementation, this would call the O*NET API
    // For now, return mock data
    return mockSkillTransferabilityData;
  } catch (error) {
    console.error('Error fetching skill transferability data:', error);
    throw error;
  }
};

/**
 * Compare skills between two occupations
 * @param sourceOccupationCode Source occupation O*NET code
 * @param targetOccupationCode Target occupation O*NET code
 * @returns Comparison of skills between occupations
 */
export const compareSkillsBetweenOccupations = async (
  sourceOccupationCode: string,
  targetOccupationCode: string
): Promise<OccupationSkillComparison> => {
  try {
    // In a real implementation, this would call the O*NET API
    // For now, return mock data
    return {
      sourceOccupation: {
        code: sourceOccupationCode,
        title: 'Source Occupation'
      },
      targetOccupation: {
        code: targetOccupationCode,
        title: 'Target Occupation'
      },
      skillComparisons: [
        {
          skillId: 'skill-1',
          skillName: 'Critical Thinking',
          sourceLevel: 4,
          targetLevel: 3,
          gap: -1,
          transferability: 0.8
        },
        {
          skillId: 'skill-2',
          skillName: 'Complex Problem Solving',
          sourceLevel: 3,
          targetLevel: 4,
          gap: 1,
          transferability: 0.7
        },
        {
          skillId: 'skill-3',
          skillName: 'Programming',
          sourceLevel: 4,
          targetLevel: 2,
          gap: -2,
          transferability: 0.5
        },
        {
          skillId: 'skill-4',
          skillName: 'Active Learning',
          sourceLevel: 3,
          targetLevel: 3,
          gap: 0,
          transferability: 0.9
        },
        {
          skillId: 'skill-5',
          skillName: 'Systems Analysis',
          sourceLevel: 3,
          targetLevel: 2,
          gap: -1,
          transferability: 0.6
        }
      ],
      overallTransferability: 0.7
    };
  } catch (error) {
    console.error('Error comparing skills between occupations:', error);
    throw error;
  }
};

// Mock data
const mockSkillTransferabilityData: SkillTransferabilityData = {
  nodes: [
    {
      id: 'skill-1',
      label: 'Critical Thinking',
      type: 'skill',
      category: 'Cognitive',
      level: 4,
      importance: 90
    },
    {
      id: 'skill-2',
      label: 'Complex Problem Solving',
      type: 'skill',
      category: 'Cognitive',
      level: 4,
      importance: 85
    },
    {
      id: 'skill-3',
      label: 'Programming',
      type: 'skill',
      category: 'Technical',
      level: 3,
      importance: 80
    },
    {
      id: 'skill-4',
      label: 'Active Learning',
      type: 'skill',
      category: 'Learning',
      level: 3,
      importance: 75
    },
    {
      id: 'skill-5',
      label: 'Systems Analysis',
      type: 'skill',
      category: 'Technical',
      level: 3,
      importance: 70
    },
    {
      id: 'occ-1',
      label: 'Computer Systems Analyst',
      type: 'occupation'
    },
    {
      id: 'occ-2',
      label: 'Software Developer',
      type: 'occupation'
    },
    {
      id: 'occ-3',
      label: 'Database Administrator',
      type: 'occupation'
    }
  ],
  edges: [
    {
      source: 'occ-1',
      target: 'skill-1',
      weight: 0.9,
      type: 'requires'
    },
    {
      source: 'occ-1',
      target: 'skill-2',
      weight: 0.85,
      type: 'requires'
    },
    {
      source: 'occ-1',
      target: 'skill-5',
      weight: 0.8,
      type: 'requires'
    },
    {
      source: 'occ-2',
      target: 'skill-1',
      weight: 0.8,
      type: 'requires'
    },
    {
      source: 'occ-2',
      target: 'skill-2',
      weight: 0.9,
      type: 'requires'
    },
    {
      source: 'occ-2',
      target: 'skill-3',
      weight: 0.95,
      type: 'requires'
    },
    {
      source: 'occ-3',
      target: 'skill-1',
      weight: 0.75,
      type: 'requires'
    },
    {
      source: 'occ-3',
      target: 'skill-3',
      weight: 0.8,
      type: 'requires'
    },
    {
      source: 'occ-3',
      target: 'skill-5',
      weight: 0.85,
      type: 'requires'
    },
    {
      source: 'skill-1',
      target: 'skill-2',
      weight: 0.7,
      type: 'similar'
    },
    {
      source: 'skill-2',
      target: 'skill-5',
      weight: 0.6,
      type: 'similar'
    },
    {
      source: 'skill-3',
      target: 'skill-5',
      weight: 0.5,
      type: 'similar'
    }
  ]
};
