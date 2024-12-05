import { CareerPath, CareerLevel, ExperienceMilestone, ProgressionRequirement } from '@/components/career-progression/types';
import { getOccupationDetails } from './OnetService';

export class CareerProgressionService {
  async getCareerPath(occupationCode: string): Promise<CareerPath> {
    try {
      const occupationDetails = await getOccupationDetails(occupationCode);
      
      // Extract relevant data from O*NET
      const levels = this.generateCareerLevels(occupationDetails);
      
      return {
        id: occupationCode,
        name: occupationDetails.title,
        description: occupationDetails.description,
        domain: this.getDomainFromCode(occupationCode),
        levels
      };
    } catch (error) {
      console.error('Error fetching career path:', error);
      throw new Error('Failed to fetch career path data');
    }
  }

  private getDomainFromCode(code: string): string {
    // O*NET codes follow the format XX-XXXX.XX where the first two digits represent the major group
    const majorGroup = code.split('-')[0];
    // Map major groups to domains based on O*NET classification
    const domainMap: { [key: string]: string } = {
      '11': 'Management',
      '13': 'Business and Financial',
      '15': 'Computer and Mathematical',
      '17': 'Architecture and Engineering',
      '19': 'Life, Physical, and Social Science',
      '21': 'Community and Social Service',
      '23': 'Legal',
      '25': 'Education, Training, and Library',
      '27': 'Arts, Design, Entertainment, Sports, and Media',
      '29': 'Healthcare Practitioners',
      '31': 'Healthcare Support',
      '33': 'Protective Service',
      '35': 'Food Preparation and Serving',
      '37': 'Building and Grounds Maintenance',
      '39': 'Personal Care and Service',
      '41': 'Sales',
      '43': 'Office and Administrative Support',
      '45': 'Farming, Fishing, and Forestry',
      '47': 'Construction and Extraction',
      '49': 'Installation, Maintenance, and Repair',
      '51': 'Production',
      '53': 'Transportation and Material Moving'
    };
    return domainMap[majorGroup] || 'Other';
  }

  private generateCareerLevels(occupationDetails: any): CareerLevel[] {
    const levels: CareerLevel[] = [];
    
    // Entry Level
    levels.push({
      id: `${occupationDetails.code}-entry`,
      title: `Entry Level ${occupationDetails.title}`,
      level: 1,
      description: 'Entry-level position with basic responsibilities',
      requirements: {
        experience: 0,
        skills: occupationDetails.skills
          ?.filter((skill: any) => skill.level === 'Basic' || skill.level === 'Foundational')
          ?.map((skill: any) => skill.name) || [],
        education: ['High School Diploma']
      },
      salary: {
        min: 35000,
        max: 50000,
        currency: '$'
      },
      nextLevels: [`${occupationDetails.code}-mid`]
    });

    // Mid Level
    levels.push({
      id: `${occupationDetails.code}-mid`,
      title: `${occupationDetails.title}`,
      level: 2,
      description: occupationDetails.description,
      requirements: {
        experience: 2,
        skills: occupationDetails.skills
          ?.filter((skill: any) => skill.level === 'Intermediate')
          ?.map((skill: any) => skill.name) || [],
        education: ["Associate's Degree", "Bachelor's Degree"]
      },
      salary: {
        min: 45000,
        max: 70000,
        currency: '$'
      },
      nextLevels: [`${occupationDetails.code}-senior`]
    });

    // Senior Level
    levels.push({
      id: `${occupationDetails.code}-senior`,
      title: `Senior ${occupationDetails.title}`,
      level: 3,
      description: `Senior level position with advanced responsibilities`,
      requirements: {
        experience: 5,
        skills: occupationDetails.skills
          ?.filter((skill: any) => skill.level === 'Advanced' || skill.level === 'Expert')
          ?.map((skill: any) => skill.name) || [],
        education: ["Bachelor's Degree", "Master's Degree"]
      },
      salary: {
        min: 60000,
        max: 90000,
        currency: '$'
      },
      nextLevels: []
    });

    return levels;
  }

  calculateProgressionRequirements(
    currentLevel: CareerLevel,
    targetLevel: CareerLevel
  ): ProgressionRequirement {
    const missingSkills = targetLevel.requirements.skills.filter(
      skill => !currentLevel.requirements.skills.includes(skill)
    );

    const missingCertifications = (targetLevel.requirements.certifications || []).filter(
      cert => !(currentLevel.requirements.certifications || []).includes(cert)
    );

    const experienceGap = Math.max(
      0,
      targetLevel.requirements.experience - currentLevel.requirements.experience
    );

    const educationGap = (targetLevel.requirements.education || []).filter(
      edu => !(currentLevel.requirements.education || []).includes(edu)
    );

    // Rough estimation: 6 months per certification, 3 months per skill
    const estimatedMonths =
      experienceGap * 12 +
      missingCertifications.length * 6 +
      missingSkills.length * 3;

    return {
      currentLevel,
      targetLevel,
      missingSkills,
      missingCertifications,
      experienceGap,
      educationGap,
      estimatedTimeToAchieve: estimatedMonths
    };
  }

  async getMilestones(levelId: string): Promise<ExperienceMilestone[]> {
    // Mock data - would typically come from an API
    return [
      {
        id: 'milestone-1',
        title: 'Basic Project Completion',
        description: 'Complete first major project independently',
        yearsRequired: 1,
        skills: ['Project Management', 'Technical Documentation'],
        achieved: false
      },
      {
        id: 'milestone-2',
        title: 'Team Leadership',
        description: 'Lead a small team or major feature development',
        yearsRequired: 2,
        skills: ['Team Leadership', 'Technical Planning'],
        achieved: false
      }
    ];
  }
}

export const careerProgressionService = new CareerProgressionService();
