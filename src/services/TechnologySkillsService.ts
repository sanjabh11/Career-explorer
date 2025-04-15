// src/services/TechnologySkillsService.ts

import axios from 'axios';
import { HotTechnology, TechnologyTrend, TechnologyTrendData } from '@/types/technologySkills';

const API_BASE_URL = '/.netlify/functions/onet-proxy';

/**
 * Get hot technologies
 * @param industryCode Optional industry code to filter technologies
 * @returns List of hot technologies
 */
export const getHotTechnologies = async (industryCode?: string): Promise<HotTechnology[]> => {
  try {
    // In a real implementation, this would call the O*NET API
    // For now, return mock data
    let technologies = mockHotTechnologies;
    
    if (industryCode) {
      // Filter by industry if provided
      technologies = technologies.filter(tech => 
        tech.relatedOccupations.some(occ => occ.code.startsWith(industryCode))
      );
    }
    
    return technologies;
  } catch (error) {
    console.error('Error fetching hot technologies:', error);
    throw error;
  }
};

/**
 * Get technology trends
 * @param timespan Number of years to include in trend data
 * @returns Technology trend data
 */
export const getTechnologyTrends = async (timespan: number = 5): Promise<TechnologyTrendData> => {
  try {
    // In a real implementation, this would call the O*NET API
    // For now, return mock data
    const currentYear = new Date().getFullYear();
    const yearlyData = Array.from({ length: timespan }, (_, i) => {
      const year = currentYear - timespan + i + 1;
      return {
        year,
        technologies: mockTechnologyTrends.map(trend => {
          // Calculate adoption rate based on year and growth rate
          const yearsSinceIntro = year - trend.yearIntroduced;
          let adoptionRate = 0;
          
          if (yearsSinceIntro >= 0) {
            // Simple S-curve model for technology adoption
            adoptionRate = Math.min(
              trend.adoptionRate * (1 - Math.exp(-trend.growthRate * yearsSinceIntro / 10)),
              trend.adoptionRate
            );
          }
          
          return {
            id: trend.id,
            adoptionRate
          };
        })
      };
    });
    
    return {
      trends: mockTechnologyTrends,
      yearlyData
    };
  } catch (error) {
    console.error('Error fetching technology trends:', error);
    throw error;
  }
};

// Mock data
const mockHotTechnologies: HotTechnology[] = [
  {
    id: 'tech-1',
    name: 'Machine Learning Frameworks',
    category: 'Artificial Intelligence',
    description: 'Software libraries and tools for developing machine learning models',
    adoptionRate: 75,
    growthRate: 15,
    relatedOccupations: [
      {
        code: '15-1255.00',
        title: 'Web and Digital Interface Designers',
        relevance: 85
      },
      {
        code: '15-1252.00',
        title: 'Software Developers',
        relevance: 90
      },
      {
        code: '15-2051.00',
        title: 'Data Scientists',
        relevance: 95
      }
    ],
    skills: [
      {
        id: 'skill-1',
        name: 'Programming',
        importance: 90
      },
      {
        id: 'skill-2',
        name: 'Mathematics',
        importance: 85
      },
      {
        id: 'skill-3',
        name: 'Critical Thinking',
        importance: 80
      }
    ]
  },
  {
    id: 'tech-2',
    name: 'Cloud Computing Platforms',
    category: 'Cloud Infrastructure',
    description: 'Services for computing, storage, and networking in the cloud',
    adoptionRate: 85,
    growthRate: 10,
    relatedOccupations: [
      {
        code: '15-1244.00',
        title: 'Network and Computer Systems Administrators',
        relevance: 90
      },
      {
        code: '15-1252.00',
        title: 'Software Developers',
        relevance: 85
      },
      {
        code: '15-1299.08',
        title: 'Computer Systems Engineers/Architects',
        relevance: 95
      }
    ],
    skills: [
      {
        id: 'skill-4',
        name: 'Systems Analysis',
        importance: 90
      },
      {
        id: 'skill-5',
        name: 'Network Management',
        importance: 85
      },
      {
        id: 'skill-1',
        name: 'Programming',
        importance: 80
      }
    ]
  },
  {
    id: 'tech-3',
    name: 'DevOps Tools',
    category: 'Software Development',
    description: 'Tools for automating software development, testing, and deployment',
    adoptionRate: 80,
    growthRate: 12,
    relatedOccupations: [
      {
        code: '15-1252.00',
        title: 'Software Developers',
        relevance: 90
      },
      {
        code: '15-1244.00',
        title: 'Network and Computer Systems Administrators',
        relevance: 85
      },
      {
        code: '15-1299.08',
        title: 'Computer Systems Engineers/Architects',
        relevance: 90
      }
    ],
    skills: [
      {
        id: 'skill-1',
        name: 'Programming',
        importance: 90
      },
      {
        id: 'skill-6',
        name: 'Systems Evaluation',
        importance: 85
      },
      {
        id: 'skill-7',
        name: 'Quality Control Analysis',
        importance: 80
      }
    ]
  },
  {
    id: 'tech-4',
    name: 'Blockchain Platforms',
    category: 'Distributed Systems',
    description: 'Platforms for developing and deploying blockchain applications',
    adoptionRate: 60,
    growthRate: 18,
    relatedOccupations: [
      {
        code: '15-1252.00',
        title: 'Software Developers',
        relevance: 85
      },
      {
        code: '15-1299.08',
        title: 'Computer Systems Engineers/Architects',
        relevance: 80
      },
      {
        code: '13-2098.00',
        title: 'Financial and Investment Analysts',
        relevance: 75
      }
    ],
    skills: [
      {
        id: 'skill-1',
        name: 'Programming',
        importance: 90
      },
      {
        id: 'skill-8',
        name: 'Cryptography',
        importance: 85
      },
      {
        id: 'skill-9',
        name: 'Distributed Systems',
        importance: 90
      }
    ]
  },
  {
    id: 'tech-5',
    name: 'Augmented Reality Development Kits',
    category: 'Extended Reality',
    description: 'Tools for developing augmented reality applications',
    adoptionRate: 55,
    growthRate: 20,
    relatedOccupations: [
      {
        code: '15-1252.00',
        title: 'Software Developers',
        relevance: 90
      },
      {
        code: '15-1255.00',
        title: 'Web and Digital Interface Designers',
        relevance: 85
      },
      {
        code: '27-1024.00',
        title: 'Graphic Designers',
        relevance: 80
      }
    ],
    skills: [
      {
        id: 'skill-1',
        name: 'Programming',
        importance: 90
      },
      {
        id: 'skill-10',
        name: '3D Modeling',
        importance: 85
      },
      {
        id: 'skill-11',
        name: 'User Experience Design',
        importance: 90
      }
    ]
  }
];

const mockTechnologyTrends: TechnologyTrend[] = [
  {
    id: 'trend-1',
    name: 'Machine Learning',
    category: 'Artificial Intelligence',
    adoptionRate: 75,
    growthRate: 15,
    yearIntroduced: 2010,
    maturityLevel: 'growing',
    industries: [
      {
        id: '51',
        name: 'Information',
        adoptionRate: 85
      },
      {
        id: '52',
        name: 'Finance and Insurance',
        adoptionRate: 80
      },
      {
        id: '62',
        name: 'Health Care and Social Assistance',
        adoptionRate: 70
      }
    ]
  },
  {
    id: 'trend-2',
    name: 'Cloud Computing',
    category: 'Infrastructure',
    adoptionRate: 85,
    growthRate: 10,
    yearIntroduced: 2008,
    maturityLevel: 'mature',
    industries: [
      {
        id: '51',
        name: 'Information',
        adoptionRate: 90
      },
      {
        id: '52',
        name: 'Finance and Insurance',
        adoptionRate: 85
      },
      {
        id: '54',
        name: 'Professional, Scientific, and Technical Services',
        adoptionRate: 80
      }
    ]
  },
  {
    id: 'trend-3',
    name: 'DevOps',
    category: 'Software Development',
    adoptionRate: 80,
    growthRate: 12,
    yearIntroduced: 2009,
    maturityLevel: 'mature',
    industries: [
      {
        id: '51',
        name: 'Information',
        adoptionRate: 90
      },
      {
        id: '54',
        name: 'Professional, Scientific, and Technical Services',
        adoptionRate: 85
      },
      {
        id: '52',
        name: 'Finance and Insurance',
        adoptionRate: 75
      }
    ]
  },
  {
    id: 'trend-4',
    name: 'Blockchain',
    category: 'Distributed Systems',
    adoptionRate: 60,
    growthRate: 18,
    yearIntroduced: 2015,
    maturityLevel: 'growing',
    industries: [
      {
        id: '52',
        name: 'Finance and Insurance',
        adoptionRate: 75
      },
      {
        id: '51',
        name: 'Information',
        adoptionRate: 65
      },
      {
        id: '54',
        name: 'Professional, Scientific, and Technical Services',
        adoptionRate: 60
      }
    ]
  },
  {
    id: 'trend-5',
    name: 'Augmented Reality',
    category: 'Extended Reality',
    adoptionRate: 55,
    growthRate: 20,
    yearIntroduced: 2017,
    maturityLevel: 'emerging',
    industries: [
      {
        id: '71',
        name: 'Arts, Entertainment, and Recreation',
        adoptionRate: 70
      },
      {
        id: '51',
        name: 'Information',
        adoptionRate: 65
      },
      {
        id: '44-45',
        name: 'Retail Trade',
        adoptionRate: 55
      }
    ]
  }
];
