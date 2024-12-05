import axios from 'axios';
import { getOccupationDetails } from './OnetService';

export interface EducationRequirement {
  level: string;
  required: boolean;
  preferredPercentage: number;
  description: string;
}

export interface Certification {
  name: string;
  provider: string;
  description: string;
  required: boolean;
  validityPeriod?: string;
}

export interface EducationData {
  occupationId: string;
  typicalEducation: string;
  educationLevels: EducationRequirement[];
  certifications: Certification[];
  continuingEducation?: string[];
}

class EducationService {
  async getEducationRequirements(occupationId: string): Promise<EducationData> {
    try {
      const occupationDetails = await getOccupationDetails(occupationId);
      
      // Process O*NET data into our education format
      const educationData: EducationData = {
        occupationId,
        typicalEducation: this.determineTypicalEducation(occupationDetails.knowledge),
        educationLevels: this.processEducationLevels(occupationDetails.knowledge),
        certifications: this.processCertifications(occupationDetails),
        continuingEducation: this.processContinuingEducation(occupationDetails)
      };

      return educationData;
    } catch (error) {
      console.error('Error fetching education requirements:', error);
      throw error;
    }
  }

  private determineTypicalEducation(knowledge: any[]): string {
    // Calculate typical education level based on knowledge requirements
    const educationScores = {
      'High School Diploma': 0,
      'Associate\'s Degree': 0,
      'Bachelor\'s Degree': 0,
      'Master\'s Degree': 0,
      'Doctoral Degree': 0
    };

    knowledge?.forEach(item => {
      const score = parseFloat(item.value) || 0;
      if (score >= 80) educationScores['Doctoral Degree']++;
      else if (score >= 70) educationScores['Master\'s Degree']++;
      else if (score >= 60) educationScores['Bachelor\'s Degree']++;
      else if (score >= 50) educationScores['Associate\'s Degree']++;
      else educationScores['High School Diploma']++;
    });

    // Find the education level with the highest score
    return Object.entries(educationScores)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0];
  }

  private processEducationLevels(knowledge: any[]): EducationRequirement[] {
    const levels: EducationRequirement[] = [];
    const maxKnowledgeScore = Math.max(...(knowledge?.map(k => parseFloat(k.value) || 0) || [0]));

    // High School
    levels.push({
      level: 'High School Diploma',
      required: true,
      preferredPercentage: 100,
      description: 'Basic educational requirement'
    });

    // Associate's
    if (maxKnowledgeScore >= 50) {
      levels.push({
        level: 'Associate\'s Degree',
        required: maxKnowledgeScore >= 60,
        preferredPercentage: Math.min(100, Math.round((maxKnowledgeScore / 50) * 100)),
        description: 'Provides foundational knowledge and technical skills'
      });
    }

    // Bachelor's
    if (maxKnowledgeScore >= 60) {
      levels.push({
        level: 'Bachelor\'s Degree',
        required: maxKnowledgeScore >= 70,
        preferredPercentage: Math.min(100, Math.round((maxKnowledgeScore / 60) * 100)),
        description: 'Comprehensive education in field-specific knowledge'
      });
    }

    // Master's
    if (maxKnowledgeScore >= 70) {
      levels.push({
        level: 'Master\'s Degree',
        required: maxKnowledgeScore >= 80,
        preferredPercentage: Math.min(100, Math.round((maxKnowledgeScore / 70) * 100)),
        description: 'Advanced knowledge and specialization'
      });
    }

    // Doctoral
    if (maxKnowledgeScore >= 80) {
      levels.push({
        level: 'Doctoral Degree',
        required: maxKnowledgeScore >= 90,
        preferredPercentage: Math.min(100, Math.round((maxKnowledgeScore / 80) * 100)),
        description: 'Highest level of field expertise'
      });
    }

    return levels;
  }

  private processCertifications(occupationDetails: any): Certification[] {
    const certifications: Certification[] = [];
    
    // Extract certification requirements from tasks and knowledge
    const relevantTasks = occupationDetails.tasks
      ?.filter((task: any) => 
        task.description.toLowerCase().includes('certif') ||
        task.description.toLowerCase().includes('licens'))
      || [];

    const relevantKnowledge = occupationDetails.knowledge
      ?.filter((item: any) => 
        parseFloat(item.value) >= 60 &&
        (item.description.toLowerCase().includes('certif') ||
         item.description.toLowerCase().includes('licens')))
      || [];

    // Create certification entries
    [...relevantTasks, ...relevantKnowledge].forEach((item: any) => {
      const description = item.description || item.name || '';
      if (!certifications.some(cert => cert.description === description)) {
        certifications.push({
          name: this.extractCertificationName(description),
          provider: 'Industry Standard',
          description: description,
          required: parseFloat(item.value) >= 70 || false,
          validityPeriod: '2 years' // Default validity period
        });
      }
    });

    return certifications;
  }

  private extractCertificationName(description: string): string {
    // Extract certification name from description
    const certMatch = description.match(/\b(?:certification|certificate|license)\s+in\s+([^.]+)/i);
    if (certMatch) return certMatch[1].trim();
    
    // If no specific match, create a general name
    return 'Professional Certification in ' + description.split(' ').slice(0, 3).join(' ');
  }

  private processContinuingEducation(occupationDetails: any): string[] {
    const continuingEd: Set<string> = new Set();

    // Extract continuing education requirements from tasks and knowledge
    occupationDetails.tasks?.forEach((task: any) => {
      if (task.description.toLowerCase().includes('training') ||
          task.description.toLowerCase().includes('education') ||
          task.description.toLowerCase().includes('development')) {
        continuingEd.add(task.description);
      }
    });

    occupationDetails.knowledge?.forEach((item: any) => {
      if (parseFloat(item.value) >= 50 &&
          (item.description.toLowerCase().includes('training') ||
           item.description.toLowerCase().includes('education') ||
           item.description.toLowerCase().includes('development'))) {
        continuingEd.add(item.description);
      }
    });

    return Array.from(continuingEd);
  }
}

export default new EducationService();
