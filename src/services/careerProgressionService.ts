import { CareerPath, ExperienceMilestone } from '@/components/career-progression/types';
import { getOccupationDetails } from './OnetService';

interface CareerLevel {
  id: string;
  title: string;
  description: string;
  salary: {
    currency: string;
    min: number;
    max: number;
  };
  requirements: {
    skills: string[];
    education?: string[];
    experience: number;
    certifications?: string[];
  };
}

interface AdvancementRequirements {
  currentLevel: CareerLevel;
  targetLevel: CareerLevel;
  requirements: {
    skillGaps: string[];
    educationGaps: string[];
    experienceGap: number;
  };
  timeEstimates: {
    skillAcquisition: number;
    certifications: number;
    education: number;
    experience: number;
  };
  totalTimeEstimate: number;
  salaryIncrease: {
    min: number;
    max: number;
    percentage: number;
  };
}

export class CareerProgressionService {
  async getCareerPath(occupationCode: string): Promise<CareerPath> {
    try {
      const occupationDetails = await getOccupationDetails(occupationCode);
      const levels = await this.generateCareerLevels(occupationDetails);
      
      return {
        id: occupationCode,
        name: occupationDetails.title,
        description: occupationDetails.description,
        domain: this.getDomainFromCode(occupationCode),
        levels
      };
    } catch (error) {
      console.error('Error fetching career path:', error);
      throw error;
    }
  }

  private getDomainFromCode(code: string): string {
    const domains: { [key: string]: string } = {
      '15': 'Computer and Mathematical',
      '17': 'Architecture and Engineering',
      '13': 'Business and Financial',
      '25': 'Education and Training',
      '29': 'Healthcare Practitioners',
      '31': 'Healthcare Support',
      '41': 'Sales',
      '43': 'Office and Administrative Support'
    };

    const majorGroup = code.substring(0, 2);
    return domains[majorGroup] || 'Other';
  }

  private async generateCareerLevels(occupationDetails: any) {
    const levels = [];

    // Entry Level
    levels.push({
      id: `${occupationDetails.code}-entry`,
      title: `Entry Level ${occupationDetails.title}`,
      description: 'Entry-level position with basic responsibilities',
      salary: {
        min: 35000,
        max: 50000,
        currency: '$'
      },
      requirements: {
        experience: 0,
        skills: occupationDetails.skills
          ?.slice(0, 5)
          ?.map((skill: any) => skill.name) || [],
        education: ['High School Diploma']
      }
    });

    // Mid Level
    levels.push({
      id: `${occupationDetails.code}-mid`,
      title: `${occupationDetails.title}`,
      description: occupationDetails.description,
      salary: {
        min: 45000,
        max: 70000,
        currency: '$'
      },
      requirements: {
        experience: 2,
        skills: occupationDetails.skills
          ?.map((skill: any) => skill.name) || [],
        education: ["Associate's Degree", "Bachelor's Degree"]
      }
    });

    // Senior Level
    levels.push({
      id: `${occupationDetails.code}-senior`,
      title: `Senior ${occupationDetails.title}`,
      description: `Senior level position with advanced responsibilities`,
      salary: {
        min: 60000,
        max: 90000,
        currency: '$'
      },
      requirements: {
        experience: 5,
        skills: occupationDetails.skills
          ?.map((skill: any) => skill.name) || [],
        education: ["Bachelor's Degree", "Master's Degree"]
      }
    });

    return levels;
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

  async getExperienceMilestones(): Promise<ExperienceMilestone[]> {
    return [
      {
        id: 'milestone-1',
        title: 'First Project Completion',
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

  async compareSkillRequirements(currentLevel: CareerLevel, targetLevel: CareerLevel) {
    const missingSkills = targetLevel.requirements.skills.filter(
      skill => !currentLevel.requirements.skills.includes(skill)
    );

    const missingEducation = (targetLevel.requirements.education || []).filter(
      edu => !(currentLevel.requirements.education || []).includes(edu)
    );

    const missingCertifications = (targetLevel.requirements.certifications || []).filter(
      (cert: string) => !(currentLevel.requirements.certifications || []).includes(cert)
    );

    const experienceGap = Math.max(
      0,
      targetLevel.requirements.experience - currentLevel.requirements.experience
    );

    return {
      missingSkills,
      missingEducation,
      missingCertifications,
      experienceGap
    };
  }

  async calculateProgressionRequirements(
    currentLevel: CareerLevel,
    targetLevel: CareerLevel
  ): Promise<AdvancementRequirements> {
    const requirements = await this.compareSkillRequirements(currentLevel, targetLevel);
    const { missingSkills, missingEducation, missingCertifications, experienceGap } = requirements;

    // Rough estimation: 6 months per certification, 3 months per skill
    const estimatedMonths =
      missingSkills.length * 3 +
      missingCertifications.length * 6 +
      experienceGap * 12;

    const salaryIncrease = {
      min: targetLevel.salary.min - currentLevel.salary.min,
      max: targetLevel.salary.max - currentLevel.salary.max,
      percentage: ((targetLevel.salary.max - currentLevel.salary.max) / currentLevel.salary.max) * 100
    };

    return {
      currentLevel,
      targetLevel,
      requirements: {
        skillGaps: missingSkills,
        educationGaps: missingEducation,
        experienceGap
      },
      timeEstimates: {
        skillAcquisition: missingSkills.length * 3,
        certifications: missingCertifications.length * 6,
        education: missingEducation.length * 12,
        experience: experienceGap * 12
      },
      totalTimeEstimate: estimatedMonths,
      salaryIncrease
    };
  }

  async getAdvancementRequirements(
    currentLevelId: string,
    targetLevelId: string,
    careerPath: CareerPath
  ): Promise<AdvancementRequirements> {
    const currentLevel = careerPath.levels.find(level => level.id === currentLevelId);
    const targetLevel = careerPath.levels.find(level => level.id === targetLevelId);

    if (!currentLevel || !targetLevel) {
      throw new Error('Invalid level IDs provided');
    }

    return this.calculateProgressionRequirements(currentLevel, targetLevel);
  }
}

export const careerProgressionService = new CareerProgressionService();
