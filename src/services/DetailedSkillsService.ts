/**
 * Detailed Skills Service
 *
 * Service for fetching and analyzing detailed skills data, including
 * automation impact, future relevance, and skill relationships.
 */

import { DetailedSkill, DetailedSkillsResponse, DetailedSkillGap, SkillDevelopmentRecommendation, ProficiencyCriteria, RelatedSkill } from '../types/detailedSkills';
import { Skill } from '../types/skills';

class DetailedSkillsService {
  private cache: Map<string, { data: DetailedSkillsResponse; timestamp: number }>;
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  constructor() {
    this.cache = new Map();
  }

  /**
   * Get detailed skills for an occupation
   * @param occupationId O*NET occupation code
   * @returns Detailed skills data
   */
  async getDetailedSkills(occupationId: string): Promise<DetailedSkillsResponse> {
    try {
      // Check cache first
      const cacheKey = `detailed_skills_${occupationId}`;
      const cachedData = this.cache.get(cacheKey);

      if (cachedData && (Date.now() - cachedData.timestamp) < this.CACHE_TTL) {
        console.log('Using cached detailed skills data');
        return cachedData.data;
      }

      // Determine the base URL for Netlify functions
      // In development, we might need to use a different port (8888 is common for netlify dev)
      const netlifyFunctionsUrl = process.env.NEXT_PUBLIC_NETLIFY_FUNCTIONS_URL ||
                                 (window.location.origin.includes('localhost') ?
                                 'http://localhost:8888/.netlify/functions' :
                                 '/.netlify/functions');

      // Fetch from API
      console.log(`Fetching detailed skills for occupation: ${occupationId}`);
      console.log(`Using Netlify functions URL: ${netlifyFunctionsUrl}`);

      const response = await fetch(`${netlifyFunctionsUrl}/detailed-skills?occupationId=${occupationId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch detailed skills: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Check if the response contains mock data
      if (data.mockData) {
        console.warn('Received mock data from API, this means O*NET API credentials may be missing or invalid');
      } else {
        console.log('Successfully fetched real O*NET data');
      }

      // Cache the result
      this.cache.set(cacheKey, { data, timestamp: Date.now() });

      return data;
    } catch (error) {
      console.error('Error fetching detailed skills:', error);

      // Only fall back to mock data if we can't reach the Netlify function at all
      // This ensures we're using the server-side O*NET integration when possible
      console.warn('Falling back to client-side mock data due to network error');
      return this.generateMockDetailedSkills(occupationId);
    }
  }

  /**
   * Generate mock detailed skills data
   * @param occupationId O*NET occupation code
   * @returns Mock detailed skills data
   */
  private generateMockDetailedSkills(occupationId: string): DetailedSkillsResponse {
    // Extract occupation code parts for more realistic mock data
    const codeParts = occupationId.split('-');
    const majorGroup = codeParts[0] || '00';

    // Determine occupation type based on major group
    let occupationType = 'General';
    let occupationTitle = 'Occupation';

    switch (majorGroup) {
      case '11':
        occupationType = 'Management';
        occupationTitle = 'Manager';
        break;
      case '13':
        occupationType = 'Business and Financial';
        occupationTitle = 'Business Analyst';
        break;
      case '15':
        occupationType = 'Computer and Mathematical';
        occupationTitle = 'Software Developer';
        break;
      case '17':
        occupationType = 'Architecture and Engineering';
        occupationTitle = 'Engineer';
        break;
      case '19':
        occupationType = 'Life, Physical, and Social Science';
        occupationTitle = 'Scientist';
        break;
      case '21':
        occupationType = 'Community and Social Service';
        occupationTitle = 'Counselor';
        break;
      case '25':
        occupationType = 'Education, Training, and Library';
        occupationTitle = 'Teacher';
        break;
      case '29':
        occupationType = 'Healthcare Practitioners';
        occupationTitle = 'Healthcare Professional';
        break;
      case '41':
        occupationType = 'Sales';
        occupationTitle = 'Sales Representative';
        break;
      case '43':
        occupationType = 'Office and Administrative Support';
        occupationTitle = 'Administrative Assistant';
        break;
      case '47':
        occupationType = 'Construction and Extraction';
        occupationTitle = 'Construction Worker';
        break;
      default:
        occupationType = 'General';
        occupationTitle = 'Professional';
    }

    // Generate skills based on occupation type
    const skills = this.generateSkillsForOccupationType(occupationType);

    return {
      occupation_id: occupationId,
      occupation_title: `${occupationTitle} (${occupationId})`,
      skills: skills,
      skill_categories: this.extractCategories(skills),
      last_updated: new Date().toISOString(),
      mockData: true
    };
  }

  /**
   * Extract unique categories from skills
   */
  private extractCategories(skills: DetailedSkill[]): string[] {
    const categories = new Set<string>();
    skills.forEach(skill => {
      if (skill.category) {
        categories.add(skill.category);
      }
    });
    return Array.from(categories);
  }

  /**
   * Generate skills for a specific occupation type
   * @param occupationType Type of occupation
   * @returns List of detailed skills for the occupation type
   */
  private generateSkillsForOccupationType(occupationType: string): DetailedSkill[] {
    // Base skills that apply to most occupations
    const baseSkills: DetailedSkill[] = [
      {
        id: 'skill_1',
        name: 'Critical Thinking',
        description: 'Using logic and reasoning to identify the strengths and weaknesses of alternative solutions, conclusions, or approaches to problems.',
        category: 'Cognitive Skills',
        required_level: 4,
        importance: 85,
        automation_impact: {
          score: 25,
          category: 'Low',
          description: 'This skill is relatively resistant to automation and will likely remain valuable in the future.'
        },
        future_relevance: {
          score: 90,
          trend: 'Increasing',
          horizon: '5-10 years'
        },
        proficiency_criteria: this.generateProficiencyCriteria('Critical Thinking'),
        related_skills: []
      },
      {
        id: 'skill_2',
        name: 'Active Learning',
        description: 'Understanding the implications of new information for both current and future problem-solving and decision-making.',
        category: 'Cognitive Skills',
        required_level: 4,
        importance: 80,
        automation_impact: {
          score: 30,
          category: 'Low',
          description: 'This skill is relatively resistant to automation and will likely remain valuable in the future.'
        },
        future_relevance: {
          score: 85,
          trend: 'Increasing',
          horizon: '5-10 years'
        },
        proficiency_criteria: this.generateProficiencyCriteria('Active Learning'),
        related_skills: []
      },
      {
        id: 'skill_3',
        name: 'Communication',
        description: 'Talking to others to convey information effectively and listening to understand the points being made.',
        category: 'Social Skills',
        required_level: 4,
        importance: 90,
        automation_impact: {
          score: 20,
          category: 'Low',
          description: 'This skill is relatively resistant to automation and will likely remain valuable in the future.'
        },
        future_relevance: {
          score: 95,
          trend: 'Increasing',
          horizon: '5-10 years'
        },
        proficiency_criteria: this.generateProficiencyCriteria('Communication'),
        related_skills: []
      }
    ];

    // Add occupation-specific skills
    let occupationSkills: DetailedSkill[] = [];

    switch (occupationType) {
      case 'Computer and Mathematical':
        occupationSkills = this.generateTechSkills();
        break;
      case 'Management':
        occupationSkills = this.generateManagementSkills();
        break;
      case 'Construction and Extraction':
        occupationSkills = this.generateConstructionSkills();
        break;
      case 'Office and Administrative Support':
        occupationSkills = this.generateAdminSkills();
        break;
      default:
        // For other occupation types, add generic skills
        occupationSkills = this.generateGenericSkills();
    }

    // Add related skills
    const allSkills = [...baseSkills, ...occupationSkills];
    allSkills.forEach(skill => {
      skill.related_skills = this.generateRelatedSkillsForMock(skill.id, allSkills);
    });

    return allSkills;
  }

  /**
   * Generate tech skills
   */
  private generateTechSkills(): DetailedSkill[] {
    return [
      {
        id: 'skill_tech_1',
        name: 'Programming',
        description: 'Writing computer programs for various purposes.',
        category: 'Technical Skills',
        required_level: 5,
        importance: 95,
        automation_impact: {
          score: 45,
          category: 'Medium',
          description: 'This skill may be partially automated, but human expertise will still be needed for complex applications.'
        },
        future_relevance: {
          score: 80,
          trend: 'Stable',
          horizon: '5-10 years'
        },
        proficiency_criteria: this.generateProficiencyCriteria('Programming'),
        related_skills: []
      },
      {
        id: 'skill_tech_2',
        name: 'Complex Problem Solving',
        description: 'Identifying complex problems and reviewing related information to develop and evaluate options and implement solutions.',
        category: 'Technical Skills',
        required_level: 5,
        importance: 90,
        automation_impact: {
          score: 30,
          category: 'Low',
          description: 'This skill is relatively resistant to automation and will likely remain valuable in the future.'
        },
        future_relevance: {
          score: 95,
          trend: 'Increasing',
          horizon: '5-10 years'
        },
        proficiency_criteria: this.generateProficiencyCriteria('Complex Problem Solving'),
        related_skills: []
      },
      {
        id: 'skill_tech_3',
        name: 'Systems Analysis',
        description: 'Determining how a system should work and how changes in conditions, operations, and the environment will affect outcomes.',
        category: 'Technical Skills',
        required_level: 4,
        importance: 85,
        automation_impact: {
          score: 40,
          category: 'Medium',
          description: 'This skill may be partially automated, but human expertise will still be needed for complex applications.'
        },
        future_relevance: {
          score: 85,
          trend: 'Stable',
          horizon: '5-10 years'
        },
        proficiency_criteria: this.generateProficiencyCriteria('Systems Analysis'),
        related_skills: []
      }
    ];
  }

  /**
   * Generate management skills
   */
  private generateManagementSkills(): DetailedSkill[] {
    return [
      {
        id: 'skill_mgmt_1',
        name: 'Leadership',
        description: 'Guiding and motivating individuals or groups toward achieving goals.',
        category: 'Management Skills',
        required_level: 5,
        importance: 95,
        automation_impact: {
          score: 15,
          category: 'Low',
          description: 'This skill is relatively resistant to automation and will likely remain valuable in the future.'
        },
        future_relevance: {
          score: 95,
          trend: 'Increasing',
          horizon: '5-10 years'
        },
        proficiency_criteria: this.generateProficiencyCriteria('Leadership'),
        related_skills: []
      },
      {
        id: 'skill_mgmt_2',
        name: 'Decision Making',
        description: 'Considering the relative costs and benefits of potential actions to choose the most appropriate one.',
        category: 'Management Skills',
        required_level: 5,
        importance: 90,
        automation_impact: {
          score: 35,
          category: 'Medium',
          description: 'This skill may be partially automated, but human expertise will still be needed for complex applications.'
        },
        future_relevance: {
          score: 85,
          trend: 'Stable',
          horizon: '5-10 years'
        },
        proficiency_criteria: this.generateProficiencyCriteria('Decision Making'),
        related_skills: []
      }
    ];
  }

  /**
   * Generate construction skills
   */
  private generateConstructionSkills(): DetailedSkill[] {
    return [
      {
        id: 'skill_const_1',
        name: 'Equipment Operation',
        description: 'Operating construction equipment safely and effectively.',
        category: 'Technical Skills',
        required_level: 4,
        importance: 90,
        automation_impact: {
          score: 65,
          category: 'Medium',
          description: 'This skill may be partially automated, but human expertise will still be needed for complex applications.'
        },
        future_relevance: {
          score: 60,
          trend: 'Decreasing',
          horizon: '5-10 years'
        },
        proficiency_criteria: this.generateProficiencyCriteria('Equipment Operation'),
        related_skills: []
      },
      {
        id: 'skill_const_2',
        name: 'Physical Strength',
        description: 'Exerting physical force to lift, push, pull, or carry objects.',
        category: 'Physical Skills',
        required_level: 4,
        importance: 85,
        automation_impact: {
          score: 70,
          category: 'High',
          description: 'This skill is highly susceptible to automation and may be significantly transformed by technology.'
        },
        future_relevance: {
          score: 50,
          trend: 'Decreasing',
          horizon: '5-10 years'
        },
        proficiency_criteria: this.generateProficiencyCriteria('Physical Strength'),
        related_skills: []
      }
    ];
  }

  /**
   * Generate administrative skills
   */
  private generateAdminSkills(): DetailedSkill[] {
    return [
      {
        id: 'skill_admin_1',
        name: 'Information Organization',
        description: 'Finding ways to structure or classify multiple pieces of information.',
        category: 'Administrative Skills',
        required_level: 4,
        importance: 85,
        automation_impact: {
          score: 75,
          category: 'High',
          description: 'This skill is highly susceptible to automation and may be significantly transformed by technology.'
        },
        future_relevance: {
          score: 40,
          trend: 'Decreasing',
          horizon: '5-10 years'
        },
        proficiency_criteria: this.generateProficiencyCriteria('Information Organization'),
        related_skills: []
      },
      {
        id: 'skill_admin_2',
        name: 'Time Management',
        description: 'Managing one\'s own time and the time of others.',
        category: 'Administrative Skills',
        required_level: 4,
        importance: 80,
        automation_impact: {
          score: 50,
          category: 'Medium',
          description: 'This skill may be partially automated, but human expertise will still be needed for complex applications.'
        },
        future_relevance: {
          score: 65,
          trend: 'Stable',
          horizon: '5-10 years'
        },
        proficiency_criteria: this.generateProficiencyCriteria('Time Management'),
        related_skills: []
      }
    ];
  }

  /**
   * Generate generic skills
   */
  private generateGenericSkills(): DetailedSkill[] {
    return [
      {
        id: 'skill_gen_1',
        name: 'Problem Solving',
        description: 'Identifying problems and reviewing related information to develop and evaluate options and implement solutions.',
        category: 'General Skills',
        required_level: 4,
        importance: 85,
        automation_impact: {
          score: 40,
          category: 'Medium',
          description: 'This skill may be partially automated, but human expertise will still be needed for complex applications.'
        },
        future_relevance: {
          score: 80,
          trend: 'Stable',
          horizon: '5-10 years'
        },
        proficiency_criteria: this.generateProficiencyCriteria('Problem Solving'),
        related_skills: []
      },
      {
        id: 'skill_gen_2',
        name: 'Adaptability',
        description: 'Adjusting actions in relation to others\' actions or changing conditions.',
        category: 'General Skills',
        required_level: 4,
        importance: 80,
        automation_impact: {
          score: 25,
          category: 'Low',
          description: 'This skill is relatively resistant to automation and will likely remain valuable in the future.'
        },
        future_relevance: {
          score: 90,
          trend: 'Increasing',
          horizon: '5-10 years'
        },
        proficiency_criteria: this.generateProficiencyCriteria('Adaptability'),
        related_skills: []
      }
    ];
  }

  /**
   * Generate proficiency criteria for a skill
   */
  private generateProficiencyCriteria(_skillName: string): ProficiencyCriteria[] {
    return [
      {
        level: 1,
        description: 'Basic understanding',
        examples: ['Understands basic concepts', 'Can perform simple tasks with guidance'],
        assessment_criteria: ['Can define key terms', 'Recognizes when the skill should be applied']
      },
      {
        level: 3,
        description: 'Intermediate proficiency',
        examples: ['Can apply the skill independently in standard situations', 'Understands underlying principles'],
        assessment_criteria: ['Can solve routine problems', 'Requires minimal supervision']
      },
      {
        level: 5,
        description: 'Expert proficiency',
        examples: ['Can apply the skill in complex and novel situations', 'Can teach others'],
        assessment_criteria: ['Develops innovative approaches', 'Recognized as a resource by peers']
      }
    ];
  }

  /**
   * Generate related skills for mock data
   */
  private generateRelatedSkillsForMock(skillId: string, allSkills: DetailedSkill[]): RelatedSkill[] {
    // Select 2-3 random skills that aren't the current skill
    const otherSkills = allSkills.filter(s => s.id !== skillId);
    const numRelated = Math.floor(Math.random() * 2) + 2; // 2-3 related skills

    // Shuffle and take the first numRelated
    const shuffled = otherSkills.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, numRelated);

    // Format as related skills
    return selected.map(s => ({
      id: s.id,
      name: s.name,
      relationship_strength: Math.floor(Math.random() * 30) + 70, // 70-100% relationship strength
      relationship_type: Math.random() > 0.5 ? 'complementary' : 'prerequisite'
    }));
  }

  /**
   * Analyze skill gaps with detailed information
   * @param userSkills User's current skills
   * @param detailedSkills Detailed skills for the occupation
   * @returns Detailed skill gap analysis
   */
  analyzeSkillGaps(userSkills: Skill[], detailedSkills: DetailedSkill[]): DetailedSkillGap[] {
    return detailedSkills.map(requiredSkill => {
      const userSkill = userSkills.find(skill => skill.id === requiredSkill.id);
      const currentLevel = userSkill?.level || 0;
      const requiredLevel = requiredSkill.required_level || 0;
      const gap = Math.max(0, requiredLevel - currentLevel);

      // Calculate priority based on gap, importance, and future relevance
      const priority = this.calculatePriority(gap, requiredSkill);

      return {
        skill: requiredSkill,
        currentLevel,
        requiredLevel,
        gap,
        priority,
        automationRisk: requiredSkill.automation_impact.score,
        futureRelevance: requiredSkill.future_relevance.score
      };
    }).sort((a, b) => {
      // Sort by priority first, then by gap
      if (this.getPriorityWeight(a.priority) !== this.getPriorityWeight(b.priority)) {
        return this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority);
      }
      return b.gap - a.gap;
    });
  }

  /**
   * Generate skill development recommendations
   * @param skillGaps Detailed skill gaps
   * @returns Skill development recommendations
   */
  generateDevelopmentRecommendations(skillGaps: DetailedSkillGap[]): SkillDevelopmentRecommendation[] {
    return skillGaps
      .filter(gap => gap.gap > 0) // Only include skills with a gap
      .map(gap => {
        // Estimate time to achieve target level
        const estimatedTimeToAchieve = this.estimateTimeToAchieve(gap.gap);

        // Generate learning resources
        const learningResources = this.generateLearningResources(gap.skill, gap.currentLevel, gap.requiredLevel);

        return {
          skill: gap.skill,
          currentLevel: gap.currentLevel,
          targetLevel: gap.requiredLevel,
          priority: gap.priority,
          estimatedTimeToAchieve,
          learningResources
        };
      });
  }

  /**
   * Calculate priority for a skill gap
   * @param gap Skill gap
   * @param skill Detailed skill
   * @returns Priority level
   */
  private calculatePriority(gap: number, skill: DetailedSkill): 'high' | 'medium' | 'low' {
    // Consider gap size, importance, and future relevance
    const importance = skill.importance || 0;
    const futureRelevance = skill.future_relevance.score;
    const automationRisk = skill.automation_impact.score;

    // Calculate a priority score
    // Higher importance, higher future relevance, and lower automation risk increase priority
    const priorityScore = (gap * 20) + (importance * 0.3) + (futureRelevance * 0.3) - (automationRisk * 0.2);

    if (priorityScore > 70) return 'high';
    if (priorityScore > 40) return 'medium';
    return 'low';
  }

  /**
   * Get numeric weight for priority level (for sorting)
   * @param priority Priority level
   * @returns Numeric weight
   */
  private getPriorityWeight(priority: 'high' | 'medium' | 'low'): number {
    switch (priority) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }

  /**
   * Estimate time to achieve target skill level
   * @param gap Skill gap
   * @returns Estimated time
   */
  private estimateTimeToAchieve(gap: number): string {
    // This is a simplified model - in a real implementation, this would be more sophisticated
    if (gap <= 1) return '1-2 months';
    if (gap <= 2) return '3-6 months';
    return '6-12 months';
  }

  /**
   * Generate learning resources for a skill
   * @param skill Detailed skill
   * @param currentLevel Current skill level
   * @param targetLevel Target skill level
   * @returns Learning resources
   */
  private generateLearningResources(skill: DetailedSkill, currentLevel: number, targetLevel: number) {
    // This would ideally come from a learning resources database
    // For now, we'll generate mock resources based on the skill

    const resources = [];

    // Beginner resource
    if (currentLevel < 2) {
      resources.push({
        title: `Introduction to ${skill.name}`,
        provider: 'Online Learning Platform',
        url: '#',
        type: 'course' as const,
        level: 'beginner' as const,
        duration: '4 weeks',
        cost: 'Free'
      });
    }

    // Intermediate resource
    if (currentLevel < 3 && targetLevel >= 3) {
      resources.push({
        title: `${skill.name} - Intermediate Level`,
        provider: 'Professional Training Institute',
        url: '#',
        type: 'course' as const,
        level: 'intermediate' as const,
        duration: '8 weeks',
        cost: '$199'
      });
    }

    // Advanced resource
    if (targetLevel >= 4) {
      resources.push({
        title: `Advanced ${skill.name} Mastery`,
        provider: 'Industry Certification Board',
        url: '#',
        type: 'certification' as const,
        level: 'advanced' as const,
        duration: '12 weeks',
        cost: '$399'
      });
    }

    // Add a book resource
    resources.push({
      title: `The Complete Guide to ${skill.name}`,
      provider: 'Professional Publishing',
      url: '#',
      type: 'book' as const,
      level: currentLevel <= 2 ? 'beginner' as const : 'intermediate' as const,
      cost: '$29.99'
    });

    return resources;
  }
}

// Export as singleton
export const detailedSkillsService = new DetailedSkillsService();
export default detailedSkillsService;
