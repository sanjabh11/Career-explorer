// src/services/FireCrawlService.ts
import axios from 'axios';

export interface ResearchMention {
  text: string;
  automationPercentage?: number;
  year?: number;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface ResearchData {
  source: string;
  title: string;
  date: string;
  url: string;
  automationMentions: ResearchMention[];
  relevanceScore?: number;
}

export interface FireCrawlResponse {
  researchData: ResearchData[];
  error?: string;
}

/**
 * Crawls the web for automation research related to a specific occupation
 * @param occupation The occupation title or code
 * @returns Promise with research data
 */
export const crawlAutomationResearch = async (occupation: string): Promise<FireCrawlResponse> => {
  // Check if FireCrawl is enabled
  const useFireCrawl = process.env.NEXT_PUBLIC_USE_FIRECRAWL === 'true';
  if (!useFireCrawl) {
    console.log('FireCrawl API is disabled. Using mock data instead.');
    return {
      researchData: generateMockResearchData(occupation),
      error: 'FireCrawl API is disabled'
    };
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_FIRECRAWL_API_KEY || process.env.FIRECRAWL_API_KEY;
    console.log('Using FireCrawl API key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'Not found');

    // Use our Netlify function proxy instead of direct API call
    const response = await axios.post('/.netlify/functions/firecrawl-api', {
      query: `${occupation} automation AI research`,
      limit: 5
    });

    // Check if we got mock data
    if (response.data && response.data.mockData) {
      console.log('Received mock data from FireCrawl proxy');
      return {
        researchData: generateMockResearchData(occupation),
        error: response.data.error || 'Using mock data'
      };
    }

    // Check for API errors
    if (response.data && response.data.success === false) {
      console.warn('FireCrawl API error:', response.data.error);
      return {
        researchData: generateMockResearchData(occupation),
        error: response.data.error
      };
    }

    return {
      researchData: processResearchData(response.data, occupation)
    };
  } catch (error) {
    console.error('Error crawling automation research:', error);
    return {
      researchData: generateMockResearchData(occupation),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Generate mock research data when FireCrawl API is unavailable
 */
const generateMockResearchData = (occupation: string): ResearchData[] => {
  const currentYear = new Date().getFullYear();

  return [
    {
      source: 'mckinsey.com',
      title: `The Future of ${occupation} in the Age of Automation`,
      date: `${currentYear}-03-15`,
      url: 'https://www.mckinsey.com/featured-insights/future-of-work',
      automationMentions: [
        {
          text: `Recent studies suggest that ${occupation} roles may see up to 30% of tasks automated in the next decade, though complete job displacement is unlikely.`,
          automationPercentage: 30,
          year: currentYear - 1,
          sentiment: 'neutral'
        },
        {
          text: `AI and automation technologies are expected to augment ${occupation} capabilities rather than replace them entirely.`,
          sentiment: 'positive'
        }
      ],
      relevanceScore: 0.85
    },
    {
      source: 'weforum.org',
      title: `Skills of the Future: What ${occupation} Professionals Need to Know`,
      date: `${currentYear}-01-10`,
      url: 'https://www.weforum.org/agenda/archive/future-of-work',
      automationMentions: [
        {
          text: `By ${currentYear + 3}, approximately 25% of current ${occupation} tasks could be automated, requiring professionals to upskill in areas like advanced analytics and human-AI collaboration.`,
          automationPercentage: 25,
          year: currentYear + 3,
          sentiment: 'neutral'
        }
      ],
      relevanceScore: 0.78
    },
    {
      source: 'brookings.edu',
      title: `Automation and the Changing Landscape for ${occupation}`,
      date: `${currentYear - 2}-11-05`,
      url: 'https://www.brookings.edu/topics/automation-artificial-intelligence/',
      automationMentions: [
        {
          text: `Historical data shows that ${occupation} roles have adapted to previous waves of technological change, with job growth actually increasing by 15% following automation of routine tasks.`,
          sentiment: 'positive'
        },
        {
          text: `Regions with higher concentrations of ${occupation} jobs saw 40% faster economic growth when embracing automation technologies.`,
          automationPercentage: 40,
          year: currentYear - 3,
          sentiment: 'positive'
        }
      ],
      relevanceScore: 0.72
    }
  ];
};

/**
 * Crawls industry-specific sources for automation trends
 * @param occupation The occupation title or code
 * @param industry The industry related to the occupation
 * @returns Promise with industry-specific research data
 */
export const crawlIndustryAutomation = async (
  occupation: string,
  industry: string
): Promise<FireCrawlResponse> => {
  // Check if FireCrawl is enabled
  const useFireCrawl = process.env.NEXT_PUBLIC_USE_FIRECRAWL === 'true';
  if (!useFireCrawl) {
    console.log('FireCrawl API is disabled. Using mock industry data instead.');
    return {
      researchData: generateMockIndustryData(occupation, industry),
      error: 'FireCrawl API is disabled'
    };
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_FIRECRAWL_API_KEY || process.env.FIRECRAWL_API_KEY;

    // Use our Netlify function proxy instead of direct API call
    const response = await axios.post('/.netlify/functions/firecrawl-api', {
      query: `${occupation} ${industry} automation research`,
      limit: 5
    });

    // Check if we got mock data
    if (response.data && response.data.mockData) {
      console.log('Received mock data from FireCrawl proxy');
      return {
        researchData: generateMockIndustryData(occupation, industry),
        error: response.data.error || 'Using mock data'
      };
    }

    // Check for API errors
    if (response.data && response.data.success === false) {
      console.warn('FireCrawl API error:', response.data.error);
      return {
        researchData: generateMockIndustryData(occupation, industry),
        error: response.data.error
      };
    }

    return {
      researchData: processResearchData(response.data, occupation)
    };
  } catch (error) {
    console.error('Error crawling industry automation:', error);
    return {
      researchData: generateMockIndustryData(occupation, industry),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Generate mock industry-specific data when FireCrawl API is unavailable
 */
const generateMockIndustryData = (occupation: string, industry: string): ResearchData[] => {
  const currentYear = new Date().getFullYear();

  return [
    {
      source: `${industry.toLowerCase()}.org`,
      title: `${industry} Industry Automation Trends for ${occupation}`,
      date: `${currentYear}-02-20`,
      url: `https://www.example.com/${industry.toLowerCase()}/trends`,
      automationMentions: [
        {
          text: `In the ${industry} sector, ${occupation} roles are experiencing a ${Math.floor(20 + Math.random() * 15)}% automation rate, primarily in routine documentation and analysis tasks.`,
          automationPercentage: Math.floor(20 + Math.random() * 15),
          year: currentYear,
          sentiment: 'neutral'
        }
      ],
      relevanceScore: 0.9
    },
    {
      source: 'industryweek.com',
      title: `How ${industry} Leaders are Approaching Automation`,
      date: `${currentYear - 1}-11-15`,
      url: 'https://www.industryweek.com/technology-and-automation',
      automationMentions: [
        {
          text: `${occupation} professionals in ${industry} companies are increasingly working alongside AI tools, with ${Math.floor(30 + Math.random() * 20)}% of companies reporting increased productivity.`,
          automationPercentage: Math.floor(30 + Math.random() * 20),
          year: currentYear - 1,
          sentiment: 'positive'
        }
      ],
      relevanceScore: 0.75
    }
  ];
};

/**
 * Process research data from FireCrawl API
 */
const processResearchData = (data: any, occupation: string): ResearchData[] => {
  // Extract relevant information from crawled pages
  const researchData: ResearchData[] = [];

  if (!data.pages || !Array.isArray(data.pages)) {
    return researchData;
  }

  data.pages.forEach((page: any) => {
    // Extract paragraphs that mention the occupation and automation
    const relevantParagraphs = extractRelevantParagraphs(page.content, occupation);

    if (relevantParagraphs.length > 0) {
      // Extract automation mentions from paragraphs
      const automationMentions = extractAutomationMentions(relevantParagraphs);

      if (automationMentions.length > 0) {
        // Calculate relevance score based on number of mentions and specificity
        const relevanceScore = calculateRelevanceScore(automationMentions, occupation);

        researchData.push({
          source: extractDomain(page.url),
          title: page.title || 'Untitled',
          date: page.lastModified || new Date().toISOString(),
          url: page.url,
          automationMentions,
          relevanceScore
        });
      }
    }
  });

  return researchData.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
};

/**
 * Extract paragraphs that mention the occupation and automation
 */
const extractRelevantParagraphs = (content: string, occupation: string): string[] => {
  if (!content) return [];

  // Split content into paragraphs
  const paragraphs = content.split(/\n\n+/);

  // Filter paragraphs that mention both the occupation and automation
  return paragraphs.filter(paragraph => {
    const lowerParagraph = paragraph.toLowerCase();
    const occupationTerms = occupation.toLowerCase().split(/\s+/);

    // Check if paragraph mentions occupation
    const mentionsOccupation = occupationTerms.some(term =>
      lowerParagraph.includes(term) && term.length > 3
    );

    // Check if paragraph mentions automation
    const mentionsAutomation = [
      'automation', 'automated', 'automate',
      'ai', 'artificial intelligence',
      'machine learning', 'robot',
      'job displacement', 'future of work'
    ].some(term => lowerParagraph.includes(term));

    return mentionsOccupation && mentionsAutomation;
  });
};

/**
 * Extract automation mentions from paragraphs
 */
const extractAutomationMentions = (paragraphs: string[]): ResearchMention[] => {
  const mentions: ResearchMention[] = [];

  paragraphs.forEach(paragraph => {
    // Extract percentage if available
    const percentMatch = paragraph.match(/(\d+(?:\.\d+)?)%/);
    const percentage = percentMatch ? parseFloat(percentMatch[1]) : undefined;

    // Extract year if available
    const yearMatch = paragraph.match(/\b(20\d{2})\b/);
    const year = yearMatch ? parseInt(yearMatch[1]) : undefined;

    // Determine sentiment
    const sentiment = determineSentiment(paragraph);

    mentions.push({
      text: paragraph,
      automationPercentage: percentage,
      year,
      sentiment
    });
  });

  return mentions;
};

/**
 * Determine sentiment of a paragraph
 */
const determineSentiment = (text: string): 'positive' | 'negative' | 'neutral' => {
  const lowerText = text.toLowerCase();

  const positiveTerms = [
    'opportunity', 'enhance', 'improve', 'benefit',
    'advantage', 'growth', 'positive', 'augment'
  ];

  const negativeTerms = [
    'threat', 'risk', 'replace', 'eliminate',
    'displace', 'loss', 'negative', 'danger'
  ];

  const positiveCount = positiveTerms.filter(term => lowerText.includes(term)).length;
  const negativeCount = negativeTerms.filter(term => lowerText.includes(term)).length;

  if (positiveCount > negativeCount) {
    return 'positive';
  } else if (negativeCount > positiveCount) {
    return 'negative';
  } else {
    return 'neutral';
  }
};

/**
 * Calculate relevance score for research data
 */
const calculateRelevanceScore = (mentions: ResearchMention[], occupation: string): number => {
  // Base score on number of mentions
  let score = Math.min(1, mentions.length / 5);

  // Boost score if percentages are mentioned
  const hasPercentages = mentions.some(mention => mention.automationPercentage !== undefined);
  if (hasPercentages) {
    score += 0.2;
  }

  // Boost score if recent years are mentioned
  const currentYear = new Date().getFullYear();
  const hasRecentYears = mentions.some(mention =>
    mention.year !== undefined && mention.year >= currentYear - 3
  );
  if (hasRecentYears) {
    score += 0.2;
  }

  // Boost score if occupation is mentioned frequently
  const occupationMentionCount = mentions.reduce((count, mention) => {
    const lowerText = mention.text.toLowerCase();
    const occupationTerms = occupation.toLowerCase().split(/\s+/);

    const termMatches = occupationTerms.filter(term =>
      lowerText.includes(term) && term.length > 3
    ).length;

    return count + termMatches;
  }, 0);

  score += Math.min(0.3, occupationMentionCount / 10);

  return Math.min(1, score);
};

/**
 * Get industry-specific URLs for crawling
 */
const getIndustryUrls = (industry: string): string[] => {
  const baseUrls: Record<string, string[]> = {
    'healthcare': [
      'https://www.healthcareitnews.com/',
      'https://www.beckershospitalreview.com/',
      'https://www.healthcarefinancenews.com/'
    ],
    'finance': [
      'https://www.finextra.com/',
      'https://www.fintech.finance/',
      'https://www.bankingtech.com/'
    ],
    'manufacturing': [
      'https://www.manufacturingglobal.com/',
      'https://www.industryweek.com/',
      'https://www.automationworld.com/'
    ],
    'technology': [
      'https://techcrunch.com/',
      'https://www.wired.com/',
      'https://www.theverge.com/'
    ],
    'education': [
      'https://www.edtechnology.co.uk/',
      'https://www.edsurge.com/',
      'https://www.chronicle.com/'
    ]
  };

  // Find the closest matching industry
  const lowerIndustry = industry.toLowerCase();
  for (const [key, urls] of Object.entries(baseUrls)) {
    if (lowerIndustry.includes(key)) {
      return urls;
    }
  }

  // Default to general research URLs if no specific industry match
  return [
    'https://www.mckinsey.com/featured-insights/future-of-work',
    'https://www.weforum.org/agenda/archive/future-of-work',
    'https://www.brookings.edu/topics/automation-artificial-intelligence/'
  ];
};

/**
 * Extract domain from URL
 */
const extractDomain = (url: string): string => {
  try {
    const domain = new URL(url).hostname;
    return domain.replace(/^www\./, '');
  } catch (e) {
    return url;
  }
};
