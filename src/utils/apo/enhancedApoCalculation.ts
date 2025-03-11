/**
 * Enhanced APO Calculation Utility
 * Version 1.0
 * 
 * Combines data from O*NET, SerpAPI, and JinaAPI to calculate
 * comprehensive automation potential with time-based projections.
 */

import { AutomationResearchData, ResearchPaper, IndustryReport, NewsArticle } from '../../types/research';
import { OccupationAnalysis } from '../../types/semantic';
import { APOResult, FactorBreakdown, TimeProjection, SkillsImpact, CareerRecommendation } from '../../types/apo';

// Import types from existing occupation data
interface OccupationDetails {
  id: string;
  title: string;
  description: string;
  tasks: Array<{
    id: string;
    description: string;
    importance?: number;
  }>;
  skills: Array<{
    id: string;
    name: string;
    importance?: number;
    level?: number;
    category: string; // Added category property
  }>;
  // Other occupation details...
}

/**
 * Calculate enhanced APO with multiple data sources and projections
 * @param onetData Occupation details from O*NET
 * @param serpResults Research data from SerpAPI
 * @param jinaAnalysis Semantic analysis from JinaAPI
 * @param timeHorizon Number of years for projections (default: 5)
 * @returns Comprehensive APO result
 */
export function calculateEnhancedAPO(
  onetData: OccupationDetails,
  serpResults: AutomationResearchData,
  jinaAnalysis: OccupationAnalysis,
  timeHorizon: number = 5
): APOResult {
  // 1. Calculate baseline APO from O*NET data
  const baselineAPO = calculateBaselineAPO(onetData);
  
  // 2. Extract research-based adjustments from SerpAPI results
  const researchAdjustments = extractResearchAdjustments(serpResults);
  
  // 3. Apply semantic analysis factors from JinaAPI
  const semanticFactors = extractSemanticFactors(jinaAnalysis);
  
  // 4. Calculate factor-specific scores
  const factorScores = calculateFactorScores(
    onetData,
    researchAdjustments,
    semanticFactors
  );
  
  // 5. Generate time-based projections
  const timeProjections = generateTimeProjections(
    baselineAPO,
    factorScores,
    timeHorizon
  );
  
  // 6. Calculate confidence intervals
  const confidenceMetrics = calculateConfidenceMetrics(
    baselineAPO,
    researchAdjustments,
    semanticFactors
  );
  
  // 7. Generate skill impact assessment
  const skillsImpact = assessSkillsImpact(
    onetData.skills,
    jinaAnalysis.skillRankings
  );
  
  // 8. Create career recommendations
  const recommendations = generateRecommendations(
    factorScores,
    timeProjections,
    skillsImpact
  );
  
  // 9. Return comprehensive APO result
  return {
    occupationId: onetData.id,
    occupationTitle: onetData.title,
    overallScore: weightedAverage(factorScores),
    confidence: confidenceMetrics.overall,
    timeProjections,
    factorBreakdown: factorScores,
    skillsImpact,
    recommendations,
    taskAnalysis: {
      highRiskTasks: onetData.tasks
        .filter(task => calculateTaskAutomationPotential(task, jinaAnalysis) > 0.7)
        .map(task => ({
          id: task.id,
          description: task.description,
          automationPotential: calculateTaskAutomationPotential(task, jinaAnalysis),
          reason: getTaskAutomationReason(task, jinaAnalysis, 'high'),
          timeframe: 'Short-term'
        })),
      moderateRiskTasks: onetData.tasks
        .filter(task => {
          const score = calculateTaskAutomationPotential(task, jinaAnalysis);
          return score >= 0.3 && score <= 0.7;
        })
        .map(task => ({
          id: task.id,
          description: task.description,
          automationPotential: calculateTaskAutomationPotential(task, jinaAnalysis),
          reason: getTaskAutomationReason(task, jinaAnalysis, 'moderate'),
          timeframe: 'Medium-term'
        })),
      lowRiskTasks: onetData.tasks
        .filter(task => calculateTaskAutomationPotential(task, jinaAnalysis) < 0.3)
        .map(task => ({
          id: task.id,
          description: task.description,
          automationPotential: calculateTaskAutomationPotential(task, jinaAnalysis),
          reason: getTaskAutomationReason(task, jinaAnalysis, 'low'),
          timeframe: 'Long-term'
        })),
      overallTaskAutomationScore: calculateOverallTaskAutomationScore(onetData.tasks, jinaAnalysis)
    },
    dataSourceInfo: {
      onetDataDate: new Date().toISOString(),
      researchDataDate: serpResults.lastUpdated,
      semanticAnalysisDate: jinaAnalysis.lastUpdated
    }
  };
}

/**
 * Calculate baseline APO from O*NET data
 */
function calculateBaselineAPO(onetData: OccupationDetails): number {
  // Extract task and skill information from O*NET data
  const tasks = onetData.tasks || [];
  const skills = onetData.skills || [];
  
  // Calculate task-based automation score
  const taskScore = tasks.reduce((score, task) => {
    // Higher importance tasks have more weight
    const importance = task.importance || 0.5;
    
    // Analyze task description for automation indicators
    const automationIndicators = [
      'routine', 'repetitive', 'standard', 'basic', 'simple',
      'data entry', 'data processing', 'calculation', 'sorting',
      'filing', 'monitoring', 'scanning', 'tracking'
    ];
    
    const complexityIndicators = [
      'complex', 'creative', 'innovative', 'judgment', 'decision',
      'negotiate', 'persuade', 'emotional', 'interpersonal', 'leadership',
      'strategic', 'novel', 'unpredictable', 'adapt', 'customize'
    ];
    
    // Calculate automation likelihood based on task description
    let automationLikelihood = 0.5; // Default middle value
    
    // Check for automation indicators (increases likelihood)
    automationIndicators.forEach(indicator => {
      if (task.description.toLowerCase().includes(indicator)) {
        automationLikelihood += 0.05; // Increase by 5% per indicator
      }
    });
    
    // Check for complexity indicators (decreases likelihood)
    complexityIndicators.forEach(indicator => {
      if (task.description.toLowerCase().includes(indicator)) {
        automationLikelihood -= 0.05; // Decrease by 5% per indicator
      }
    });
    
    // Ensure the score stays within 0-1 range
    automationLikelihood = Math.min(1, Math.max(0, automationLikelihood));
    
    // Weight by importance
    return score + (automationLikelihood * importance);
  }, 0) / Math.max(1, tasks.length);
  
  // Calculate skill-based automation resistance
  const skillScore = skills.reduce((score, skill) => {
    // Higher importance and level skills have more weight
    const importance = skill.importance || 0.5;
    const level = skill.level || 0.5;
    
    // Categorize skills by automation resistance
    const highResistanceSkills = [
      'critical thinking', 'problem solving', 'creativity', 'innovation',
      'emotional intelligence', 'leadership', 'negotiation', 'persuasion'
    ];
    
    const mediumResistanceSkills = [
      'communication', 'teamwork', 'collaboration', 'adaptability',
      'project management', 'decision making', 'research', 'analysis'
    ];
    
    const lowResistanceSkills = [
      'data entry', 'calculation', 'documentation', 'record keeping',
      'monitoring', 'basic', 'routine', 'standard'
    ];
    
    // Calculate resistance score based on skill name
    let resistanceScore = 0.5; // Default middle value
    
    // Check for high resistance skills
    if (highResistanceSkills.some(s => skill.name.toLowerCase().includes(s))) {
      resistanceScore = 0.8;
    } 
    // Check for medium resistance skills
    else if (mediumResistanceSkills.some(s => skill.name.toLowerCase().includes(s))) {
      resistanceScore = 0.5;
    } 
    // Check for low resistance skills
    else if (lowResistanceSkills.some(s => skill.name.toLowerCase().includes(s))) {
      resistanceScore = 0.2;
    }
    
    // Weight by importance and level
    return score + (resistanceScore * importance * level);
  }, 0) / Math.max(1, skills.length);
  
  // Combine task and skill scores (inverse skill score as higher skill resistance means lower automation)
  return (taskScore * 0.6) + ((1 - skillScore) * 0.4);
}

/**
 * Extract research-based adjustments from SerpAPI results
 */
function extractResearchAdjustments(serpResults: AutomationResearchData): any {
  // Extract key metrics from research data
  const { trends, researchPapers, industryReports, newsArticles, overallScore, confidenceLevel } = serpResults;
  
  // Process research papers for insights
  const paperInsights = researchPapers?.map(paper => ({
    title: paper.title,
    year: paper.publicationYear,
    automationScore: paper.automationScore || 0.5,
    relevance: paper.relevanceScore,
    keyFindings: paper.keyInsights
  }));
  
  // Process industry reports for insights
  const reportInsights = industryReports.map(report => ({
    title: report.title,
    year: report.year,
    automationScore: report.automationScore || 0.5,
    relevance: report.relevanceScore,
    keyInsights: report.keyInsights
  }));
  
  // Process news articles for insights
  const newsInsights = newsArticles.map(article => ({
    title: article.title,
    date: article.date,
    automationScore: article.automationScore || 0.5,
    relevance: article.relevanceScore,
    sentiment: article.keyInsights.length > 0 ? analyzeArticleSentiment(article.keyInsights) : 'neutral'
  }));
  
  // Calculate recency-weighted research consensus
  const currentYear = new Date().getFullYear();
  
  // Weight papers by recency and relevance
  const weightedPaperScores = researchPapers?.map(paper => {
    const recencyWeight = Math.max(0, 1 - (currentYear - paper.publicationYear) / 10); // Papers up to 10 years old
    return (paper.automationScore || 0.5) * paper.relevanceScore * recencyWeight;
  });
  
  const paperConsensus = weightedPaperScores?.length > 0 
    ? weightedPaperScores.reduce((sum, score) => sum + score, 0) / weightedPaperScores.length 
    : 0.5;
  
  // Extract industry adoption rates from reports
  const adoptionRates = industryReports.reduce((rates, report) => {
    // Extract adoption percentages from key insights
    const adoptionInsights = report.keyInsights.filter(insight => 
      insight.toLowerCase().includes('adoption') || 
      insight.toLowerCase().includes('implement') ||
      insight.toLowerCase().includes('deploy')
    );
    
    // If adoption insights found, estimate rate
    if (adoptionInsights.length > 0) {
      rates.push({
        year: report.year,
        rate: report.automationScore || 0.5,
        source: report.publisher
      });
    }
    
    return rates;
  }, [] as Array<{year: number, rate: number, source: string}>);
  
  // Extract emerging technology mentions from all sources
  const emergingTechMentions = [...researchPapers, ...industryReports, ...newsArticles].reduce((techs, source) => {
    // Create a combined content string based on available properties
    let content = source.title;
    
    // Add summary if available (only for industry reports and news articles)
    if ('summary' in source && source.summary) {
      content += ' ' + source.summary;
    }
    
    // Add insights (all types have keyInsights)
    content += ' ' + source.keyInsights.join(' ');
    
    const techKeywords = [
      'artificial intelligence', 'machine learning', 'deep learning',
      'neural network', 'natural language processing', 'computer vision',
      'robotics', 'automation', 'autonomous', 'generative ai',
      'large language model', 'llm', 'gpt', 'transformer'
    ];
    
    techKeywords.forEach(tech => {
      if (content.toLowerCase().includes(tech)) {
        if (!techs[tech]) {
          techs[tech] = 0;
        }
        techs[tech]++;
      }
    });
    
    return techs;
  }, {} as Record<string, number>);
  
  // Sort emerging technologies by mention frequency
  const sortedTechs = Object.entries(emergingTechMentions)
    .sort((a, b) => b[1] - a[1])
    .map(([tech, count]) => ({ tech, count }));
  
  return {
    // Research consensus with confidence
    researchConsensus: {
      overall: overallScore,
      paperConsensus,
      confidence: confidenceLevel
    },
    
    // Industry trends with impact scores
    industryTrends: trends.map(trend => ({
      name: trend.trendName,
      impact: trend.impactScore,
      timeframe: trend.timeframe,
      sources: trend.sources
    })),
    
    // Adoption metrics
    adoption: {
      rates: adoptionRates,
      average: adoptionRates.length > 0 
        ? adoptionRates.reduce((sum, item) => sum + (item.rate || 0.5), 0) / adoptionRates.length 
        : 0.5
    },
    
    // Emerging technologies
    emergingTech: sortedTechs.slice(0, 5), // Top 5 technologies
    
    // Source insights
    sources: {
      papers: paperInsights,
      reports: reportInsights,
      news: newsInsights
    },
    
    // Regional impact data
    regionalImpact: serpResults.regionalImpact
  };
}

/**
 * Analyze article sentiment based on key insights
 */
function analyzeArticleSentiment(insights: string[]): string {
  const positiveTerms = ['increase', 'growth', 'improve', 'advance', 'opportunity', 'benefit', 'enhance'];
  const negativeTerms = ['decrease', 'decline', 'threat', 'risk', 'replace', 'eliminate', 'displace'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  // Count positive and negative terms in insights
  insights.forEach(insight => {
    const lowerInsight = insight.toLowerCase();
    
    positiveTerms.forEach(term => {
      if (lowerInsight.includes(term)) positiveCount++;
    });
    
    negativeTerms.forEach(term => {
      if (lowerInsight.includes(term)) negativeCount++;
    });
  });
  
  // Determine sentiment based on counts
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

/**
 * Extract semantic factors from JinaAPI analysis
 */
function extractSemanticFactors(jinaAnalysis: OccupationAnalysis): any {
  // Extract key metrics from semantic analysis
  const { 
    overallAutomationScore, 
    confidenceScore,
    taskRankings,
    skillRankings,
    keyAutomationDrivers,
    keyAutomationBarriers,
    recommendedSkillDevelopment
  } = jinaAnalysis;
  
  // Calculate task complexity distribution
  const taskComplexityDistribution = taskRankings.reduce((dist, task) => {
    if (task.automationScore < 0.3) {
      dist.complex++;
    } else if (task.automationScore < 0.7) {
      dist.mixed++;
    } else {
      dist.routine++;
    }
    return dist;
  }, { complex: 0, mixed: 0, routine: 0 });
  
  // Calculate skill automation vulnerability
  const skillVulnerability = skillRankings.reduce((vuln, skill) => {
    if (skill.automationScore < 0.3) {
      vuln.low++;
    } else if (skill.automationScore < 0.7) {
      vuln.medium++;
    } else {
      vuln.high++;
    }
    return vuln;
  }, { low: 0, medium: 0, high: 0 });
  
  // Calculate time horizon distribution
  const timeHorizonDistribution = [...taskRankings, ...skillRankings].reduce((dist, item) => {
    const horizon = item.timeHorizon || 10; // Default to 10 years if not specified
    
    if (horizon <= 2) {
      dist.immediate++;
    } else if (horizon <= 5) {
      dist.shortTerm++;
    } else if (horizon <= 10) {
      dist.mediumTerm++;
    } else {
      dist.longTerm++;
    }
    
    return dist;
  }, { immediate: 0, shortTerm: 0, mediumTerm: 0, longTerm: 0 });
  
  // Calculate human-AI collaboration potential
  const collaborationPotential = skillRankings.reduce((potential, skill) => {
    // Skills with medium automation scores have highest collaboration potential
    const collaborationScore = 1 - Math.abs(skill.automationScore - 0.5) * 2;
    return potential + collaborationScore;
  }, 0) / Math.max(1, skillRankings.length);
  
  return {
    // Task automation metrics
    taskAutomation: {
      average: overallAutomationScore,
      confidence: confidenceScore,
      distribution: taskComplexityDistribution
    },
    
    // Skill vulnerability metrics
    skillVulnerability: {
      distribution: skillVulnerability,
      mostVulnerable: skillRankings
        .filter(skill => skill.automationScore > 0.7)
        .sort((a, b) => b.automationScore - a.automationScore)
        .slice(0, 3)
        .map(skill => skill.skillId),
      leastVulnerable: skillRankings
        .filter(skill => skill.automationScore < 0.3)
        .sort((a, b) => a.automationScore - b.automationScore)
        .slice(0, 3)
        .map(skill => skill.skillId)
    },
    
    // Time horizon metrics
    timeHorizon: {
      distribution: timeHorizonDistribution,
      average: [...taskRankings, ...skillRankings].reduce((sum, item) => sum + (item.timeHorizon || 10), 0) / 
               Math.max(1, taskRankings.length + skillRankings.length)
    },
    
    // Automation drivers and barriers
    drivers: keyAutomationDrivers,
    barriers: keyAutomationBarriers,
    
    // Human-AI collaboration potential
    collaborationPotential,
    
    // Skill development recommendations
    recommendations: recommendedSkillDevelopment
  };
}

/**
 * Calculate factor-specific scores
 */
function calculateFactorScores(
  onetData: OccupationDetails,
  researchAdjustments: any,
  semanticFactors: any
): FactorBreakdown {
  // Calculate scores for each factor that contributes to APO
  
  // Task complexity impact
  const taskComplexity = calculateTaskComplexityImpact(
    onetData,
    semanticFactors
  );
  
  // Collaboration requirements impact
  const collaborationRequirements = calculateCollaborationImpact(
    onetData,
    semanticFactors
  );
  
  // Industry adoption impact
  const industryAdoption = calculateIndustryAdoptionImpact(
    researchAdjustments
  );
  
  // Emerging technology impact
  const emergingTechImpact = calculateEmergingTechImpact(
    researchAdjustments,
    semanticFactors
  );
  
  // Regional factors
  const regionalFactors = calculateRegionalFactors(onetData.id, researchAdjustments);
  
  return {
    taskComplexity,
    collaborationRequirements,
    industryAdoption,
    emergingTechImpact,
    regionalFactors: {
      highIncome: regionalFactors.aggregateImpact,
      middleIncome: regionalFactors.regions.find(r => r.name === 'Asia Pacific')?.overallImpact || 0.5,
      lowIncome: regionalFactors.regions.find(r => r.name === 'Latin America')?.overallImpact || 0.3
    }
  };
}

/**
 * Calculate task complexity impact
 */
function calculateTaskComplexityImpact(
  onetData: OccupationDetails,
  semanticFactors: any
): number {
  // Calculate impact of task complexity on automation potential
  
  // Use task complexity distribution from semantic analysis
  const { complex, mixed, routine } = semanticFactors.taskAutomation.distribution;
  
  // Assign weights to each complexity level
  const weights = {
    complex: 0.2,
    mixed: 0.5,
    routine: 0.8
  };
  
  // Calculate weighted sum
  const weightedSum = (complex * weights.complex) + (mixed * weights.mixed) + (routine * weights.routine);
  
  // Normalize to 0-1 range
  return weightedSum / (complex + mixed + routine);
}

/**
 * Calculate collaboration impact
 */
function calculateCollaborationImpact(
  onetData: OccupationDetails,
  semanticFactors: any
): number {
  // Calculate impact of collaboration requirements on automation potential
  
  // Use collaboration potential from semantic analysis
  const collaborationPotential = semanticFactors.collaborationPotential;
  
  // Assign weights to collaboration potential
  const weights = {
    low: 0.8,
    medium: 0.5,
    high: 0.2
  };
  
  // Calculate weighted sum
  const weightedSum = collaborationPotential * weights.low + (1 - collaborationPotential) * weights.high;
  
  // Normalize to 0-1 range
  return weightedSum;
}

/**
 * Calculate industry adoption impact
 */
function calculateIndustryAdoptionImpact(
  researchAdjustments: any
): number {
  // Calculate impact of industry technology adoption on automation potential
  
  // Use adoption rates from research adjustments
  const adoptionRates = researchAdjustments.adoption.rates;
  
  // Assign weights to adoption rates
  const weights = {
    low: 0.8,
    medium: 0.5,
    high: 0.2
  };
  
  // Calculate weighted sum
  const weightedSum = adoptionRates.reduce((sum: number, rate: {year: number, rate: number, source: string}) => sum + (rate.rate || 0.5), 0);
  
  // Normalize to 0-1 range
  return weightedSum / adoptionRates.length;
}

/**
 * Calculate emerging technology impact
 */
function calculateEmergingTechImpact(
  researchAdjustments: any,
  semanticFactors: any
): number {
  // Calculate impact of emerging technologies on automation potential
  
  // Use emerging technology mentions from research adjustments
  const emergingTechMentions = researchAdjustments.emergingTech;
  
  // Assign weights to emerging technology mentions
  const weights = {
    low: 0.8,
    medium: 0.5,
    high: 0.2
  };
  
  // Calculate weighted sum
  const weightedSum = emergingTechMentions.reduce((sum: number, mention: {tech: string, count: number}) => sum + mention.count, 0);
  
  // Normalize to 0-1 range
  return weightedSum / emergingTechMentions.length;
}

/**
 * Calculate regional factors that affect automation potential
 * @param occupationId The occupation ID
 * @param researchData Research data containing regional insights
 * @returns Regional impact factors
 */
function calculateRegionalFactors(
  occupationId: string,
  researchData: AutomationResearchData
): {
  regions: Array<{
    name: string;
    adoptionRate: number;
    laborMarketImpact: number;
    policyEnvironment: number;
    overallImpact: number;
  }>;
  aggregateImpact: number;
} {
  // Extract regional insights from research data
  const regionalInsights = extractRegionalInsights(researchData);
  
  // Define default regions to analyze
  const defaultRegions = [
    'North America',
    'Europe',
    'Asia Pacific',
    'Latin America'
  ];
  
  // Generate regional impact data
  const regions = defaultRegions.map(regionName => {
    // Find insights specific to this region
    const regionInsights = regionalInsights.filter(
      insight => (insight.region === regionName || insight.region === 'Global') &&
                 (insight.category === 'adoption' || insight.category === 'general')
    );
    
    // Calculate technology adoption rate for the region
    const adoptionRate = calculateRegionalAdoptionRate(regionName, regionInsights);
    
    // Calculate labor market impact for the region
    const laborMarketImpact = calculateLaborMarketImpact(regionName, regionInsights);
    
    // Calculate policy environment impact for the region
    const policyEnvironment = calculatePolicyEnvironment(regionName, regionInsights);
    
    // Calculate overall impact as weighted average
    const overallImpact = (
      (adoptionRate * 0.4) +
      (laborMarketImpact * 0.3) +
      (policyEnvironment * 0.3)
    );
    
    return {
      name: regionName,
      adoptionRate,
      laborMarketImpact,
      policyEnvironment,
      overallImpact
    };
  });
  
  // Calculate aggregate impact across all regions (weighted by economic significance)
  const regionWeights = {
    'North America': 0.35,
    'Europe': 0.25,
    'Asia Pacific': 0.3,
    'Latin America': 0.1
  };
  
  const aggregateImpact = regions.reduce((sum, region) => {
    const weight = regionWeights[region.name as keyof typeof regionWeights] || 0.25;
    return sum + (region.overallImpact * weight);
  }, 0);
  
  return {
    regions,
    aggregateImpact
  };
}

/**
 * Extract regional insights from research data
 * @param researchData Research data containing regional insights
 * @returns Array of regional insights
 */
function extractRegionalInsights(researchData: AutomationResearchData): Array<{
  region: string;
  insight: string;
  source: string;
  confidence: number;
  category: 'adoption' | 'labor' | 'policy' | 'general';
}> {
  const insights: Array<{
    region: string;
    insight: string;
    source: string;
    confidence: number;
    category: 'adoption' | 'labor' | 'policy' | 'general';
  }> = [];
  
  // Extract insights from scholarly papers
  researchData.researchPapers?.forEach((paper: ResearchPaper) => {
    if (paper.abstract && paper.abstract.toLowerCase().includes('region')) {
      // Determine which region the paper is about
      const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America'];
      let paperRegion = 'Global';
      
      for (const region of regions) {
        if (paper.abstract.includes(region) || paper.title.includes(region)) {
          paperRegion = region;
          break;
        }
      }
      
      // Determine the category of insight
      let category: 'adoption' | 'labor' | 'policy' | 'general' = 'general';
      if (paper.abstract.toLowerCase().includes('adoption') || 
          paper.abstract.toLowerCase().includes('technology')) {
        category = 'adoption';
      } else if (paper.abstract.toLowerCase().includes('labor') || 
                paper.abstract.toLowerCase().includes('employment')) {
        category = 'labor';
      } else if (paper.abstract.toLowerCase().includes('policy') || 
                paper.abstract.toLowerCase().includes('regulation')) {
        category = 'policy';
      }
      
      insights.push({
        region: paperRegion,
        insight: paper.abstract.substring(0, 200) + '...',
        source: 'scholarly',
        confidence: 0.8,
        category
      });
    }
  });
  
  // Extract insights from industry reports
  researchData.industryReports.forEach((report: IndustryReport) => {
    if (report.summary && report.summary.toLowerCase().includes('region')) {
      // Determine which region the report is about
      const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America'];
      let reportRegion = 'Global';
      
      for (const region of regions) {
        if (report.summary.includes(region) || report.title.includes(region)) {
          reportRegion = region;
          break;
        }
      }
      
      // Determine the category of insight
      let category: 'adoption' | 'labor' | 'policy' | 'general' = 'general';
      if (report.summary.toLowerCase().includes('adoption') || 
          report.summary.toLowerCase().includes('technology')) {
        category = 'adoption';
      } else if (report.summary.toLowerCase().includes('labor') || 
                report.summary.toLowerCase().includes('employment')) {
        category = 'labor';
      } else if (report.summary.toLowerCase().includes('policy') || 
                report.summary.toLowerCase().includes('regulation')) {
        category = 'policy';
      }
      
      insights.push({
        region: reportRegion,
        insight: report.summary.substring(0, 200) + '...',
        source: 'industry',
        confidence: 0.7,
        category
      });
    }
  });
  
  // If no insights were found, add default insights
  if (insights.length === 0) {
    insights.push(
      {
        region: 'North America',
        insight: 'High technology adoption rates with supportive regulatory environment',
        source: 'default',
        confidence: 0.5,
        category: 'adoption'
      },
      {
        region: 'Europe',
        insight: 'Moderate technology adoption with strong labor protections',
        source: 'default',
        confidence: 0.5,
        category: 'policy'
      },
      {
        region: 'Asia Pacific',
        insight: 'Rapid technology adoption with varying labor market impacts',
        source: 'default',
        confidence: 0.5,
        category: 'labor'
      },
      {
        region: 'Latin America',
        insight: 'Emerging technology adoption with developing policy frameworks',
        source: 'default',
        confidence: 0.5,
        category: 'general'
      }
    );
  }
  
  return insights;
}

/**
 * Calculate technology adoption rate for a region
 * @param region Region name
 * @param insights Regional insights
 * @returns Adoption rate score (0-1)
 */
function calculateRegionalAdoptionRate(
  region: string,
  insights: Array<{
    region: string;
    insight: string;
    source: string;
    confidence: number;
    category: 'adoption' | 'labor' | 'policy' | 'general';
  }>
): number {
  // Filter insights related to technology adoption for this region
  const adoptionInsights = insights.filter(
    insight => (insight.region === region || insight.region === 'Global') &&
               (insight.category === 'adoption' || insight.category === 'general')
  );
  
  if (adoptionInsights.length === 0) {
    // Default adoption rates if no insights available
    const defaultRates: Record<string, number> = {
      'North America': 0.75,
      'Europe': 0.65,
      'Asia Pacific': 0.70,
      'Latin America': 0.50
    };
    return defaultRates[region] || 0.60;
  }
  
  // Calculate adoption rate based on insights
  // Higher confidence insights have more weight
  const totalWeight = adoptionInsights.reduce((sum, insight) => sum + insight.confidence, 0);
  const weightedSum = adoptionInsights.reduce((sum, insight) => {
    // Analyze the insight text for adoption indicators
    const text = insight.insight.toLowerCase();
    let baseScore = 0.5; // Neutral starting point
    
    if (text.includes('high') || text.includes('rapid') || text.includes('advanced')) {
      baseScore = 0.8;
    } else if (text.includes('moderate') || text.includes('average')) {
      baseScore = 0.6;
    } else if (text.includes('low') || text.includes('slow') || text.includes('limited')) {
      baseScore = 0.4;
    }
    
    return sum + (baseScore * insight.confidence);
  }, 0);
  
  return totalWeight > 0 ? weightedSum / totalWeight : 0.6;
}

/**
 * Calculate labor market impact for a region
 * @param region Region name
 * @param insights Regional insights
 * @returns Labor market impact score (0-1)
 */
function calculateLaborMarketImpact(
  region: string,
  insights: Array<{
    region: string;
    insight: string;
    source: string;
    confidence: number;
    category: 'adoption' | 'labor' | 'policy' | 'general';
  }>
): number {
  // Filter insights related to labor markets for this region
  const laborInsights = insights.filter(
    insight => (insight.region === region || insight.region === 'Global') &&
               (insight.category === 'labor' || insight.category === 'general')
  );
  
  if (laborInsights.length === 0) {
    // Default labor market impact if no insights available
    const defaultImpacts: Record<string, number> = {
      'North America': 0.65,
      'Europe': 0.55,
      'Asia Pacific': 0.70,
      'Latin America': 0.60
    };
    return defaultImpacts[region] || 0.60;
  }
  
  // Calculate labor market impact based on insights
  const totalWeight = laborInsights.reduce((sum, insight) => sum + insight.confidence, 0);
  const weightedSum = laborInsights.reduce((sum, insight) => {
    // Analyze the insight text for labor market indicators
    const text = insight.insight.toLowerCase();
    let baseScore = 0.5; // Neutral starting point
    
    if (text.includes('disruption') || text.includes('displacement') || text.includes('job loss')) {
      baseScore = 0.8;
    } else if (text.includes('adaptation') || text.includes('transition')) {
      baseScore = 0.6;
    } else if (text.includes('creation') || text.includes('opportunity') || text.includes('growth')) {
      baseScore = 0.4;
    }
    
    return sum + (baseScore * insight.confidence);
  }, 0);
  
  return totalWeight > 0 ? weightedSum / totalWeight : 0.6;
}

/**
 * Calculate policy environment impact for a region
 * @param region Region name
 * @param insights Regional insights
 * @returns Policy environment score (0-1)
 */
function calculatePolicyEnvironment(
  region: string,
  insights: Array<{
    region: string;
    insight: string;
    source: string;
    confidence: number;
    category: 'adoption' | 'labor' | 'policy' | 'general';
  }>
): number {
  // Filter insights related to policy for this region
  const policyInsights = insights.filter(
    insight => (insight.region === region || insight.region === 'Global') &&
               (insight.category === 'policy' || insight.category === 'general')
  );
  
  if (policyInsights.length === 0) {
    // Default policy environment if no insights available
    const defaultPolicies: Record<string, number> = {
      'North America': 0.60,
      'Europe': 0.70,
      'Asia Pacific': 0.55,
      'Latin America': 0.45
    };
    return defaultPolicies[region] || 0.55;
  }
  
  // Calculate policy environment impact based on insights
  const totalWeight = policyInsights.reduce((sum, insight) => sum + insight.confidence, 0);
  const weightedSum = policyInsights.reduce((sum, insight) => {
    // Analyze the insight text for policy indicators
    const text = insight.insight.toLowerCase();
    let baseScore = 0.5; // Neutral starting point
    
    if (text.includes('restrictive') || text.includes('regulation') || text.includes('protection')) {
      baseScore = 0.3; // Lower score means policy slows automation
    } else if (text.includes('balanced') || text.includes('framework')) {
      baseScore = 0.5;
    } else if (text.includes('supportive') || text.includes('incentive') || text.includes('promote')) {
      baseScore = 0.7; // Higher score means policy accelerates automation
    }
    
    return sum + (baseScore * insight.confidence);
  }, 0);
  
  return totalWeight > 0 ? weightedSum / totalWeight : 0.55;
}

/**
 * Generate time-based projections
 */
function generateTimeProjections(
  baselineAPO: number,
  factorScores: FactorBreakdown,
  timeHorizon: number
): TimeProjection[] {
  // Generate projections for each year in the time horizon
  
  const projections: TimeProjection[] = [];
  
  // Current year
  const currentYear = new Date().getFullYear();
  
  // Calculate growth rate based on factor scores
  const growthRate = calculateGrowthRate(factorScores);
  
  // Generate projection for each year
  for (let i = 1; i <= timeHorizon; i++) {
    const year = currentYear + i;
    
    // Apply compound growth to baseline APO
    // Using a sigmoid function to model S-curve adoption
    const timeProgress = i / timeHorizon;
    const sigmoid = 1 / (1 + Math.exp(-12 * (timeProgress - 0.5)));
    
    // Calculate projected score
    const score = baselineAPO + (growthRate * sigmoid);
    
    // Cap between 0 and 1
    const cappedScore = Math.max(0, Math.min(1, score));
    
    // Calculate confidence (decreases with time)
    const confidence = 0.9 - (i * 0.05);
    
    // Determine key drivers for this time period
    const keyDrivers = determineKeyDrivers(factorScores, i);
    
    projections.push({
      year,
      score: cappedScore,
      confidence,
      keyDrivers
    });
  }
  
  return projections;
}

/**
 * Calculate growth rate based on factor scores
 */
function calculateGrowthRate(factorScores: FactorBreakdown): number {
  // Calculate growth rate based on factor scores
  
  // Define weights for each factor
  const weights = {
    taskComplexity: 0.3,
    collaborationRequirements: 0.2,
    industryAdoption: 0.25,
    emergingTechImpact: 0.25
    // Regional factors are applied separately
  };
  
  // Calculate weighted sum
  let weightedSum = 0;
  let totalWeight = 0;
  
  weightedSum += factorScores.taskComplexity * weights.taskComplexity;
  totalWeight += weights.taskComplexity;
  
  weightedSum += factorScores.collaborationRequirements * weights.collaborationRequirements;
  totalWeight += weights.collaborationRequirements;
  
  weightedSum += factorScores.industryAdoption * weights.industryAdoption;
  totalWeight += weights.industryAdoption;
  
  weightedSum += factorScores.emergingTechImpact * weights.emergingTechImpact;
  totalWeight += weights.emergingTechImpact;
  
  // Return weighted average
  return weightedSum / totalWeight;
}

/**
 * Determine key drivers for a specific time period
 */
function determineKeyDrivers(factorScores: FactorBreakdown, timeIndex: number): string[] {
  // Determine key drivers for this time period
  
  // Placeholder implementation
  if (timeIndex <= 2) {
    return ['Industry Adoption', 'Task Automation'];
  } else {
    return ['Emerging Technologies', 'Regional Adoption'];
  }
}

/**
 * Calculate confidence metrics
 */
function calculateConfidenceMetrics(
  baselineAPO: number,
  researchAdjustments: any,
  semanticFactors: any
): any {
  // Calculate confidence metrics for the APO calculation
  
  // Placeholder implementation
  return {
    overall: 0.8,
    byFactor: {
      baseline: 0.9,
      research: researchAdjustments.confidenceLevel,
      semantic: semanticFactors.taskAutomation.confidence
    }
  };
}

/**
 * Assess impact on skills
 */
function assessSkillsImpact(
  skills: Array<{id: string; name: string; importance?: number; level?: number; category: string}>,
  skillRankings: any[]
): SkillsImpact {
  // Assess impact of automation on skills
  
  // Placeholder implementation - in a real system, this would match
  // skills from O*NET with the rankings from JinaAPI
  
  return {
    highRisk: [
      { id: 'skill1', name: 'Data Entry', type: 'hard', description: 'Entering data into systems', category: 'Administrative' }
    ],
    moderateRisk: [
      { id: 'skill2', name: 'Basic Analysis', type: 'hard', description: 'Analyzing basic data patterns', category: 'Analytical' }
    ],
    lowRisk: [
      { id: 'skill3', name: 'Critical Thinking', type: 'soft', description: 'Using logic to solve problems', category: 'Cognitive' }
    ],
    emergingSkills: [
      { id: 'skill4', name: 'AI Collaboration', type: 'hard', description: 'Working effectively with AI systems', category: 'Technical' }
    ]
  };
}

/**
 * Generate career recommendations
 */
function generateRecommendations(
  factorScores: FactorBreakdown,
  timeProjections: TimeProjection[],
  skillsImpact: SkillsImpact
): CareerRecommendation[] {
  // Generate career recommendations based on APO analysis
  
  // Placeholder implementation
  return [
    {
      type: 'skill_development',
      title: 'Develop AI Collaboration Skills',
      description: 'Focus on developing skills to work alongside AI systems',
      timeframe: 'Short-term',
      impact: 'High'
    },
    {
      type: 'career_pivot',
      title: 'Consider Related Roles with Lower Automation Risk',
      description: 'Explore roles that leverage your experience but have lower automation potential',
      timeframe: 'Medium-term',
      impact: 'Medium'
    }
  ];
}

/**
 * Calculate weighted average of factor scores
 */
function weightedAverage(factorScores: FactorBreakdown): number {
  // Calculate weighted average of factor scores
  
  // Define weights for each factor
  const weights = {
    taskComplexity: 0.3,
    collaborationRequirements: 0.2,
    industryAdoption: 0.25,
    emergingTechImpact: 0.25
    // Regional factors are applied separately
  };
  
  // Calculate weighted sum
  let weightedSum = 0;
  let totalWeight = 0;
  
  weightedSum += factorScores.taskComplexity * weights.taskComplexity;
  totalWeight += weights.taskComplexity;
  
  weightedSum += factorScores.collaborationRequirements * weights.collaborationRequirements;
  totalWeight += weights.collaborationRequirements;
  
  weightedSum += factorScores.industryAdoption * weights.industryAdoption;
  totalWeight += weights.industryAdoption;
  
  weightedSum += factorScores.emergingTechImpact * weights.emergingTechImpact;
  totalWeight += weights.emergingTechImpact;
  
  // Return weighted average
  return weightedSum / totalWeight;
}

/**
 * Calculate the automation potential of a task based on its characteristics and semantic analysis
 * @param task The task to analyze
 * @param jinaAnalysis The semantic analysis from Jina API
 * @returns A score between 0 and 1 representing the automation potential
 */
function calculateTaskAutomationPotential(task: any, jinaAnalysis: any): number {
  // In a real implementation, this would use the semantic analysis to determine
  // the automation potential of the task based on its characteristics
  
  // Check if the task is mentioned in the jinaAnalysis
  const taskAnalysis = jinaAnalysis.tasks?.find((t: any) => 
    t.description.toLowerCase().includes(task.description.toLowerCase())
  );
  
  if (taskAnalysis && taskAnalysis.automationPotential !== undefined) {
    return taskAnalysis.automationPotential;
  }
  
  // If no specific analysis is available, calculate based on task characteristics
  // This is a simplified implementation
  const repetitiveKeywords = ['routine', 'repetitive', 'standard', 'regular', 'consistent', 'systematic'];
  const complexKeywords = ['complex', 'analyze', 'evaluate', 'interpret', 'judgment', 'creative'];
  
  let score = 0.5; // Default moderate score
  
  // Check for repetitive keywords (increase automation potential)
  repetitiveKeywords.forEach(keyword => {
    if (task.description.toLowerCase().includes(keyword)) {
      score += 0.1;
    }
  });
  
  // Check for complex keywords (decrease automation potential)
  complexKeywords.forEach(keyword => {
    if (task.description.toLowerCase().includes(keyword)) {
      score -= 0.1;
    }
  });
  
  // Ensure score is within 0-1 range
  return Math.max(0, Math.min(1, score));
}

/**
 * Get a reason for the automation potential of a task
 * @param task The task to analyze
 * @param jinaAnalysis The semantic analysis from Jina API
 * @param riskLevel The risk level (high, moderate, low)
 * @returns A string explaining the reason for the automation potential
 */
function getTaskAutomationReason(task: any, jinaAnalysis: any, riskLevel: string): string {
  // In a real implementation, this would provide a detailed reason based on the
  // semantic analysis and task characteristics
  
  const taskAnalysis = jinaAnalysis.tasks?.find((t: any) => 
    t.description.toLowerCase().includes(task.description.toLowerCase())
  );
  
  if (taskAnalysis && taskAnalysis.reason) {
    return taskAnalysis.reason;
  }
  
  // Default reasons based on risk level
  switch (riskLevel) {
    case 'high':
      return 'repetitive nature and standardized processes';
    case 'moderate':
      return 'mix of routine and complex elements';
    case 'low':
      return 'high cognitive requirements and human judgment needed';
    default:
      return 'various factors affecting automation potential';
  }
}

/**
 * Calculate the overall automation score for a set of tasks
 * @param tasks The tasks to analyze
 * @param jinaAnalysis The semantic analysis from Jina API
 * @returns A score between 0 and 1 representing the overall automation potential
 */
function calculateOverallTaskAutomationScore(tasks: any[], jinaAnalysis: any): number {
  if (!tasks || tasks.length === 0) {
    return 0.5; // Default score if no tasks are provided
  }
  
  // Calculate the average automation potential across all tasks
  const totalScore = tasks.reduce((sum, task) => {
    return sum + calculateTaskAutomationPotential(task, jinaAnalysis);
  }, 0);
  
  return totalScore / tasks.length;
}
