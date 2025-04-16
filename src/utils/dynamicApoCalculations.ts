// src/utils/dynamicApoCalculations.ts
import { APOItem } from '@/types/onet';
import { OccupationData } from '@/types/occupation';
import { getAverageAPO, calculateAPO } from './apoCalculations';
import {
  fetchAutomationTrends,
  fetchAutomationResearch,
  fetchTechnologyAdoption,
  AutomationTrend
} from '../services/SerpApiService';
import {
  analyzeTaskAutomationPotential,
  analyzeSkillAutomationPotential,
  TaskAnalysisResult,
  SkillAnalysisResult
} from '../services/JinaApiService';
import {
  crawlAutomationResearch,
  crawlIndustryAutomation,
  ResearchData
} from '../services/FireCrawlService';

// Define interfaces for dynamic APO calculation
export interface DynamicAPOResult {
  overallAPO: number;
  categoryScores: {
    tasks: number;
    knowledge: number;
    skills: number;
    abilities: number;
    technologies: number;
  };
  trends: TrendData[];
  insights: string[];
  dataConfidence: number;
  dataSource: 'dynamic' | 'static' | 'hybrid';
}

export interface TrendData {
  year: number;
  value: number;
  source: string;
}

export interface APOContext {
  industry?: string;
  region?: string;
  useFireCrawl?: boolean;
  useJina?: boolean;
  useSERP?: boolean;
  fallbackToStatic?: boolean;
}

/**
 * Calculate dynamic APO for an occupation using available APIs
 * @param occupation The occupation data
 * @param context Additional context for calculation
 * @returns Promise with dynamic APO result
 */
export const calculateDynamicAPO = async (
  occupation: OccupationData,
  context: APOContext = { fallbackToStatic: true }
): Promise<DynamicAPOResult> => {
  console.log(`Calculating dynamic APO for ${occupation.title}`);

  // Initialize result with default values
  const result: DynamicAPOResult = {
    overallAPO: 0,
    categoryScores: {
      tasks: 0,
      knowledge: 0,
      skills: 0,
      abilities: 0,
      technologies: 0
    },
    trends: [],
    insights: [],
    dataConfidence: 0,
    dataSource: 'static' // Default to static if APIs fail
  };

  try {
    // Collect data from APIs in parallel
    const apiPromises: Promise<any>[] = [];
    const apiResults: any = {};

    // Check environment variables
    const useSERP = process.env.NEXT_PUBLIC_USE_SERP === 'true' && context.useSERP !== false;
    const useJina = process.env.NEXT_PUBLIC_USE_JINA === 'true' && context.useJina !== false;
    const useFireCrawl = process.env.NEXT_PUBLIC_USE_FIRECRAWL === 'true' && context.useFireCrawl !== false;

    console.log(`Dynamic APO calculation using APIs - SERP: ${useSERP}, JINA: ${useJina}, FireCrawl: ${useFireCrawl}`);

    // SERP API calls
    if (useSERP) {
      console.log('Fetching data from SERP API...');
      apiPromises.push(
        fetchAutomationTrends(occupation.title)
          .then(data => {
            console.log('SERP Automation Trends data received');
            apiResults.automationTrends = data;
          })
          .catch(err => console.error('SERP API error:', err))
      );

      apiPromises.push(
        fetchAutomationResearch(occupation.title)
          .then(data => {
            console.log('SERP Research data received');
            apiResults.automationResearch = data;
          })
          .catch(err => console.error('SERP Research API error:', err))
      );

      apiPromises.push(
        fetchTechnologyAdoption(occupation.title)
          .then(data => {
            console.log('SERP Technology Adoption data received');
            apiResults.technologyAdoption = data;
          })
          .catch(err => console.error('SERP Technology API error:', err))
      );
    }

    // JINA API calls
    if (useJina) {
      console.log('Analyzing data with JINA API...');
      apiPromises.push(
        analyzeTaskAutomationPotential(occupation.tasks.map(t => t.name || t.title || ''))
          .then(data => {
            console.log('JINA Task Analysis data received');
            apiResults.taskAnalysis = data;
          })
          .catch(err => console.error('JINA Task API error:', err))
      );

      apiPromises.push(
        analyzeSkillAutomationPotential(occupation.skills.map(s => s.name || s.title || ''))
          .then(data => {
            console.log('JINA Skill Analysis data received');
            apiResults.skillAnalysis = data;
          })
          .catch(err => console.error('JINA Skill API error:', err))
      );
    }

    // FireCrawl API calls
    if (useFireCrawl) {
      console.log('Crawling web for research data with FireCrawl API...');
      apiPromises.push(
        crawlAutomationResearch(occupation.title)
          .then(data => {
            console.log('FireCrawl Research data received');
            apiResults.researchData = data;
          })
          .catch(err => console.error('FireCrawl API error:', err))
      );

      if (context.industry) {
        apiPromises.push(
          crawlIndustryAutomation(occupation.title, context.industry)
            .then(data => {
              console.log('FireCrawl Industry data received');
              apiResults.industryData = data;
            })
            .catch(err => console.error('FireCrawl Industry API error:', err))
        );
      }
    }

    // Wait for all API calls to complete
    await Promise.all(apiPromises);

    // Check if we have enough data to calculate dynamic APO
    const hasEnoughData = Object.keys(apiResults).length >= 2;

    if (hasEnoughData) {
      // Calculate category scores using dynamic data
      result.categoryScores = {
        tasks: await calculateDynamicTaskAPO(occupation.tasks, apiResults),
        knowledge: await calculateDynamicKnowledgeAPO(occupation.knowledge, apiResults),
        skills: await calculateDynamicSkillAPO(occupation.skills, apiResults),
        abilities: await calculateDynamicAbilityAPO(occupation.abilities, apiResults),
        technologies: await calculateDynamicTechnologyAPO(occupation.technologies, apiResults)
      };

      // Calculate overall APO using weighted average
      result.overallAPO = calculateWeightedOverallAPO(result.categoryScores);

      // Extract trends from API results
      result.trends = extractTrends(apiResults);

      // Generate insights based on API results
      result.insights = generateInsights(occupation, result, apiResults);

      // Calculate data confidence
      result.dataConfidence = calculateDataConfidence(apiResults);

      // Set data source
      result.dataSource = 'dynamic';
    } else if (context.fallbackToStatic) {
      // Fall back to static calculation if not enough dynamic data
      console.log('Falling back to static APO calculation');

      // Use static calculation for categories
      result.categoryScores = {
        tasks: getAverageAPO(occupation.tasks, 'tasks'),
        knowledge: getAverageAPO(occupation.knowledge, 'knowledge'),
        skills: getAverageAPO(occupation.skills, 'skills'),
        abilities: getAverageAPO(occupation.abilities, 'abilities'),
        technologies: getAverageAPO(occupation.technologies, 'technologies')
      };

      // Calculate overall APO using weighted average
      result.overallAPO = calculateWeightedOverallAPO(result.categoryScores);

      // Generate basic insights
      result.insights = [
        'APO calculation based on static data due to limited API data',
        'Consider running with full API access for more accurate results'
      ];

      // Set data confidence and source
      result.dataConfidence = 0.5; // Medium confidence for static data
      result.dataSource = 'static';
    } else {
      // If we don't have enough data and can't fall back, return error
      throw new Error('Insufficient data for APO calculation');
    }

    // If we have some API data but not enough, mark as hybrid
    if (Object.keys(apiResults).length > 0 && result.dataSource === 'static') {
      result.dataSource = 'hybrid';
      result.dataConfidence = 0.6; // Slightly higher confidence for hybrid
    }

    return result;
  } catch (error) {
    console.error('Error calculating dynamic APO:', error);

    // If fallback is enabled, use static calculation
    if (context.fallbackToStatic) {
      console.log('Error in dynamic calculation, falling back to static APO');

      // Use static calculation for categories
      result.categoryScores = {
        tasks: getAverageAPO(occupation.tasks, 'tasks'),
        knowledge: getAverageAPO(occupation.knowledge, 'knowledge'),
        skills: getAverageAPO(occupation.skills, 'skills'),
        abilities: getAverageAPO(occupation.abilities, 'abilities'),
        technologies: getAverageAPO(occupation.technologies, 'technologies')
      };

      // Calculate overall APO using weighted average
      result.overallAPO = calculateWeightedOverallAPO(result.categoryScores);

      // Add error insight
      result.insights = [
        'Error occurred during dynamic APO calculation',
        'Results based on static data as fallback'
      ];

      result.dataConfidence = 0.4; // Lower confidence due to error
      result.dataSource = 'static';

      return result;
    }

    // If no fallback, rethrow the error
    throw error;
  }
};

/**
 * Calculate dynamic APO for tasks
 */
const calculateDynamicTaskAPO = async (
  tasks: APOItem[],
  apiResults: any
): Promise<number> => {
  if (!tasks || tasks.length === 0) return 0;

  // If we have JINA task analysis, use it
  if (apiResults.taskAnalysis && apiResults.taskAnalysis.results) {
    const taskAnalysis = apiResults.taskAnalysis.results as TaskAnalysisResult[];

    // Map task analysis results to tasks
    const taskAPOs = tasks.map(task => {
      const taskName = task.name || task.title || '';
      const analysis = taskAnalysis.find(a => a.task === taskName);

      if (analysis) {
        // Convert automation potential to APO (0-100 scale)
        const dynamicAPO = analysis.automationPotential * 100;
        // Weight by confidence
        const weightedAPO = dynamicAPO * analysis.confidence;

        console.log(`Dynamic Task APO for "${taskName}": ${weightedAPO.toFixed(2)}`);
        return weightedAPO;
      } else {
        // Fall back to static calculation
        const staticAPO = calculateAPO(task, 'tasks');
        console.log(`Static Task APO for "${taskName}": ${staticAPO.toFixed(2)}`);
        return staticAPO;
      }
    });

    // Calculate average APO
    const averageAPO = taskAPOs.reduce((sum, apo) => sum + apo, 0) / taskAPOs.length;
    console.log(`Average dynamic Task APO: ${averageAPO.toFixed(2)}%`);
    return averageAPO;
  }

  // Fall back to static calculation
  return getAverageAPO(tasks, 'tasks');
};

/**
 * Calculate dynamic APO for knowledge
 */
const calculateDynamicKnowledgeAPO = async (
  knowledge: APOItem[],
  apiResults: any
): Promise<number> => {
  if (!knowledge || knowledge.length === 0) return 0;

  // For knowledge, we primarily use research data
  if ((apiResults.automationResearch && apiResults.automationResearch.trends) ||
      (apiResults.researchData && apiResults.researchData.researchData)) {

    // Combine research data from both sources
    const researchTrends = apiResults.automationResearch?.trends || [];
    const researchData = apiResults.researchData?.researchData || [];

    // Extract knowledge-related terms
    const knowledgeTerms = knowledge.map(k => k.name || k.title || '').filter(Boolean);

    // Find research that mentions knowledge terms
    const relevantResearch = [...researchTrends, ...researchData].filter(research => {
      const researchText = research.title + ' ' + (research.snippet || '') +
                          (research.automationMentions ?
                            research.automationMentions.map((m: any) => m.text).join(' ') : '');

      return knowledgeTerms.some(term =>
        researchText.toLowerCase().includes(term.toLowerCase())
      );
    });

    if (relevantResearch.length > 0) {
      // Extract automation percentages from research
      const percentages = relevantResearch
        .map(r => r.automationPercentage ||
             (r.automationMentions && r.automationMentions[0]?.automationPercentage))
        .filter(Boolean) as number[];

      if (percentages.length > 0) {
        // Calculate average of percentages
        const averagePercentage = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
        console.log(`Average dynamic Knowledge APO from research: ${averagePercentage.toFixed(2)}%`);
        return averagePercentage;
      }
    }
  }

  // Fall back to static calculation
  return getAverageAPO(knowledge, 'knowledge');
};

/**
 * Calculate dynamic APO for skills
 */
const calculateDynamicSkillAPO = async (
  skills: APOItem[],
  apiResults: any
): Promise<number> => {
  if (!skills || skills.length === 0) return 0;

  // If we have JINA skill analysis, use it
  if (apiResults.skillAnalysis && apiResults.skillAnalysis.results) {
    const skillAnalysis = apiResults.skillAnalysis.results as SkillAnalysisResult[];

    // Map skill analysis results to skills
    const skillAPOs = skills.map(skill => {
      const skillName = skill.name || skill.title || '';
      const analysis = skillAnalysis.find(a => a.skill === skillName);

      if (analysis) {
        // Convert automation potential to APO (0-100 scale)
        const dynamicAPO = analysis.automationPotential * 100;
        // Weight by confidence
        const weightedAPO = dynamicAPO * analysis.confidence;

        console.log(`Dynamic Skill APO for "${skillName}": ${weightedAPO.toFixed(2)}`);
        return weightedAPO;
      } else {
        // Fall back to static calculation
        const staticAPO = calculateAPO(skill, 'skills');
        console.log(`Static Skill APO for "${skillName}": ${staticAPO.toFixed(2)}`);
        return staticAPO;
      }
    });

    // Calculate average APO
    const averageAPO = skillAPOs.reduce((sum, apo) => sum + apo, 0) / skillAPOs.length;
    console.log(`Average dynamic Skill APO: ${averageAPO.toFixed(2)}%`);
    return averageAPO;
  }

  // Fall back to static calculation
  return getAverageAPO(skills, 'skills');
};

/**
 * Calculate dynamic APO for abilities
 */
const calculateDynamicAbilityAPO = async (
  abilities: APOItem[],
  apiResults: any
): Promise<number> => {
  if (!abilities || abilities.length === 0) return 0;

  // For abilities, we primarily use research data
  if ((apiResults.automationResearch && apiResults.automationResearch.trends) ||
      (apiResults.researchData && apiResults.researchData.researchData)) {

    // Combine research data from both sources
    const researchTrends = apiResults.automationResearch?.trends || [];
    const researchData = apiResults.researchData?.researchData || [];

    // Extract ability-related terms
    const abilityTerms = abilities.map(a => a.name || a.title || '').filter(Boolean);

    // Find research that mentions ability terms
    const relevantResearch = [...researchTrends, ...researchData].filter(research => {
      const researchText = research.title + ' ' + (research.snippet || '') +
                          (research.automationMentions ?
                            research.automationMentions.map((m: any) => m.text).join(' ') : '');

      return abilityTerms.some(term =>
        researchText.toLowerCase().includes(term.toLowerCase())
      );
    });

    if (relevantResearch.length > 0) {
      // Extract automation percentages from research
      const percentages = relevantResearch
        .map(r => r.automationPercentage ||
             (r.automationMentions && r.automationMentions[0]?.automationPercentage))
        .filter(Boolean) as number[];

      if (percentages.length > 0) {
        // Calculate average of percentages
        const averagePercentage = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
        console.log(`Average dynamic Ability APO from research: ${averagePercentage.toFixed(2)}%`);
        return averagePercentage;
      }
    }
  }

  // Fall back to static calculation
  return getAverageAPO(abilities, 'abilities');
};

/**
 * Calculate dynamic APO for technologies
 */
const calculateDynamicTechnologyAPO = async (
  technologies: APOItem[],
  apiResults: any
): Promise<number> => {
  if (!technologies || technologies.length === 0) return 0;

  // For technologies, we primarily use technology adoption data
  if (apiResults.technologyAdoption && apiResults.technologyAdoption.trends) {
    const techTrends = apiResults.technologyAdoption.trends;

    // Extract technology-related terms
    const techTerms = technologies.map(t => t.name || t.title || '').filter(Boolean);

    // Find trends that mention technology terms
    const relevantTrends = techTrends.filter((trend: any) => {
      const trendText = trend.title + ' ' + (trend.snippet || '');

      return techTerms.some(term =>
        trendText.toLowerCase().includes(term.toLowerCase())
      );
    });

    if (relevantTrends.length > 0) {
      // Extract automation percentages from trends
      const percentages = relevantTrends
        .map((t: any) => t.automationPercentage)
        .filter(Boolean) as number[];

      if (percentages.length > 0) {
        // Calculate average of percentages
        const averagePercentage = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
        console.log(`Average dynamic Technology APO from trends: ${averagePercentage.toFixed(2)}%`);
        return averagePercentage;
      }
    }
  }

  // Fall back to static calculation
  return getAverageAPO(technologies, 'technologies');
};

/**
 * Calculate weighted overall APO
 */
const calculateWeightedOverallAPO = (categoryScores: {
  tasks: number;
  knowledge: number;
  skills: number;
  abilities: number;
  technologies: number;
}): number => {
  // Define category weights
  const categoryWeights = {
    tasks: 0.3,
    knowledge: 0.2,
    skills: 0.2,
    abilities: 0.15,
    technologies: 0.15
  };

  // Calculate weighted sum
  const weightedSum =
    categoryScores.tasks * categoryWeights.tasks +
    categoryScores.knowledge * categoryWeights.knowledge +
    categoryScores.skills * categoryWeights.skills +
    categoryScores.abilities * categoryWeights.abilities +
    categoryScores.technologies * categoryWeights.technologies;

  console.log(`Overall weighted APO: ${weightedSum.toFixed(2)}%`);
  return weightedSum;
};

/**
 * Extract trends from API results
 */
const extractTrends = (apiResults: any): TrendData[] => {
  const trends: TrendData[] = [];

  // Extract trends from automation trends
  if (apiResults.automationTrends && apiResults.automationTrends.trends) {
    apiResults.automationTrends.trends.forEach((trend: AutomationTrend) => {
      if (trend.year && trend.automationPercentage) {
        trends.push({
          year: trend.year,
          value: trend.automationPercentage,
          source: trend.source
        });
      }
    });
  }

  // Extract trends from research data
  if (apiResults.researchData && apiResults.researchData.researchData) {
    apiResults.researchData.researchData.forEach((research: ResearchData) => {
      research.automationMentions.forEach(mention => {
        if (mention.year && mention.automationPercentage) {
          trends.push({
            year: mention.year,
            value: mention.automationPercentage,
            source: research.source
          });
        }
      });
    });
  }

  // Sort trends by year
  return trends.sort((a, b) => a.year - b.year);
};

/**
 * Generate insights based on API results
 */
const generateInsights = (
  occupation: OccupationData,
  result: DynamicAPOResult,
  apiResults: any
): string[] => {
  const insights: string[] = [];

  // Overall APO insight
  if (result.overallAPO > 70) {
    insights.push(`${occupation.title} has a high automation potential (${result.overallAPO.toFixed(1)}%), suggesting significant portions of this role may be automated in the future.`);
  } else if (result.overallAPO > 40) {
    insights.push(`${occupation.title} has a moderate automation potential (${result.overallAPO.toFixed(1)}%), indicating some tasks may be automated while others require human skills.`);
  } else {
    insights.push(`${occupation.title} has a low automation potential (${result.overallAPO.toFixed(1)}%), suggesting this role is relatively resistant to automation.`);
  }

  // Category insights
  const highestCategory = Object.entries(result.categoryScores)
    .reduce((highest, [category, score]) =>
      score > highest.score ? { category, score } : highest,
      { category: '', score: 0 }
    );

  const lowestCategory = Object.entries(result.categoryScores)
    .reduce((lowest, [category, score]) =>
      score < lowest.score || lowest.score === 0 ? { category, score } : lowest,
      { category: '', score: 100 }
    );

  insights.push(`The most automatable aspect is ${formatCategory(highestCategory.category)} (${highestCategory.score.toFixed(1)}%).`);
  insights.push(`The least automatable aspect is ${formatCategory(lowestCategory.category)} (${lowestCategory.score.toFixed(1)}%).`);

  // Trend insights
  if (result.trends.length > 0) {
    // Sort trends by year
    const sortedTrends = [...result.trends].sort((a, b) => a.year - b.year);

    if (sortedTrends.length > 1) {
      const oldestTrend = sortedTrends[0];
      const newestTrend = sortedTrends[sortedTrends.length - 1];
      const trendDifference = newestTrend.value - oldestTrend.value;

      if (trendDifference > 10) {
        insights.push(`Automation potential has increased significantly from ${oldestTrend.value.toFixed(1)}% in ${oldestTrend.year} to ${newestTrend.value.toFixed(1)}% in ${newestTrend.year}.`);
      } else if (trendDifference < -10) {
        insights.push(`Automation potential has decreased from ${oldestTrend.value.toFixed(1)}% in ${oldestTrend.year} to ${newestTrend.value.toFixed(1)}% in ${newestTrend.year}, suggesting increasing value of human skills in this role.`);
      } else {
        insights.push(`Automation potential has remained relatively stable from ${oldestTrend.value.toFixed(1)}% in ${oldestTrend.year} to ${newestTrend.value.toFixed(1)}% in ${newestTrend.year}.`);
      }
    }
  }

  // Research insights
  if (apiResults.researchData && apiResults.researchData.researchData) {
    const researchData = apiResults.researchData.researchData;

    // Count sentiment distribution
    const sentiments = researchData.flatMap((research: ResearchData) =>
      research.automationMentions.map(mention => mention.sentiment)
    ).filter(Boolean);

    const positiveSentiments = sentiments.filter((s: any) => s === 'positive').length;
    const negativeSentiments = sentiments.filter((s: any) => s === 'negative').length;

    if (sentiments.length > 0) {
      const sentimentRatio = positiveSentiments / sentiments.length;

      if (sentimentRatio > 0.6) {
        insights.push(`Research generally views automation in this field positively, focusing on augmentation rather than replacement.`);
      } else if (sentimentRatio < 0.4) {
        insights.push(`Research indicates concerns about automation's impact on this occupation, with emphasis on potential job displacement.`);
      } else {
        insights.push(`Research shows mixed perspectives on automation's impact on this occupation.`);
      }
    }
  }

  // Add data source insight
  if (result.dataSource === 'dynamic') {
    insights.push(`This analysis is based on real-time data from multiple sources with ${(result.dataConfidence * 100).toFixed(0)}% confidence.`);
  } else if (result.dataSource === 'hybrid') {
    insights.push(`This analysis combines real-time data with predefined models with ${(result.dataConfidence * 100).toFixed(0)}% confidence.`);
  } else {
    insights.push(`This analysis is based on predefined models with ${(result.dataConfidence * 100).toFixed(0)}% confidence. Consider enabling API access for more accurate results.`);
  }

  return insights;
};

/**
 * Calculate data confidence based on API results
 */
const calculateDataConfidence = (apiResults: any): number => {
  // Count the number of successful API results
  const successfulApis = Object.values(apiResults).filter(Boolean).length;

  // Calculate base confidence based on number of APIs
  let confidence = Math.min(0.9, successfulApis * 0.15);

  // Boost confidence if we have task analysis
  if (apiResults.taskAnalysis && apiResults.taskAnalysis.results) {
    confidence += 0.1;
  }

  // Boost confidence if we have research data
  if (apiResults.researchData && apiResults.researchData.researchData) {
    confidence += 0.1;
  }

  // Cap confidence at 0.95
  return Math.min(0.95, confidence);
};

/**
 * Format category name for insights
 */
const formatCategory = (category: string): string => {
  switch (category) {
    case 'tasks':
      return 'tasks and responsibilities';
    case 'knowledge':
      return 'knowledge requirements';
    case 'skills':
      return 'skills';
    case 'abilities':
      return 'abilities';
    case 'technologies':
      return 'technology usage';
    default:
      return category;
  }
};
