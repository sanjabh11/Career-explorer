import { Task, Skill, Knowledge, Ability, Technology } from '@/types/occupation';

export const calculateTaskComplexity = (tasks: Task[]): number => {
  if (!tasks.length) return 0;
  return tasks.reduce((sum, task) => {
    const complexity = task.level || 1;
    return sum + (complexity / 5);
  }, 0) / tasks.length;
};

export const calculateTaskRepetitiveness = (tasks: Task[]): number => {
  if (!tasks.length) return 0;
  return tasks.reduce((sum, task) => {
    // Tasks with lower complexity are generally more repetitive
    const complexity = task.level || 1;
    return sum + (1 - complexity / 5);
  }, 0) / tasks.length;
};

export const calculateHumanAIInteraction = (tasks: Task[]): number => {
  if (!tasks.length) return 0;
  return tasks.reduce((sum, task) => {
    const genAIImpact = task.genAIImpact === 'High' ? 0.8 :
                       task.genAIImpact === 'Medium' ? 0.5 :
                       task.genAIImpact === 'Low' ? 0.2 : 0.5;
    return sum + genAIImpact;
  }, 0) / tasks.length;
};

export const calculateTechImpact = (technologies: Technology[]): number => {
  if (!technologies.length) return 0;
  return technologies.reduce((sum, tech) => sum + (tech.value / 100), 0) / technologies.length;
};

export const calculateSkillComplexity = (skills: Skill[]): number => {
  if (!skills.length) return 0;
  return skills.reduce((sum, skill) => sum + ((skill.level ?? 3) / 5), 0) / skills.length;
};

export const calculateSkillAICollaboration = (skills: Skill[]): number => {
  if (!skills.length) return 0;
  return skills.reduce((sum, skill) => {
    // Higher level skills generally require more AI collaboration
    return sum + ((skill.level ?? 3) / 5);
  }, 0) / skills.length;
};

export const calculateSkillTechImpact = (skills: Skill[]): number => {
  if (!skills.length) return 0;
  return skills.reduce((sum, skill) => {
    // Technical skills have higher tech impact
    const isTechnical = skill.category?.toLowerCase().includes('technical') ?? false;
    return sum + (isTechnical ? 0.8 : 0.4);
  }, 0) / skills.length;
};

export const calculateKnowledgeComplexity = (knowledge: Knowledge[]): number => {
  if (!knowledge.length) return 0;
  return knowledge.reduce((sum, k) => sum + ((k.level ?? 3) / 5), 0) / knowledge.length;
};

export const calculateKnowledgeAICollaboration = (knowledge: Knowledge[]): number => {
  if (!knowledge.length) return 0;
  return knowledge.reduce((sum, k) => {
    // Higher level knowledge generally requires more AI collaboration
    return sum + ((k.level ?? 3) / 5);
  }, 0) / knowledge.length;
};

export const calculateKnowledgeTechImpact = (knowledge: Knowledge[]): number => {
  if (!knowledge.length) return 0;
  return knowledge.reduce((sum) => sum + 0.6, 0) / knowledge.length; // Base tech impact for knowledge
};

export const calculateAbilityComplexity = (abilities: Ability[]): number => {
  if (!abilities.length) return 0;
  return abilities.reduce((sum, ability) => sum + ((ability.level ?? 3) / 5), 0) / abilities.length;
};

export const calculateAbilityRepetitiveness = (abilities: Ability[]): number => {
  if (!abilities.length) return 0;
  return abilities.reduce((sum, ability) => {
    // Physical abilities tend to be more repetitive
    return sum + 0.7;
  }, 0) / abilities.length;
};

export const calculateAbilityAICollaboration = (abilities: Ability[]): number => {
  if (!abilities.length) return 0;
  return abilities.reduce((sum, ability) => {
    // Physical abilities generally have lower AI collaboration
    return sum + 0.3;
  }, 0) / abilities.length;
};

export const calculateAbilityTechImpact = (abilities: Ability[]): number => {
  if (!abilities.length) return 0;
  return abilities.reduce((sum) => sum + 0.4, 0) / abilities.length; // Base tech impact for abilities
};
