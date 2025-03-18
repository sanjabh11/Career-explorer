// src/services/SkillsTransferabilityService.ts
// Version 1.3.0

import axios from 'axios';
import { 
  SkillNode,
  SkillEdge,
  SkillTransferability,
  SkillCluster,
  TransferPathway,
  SkillGapVisualization,
  SkillTransferabilityData,
  SkillGap,
  SkillMatch,
  CareerPath,
  CareerPathStep,
  CareerTransitionGap
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

/**
 * Gets skill transferability data for visualization
 * @param occupationCode O*NET-SOC code for the occupation
 * @returns Promise resolving to a SkillTransferabilityData object
 */
export const getSkillTransferabilityData = async (
  occupationCode: string
): Promise<SkillTransferabilityData> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/skills/network?code=${encodeURIComponent(occupationCode)}`
    );
    
    if (!response.data.network) {
      throw new Error('Invalid response format: missing network data');
    }
    
    return {
      nodes: response.data.network.nodes.map((node: any) => ({
        id: node.id,
        name: node.name,
        description: node.description || '',
        level: node.level || 0,
        value: node.value || 1,
        category: node.category,
        subcategory: node.subcategory,
        importance: node.importance || 0,
        label: node.name, // Add label for visualization
        type: node.type || 'skill'
      })),
      edges: response.data.network.edges.map((edge: any) => ({
        source: edge.source,
        target: edge.target,
        strength: edge.strength || 0.5,
        type: edge.type || 'direct'
      })),
      clusters: response.data.network.clusters?.map((cluster: any) => ({
        id: cluster.id,
        name: cluster.name,
        skills: cluster.skills,
        relatedClusters: cluster.related_clusters || [],
        occupations: cluster.occupations || []
      }))
    };
  } catch (error) {
    console.error(`Error getting skill transferability data for occupation ${occupationCode}:`, error);
    throw error;
  }
};

/**
 * Gets skill gaps between current and target occupation
 * @param currentCode O*NET-SOC code for the current occupation
 * @param targetCode O*NET-SOC code for the target occupation
 * @returns Promise resolving to an array of SkillGap objects
 */
export const getSkillGaps = async (
  currentCode: string,
  targetCode: string
): Promise<SkillGap[]> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/skills/gaps?current=${encodeURIComponent(currentCode)}&target=${encodeURIComponent(targetCode)}`
    );
    
    if (!response.data.gaps) {
      throw new Error('Invalid response format: missing gaps array');
    }
    
    return response.data.gaps.map((gap: any) => ({
      id: gap.id,
      name: gap.name,
      description: gap.description,
      currentLevel: gap.current_level,
      requiredLevel: gap.required_level,
      category: gap.category,
      trainingOption: gap.training_option,
      difficulty: gap.difficulty
    }));
  } catch (error) {
    console.error(`Error getting skill gaps between ${currentCode} and ${targetCode}:`, error);
    throw error;
  }
};

/**
 * Gets skill matches between current and target occupation
 * @param currentCode O*NET-SOC code for the current occupation
 * @param targetCode O*NET-SOC code for the target occupation
 * @returns Promise resolving to an array of SkillMatch objects
 */
export const getSkillMatches = async (
  currentCode: string,
  targetCode: string
): Promise<SkillMatch[]> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/skills/matches?current=${encodeURIComponent(currentCode)}&target=${encodeURIComponent(targetCode)}`
    );
    
    if (!response.data.matches) {
      throw new Error('Invalid response format: missing matches array');
    }
    
    return response.data.matches.map((match: any) => ({
      id: match.id,
      name: match.name,
      description: match.description,
      level: match.level,
      category: match.category,
      importance: match.importance,
      transferability: match.transferability
    }));
  } catch (error) {
    console.error(`Error getting skill matches between ${currentCode} and ${targetCode}:`, error);
    throw error;
  }
};

/**
 * Gets career pathways for a specific occupation
 * @param occupationCode O*NET-SOC code for the occupation
 * @param maxPathLength Maximum number of steps in each path
 * @returns Promise resolving to an array of CareerPath objects
 */
export const getCareerPathways = async (
  occupationCode: string,
  maxPathLength: number = 3
): Promise<CareerPath[]> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/skills/career-paths?code=${encodeURIComponent(occupationCode)}&maxLength=${maxPathLength}`
    );
    
    if (!response.data.paths) {
      throw new Error('Invalid response format: missing paths array');
    }
    
    return response.data.paths.map((path: any) => ({
      id: path.id,
      name: path.name,
      description: path.description,
      difficulty: path.difficulty,
      estimatedTimeYears: path.estimated_time_years,
      steps: path.steps.map((step: any) => ({
        occupation: {
          code: step.occupation.code,
          title: step.occupation.title
        },
        title: step.title,
        description: step.description,
        salary: step.salary,
        growthRate: step.growth_rate,
        brightOutlook: step.bright_outlook,
        educationRequired: step.education_required,
        experienceRequired: step.experience_required,
        timingMonths: step.timing_months,
        gaps: step.gaps?.map((gap: any) => ({
          id: gap.id,
          name: gap.name,
          description: gap.description,
          currentLevel: gap.current_level,
          requiredLevel: gap.required_level,
          trainingOption: gap.training_option
        }))
      }))
    }));
  } catch (error) {
    console.error(`Error getting career pathways for occupation ${occupationCode}:`, error);
    throw error;
  }
};

// Export additional methods that will be implemented as needed
export default {
  analyzeSkillsTransferability,
  getSkillVisualizationData,
  getSkillClusters,
  findCareerPathway,
  getSkillTransferabilityData,
  getSkillGaps,
  getSkillMatches,
  getCareerPathways
};
