import { Skill, LearningResource } from '../types/skills';

const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8888/.netlify/functions'
  : '/.netlify/functions';

class SkillsService {
  static async getSkillsForOccupation(occupationId: string): Promise<Skill[]> {
    try {
      console.log(`Fetching skills for occupation: ${occupationId}`);
      const response = await fetch(`${API_BASE_URL}/onet-skills?occupationId=${occupationId}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(`Failed to fetch skills: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.element || !Array.isArray(data.element)) {
        console.error('Unexpected data format:', data);
        throw new Error('Invalid data format received from API');
      }

      return data.element;
    } catch (error) {
      console.error('Error fetching skills:', error);
      throw error;
    }
  }

  static async getUserSkills(userId: string): Promise<Skill[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/user-skills`);
      const data = await response.json();
      return data.map((skill: any) => ({
        id: skill.id,
        name: skill.name,
        description: skill.description,
        importance: skill.importance,
        category: skill.category,
        level: skill.level,
        confidence: skill.confidence,
        required_level: skill.required_level,
        current_level: skill.current_level,
      }));
    } catch (error) {
      console.error('Error fetching user skills:', error);
      return [];
    }
  }

  static async assessSkill(userId: string, skillId: string, assessment: { level: number; confidence: number }): Promise<void> {
    try {
      const userSkills = await this.getUserSkills(userId);
      const updatedSkills = {
        ...userSkills,
        [skillId]: {
          level: assessment.level,
          confidence: assessment.confidence,
          lastUpdated: new Date().toISOString()
        }
      };

      localStorage.setItem(`user_skills_${userId}`, JSON.stringify(updatedSkills));
    } catch (error) {
      console.error('Error assessing skill:', error);
      throw error;
    }
  }

  static async getSkillGapAnalysis(userId: string, occupationId: string): Promise<any> {
    try {
      const [userSkills, requiredSkills] = await Promise.all([
        this.getUserSkills(userId),
        this.getSkillsForOccupation(occupationId)
      ]);

      return requiredSkills.map(requiredSkill => {
        const userSkill = userSkills.find(skill => skill.id === requiredSkill.id);
        const gap = (requiredSkill.required_level || 0) - (userSkill?.level || 0);
        return {
          skill: requiredSkill,
          currentLevel: userSkill?.level || 0,
          gap: Math.max(0, gap),
          confidence: userSkill?.confidence || 0
        };
      });
    } catch (error) {
      console.error('Error getting skill gap analysis:', error);
      throw error;
    }
  }

  static async getTrainingRecommendations(userId: string, occupationId: string): Promise<any> {
    try {
      const gapAnalysis = await this.getSkillGapAnalysis(userId, occupationId);
      const significantGaps = gapAnalysis
        .filter((item: any) => item.gap > 1)
        .sort((a: any, b: any) => b.gap - a.gap);

      // Mock training resources - in real app, this would come from a training API
      return significantGaps.map((gap: any) => ({
        skill: gap.skill.name,
        gap: gap.gap,
        training_resources: [
          {
            title: `${gap.skill.name} Fundamentals`,
            provider: 'Online Learning Platform',
            url: '#',
            type: 'course',
            level: 'Beginner',
            duration: '4 weeks',
            cost: 'Free'
          },
          {
            title: `Advanced ${gap.skill.name}`,
            provider: 'Professional Training Institute',
            url: '#',
            type: 'certification',
            level: 'Advanced',
            duration: '8 weeks',
            cost: '$299'
          }
        ]
      }));
    } catch (error) {
      console.error('Error getting training recommendations:', error);
      throw error;
    }
  }
}

export default SkillsService;
