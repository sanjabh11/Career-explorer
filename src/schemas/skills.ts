// Type definitions for Skills Development Framework

export interface Skill {
    id: number;
    name: string;
    category: string;
    description: string;
    proficiency_levels: {
        [key: number]: {
            description: string;
            criteria: string[];
        };
    };
    learning_resources: LearningResource[];
    assessment_criteria: {
        [key: number]: string[];
    };
    industry_demand: number;
    future_relevance: number;
    automation_resistance: number;
}

export interface LearningResource {
    id: number;
    title: string;
    url: string;
    type: 'course' | 'documentation' | 'video' | 'article';
    provider: string;
    estimated_duration: number; // in hours
    difficulty_level: 'beginner' | 'intermediate' | 'advanced';
    cost: number | 'free';
    rating?: number;
}

export interface SkillAssessment {
    id: number;
    skill_id: number;
    user_id: number;
    current_level: number;
    target_level: number;
    last_assessment_date: string;
    progress_history: {
        date: string;
        level: number;
        notes?: string;
    }[];
    completed_resources: number[]; // IDs of completed learning resources
}

export interface SkillGap {
    id: number;
    user_id: number;
    target_role_id: number;
    gap_analysis: {
        skill_id: number;
        skill_name: string;
        current_level: number;
        required_level: number;
        gap: number;
        priority: 'high' | 'medium' | 'low';
    }[];
    priority_skills: number[];
    estimated_completion_time: number; // in hours
    recommended_path: LearningPathItem[];
    completion_percentage: number;
    time_invested: number; // in hours
    milestone_achievements: {
        milestone_id: number;
        achieved_date: string;
        skill_id: number;
        level: number;
    }[];
}

export interface LearningPathItem {
    skill_id: number;
    name: string;
    current_level: number;
    target_level: number;
    prerequisites: {
        skill_id: number;
        name: string;
        estimated_time: number;
    }[];
    learning_resources: LearningResource[];
    estimated_time: number;
    milestones: {
        level: number;
        description: string;
        assessment_criteria: string[];
    }[];
}

export interface SkillMetrics {
    id: number;
    skill_id: number;
    timestamp: number;
    learning_resource_usage: number;
    assessment_completion_rate: number;
    average_proficiency_gain: number;
    job_posting_frequency: number;
    salary_impact: number;
    industry_growth_rate: number;
    average_time_to_proficiency: number;
    success_rate: number;
    retention_rate: number;
}

// API Response Types
export interface SkillResponse extends Skill {}

export interface SkillAssessmentResponse extends SkillAssessment {}

export interface SkillGapResponse extends SkillGap {}

export interface SkillMetricsResponse extends SkillMetrics {}

export interface SkillPathResponse {
    user_id: number;
    role_id: number;
    learning_path: LearningPathItem[];
    estimated_completion_time: number;
    priority_skills: number[];
}

// API Request Types
export interface SkillAssessmentCreate {
    user_id: number;
    skill_id: number;
    current_level: number;
    target_level: number;
    notes?: string;
}

export interface SkillGapAnalysisRequest {
    user_id: number;
    target_role_id: number;
}

// Utility Types
export type ProficiencyLevel = 1 | 2 | 3 | 4 | 5;

export type SkillCategory = 
    | 'Technical'
    | 'Soft Skills'
    | 'Domain Knowledge'
    | 'Tools'
    | 'Methodologies'
    | 'Languages'
    | 'Frameworks';

export type Priority = 'high' | 'medium' | 'low';

export interface SkillFilter {
    categories?: SkillCategory[];
    minProficiency?: ProficiencyLevel;
    maxProficiency?: ProficiencyLevel;
    searchTerm?: string;
    sortBy?: 'name' | 'proficiency' | 'priority';
    sortOrder?: 'asc' | 'desc';
}
