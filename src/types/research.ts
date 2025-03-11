/**
 * Types for SerpAPI research data integration
 * Version 1.0
 */

export interface ResearchPaper {
  title: string;
  authors: string[];
  publicationYear: number;
  journal?: string;
  url: string;
  abstract?: string;
  citationCount?: number;
  automationScore?: number; // Calculated score from 0-1
  relevanceScore: number; // How relevant this paper is to the occupation
  keyInsights: string[];
}

export interface IndustryReport {
  title: string;
  publisher: string;
  year: number;
  url: string;
  summary?: string;
  automationScore?: number;
  relevanceScore: number;
  keyInsights: string[];
}

export interface NewsArticle {
  title: string;
  source: string;
  date: string;
  url: string;
  summary?: string;
  automationScore?: number;
  relevanceScore: number;
  keyInsights: string[];
}

export interface AutomationTrend {
  trendName: string;
  description: string;
  impactScore: number; // 0-1 score of impact on automation
  timeframe: string; // e.g., "Short-term", "Medium-term", "Long-term"
  relevantTechnologies: string[];
  sources: string[];
}

export interface ConfidenceScore {
  overall: number;
  sourceCount: number;
  sourceQuality: number;
  dataConsistency: number;
  recency: number;
}

export interface RegionalImpact {
  global: number;
  regional: {
    northAmerica: number;
    europe: number;
    asia: number;
    other: number;
  };
  factorsByRegion: {
    northAmerica: string[];
    europe: string[];
    asia: string[];
    other: string[];
  };
}

export interface TimeProjection {
  shortTerm: {
    years: string;
    impact: number;
    keyFactors: string[];
  };
  mediumTerm: {
    years: string;
    impact: number;
    keyFactors: string[];
  };
  longTerm: {
    years: string;
    impact: number;
    keyFactors: string[];
  };
}

export interface AutomationResearchData {
  occupation: string;
  researchPapers: ResearchPaper[];
  industryReports: IndustryReport[];
  newsArticles: NewsArticle[];
  trends: AutomationTrend[];
  overallScore: number; // Aggregated score from all sources
  confidenceLevel: ConfidenceScore; // How confident we are in the aggregated score
  regionalImpact: RegionalImpact;
  adoptionCurves: {
    shortTerm: { year: number; adoption: number }[];
    mediumTerm: { year: number; adoption: number }[];
    longTerm: { year: number; adoption: number }[];
  };
  lastUpdated: string; // ISO date string
}

export interface SerpApiResponse {
  search_metadata: {
    id: string;
    status: string;
    json_endpoint: string;
    created_at: string;
    processed_at: string;
    google_scholar_url: string;
    raw_html_file: string;
    total_time_taken: number;
  };
  search_parameters: {
    engine: string;
    q: string;
    as_ylo?: number;
  };
  organic_results: Array<{
    position: number;
    title: string;
    result_id: string;
    link: string;
    snippet: string;
    publication_info: {
      summary: string;
      authors?: Array<{
        name: string;
        link: string;
        author_id: string;
      }>;
      year?: number;
    };
    inline_links?: {
      cited_by?: {
        total: number;
        link: string;
      };
      related_pages_link?: string;
      versions?: {
        total: number;
        link: string;
      };
    };
    resources?: Array<{
      title: string;
      link: string;
    }>;
  }>;
  pagination?: {
    current: number;
    next: string;
    other_pages: Record<string, string>;
  };
}
