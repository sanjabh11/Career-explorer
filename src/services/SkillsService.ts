import { getOccupationDetails } from './OnetService';
import { Skill } from '../types/skills';

class SkillsService {
  async getSkillsForOccupation(occupationId: string): Promise<Skill[]> {
    try {
      console.log(`Fetching skills for occupation: ${occupationId}`);
      const occupationDetails = await getOccupationDetails(occupationId);

      if (!occupationDetails || !occupationDetails.skills) {
        console.warn('No skills data found in occupation details');
        return [];
      }

      // Transform skills data to match our format
      const skills = occupationDetails.skills.map(skill => ({
        id: skill.id || `skill-${Math.random().toString(36).substr(2, 9)}`,
        name: skill.name,
        category: skill.category || "Core Skills",
        current_level: 0,
        required_level: Math.round((skill.level || 0) * 5),
        description: skill.description || '',
        importance: Math.round((skill.value || 0) * 100)
      }));

      console.log(`Transformed ${skills.length} skills`);
      return skills;
    } catch (error) {
      console.error('Error fetching skills:', error);
      throw error;
    }
  }
}

export default new SkillsService();
