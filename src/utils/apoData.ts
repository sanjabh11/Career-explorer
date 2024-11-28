// apoData.ts

export interface APOCategory {
    [key: string]: number;
  }
  
  export interface APOCategories {
    tasks: APOCategory;
    knowledge: APOCategory;
    skills: APOCategory;
    abilities: APOCategory;
    technologies: APOCategory;
  }
  export interface ItemData {
    name: string;
    description: string;
    importance?: number;
    level?: number;
    date?: string;
    category?: string;
    genAIImpact?: string;
  }
  export interface SynonymMap {
    [key: string]: string[];
  }
  
  export interface TaskCategories {
    [key: string]: number;
  }
  
  export interface CategoryWeights {
    [key: string]: number;
  }
  
  export const APO_CATEGORIES: APOCategories = {
    tasks: {
      "Analyzing Data": 65,
      "Preparing Reports": 55,
      "Coordinating Activities": 40,
      "Evaluating Information": 35,
      "Developing Objectives": 25,
      "Communicating": 30,
      "Monitoring Processes": 50,
      "Training": 35,
      "Problem Solving": 45,
      "Updating Knowledge": 60,
      "Identifying Issues": 40,
      "Conducting Audits": 55,
      "Recommending Solutions": 50,
      "Calculating Metrics": 70,
      "Inspecting Systems": 45,
      "Analyzing Feasibility": 60,
      "Collecting Data": 55,
      "Programming": 65,
      "Debugging": 55,
      "Testing": 50,
      "Documenting": 45,
      "Energy Analysis": 60,
      "Auditing": 55,
      "Calculating Savings": 65,
      "Identifying Improvements": 55
    },
    knowledge: {
      "Administration and Management": 35,
      "Customer and Personal Service": 40,
      "Engineering and Technology": 50,
      "Mathematics": 70,
      "English Language": 55,
      "Computers and Electronics": 60,
      "Education and Training": 40,
      "Psychology": 30,
      "Law and Government": 45,
      "Production and Processing": 55,
      "Design": 45,
      "Geography": 40
    },
    skills: {
      "Active Listening": 35,
      "Critical Thinking": 40,
      "Reading Comprehension": 60,
      "Speaking": 25,
      "Writing": 55,
      "Active Learning": 50,
      "Monitoring": 65,
      "Social Perceptiveness": 20,
      "Time Management": 45,
      "Complex Problem Solving": 40,
      "Systems Analysis": 55,
      "Quality Control Analysis": 50,
      "Judgment and Decision Making": 45
    },
    abilities: {
      "Oral Comprehension": 40,
      "Written Comprehension": 65,
      "Oral Expression": 25,
      "Written Expression": 55,
      "Fluency of Ideas": 35,
      "Originality": 30,
      "Problem Sensitivity": 55,
      "Deductive Reasoning": 50,
      "Inductive Reasoning": 60,
      "Information Ordering": 70,
      "Near Vision": 40,
      "Speech Recognition": 35
    },
    technologies: {
      "Development Environment": 55,
      "Presentation Software": 50,
      "Object Oriented Development": 60,
      "Web Platform Development": 65,
      "Database Management": 70,
      "Operating System": 45,
      "Data Base User Interface": 55,
      "Compiler and Decompiler": 50,
      "Enterprise Resource Planning": 60,
      "Enterprise Application Integration": 65
    }
  };
  
  export const SynonymMap: SynonymMap = {
    "Analyzing Data": ["data analysis", "statistical analysis", "data mining", "analyze information", "evaluate data"],
    "Preparing Reports": ["report writing", "documentation", "summarizing findings", "create documents"],
    "Coordinating Activities": ["project management", "organizing", "scheduling", "coordinate tasks"],
    "Evaluating Information": ["assess information", "review data", "examine results", "evaluate findings"],
    "Developing Objectives": ["goal setting", "planning", "strategy development", "establish targets"],
    "Communicating": ["presenting", "explaining", "discussing", "conveying information"],
    "Monitoring Processes": ["overseeing operations", "supervising", "tracking progress", "quality control"],
    "Training": ["teaching", "instructing", "educating", "skill development"],
    "Problem Solving": ["troubleshooting", "resolving issues", "finding solutions", "addressing challenges"],
    "Updating Knowledge": ["learning", "staying current", "professional development", "skill enhancement"],
    "Energy Analysis": ["energy-saving measures", "energy efficiency", "energy consumption"],
    "Auditing": ["audit reports", "energy analysis results", "cost savings recommendations"],
    "Recommending Solutions": ["recommend technologies", "suggest alternatives", "propose improvements"],
    "Calculating Savings": ["calculate potential", "estimate savings", "quantify benefits"],
    "Identifying Improvements": ["identify measures", "prioritize improvements", "spot inefficiencies"],
    // Add more synonyms for other categories
  };
  
  export const TASK_CATEGORIES: TaskCategories = {
    "Information Input": 0.7,
    "Mental Processes": 0.6,
    "Work Output": 0.5,
    "Interacting With Others": 0.3
  };
  
  export const CATEGORY_WEIGHTS: CategoryWeights = {
    tasks: 0.3,
    knowledge: 0.2,
    skills: 0.2,
    abilities: 0.15,
    technologies: 0.15
  };
