import axios from 'axios';

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
  private baseUrl = process.env.REACT_APP_API_BASE_URL || '';

  async getEducationRequirements(occupationId: string): Promise<EducationData> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/education/${occupationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching education requirements:', error);
      // Return mock data for now until API is implemented
      return this.getMockEducationData(occupationId);
    }
  }

  private getMockEducationData(occupationId: string): EducationData {
    return {
      occupationId,
      typicalEducation: "Bachelor's Degree",
      educationLevels: [
        {
          level: "High School Diploma",
          required: true,
          preferredPercentage: 100,
          description: "Basic requirement for entry-level positions"
        },
        {
          level: "Bachelor's Degree",
          required: true,
          preferredPercentage: 85,
          description: "Preferred for most positions"
        },
        {
          level: "Master's Degree",
          required: false,
          preferredPercentage: 35,
          description: "Advantageous for senior positions"
        }
      ],
      certifications: [
        {
          name: "Professional Certification",
          provider: "Industry Association",
          description: "Standard industry certification",
          required: false,
          validityPeriod: "2 years"
        }
      ],
      continuingEducation: [
        "Annual compliance training",
        "Professional development courses"
      ]
    };
  }
}

export default new EducationService();
