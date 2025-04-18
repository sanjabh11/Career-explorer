/**
 * Career Pathways Service
 *
 * Service for fetching and analyzing career advancement pathways data,
 * including advancement opportunities and skill gap analysis.
 */

import { CareerPathwaysResponse, CareerAdvancementPlan, AdvancementOccupation, PathwaySkill, EducationRequirement, ExperienceRequirement, Certification } from '../types/careerPathways';

class CareerPathwaysService {
  private cache: Map<string, { data: CareerPathwaysResponse; timestamp: number }>;
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  constructor() {
    this.cache = new Map();
  }

  /**
   * Get career pathways for an occupation
   * @param occupationId O*NET occupation code
   * @returns Career pathways data
   */
  async getCareerPathways(occupationId: string): Promise<CareerPathwaysResponse> {
    try {
      // Check cache first
      const cacheKey = `career_pathways_${occupationId}`;
      const cachedData = this.cache.get(cacheKey);

      if (cachedData && (Date.now() - cachedData.timestamp) < this.CACHE_TTL) {
        console.log('Using cached career pathways data');
        return cachedData.data;
      }

      // Determine the base URL for Netlify functions
      // In development, we might need to use a different port (8888 is common for netlify dev)
      const netlifyFunctionsUrl = process.env.NEXT_PUBLIC_NETLIFY_FUNCTIONS_URL ||
                                 (window.location.origin.includes('localhost') ?
                                 'http://localhost:8888/.netlify/functions' :
                                 '/.netlify/functions');

      // Fetch from API
      console.log(`Fetching career pathways for occupation: ${occupationId}`);
      console.log(`Using Netlify functions URL: ${netlifyFunctionsUrl}`);

      const response = await fetch(`${netlifyFunctionsUrl}/career-pathways?occupationId=${occupationId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch career pathways: ${response.status} ${response.statusText}`);
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
      console.error('Error fetching career pathways:', error);
      throw error;
    }
  }

  /**
   * Create a career advancement plan for a specific target occupation
   * @param currentPathways Current career pathways data
   * @param targetOccupationId ID of the target occupation for advancement
   * @returns Career advancement plan
   */
  createAdvancementPlan(
    currentPathways: CareerPathwaysResponse,
    targetOccupationId: string
  ): CareerAdvancementPlan | null {
    // Find the target occupation in the advancement pathways
    const targetOccupation = currentPathways.advancement_pathways.find(
      occ => occ.id === targetOccupationId
    );

    if (!targetOccupation) {
      console.error(`Target occupation ${targetOccupationId} not found in advancement pathways`);
      return null;
    }

    // Extract skill gaps
    const skillGaps = targetOccupation.advancement_criteria.skills.filter(
      skill => skill.gap && skill.gap > 0
    );

    // Extract certification gaps
    const certificationGaps = targetOccupation.advancement_criteria.certifications.filter(
      cert => cert.required && !cert.has
    );

    // Estimate time to achieve based on gaps
    const estimatedTime = this.estimateTimeToAchieve(
      targetOccupation,
      skillGaps,
      targetOccupation.advancement_criteria.education.gap,
      targetOccupation.advancement_criteria.experience.gap,
      certificationGaps.length
    );

    // Generate recommended steps
    const recommendedSteps = this.generateRecommendedSteps(
      targetOccupation,
      skillGaps,
      targetOccupation.advancement_criteria.education,
      targetOccupation.advancement_criteria.experience,
      certificationGaps
    );

    return {
      target_occupation: targetOccupation,
      skill_gaps: skillGaps,
      education_gap: targetOccupation.advancement_criteria.education,
      experience_gap: targetOccupation.advancement_criteria.experience,
      certification_gaps: certificationGaps,
      estimated_time_to_achieve: estimatedTime,
      recommended_steps: recommendedSteps
    };
  }

  /**
   * Estimate time to achieve career advancement
   * @param targetOccupation Target occupation
   * @param skillGaps Skill gaps
   * @param hasEducationGap Whether there's an education gap
   * @param hasExperienceGap Whether there's an experience gap
   * @param certificationGapsCount Number of certification gaps
   * @returns Estimated time to achieve advancement
   */
  private estimateTimeToAchieve(
    targetOccupation: AdvancementOccupation,
    skillGaps: PathwaySkill[],
    hasEducationGap: boolean,
    hasExperienceGap: boolean,
    certificationGapsCount: number
  ): string {
    // This is a simplified estimation - in a real implementation, this would be more sophisticated

    // Calculate base time in months
    let timeInMonths = 0;

    // Add time for skill gaps (3-6 months per skill level gap)
    const totalSkillGapLevels = skillGaps.reduce((sum, skill) => sum + (skill.gap || 0), 0);
    timeInMonths += totalSkillGapLevels * 4; // Average 4 months per skill level

    // Add time for education gap (1-4 years depending on degree)
    if (hasEducationGap) {
      const educationReq = targetOccupation.advancement_criteria.education.required.toLowerCase();
      if (educationReq.includes('master')) {
        timeInMonths += 24; // 2 years for Master's
      } else if (educationReq.includes('bachelor')) {
        timeInMonths += 48; // 4 years for Bachelor's
      } else if (educationReq.includes('associate')) {
        timeInMonths += 24; // 2 years for Associate's
      } else {
        timeInMonths += 12; // 1 year for other education
      }
    }

    // Add time for experience gap (directly from the gap)
    if (hasExperienceGap) {
      const currentExp = this.parseExperienceYears(targetOccupation.advancement_criteria.experience.current);
      const requiredExp = this.parseExperienceYears(targetOccupation.advancement_criteria.experience.required);
      const expGapYears = Math.max(0, requiredExp - currentExp);
      timeInMonths += expGapYears * 12;
    }

    // Add time for certifications (3-6 months per certification)
    timeInMonths += certificationGapsCount * 4;

    // Format the result
    if (timeInMonths < 12) {
      return `${timeInMonths} months`;
    } else {
      const years = Math.floor(timeInMonths / 12);
      const months = timeInMonths % 12;
      if (months === 0) {
        return `${years} year${years > 1 ? 's' : ''}`;
      } else {
        return `${years} year${years > 1 ? 's' : ''} and ${months} month${months > 1 ? 's' : ''}`;
      }
    }
  }

  /**
   * Parse experience years from string
   * @param experienceStr Experience string (e.g., "1-5 years", "5+ years")
   * @returns Number of years (uses the lower bound)
   */
  private parseExperienceYears(experienceStr: string): number {
    const match = experienceStr.match(/(\d+)(?:-(\d+))?\s*\+?\s*years?/i);
    if (match) {
      return parseInt(match[1], 10);
    }
    return 0;
  }

  /**
   * Generate recommended steps for career advancement
   * @param targetOccupation Target occupation
   * @param skillGaps Skill gaps
   * @param educationGap Education gap
   * @param experienceGap Experience gap
   * @param certificationGaps Certification gaps
   * @returns Array of recommended steps
   */
  private generateRecommendedSteps(
    targetOccupation: AdvancementOccupation,
    skillGaps: PathwaySkill[],
    educationGap: EducationRequirement,
    experienceGap: ExperienceRequirement,
    certificationGaps: Certification[]
  ): string[] {
    const steps: string[] = [];

    // Add steps for skill development
    if (skillGaps.length > 0) {
      steps.push(`Develop the following skills: ${skillGaps.map(s => s.name).join(', ')}.`);

      // Add specific steps for top skill gaps
      skillGaps.slice(0, 3).forEach(skill => {
        steps.push(`Improve ${skill.name} from level ${skill.current_level} to ${skill.required_level} through training and practice.`);
      });
    }

    // Add step for education if needed
    if (educationGap.gap) {
      steps.push(`Obtain ${educationGap.required} degree or equivalent qualification.`);
    }

    // Add step for experience if needed
    if (experienceGap.gap) {
      steps.push(`Gain additional experience (${experienceGap.required} required).`);
    }

    // Add steps for certifications
    certificationGaps.forEach(cert => {
      steps.push(`Obtain ${cert.name} certification.`);
    });

    // Add general career development steps
    steps.push(`Seek mentorship from current ${targetOccupation.title}s.`);
    steps.push(`Build a professional network in the ${targetOccupation.title} field.`);
    steps.push(`Look for opportunities to take on responsibilities similar to a ${targetOccupation.title}.`);

    return steps;
  }
}

export default new CareerPathwaysService();
