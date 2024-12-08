export interface AssessmentSkill {
  id: string;
  name: string;
  category: string;
  currentLevel: number;
  requiredLevel: number;
  gap?: number;
  importance?: number;
}

export interface SkillAssessment {
  id: string;
  skillId: string;
  userId: string;
  score: number;
  timestamp: string;
  notes?: string;
}

export interface PeerReview {
  id: string;
  skillId: string;
  reviewerId: string;
  rating: number;
  feedback: string;
  timestamp: string;
}

export interface ProjectAssessment {
  id: string;
  skillId: string;
  projectId: string;
  userId: string;
  rating: number;
  feedback: string;
  timestamp: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  weight: number;
}

export interface SkillRelationshipGraphProps {
  data: AssessmentSkill[];
  onNodeClick?: (skillId: string) => void;
}

export interface SkillTransferabilityMatrixProps {
  data: AssessmentSkill[];
  onCellClick?: (skill1: string, skill2: string) => void;
}

export interface CategoryWeightEditorProps {
  data: SkillCategory[];
  onChange: (categories: SkillCategory[]) => void;
}
