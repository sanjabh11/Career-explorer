// src/services/SkillsTransferabilityService.ts
// Version 1.3.0

import axios from 'axios';
import { 
  SkillNode,
  SkillEdge,
  SkillTransferability,
  SkillCluster,
  TransferPathway,
  SkillGapVisualization
} from '@/types/skillsTransferability';

const API_BASE_URL = '/.netlify/functions/onet-proxy';

/**
 * Analyzes skills transferability between two occupations
 * @param sourceCode O*NET-SOC code for the source occupation
 * @param targetCode O*NET-SOC code for the target occupation
 * @returns Promise resolving to a SkillTransferability object
 */
export const analyzeSkillsTransferability = async (
  sourceCode: string,
  targetCode: string
): Promise<SkillTransferability> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/skills/transferability?source=${encodeURIComponent(sourceCode)}&target=${encodeURIComponent(targetCode)}`
    );
    
    if (!response.data.transferability) {
      throw new Error('Invalid response format: missing transferability data');
    }
    
    return {
      sourceOccupation: response.data.transferability.source_occupation,
      targetOccupation: response.data.transferability.target_occupation,
      overallScore: response.data.transferability.overall_score,
      matchedSkills: response.data.transferability.matched_skills.map((skill: any) => ({
        skill: skill.skill,
        sourceLevel: skill.source_level,
        targetLevel: skill.target_level,
        gapScore: skill.gap_score
      })),
      missingSkills: response.data.transferability.missing_skills.map((skill: any) => ({
        skill: skill.skill,
        requiredLevel: skill.required_level,
        difficulty: skill.difficulty
      })),
      excessSkills: response.data.transferability.excess_skills.map((skill: any) => ({
        skill: skill.skill,
        currentLevel: skill.current_level,
        utilization: skill.utilization
      }))
    };
  } catch (error) {
    console.error(`Error analyzing skills transferability between ${sourceCode} and ${targetCode}:`, error);
    throw error;
  }
};

/**
 * Gets skill nodes and connections for visualization
 * @param sourceCode O*NET-SOC code for the source occupation
 * @param targetCode O*NET-SOC code for the target occupation
 * @returns Promise resolving to a SkillGapVisualization object
 */
export const getSkillVisualizationData = async (
  sourceCode: string,
  targetCode: string
): Promise<SkillGapVisualization> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/skills/visualization?source=${encodeURIComponent(sourceCode)}&target=${encodeURIComponent(targetCode)}`
    );
    
    if (!response.data.visualization) {
      throw new Error('Invalid response format: missing visualization data');
    }
    
    return {
      matched: response.data.visualization.matched.map((node: any) => ({
        id: node.id,
        name: node.name,
        description: node.description,
        level: node.level,
        value: node.value,
        category: node.category,
        subcategory: node.subcategory,
        importance: node.importance
      })),
      missing: response.data.visualization.missing.map((node: any) => ({
        id: node.id,
        name: node.name,
        description: node.description,
        level: node.level,
        value: node.value,
        category: node.category,
        subcategory: node.subcategory,
        importance: node.importance
      })),
      excess: response.data.visualization.excess.map((node: any) => ({
        id: node.id,
        name: node.name,
        description: node.description,
        level: node.level,
        value: node.value,
        category: node.category,
        subcategory: node.subcategory,
        importance: node.importance
      })),
      connections: response.data.visualization.connections.map((edge: any) => ({
        source: edge.source,
        target: edge.target,
        strength: edge.strength,
        type: edge.type
      }))
    };
  } catch (error) {
    console.error(`Error getting skill visualization data between ${sourceCode} and ${targetCode}:`, error);
    throw error;
  }
};

/**
 * Gets skill clusters for grouping related skills
 * @returns Promise resolving to an array of SkillCluster objects
 */
export const getSkillClusters = async (): Promise<SkillCluster[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/skills/clusters`);
    
    if (!response.data.clusters) {
      throw new Error('Invalid response format: missing clusters array');
    }
    
    return response.data.clusters.map((cluster: any) => ({
      id: cluster.id,
      name: cluster.name,
      skills: cluster.skills,
      relatedClusters: cluster.related_clusters,
      occupations: cluster.occupations
    }));
  } catch (error) {
    console.error('Error fetching skill clusters:', error);
    throw error;
  }
};

/**
 * Finds optimal career pathway between occupations
 * @param startCode O*NET-SOC code for the starting occupation
 * @param endCode O*NET-SOC code for the target occupation
 * @param includeIntermediateSteps Whether to include intermediate occupations
 * @returns Promise resolving to a TransferPathway object
 */
export const findCareerPathway = async (
  startCode: string,
  endCode: string,
  includeIntermediateSteps: boolean = true
): Promise<TransferPathway> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/skills/pathway?start=${encodeURIComponent(startCode)}&end=${encodeURIComponent(endCode)}&intermediateSteps=${includeIntermediateSteps}`
    );
    
    if (!response.data.pathway) {
      throw new Error('Invalid response format: missing pathway data');
    }
    
    return {
      start: response.data.pathway.start,
      end: response.data.pathway.end,
      intermediateSteps: response.data.pathway.intermediate_steps.map((step: any) => ({
        occupation: step.occupation,
        skillsToAcquire: step.skills_to_acquire,
        skillsToLeverage: step.skills_to_leverage
      })),
      totalTransferScore: response.data.pathway.total_transfer_score,
      estimatedTimeToTransfer: response.data.pathway.estimated_time_to_transfer
    };
  } catch (error) {
    console.error(`Error finding career pathway between ${startCode} and ${endCode}:`, error);
    throw error;
  }
};

// Export additional methods that will be implemented as needed
export default {
  analyzeSkillsTransferability,
  getSkillVisualizationData,
  getSkillClusters,
  findCareerPathway
};
