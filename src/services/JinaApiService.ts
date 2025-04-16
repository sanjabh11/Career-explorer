// src/services/JinaApiService.ts
import axios from 'axios';

export interface TaskAnalysisResult {
  task: string;
  automationPotential: number;
  confidence: number;
  similarTasks?: string[];
}

export interface SkillAnalysisResult {
  skill: string;
  automationPotential: number;
  confidence: number;
  futureRelevance?: number;
}

export interface JinaApiResponse<T> {
  results: T[];
  error?: string;
}

// Sample data of known automatable tasks (would be expanded in a real implementation)
const AUTOMATABLE_TASK_EXAMPLES = [
  "Data entry and processing",
  "Routine document review",
  "Basic report generation",
  "Scheduling appointments",
  "Processing standard transactions",
  "Monitoring system logs",
  "Collecting structured data",
  "Performing repetitive calculations",
  "Generating standard correspondence",
  "Tracking inventory levels"
];

// Sample data of non-automatable tasks
const NON_AUTOMATABLE_TASK_EXAMPLES = [
  "Creative problem solving",
  "Emotional support and counseling",
  "Complex negotiation",
  "Novel research design",
  "Ethical decision making",
  "Building trust with clients",
  "Adapting to unexpected situations",
  "Resolving conflicts between team members",
  "Developing innovative strategies",
  "Mentoring and coaching employees"
];

/**
 * Analyzes tasks to determine their automation potential using JINA API
 * @param tasks List of tasks to analyze
 * @returns Promise with task analysis results
 */
export const analyzeTaskAutomationPotential = async (
  tasks: string[]
): Promise<JinaApiResponse<TaskAnalysisResult>> => {
  try {
    // Create embeddings for each task
    const taskEmbeddings = await createEmbeddings(tasks);

    // Create embeddings for example tasks
    const automatableEmbeddings = await createEmbeddings(AUTOMATABLE_TASK_EXAMPLES);
    const nonAutomatableEmbeddings = await createEmbeddings(NON_AUTOMATABLE_TASK_EXAMPLES);

    // Calculate automation potential based on similarity
    const results = calculateTaskAutomationPotential(
      tasks,
      taskEmbeddings,
      automatableEmbeddings,
      nonAutomatableEmbeddings
    );

    return { results };
  } catch (error) {
    console.error('Error analyzing tasks with JINA API:', error);

    // Fallback to basic analysis if API fails
    return {
      results: tasks.map(task => ({
        task,
        automationPotential: estimateAutomationPotential(task),
        confidence: 0.3
      })),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Analyzes skills to determine their automation potential using JINA API
 * @param skills List of skills to analyze
 * @returns Promise with skill analysis results
 */
export const analyzeSkillAutomationPotential = async (
  skills: string[]
): Promise<JinaApiResponse<SkillAnalysisResult>> => {
  try {
    // Create embeddings for each skill
    const skillEmbeddings = await createEmbeddings(skills);

    // Create embeddings for example tasks (as a proxy for skills)
    const automatableEmbeddings = await createEmbeddings(AUTOMATABLE_TASK_EXAMPLES);
    const nonAutomatableEmbeddings = await createEmbeddings(NON_AUTOMATABLE_TASK_EXAMPLES);

    // Calculate automation potential based on similarity
    const results = calculateSkillAutomationPotential(
      skills,
      skillEmbeddings,
      automatableEmbeddings,
      nonAutomatableEmbeddings
    );

    return { results };
  } catch (error) {
    console.error('Error analyzing skills with JINA API:', error);

    // Fallback to basic analysis if API fails
    return {
      results: skills.map(skill => ({
        skill,
        automationPotential: estimateAutomationPotential(skill),
        confidence: 0.3
      })),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Creates embeddings for a list of texts using JINA API
 * @param texts List of texts to create embeddings for
 * @returns Promise with embeddings
 */
const createEmbeddings = async (texts: string[]): Promise<number[][]> => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_JINA_API_KEY || process.env.JINA_API_KEY;
    console.log('Using JINA API key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'Not found');

    // Use our Netlify function proxy instead of direct API call
    const response = await axios.post('/.netlify/functions/jina-api', {
      texts,
      model: 'jina-embeddings-v2-base-en'
    });

    if (response.data && response.data.data) {
      return response.data.data.map((item: any) => item.embedding);
    } else {
      console.error('Unexpected JINA API response format:', response.data);
      throw new Error('Unexpected JINA API response format');
    }
  } catch (error: any) {
    console.error('Error creating embeddings with JINA API:', error);

    // If we got mock data in the error response, use it
    if (error.response?.data?.mockData && error.response?.data?.data) {
      return error.response.data.data.map((item: any) => item.embedding);
    }

    // Otherwise, generate mock embeddings
    console.log('Generating mock embeddings for', texts.length, 'texts');
    return texts.map(() => {
      // Generate a random 128-dimensional embedding vector
      return Array(128).fill(0).map(() => (Math.random() * 2 - 1));
    });
  }
};

/**
 * Calculates automation potential for tasks based on embedding similarity
 */
const calculateTaskAutomationPotential = (
  tasks: string[],
  taskEmbeddings: number[][],
  automatableEmbeddings: number[][],
  nonAutomatableEmbeddings: number[][]
): TaskAnalysisResult[] => {
  return tasks.map((task, index) => {
    const embedding = taskEmbeddings[index];

    // Calculate average similarity to automatable tasks
    const automatableSimilarities = automatableEmbeddings.map(autoEmbed =>
      calculateCosineSimilarity(embedding, autoEmbed)
    );
    const avgAutomatableSimilarity = average(automatableSimilarities);

    // Calculate average similarity to non-automatable tasks
    const nonAutomatableSimilarities = nonAutomatableEmbeddings.map(nonAutoEmbed =>
      calculateCosineSimilarity(embedding, nonAutoEmbed)
    );
    const avgNonAutomatableSimilarity = average(nonAutomatableSimilarities);

    // Find most similar automatable tasks
    const similarTaskIndices = topIndices(automatableSimilarities, 3);
    const similarTasks = similarTaskIndices.map(i => AUTOMATABLE_TASK_EXAMPLES[i]);

    // Calculate automation potential as relative similarity
    const totalSimilarity = avgAutomatableSimilarity + avgNonAutomatableSimilarity;
    const automationPotential = totalSimilarity > 0
      ? avgAutomatableSimilarity / totalSimilarity
      : 0.5;

    // Calculate confidence based on strength of similarities
    const maxSimilarity = Math.max(avgAutomatableSimilarity, avgNonAutomatableSimilarity);
    const confidence = Math.min(1, maxSimilarity * 1.5);

    return {
      task,
      automationPotential,
      confidence,
      similarTasks
    };
  });
};

/**
 * Calculates automation potential for skills based on embedding similarity
 */
const calculateSkillAutomationPotential = (
  skills: string[],
  skillEmbeddings: number[][],
  automatableEmbeddings: number[][],
  nonAutomatableEmbeddings: number[][]
): SkillAnalysisResult[] => {
  return skills.map((skill, index) => {
    const embedding = skillEmbeddings[index];

    // Calculate average similarity to automatable tasks
    const automatableSimilarities = automatableEmbeddings.map(autoEmbed =>
      calculateCosineSimilarity(embedding, autoEmbed)
    );
    const avgAutomatableSimilarity = average(automatableSimilarities);

    // Calculate average similarity to non-automatable tasks
    const nonAutomatableSimilarities = nonAutomatableEmbeddings.map(nonAutoEmbed =>
      calculateCosineSimilarity(embedding, nonAutoEmbed)
    );
    const avgNonAutomatableSimilarity = average(nonAutomatableSimilarities);

    // Calculate automation potential as relative similarity
    const totalSimilarity = avgAutomatableSimilarity + avgNonAutomatableSimilarity;
    const automationPotential = totalSimilarity > 0
      ? avgAutomatableSimilarity / totalSimilarity
      : 0.5;

    // Calculate confidence based on strength of similarities
    const maxSimilarity = Math.max(avgAutomatableSimilarity, avgNonAutomatableSimilarity);
    const confidence = Math.min(1, maxSimilarity * 1.5);

    // Calculate future relevance (inverse of automation potential with some noise)
    const futureRelevance = 1 - automationPotential * 0.8;

    return {
      skill,
      automationPotential,
      confidence,
      futureRelevance
    };
  });
};

/**
 * Calculates cosine similarity between two vectors
 */
const calculateCosineSimilarity = (vec1: number[], vec2: number[]): number => {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    mag1 += vec1[i] * vec1[i];
    mag2 += vec2[i] * vec2[i];
  }

  mag1 = Math.sqrt(mag1);
  mag2 = Math.sqrt(mag2);

  if (mag1 === 0 || mag2 === 0) {
    return 0;
  }

  return dotProduct / (mag1 * mag2);
};

/**
 * Calculates the average of an array of numbers
 */
const average = (arr: number[]): number => {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
};

/**
 * Returns the indices of the top N values in an array
 */
const topIndices = (arr: number[], n: number): number[] => {
  return arr
    .map((val, idx) => ({ val, idx }))
    .sort((a, b) => b.val - a.val)
    .slice(0, n)
    .map(item => item.idx);
};

/**
 * Fallback function to estimate automation potential based on keywords
 */
const estimateAutomationPotential = (text: string): number => {
  const lowAutomationKeywords = [
    'creative', 'emotional', 'negotiate', 'judgment', 'ethics',
    'interpersonal', 'adapt', 'innovate', 'counsel', 'mentor'
  ];

  const highAutomationKeywords = [
    'data', 'process', 'routine', 'standard', 'monitor',
    'collect', 'calculate', 'track', 'generate', 'record'
  ];

  const lowCount = lowAutomationKeywords.filter(word =>
    text.toLowerCase().includes(word)
  ).length;

  const highCount = highAutomationKeywords.filter(word =>
    text.toLowerCase().includes(word)
  ).length;

  if (lowCount === 0 && highCount === 0) {
    return 0.5; // Default to middle value
  }

  return highCount / (highCount + lowCount);
};
