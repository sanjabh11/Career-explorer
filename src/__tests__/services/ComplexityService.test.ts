import { ComplexityService } from '../../services/ComplexityService';
import { Task, Skill, Technology } from '../../types/onet';

describe('ComplexityService', () => {
  let complexityService: ComplexityService;

  beforeEach(() => {
    complexityService = new ComplexityService();
  });

  describe('calculateTaskComplexity', () => {
    it('should calculate task complexity based on description and activities', () => {
      const task: Task = {
        id: '1',
        description: 'Analyze complex data and develop strategic solutions',
        tools: ['Advanced Analytics Software', 'Machine Learning Tools'],
        workActivities: ['Data Analysis', 'Strategy Development', 'Project Management']
      };

      const complexity = complexityService.calculateTaskComplexity(task);
      expect(complexity).toBeGreaterThan(0);
      expect(complexity).toBeLessThanOrEqual(1);
    });
  });

  describe('calculateSkillRequirements', () => {
    it('should evaluate skill requirements based on provided skills', () => {
      const skills: Skill[] = [
        { id: '1', name: 'Data Analysis', level: 4, category: 'Technical' },
        { id: '2', name: 'Project Management', level: 3, category: 'Management' },
        { id: '3', name: 'Machine Learning', level: 4, category: 'Technical' }
      ];

      const skillScore = complexityService.calculateSkillRequirements(skills);
      expect(skillScore).toBeGreaterThan(0);
      expect(skillScore).toBeLessThanOrEqual(1);
    });
  });

  describe('calculateTechnologicalSophistication', () => {
    it('should assess technological sophistication based on technologies', () => {
      const technologies: Technology[] = [
        { id: '1', name: 'Python', category: 'Programming', yearIntroduced: 1991 },
        { id: '2', name: 'TensorFlow', category: 'Machine Learning', yearIntroduced: 2015 },
        { id: '3', name: 'Docker', category: 'DevOps', yearIntroduced: 2013 }
      ];

      const techScore = complexityService.calculateTechnologicalSophistication(technologies);
      expect(techScore).toBeGreaterThan(0);
      expect(techScore).toBeLessThanOrEqual(1);
    });
  });

  describe('calculateDecisionMakingAutonomy', () => {
    it('should measure decision-making autonomy based on responsibilities', () => {
      const responsibilities = [
        'Independently manage complex projects',
        'Make strategic decisions about resource allocation',
        'Lead and direct team members',
        'Evaluate and approve technical solutions'
      ];

      const autonomyScore = complexityService.calculateDecisionMakingAutonomy(responsibilities);
      expect(autonomyScore).toBeGreaterThan(0);
      expect(autonomyScore).toBeLessThanOrEqual(1);
    });
  });

  describe('calculateOverallComplexity', () => {
    it('should calculate overall complexity combining all factors', () => {
      const task: Task = {
        id: '1',
        description: 'Design and implement machine learning solutions',
        tools: ['TensorFlow', 'Python', 'Docker'],
        workActivities: ['Model Development', 'Data Analysis', 'System Design']
      };

      const skills: Skill[] = [
        { id: '1', name: 'Machine Learning', level: 5, category: 'Technical' },
        { id: '2', name: 'Data Science', level: 4, category: 'Technical' },
        { id: '3', name: 'Project Management', level: 3, category: 'Management' }
      ];

      const technologies: Technology[] = [
        { id: '1', name: 'Python', category: 'Programming', yearIntroduced: 1991 },
        { id: '2', name: 'TensorFlow', category: 'Machine Learning', yearIntroduced: 2015 },
        { id: '3', name: 'Docker', category: 'DevOps', yearIntroduced: 2013 }
      ];

      const responsibilities = [
        'Lead ML projects independently',
        'Make strategic decisions about model architecture',
        'Evaluate and approve production deployments',
        'Direct team of data scientists'
      ];

      const complexity = complexityService.calculateOverallComplexity(
        task,
        skills,
        technologies,
        responsibilities
      );

      expect(complexity.taskComplexity).toBeGreaterThan(0);
      expect(complexity.skillRequirements).toBeGreaterThan(0);
      expect(complexity.technologicalSophistication).toBeGreaterThan(0);
      expect(complexity.decisionMakingAutonomy).toBeGreaterThan(0);

      expect(complexity.taskComplexity).toBeLessThanOrEqual(1);
      expect(complexity.skillRequirements).toBeLessThanOrEqual(1);
      expect(complexity.technologicalSophistication).toBeLessThanOrEqual(1);
      expect(complexity.decisionMakingAutonomy).toBeLessThanOrEqual(1);
    });
  });
});
