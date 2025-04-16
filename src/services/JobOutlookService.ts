// src/services/JobOutlookService.ts

import axios from 'axios';
import { JobOutlook } from '@/types/onet';

// Use the current window location to determine the base URL
const API_BASE_URL = window.location.origin + '/.netlify/functions/onet-proxy';



/**
 * Service for fetching and processing job outlook data from O*NET
 */
export class JobOutlookService {
  /**
   * Fetches job outlook data for a specific occupation
   * @param occupationCode The O*NET-SOC code for the occupation
   * @returns Job outlook data including growth projections and salary information
   */
  public async getJobOutlook(occupationCode: string): Promise<JobOutlook> {
    try {
      const response = await axios.get(`${API_BASE_URL}/outlook/${occupationCode}`);

      // Check if we got mock data
      if (response.data && response.data.mockData) {
        console.log(`Received mock data for job outlook ${occupationCode}`);
      }

      return this.processOutlookData(response.data, occupationCode);
    } catch (error) {
      console.error(`Error fetching job outlook for ${occupationCode}:`, error);
      // For development, return more realistic mock data based on occupation code
      return this.getMockJobOutlook(occupationCode);
    }
  }

  /**
   * Provides realistic mock job outlook data for development
   * @param occupationCode The O*NET-SOC code
   * @returns Mock job outlook data
   */
  private getMockJobOutlook(occupationCode: string): JobOutlook {
    // Different mock data based on occupation category
    const isComputerOccupation = occupationCode.startsWith('15-');
    const isManagementOccupation = occupationCode.startsWith('11-');
    const isHealthcareOccupation = occupationCode.startsWith('29-');

    if (isComputerOccupation) {
      return {
        growthRate: 15.4,
        projectedOpenings: 162900,
        brightOutlook: true,
        brightOutlookReasons: ['rapid_growth', 'numerous_openings'],
        growthOutlookDescription: 'Much faster than average growth (15.4%) with a very high number of job openings (162,900 projected openings)',
        salaryRange: {
          min: 75000,
          median: 110140,
          max: 168000,
          currency: 'USD'
        },
        employmentData: {
          current: 1847900,
          projected: 2135000,
          changePercent: 15.4,
          changeValue: 287100
        },
        lastUpdated: new Date().toISOString(),
        source: 'Mock Data (Development)'
      };
    } else if (isManagementOccupation) {
      return {
        growthRate: 8.2,
        projectedOpenings: 83800,
        brightOutlook: true,
        brightOutlookReasons: ['numerous_openings'],
        growthOutlookDescription: 'Faster than average growth (8.2%) with a high number of job openings (83,800 projected openings)',
        salaryRange: {
          min: 92000,
          median: 152720,
          max: 208000,
          currency: 'USD'
        },
        employmentData: {
          current: 912100,
          projected: 987000,
          changePercent: 8.2,
          changeValue: 74900
        },
        lastUpdated: new Date().toISOString(),
        source: 'Mock Data (Development)'
      };
    } else if (isHealthcareOccupation) {
      return {
        growthRate: 13.0,
        projectedOpenings: 139600,
        brightOutlook: true,
        brightOutlookReasons: ['rapid_growth', 'numerous_openings'],
        growthOutlookDescription: 'Much faster than average growth (13.0%) with a very high number of job openings (139,600 projected openings)',
        salaryRange: {
          min: 68000,
          median: 93300,
          max: 145000,
          currency: 'USD'
        },
        employmentData: {
          current: 1078000,
          projected: 1218000,
          changePercent: 13.0,
          changeValue: 140000
        },
        lastUpdated: new Date().toISOString(),
        source: 'Mock Data (Development)'
      };
    } else {
      // Default fallback data
      return this.getFallbackOutlookData(occupationCode);
    }
  }

  /**
   * Fetches all occupations with a bright outlook designation
   * @returns Array of occupation codes with bright outlook
   */
  public async getBrightOutlookOccupations(): Promise<string[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/bright-outlook`);
      return response.data.occupations || [];
    } catch (error) {
      console.error('Error fetching bright outlook occupations:', error);
      // Return mock bright outlook occupations for development
      return this.getMockBrightOutlookOccupations();
    }
  }

  /**
   * Provides mock bright outlook occupation codes for development
   * @returns Array of mock bright outlook occupation codes
   */
  private getMockBrightOutlookOccupations(): string[] {
    return [
      '15-1252.00', // Software Developers
      '15-1211.00', // Computer Systems Analysts
      '15-1299.08', // Computer and Information Research Scientists
      '11-9041.00', // Architectural and Engineering Managers
      '15-1212.00', // Information Security Analysts
      '29-1141.00', // Registered Nurses
      '29-1071.00', // Physician Assistants
      '29-1171.00', // Nurse Practitioners
      '13-2011.00', // Accountants and Auditors
      '11-1021.00'  // General and Operations Managers
    ];
  }

  /**
   * Checks if an occupation has a bright outlook designation
   * @param occupationCode The O*NET-SOC code for the occupation
   * @returns Boolean indicating if the occupation has a bright outlook
   */
  public async hasBrightOutlook(occupationCode: string): Promise<boolean> {
    try {
      const response = await axios.get(`${API_BASE_URL}/bright-outlook/${occupationCode}`);
      return response.data.brightOutlook || false;
    } catch (error) {
      console.error(`Error checking bright outlook for ${occupationCode}:`, error);
      // Use mock data for development
      const brightOutlookCodes = await this.getMockBrightOutlookOccupations();
      return brightOutlookCodes.includes(occupationCode);
    }
  }

  /**
   * Searches for occupations with specific criteria including bright outlook
   * @param keyword Search keyword
   * @param brightOutlookOnly Whether to only return bright outlook occupations
   * @returns Array of matching occupations
   */
  public async searchOccupationsWithFilters(keyword: string, brightOutlookOnly = false) {
    try {
      // First get all matching occupations
      const response = await axios.get(`${API_BASE_URL}?keyword=${encodeURIComponent(keyword)}`);
      const allOccupations = response.data.occupations.map((occupation: any) => ({
        code: occupation.code,
        title: occupation.title
      }));

      // If not filtering by bright outlook, return all results
      if (!brightOutlookOnly) {
        return allOccupations;
      }

      // Get all bright outlook occupations
      const brightOutlookCodes = await this.getBrightOutlookOccupations();

      // Filter to only include bright outlook occupations
      return allOccupations.filter((occupation: any) =>
        brightOutlookCodes.includes(occupation.code)
      );
    } catch (error) {
      console.error('Error searching occupations with filters:', error);
      // Return mock data for development purposes
      return this.getMockOccupations(keyword);
    }
  }

  /**
   * Provides mock occupation data for development when API calls fail
   * @param keyword The search keyword
   * @returns Mock occupation data
   */
  public getMockOccupations(keyword: string): any[] {
    // Expanded mock data with more occupations, including audit-related ones
    const mockData = [
      // Computer and IT occupations
      { code: '15-1252.00', title: 'Software Developers' },
      { code: '15-1211.00', title: 'Computer Systems Analysts' },
      { code: '15-1299.08', title: 'Computer and Information Research Scientists' },
      { code: '15-1232.00', title: 'Computer User Support Specialists' },
      { code: '15-1231.00', title: 'Computer Network Support Specialists' },
      { code: '15-1241.00', title: 'Computer Network Architects' },
      { code: '15-1244.00', title: 'Network and Computer Systems Administrators' },
      { code: '15-1212.00', title: 'Information Security Analysts' },
      { code: '15-1243.00', title: 'Database Architects' },

      // Management occupations
      { code: '11-9041.00', title: 'Architectural and Engineering Managers' },
      { code: '11-1021.00', title: 'General and Operations Managers' },
      { code: '11-3031.00', title: 'Financial Managers' },

      // Finance and accounting occupations
      { code: '13-2011.00', title: 'Accountants and Auditors' },
      { code: '13-2051.00', title: 'Financial Analysts' },
      { code: '13-2061.00', title: 'Financial Examiners' },
      { code: '13-2082.00', title: 'Tax Preparers' },
      { code: '13-2023.00', title: 'Auditors and Financial Analysts' },
      { code: '13-2031.00', title: 'Budget Analysts' },
      { code: '13-2099.01', title: 'Financial Quantitative Analysts' },

      // Healthcare occupations
      { code: '29-1141.00', title: 'Registered Nurses' },
      { code: '29-1071.00', title: 'Physician Assistants' },
      { code: '29-1171.00', title: 'Nurse Practitioners' },

      // Education occupations
      { code: '25-1011.00', title: 'Business Teachers, Postsecondary' },
      { code: '25-1022.00', title: 'Mathematical Science Teachers, Postsecondary' },
      { code: '25-1032.00', title: 'Engineering Teachers, Postsecondary' },

      // Specifically for 'audit' searches
      { code: '13-1041.00', title: 'Compliance Officers and Auditors' },
      { code: '13-1199.05', title: 'Sustainability Auditors and Specialists' },
      { code: '13-2011.02', title: 'Internal Auditors' },
      { code: '13-2011.01', title: 'Forensic Accountants and Auditors' },
      { code: '13-1041.01', title: 'Environmental Compliance Inspectors and Auditors' },
      { code: '13-1041.06', title: 'Quality Auditors and Compliance Specialists' }
    ];

    // Filter mock data based on keyword if provided
    if (keyword && keyword.trim() !== '') {
      const lowercaseKeyword = keyword.toLowerCase();

      // Special case for 'audit' to ensure we return results
      if (lowercaseKeyword.includes('audit')) {
        return mockData.filter(occupation =>
          occupation.title.toLowerCase().includes('audit') ||
          occupation.code.startsWith('13-2011') // Accountants and Auditors codes
        );
      }

      // Normal keyword filtering
      return mockData.filter(occupation =>
        occupation.title.toLowerCase().includes(lowercaseKeyword)
      );
    }

    return mockData;
  }

  /**
   * Processes raw outlook data from the API into a structured format
   * @param data Raw data from the API
   * @param occupationCode The O*NET-SOC code for the occupation
   * @returns Processed job outlook data
   */
  private processOutlookData(data: any, occupationCode: string): JobOutlook {
    // Extract growth rate and projected openings
    const growthRate = data.growth_rate || 0;
    const projectedOpenings = data.projected_openings || 0;

    // Determine if this is a bright outlook occupation and why
    const brightOutlook = data.bright_outlook || false;
    const brightOutlookReasons = data.bright_outlook_reasons || [];

    // Generate a description of the growth outlook
    const growthOutlookDescription = this.generateGrowthDescription(growthRate, projectedOpenings);

    // Extract salary information
    const salaryRange = {
      min: data.salary_min || 0,
      median: data.salary_median || 0,
      max: data.salary_max || 0,
      currency: 'USD'
    };

    // Extract employment data
    const employmentData = {
      current: data.employment_current || 0,
      projected: data.employment_projected || 0,
      changePercent: data.employment_change_percent || 0,
      changeValue: data.employment_change_value || 0
    };

    return {
      growthRate,
      projectedOpenings,
      brightOutlook,
      brightOutlookReasons,
      growthOutlookDescription,
      salaryRange,
      employmentData,
      lastUpdated: data.last_updated || new Date().toISOString(),
      source: data.source || 'O*NET'
    };
  }

  /**
   * Generates a descriptive text about the growth outlook
   * @param growthRate The projected growth rate
   * @param projectedOpenings The projected number of job openings
   * @returns A descriptive text about the growth outlook
   */
  private generateGrowthDescription(growthRate: number, projectedOpenings: number): string {
    let description = '';

    // Describe growth rate
    if (growthRate > 14) {
      description += 'Much faster than average growth ';
    } else if (growthRate > 5) {
      description += 'Faster than average growth ';
    } else if (growthRate > -5) {
      description += 'Average growth ';
    } else if (growthRate > -14) {
      description += 'Slower than average growth ';
    } else {
      description += 'Much slower than average growth ';
    }

    description += `(${growthRate}%) `;

    // Describe job openings
    if (projectedOpenings > 100000) {
      description += 'with a very high number of job openings';
    } else if (projectedOpenings > 50000) {
      description += 'with a high number of job openings';
    } else if (projectedOpenings > 10000) {
      description += 'with a moderate number of job openings';
    } else {
      description += 'with a limited number of job openings';
    }

    description += ` (${projectedOpenings.toLocaleString()} projected openings)`;

    return description;
  }

  /**
   * Provides fallback data when the API request fails
   * @param occupationCode The O*NET-SOC code for the occupation
   * @returns Fallback job outlook data
   */
  private getFallbackOutlookData(occupationCode: string): JobOutlook {
    return {
      growthRate: 0,
      projectedOpenings: 0,
      brightOutlook: false,
      brightOutlookReasons: [],
      growthOutlookDescription: 'Data currently unavailable',
      salaryRange: {
        min: 0,
        median: 0,
        max: 0,
        currency: 'USD'
      },
      employmentData: {
        current: 0,
        projected: 0,
        changePercent: 0,
        changeValue: 0
      },
      lastUpdated: new Date().toISOString(),
      source: 'Fallback Data'
    };
  }

  /**
   * Gets mock occupation details for development when API calls fail
   * @param code The O*NET-SOC code
   * @returns Mock occupation details
   */
  public getMockOccupationDetails(code: string): any {
    // Basic occupation data that all occupations will have
    const baseOccupation: any = {
      code: code,
      title: this.getOccupationTitleByCode(code),
      description: `This is a mock description for ${this.getOccupationTitleByCode(code)}. This occupation involves various tasks and responsibilities that require specific skills and knowledge.`,
      sample_of_reported_job_titles: ['Job Title 1', 'Job Title 2', 'Job Title 3'],
      updated: new Date().toISOString(),
      overallAPO: 45,
      categories: [],
      jobZone: 4,
      tasks: [
        {
          name: 'Task 1',
          description: 'Perform analysis of financial records',
          value: 65,
          level: 4,
          genAIImpact: 'Medium'
        },
        {
          name: 'Task 2',
          description: 'Prepare reports and documentation',
          value: 75,
          level: 4,
          genAIImpact: 'High'
        },
        {
          name: 'Task 3',
          description: 'Communicate with clients and stakeholders',
          value: 35,
          level: 3,
          genAIImpact: 'Low'
        },
        {
          name: 'Task 4',
          description: 'Review and verify accuracy of data',
          value: 70,
          level: 4,
          genAIImpact: 'Medium'
        },
        {
          name: 'Task 5',
          description: 'Develop and implement procedures',
          value: 55,
          level: 3,
          genAIImpact: 'Medium'
        }
      ],
      knowledge: [
        {
          name: 'Economics and Accounting',
          description: 'Knowledge of economic and accounting principles and practices',
          value: 80,
          level: 4,
          category: 'Business'
        },
        {
          name: 'Mathematics',
          description: 'Knowledge of arithmetic, algebra, geometry, calculus, and statistics',
          value: 70,
          level: 4,
          category: 'Math'
        },
        {
          name: 'English Language',
          description: 'Knowledge of the structure and content of the English language',
          value: 65,
          level: 3,
          category: 'Language'
        },
        {
          name: 'Computers and Electronics',
          description: 'Knowledge of electronic equipment, computer hardware and software',
          value: 60,
          level: 3,
          category: 'Technology'
        }
      ],
      skills: [
        {
          name: 'Critical Thinking',
          description: 'Using logic and reasoning to identify strengths and weaknesses of alternative solutions',
          value: 75,
          level: 4,
          category: 'Basic Skills'
        },
        {
          name: 'Reading Comprehension',
          description: 'Understanding written sentences and paragraphs in work-related documents',
          value: 70,
          level: 4,
          category: 'Basic Skills'
        },
        {
          name: 'Active Listening',
          description: 'Giving full attention to what other people are saying',
          value: 65,
          level: 3,
          category: 'Basic Skills'
        },
        {
          name: 'Speaking',
          description: 'Talking to others to convey information effectively',
          value: 65,
          level: 3,
          category: 'Basic Skills'
        },
        {
          name: 'Complex Problem Solving',
          description: 'Identifying complex problems and reviewing related information',
          value: 70,
          level: 4,
          category: 'Complex Problem Solving Skills'
        }
      ],
      abilities: [
        {
          name: 'Oral Comprehension',
          description: 'The ability to listen to and understand information and ideas presented through spoken words',
          value: 65,
          level: 3
        },
        {
          name: 'Written Comprehension',
          description: 'The ability to read and understand information and ideas presented in writing',
          value: 70,
          level: 4
        },
        {
          name: 'Deductive Reasoning',
          description: 'The ability to apply general rules to specific problems to produce answers',
          value: 75,
          level: 4
        },
        {
          name: 'Inductive Reasoning',
          description: 'The ability to combine pieces of information to form general rules or conclusions',
          value: 70,
          level: 4
        },
        {
          name: 'Information Ordering',
          description: 'The ability to arrange things or actions in a certain order or pattern',
          value: 65,
          level: 3
        }
      ],
      technologies: [
        {
          name: 'Spreadsheet software',
          description: 'Microsoft Excel, Google Sheets',
          value: 80,
          level: 4,
          hotTechnology: true,
          category: 'Office Software'
        },
        {
          name: 'Accounting software',
          description: 'QuickBooks, SAP, Oracle Financials',
          value: 75,
          level: 4,
          hotTechnology: true,
          category: 'Industry Specific Software'
        },
        {
          name: 'Data analysis software',
          description: 'Tableau, Power BI',
          value: 65,
          level: 3,
          hotTechnology: true,
          category: 'Analytics Software'
        },
        {
          name: 'Word processing software',
          description: 'Microsoft Word, Google Docs',
          value: 60,
          level: 3,
          hotTechnology: false,
          category: 'Office Software'
        }
      ],
      responsibilities: [
        'Perform analysis of financial records',
        'Prepare reports and documentation',
        'Communicate with clients and stakeholders',
        'Review and verify accuracy of data',
        'Develop and implement procedures'
      ]
    };

    // Add job outlook data
    baseOccupation.jobOutlook = this.getMockJobOutlook(code);

    return baseOccupation;
  }

  /**
   * Gets occupation title by code for mock data
   * @param code The O*NET-SOC code
   * @returns The occupation title
   */
  private getOccupationTitleByCode(code: string): string {
    const occupationMap: Record<string, string> = {
      '13-2011.00': 'Accountants and Auditors',
      '13-2011.01': 'Forensic Accountants and Auditors',
      '13-2011.02': 'Internal Auditors',
      '13-1041.00': 'Compliance Officers and Auditors',
      '13-1199.05': 'Sustainability Auditors and Specialists',
      '15-1252.00': 'Software Developers',
      '15-1211.00': 'Computer Systems Analysts',
      '15-1299.08': 'Computer and Information Research Scientists',
      '15-1232.00': 'Computer User Support Specialists',
      '15-1231.00': 'Computer Network Support Specialists',
      '11-9041.00': 'Architectural and Engineering Managers',
      '11-1021.00': 'General and Operations Managers',
      '11-3031.00': 'Financial Managers',
      '29-1141.00': 'Registered Nurses',
      '29-1071.00': 'Physician Assistants',
      '29-1171.00': 'Nurse Practitioners'
    };

    return occupationMap[code] || `Occupation ${code}`;
  }
}

// Export a singleton instance
export const jobOutlookService = new JobOutlookService();
