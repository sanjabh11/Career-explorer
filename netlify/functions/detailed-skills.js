const axios = require('axios');

exports.handler = async function(event, context) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Get query parameters
  const { occupationId } = event.queryStringParameters || {};
  
  if (!occupationId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Occupation ID is required' })
    };
  }

  try {
    // Get O*NET credentials from environment variables
    const username = process.env.ONET_USERNAME;
    const password = process.env.ONET_PASSWORD;
    
    // Check if we have valid credentials
    if (!username || !password) {
      console.log('O*NET credentials not found, returning mock data');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(generateMockDetailedSkills(occupationId))
      };
    }

    // Make request to O*NET API
    const response = await axios.get(
      `https://services.onetcenter.org/ws/online/occupations/${occupationId}/summary/skills`,
      {
        auth: {
          username,
          password
        },
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    // Transform the O*NET data to include more detailed information
    const detailedSkills = enhanceOnetSkillsData(response.data);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(detailedSkills)
    };
  } catch (error) {
    console.log('Error fetching skills data from O*NET:', error.message);
    
    // Return mock data on error
    return {
      statusCode: 200, // Return 200 with mock data instead of error
      headers,
      body: JSON.stringify({
        error: error.message,
        mockData: true,
        ...generateMockDetailedSkills(occupationId)
      })
    };
  }
};

// Enhance O*NET skills data with additional information
function enhanceOnetSkillsData(onetData) {
  if (!onetData || !onetData.element || !Array.isArray(onetData.element)) {
    return { skills: [] };
  }

  const skills = onetData.element.map(skill => {
    // Calculate automation impact based on skill type and level
    const automationImpact = calculateAutomationImpact(skill);
    
    return {
      id: skill.id,
      name: skill.name,
      description: skill.description || '',
      category: skill.category || 'General',
      required_level: Math.round((skill.level?.value || 0) * 5), // Convert to 0-5 scale
      importance: Math.round((skill.importance?.value || 0) * 100), // Convert to percentage
      automation_impact: automationImpact,
      future_relevance: calculateFutureRelevance(skill, automationImpact),
      proficiency_criteria: generateProficiencyCriteria(skill),
      related_skills: generateRelatedSkills(skill)
    };
  });

  return {
    occupation_id: onetData.occupation_code || '',
    occupation_title: onetData.occupation_title || '',
    skills: skills,
    skill_categories: extractCategories(skills),
    last_updated: new Date().toISOString()
  };
}

// Calculate automation impact based on skill characteristics
function calculateAutomationImpact(skill) {
  // This is a simplified model - in a real implementation, this would be more sophisticated
  const skillName = skill.name.toLowerCase();
  const skillDescription = (skill.description || '').toLowerCase();
  
  // Skills that are generally more resistant to automation
  const resistantKeywords = [
    'creativity', 'innovation', 'judgment', 'decision', 'complex', 'social', 
    'emotional', 'interpersonal', 'leadership', 'negotiation', 'persuasion'
  ];
  
  // Skills that are generally more susceptible to automation
  const susceptibleKeywords = [
    'routine', 'repetitive', 'calculation', 'data entry', 'processing', 
    'monitoring', 'recording', 'sorting', 'filing', 'basic'
  ];
  
  // Check for resistant keywords
  const resistantScore = resistantKeywords.reduce((score, keyword) => {
    if (skillName.includes(keyword) || skillDescription.includes(keyword)) {
      return score + 1;
    }
    return score;
  }, 0);
  
  // Check for susceptible keywords
  const susceptibleScore = susceptibleKeywords.reduce((score, keyword) => {
    if (skillName.includes(keyword) || skillDescription.includes(keyword)) {
      return score + 1;
    }
    return score;
  }, 0);
  
  // Calculate impact score (0-100 scale, higher means more impact from automation)
  let impactScore = 50; // Default middle value
  
  if (resistantScore > 0 || susceptibleScore > 0) {
    // Adjust based on keyword matches
    impactScore = 50 + (susceptibleScore * 10) - (resistantScore * 10);
  }
  
  // Ensure within bounds
  impactScore = Math.max(10, Math.min(90, impactScore));
  
  // Determine impact category
  let impactCategory;
  if (impactScore < 30) {
    impactCategory = 'Low';
  } else if (impactScore < 70) {
    impactCategory = 'Medium';
  } else {
    impactCategory = 'High';
  }
  
  return {
    score: impactScore,
    category: impactCategory,
    description: getAutomationImpactDescription(impactCategory)
  };
}

// Get description for automation impact category
function getAutomationImpactDescription(category) {
  switch (category) {
    case 'Low':
      return 'This skill is relatively resistant to automation and will likely remain valuable in the future.';
    case 'Medium':
      return 'This skill may be partially automated, but human expertise will still be needed for complex applications.';
    case 'High':
      return 'This skill is highly susceptible to automation and may be significantly transformed by technology.';
    default:
      return 'Impact of automation on this skill is uncertain.';
  }
}

// Calculate future relevance based on skill and automation impact
function calculateFutureRelevance(skill, automationImpact) {
  // Base future relevance on inverse of automation impact
  const baseRelevance = 100 - automationImpact.score;
  
  // Adjust based on importance
  const importanceAdjustment = ((skill.importance?.value || 0.5) - 0.5) * 20;
  
  // Calculate final relevance score
  let relevanceScore = baseRelevance + importanceAdjustment;
  
  // Ensure within bounds
  relevanceScore = Math.max(10, Math.min(100, relevanceScore));
  
  // Determine trend
  let trend;
  if (relevanceScore > 70) {
    trend = 'Increasing';
  } else if (relevanceScore > 40) {
    trend = 'Stable';
  } else {
    trend = 'Decreasing';
  }
  
  return {
    score: Math.round(relevanceScore),
    trend: trend,
    horizon: '5-10 years'
  };
}

// Generate proficiency criteria for a skill
function generateProficiencyCriteria(skill) {
  // This would ideally come from a more detailed data source
  // For now, we'll generate based on the skill name and level
  
  return [
    {
      level: 1,
      description: 'Basic understanding',
      examples: ['Understands basic concepts', 'Can perform simple tasks with guidance'],
      assessment_criteria: ['Can define key terms', 'Recognizes when the skill should be applied']
    },
    {
      level: 3,
      description: 'Intermediate proficiency',
      examples: ['Can apply the skill independently in standard situations', 'Understands underlying principles'],
      assessment_criteria: ['Can solve routine problems', 'Requires minimal supervision']
    },
    {
      level: 5,
      description: 'Expert proficiency',
      examples: ['Can apply the skill in complex and novel situations', 'Can teach others'],
      assessment_criteria: ['Develops innovative approaches', 'Recognized as a resource by peers']
    }
  ];
}

// Generate related skills
function generateRelatedSkills(skill) {
  // In a real implementation, this would come from a skills relationship database
  // For now, we'll return empty array as this would be populated with real data
  return [];
}

// Extract unique categories from skills
function extractCategories(skills) {
  const categories = new Set();
  skills.forEach(skill => {
    if (skill.category) {
      categories.add(skill.category);
    }
  });
  return Array.from(categories);
}

// Generate mock detailed skills data
function generateMockDetailedSkills(occupationId) {
  // Extract occupation code parts for more realistic mock data
  const codeParts = occupationId.split('-');
  const majorGroup = codeParts[0] || '00';
  
  // Determine occupation type based on major group
  let occupationType = 'General';
  let occupationTitle = 'Occupation';
  
  switch (majorGroup) {
    case '11':
      occupationType = 'Management';
      occupationTitle = 'Manager';
      break;
    case '13':
      occupationType = 'Business and Financial';
      occupationTitle = 'Business Analyst';
      break;
    case '15':
      occupationType = 'Computer and Mathematical';
      occupationTitle = 'Software Developer';
      break;
    case '17':
      occupationType = 'Architecture and Engineering';
      occupationTitle = 'Engineer';
      break;
    case '19':
      occupationType = 'Life, Physical, and Social Science';
      occupationTitle = 'Scientist';
      break;
    case '21':
      occupationType = 'Community and Social Service';
      occupationTitle = 'Counselor';
      break;
    case '25':
      occupationType = 'Education, Training, and Library';
      occupationTitle = 'Teacher';
      break;
    case '29':
      occupationType = 'Healthcare Practitioners';
      occupationTitle = 'Healthcare Professional';
      break;
    case '41':
      occupationType = 'Sales';
      occupationTitle = 'Sales Representative';
      break;
    case '43':
      occupationType = 'Office and Administrative Support';
      occupationTitle = 'Administrative Assistant';
      break;
    default:
      occupationType = 'General';
      occupationTitle = 'Professional';
  }
  
  // Generate skills based on occupation type
  const skills = generateSkillsForOccupationType(occupationType, occupationTitle);
  
  return {
    occupation_id: occupationId,
    occupation_title: `${occupationTitle} (${occupationId})`,
    skills: skills,
    skill_categories: extractCategories(skills),
    last_updated: new Date().toISOString(),
    mockData: true
  };
}

// Generate skills for a specific occupation type
function generateSkillsForOccupationType(occupationType, occupationTitle) {
  // Base skills that apply to most occupations
  const baseSkills = [
    {
      id: 'skill_1',
      name: 'Critical Thinking',
      description: 'Using logic and reasoning to identify the strengths and weaknesses of alternative solutions, conclusions, or approaches to problems.',
      category: 'Cognitive Skills',
      required_level: 4,
      importance: 85,
      automation_impact: {
        score: 25,
        category: 'Low',
        description: 'This skill is relatively resistant to automation and will likely remain valuable in the future.'
      },
      future_relevance: {
        score: 90,
        trend: 'Increasing',
        horizon: '5-10 years'
      }
    },
    {
      id: 'skill_2',
      name: 'Active Learning',
      description: 'Understanding the implications of new information for both current and future problem-solving and decision-making.',
      category: 'Cognitive Skills',
      required_level: 4,
      importance: 80,
      automation_impact: {
        score: 30,
        category: 'Low',
        description: 'This skill is relatively resistant to automation and will likely remain valuable in the future.'
      },
      future_relevance: {
        score: 85,
        trend: 'Increasing',
        horizon: '5-10 years'
      }
    },
    {
      id: 'skill_3',
      name: 'Communication',
      description: 'Talking to others to convey information effectively and listening to understand the points being made.',
      category: 'Social Skills',
      required_level: 4,
      importance: 90,
      automation_impact: {
        score: 20,
        category: 'Low',
        description: 'This skill is relatively resistant to automation and will likely remain valuable in the future.'
      },
      future_relevance: {
        score: 95,
        trend: 'Increasing',
        horizon: '5-10 years'
      }
    }
  ];
  
  // Add occupation-specific skills
  let occupationSkills = [];
  
  switch (occupationType) {
    case 'Computer and Mathematical':
      occupationSkills = [
        {
          id: 'skill_tech_1',
          name: 'Programming',
          description: 'Writing computer programs for various purposes.',
          category: 'Technical Skills',
          required_level: 5,
          importance: 95,
          automation_impact: {
            score: 45,
            category: 'Medium',
            description: 'This skill may be partially automated, but human expertise will still be needed for complex applications.'
          },
          future_relevance: {
            score: 80,
            trend: 'Stable',
            horizon: '5-10 years'
          }
        },
        {
          id: 'skill_tech_2',
          name: 'Complex Problem Solving',
          description: 'Identifying complex problems and reviewing related information to develop and evaluate options and implement solutions.',
          category: 'Technical Skills',
          required_level: 5,
          importance: 90,
          automation_impact: {
            score: 30,
            category: 'Low',
            description: 'This skill is relatively resistant to automation and will likely remain valuable in the future.'
          },
          future_relevance: {
            score: 95,
            trend: 'Increasing',
            horizon: '5-10 years'
          }
        },
        {
          id: 'skill_tech_3',
          name: 'Systems Analysis',
          description: 'Determining how a system should work and how changes in conditions, operations, and the environment will affect outcomes.',
          category: 'Technical Skills',
          required_level: 4,
          importance: 85,
          automation_impact: {
            score: 40,
            category: 'Medium',
            description: 'This skill may be partially automated, but human expertise will still be needed for complex applications.'
          },
          future_relevance: {
            score: 85,
            trend: 'Stable',
            horizon: '5-10 years'
          }
        }
      ];
      break;
    case 'Management':
      occupationSkills = [
        {
          id: 'skill_mgmt_1',
          name: 'Leadership',
          description: 'Guiding and motivating individuals or groups toward achieving goals.',
          category: 'Management Skills',
          required_level: 5,
          importance: 95,
          automation_impact: {
            score: 15,
            category: 'Low',
            description: 'This skill is relatively resistant to automation and will likely remain valuable in the future.'
          },
          future_relevance: {
            score: 95,
            trend: 'Increasing',
            horizon: '5-10 years'
          }
        },
        {
          id: 'skill_mgmt_2',
          name: 'Decision Making',
          description: 'Considering the relative costs and benefits of potential actions to choose the most appropriate one.',
          category: 'Management Skills',
          required_level: 5,
          importance: 90,
          automation_impact: {
            score: 35,
            category: 'Medium',
            description: 'This skill may be partially automated, but human expertise will still be needed for complex applications.'
          },
          future_relevance: {
            score: 85,
            trend: 'Stable',
            horizon: '5-10 years'
          }
        },
        {
          id: 'skill_mgmt_3',
          name: 'Strategic Planning',
          description: 'Developing specific goals and plans to prioritize, organize, and accomplish work.',
          category: 'Management Skills',
          required_level: 4,
          importance: 85,
          automation_impact: {
            score: 40,
            category: 'Medium',
            description: 'This skill may be partially automated, but human expertise will still be needed for complex applications.'
          },
          future_relevance: {
            score: 80,
            trend: 'Stable',
            horizon: '5-10 years'
          }
        }
      ];
      break;
    case 'Office and Administrative Support':
      occupationSkills = [
        {
          id: 'skill_admin_1',
          name: 'Information Organization',
          description: 'Finding ways to structure or classify multiple pieces of information.',
          category: 'Administrative Skills',
          required_level: 4,
          importance: 85,
          automation_impact: {
            score: 75,
            category: 'High',
            description: 'This skill is highly susceptible to automation and may be significantly transformed by technology.'
          },
          future_relevance: {
            score: 40,
            trend: 'Decreasing',
            horizon: '5-10 years'
          }
        },
        {
          id: 'skill_admin_2',
          name: 'Time Management',
          description: 'Managing one\'s own time and the time of others.',
          category: 'Administrative Skills',
          required_level: 4,
          importance: 80,
          automation_impact: {
            score: 50,
            category: 'Medium',
            description: 'This skill may be partially automated, but human expertise will still be needed for complex applications.'
          },
          future_relevance: {
            score: 65,
            trend: 'Stable',
            horizon: '5-10 years'
          }
        },
        {
          id: 'skill_admin_3',
          name: 'Service Orientation',
          description: 'Actively looking for ways to help people.',
          category: 'Social Skills',
          required_level: 4,
          importance: 75,
          automation_impact: {
            score: 35,
            category: 'Medium',
            description: 'This skill may be partially automated, but human expertise will still be needed for complex applications.'
          },
          future_relevance: {
            score: 75,
            trend: 'Stable',
            horizon: '5-10 years'
          }
        }
      ];
      break;
    default:
      // For other occupation types, add generic skills
      occupationSkills = [
        {
          id: 'skill_gen_1',
          name: 'Problem Solving',
          description: 'Identifying problems and reviewing related information to develop and evaluate options and implement solutions.',
          category: 'General Skills',
          required_level: 4,
          importance: 85,
          automation_impact: {
            score: 40,
            category: 'Medium',
            description: 'This skill may be partially automated, but human expertise will still be needed for complex applications.'
          },
          future_relevance: {
            score: 80,
            trend: 'Stable',
            horizon: '5-10 years'
          }
        },
        {
          id: 'skill_gen_2',
          name: 'Adaptability',
          description: 'Adjusting actions in relation to others\' actions or changing conditions.',
          category: 'General Skills',
          required_level: 4,
          importance: 80,
          automation_impact: {
            score: 25,
            category: 'Low',
            description: 'This skill is relatively resistant to automation and will likely remain valuable in the future.'
          },
          future_relevance: {
            score: 90,
            trend: 'Increasing',
            horizon: '5-10 years'
          }
        },
        {
          id: 'skill_gen_3',
          name: 'Attention to Detail',
          description: 'Being careful about detail and thorough in completing work tasks.',
          category: 'General Skills',
          required_level: 4,
          importance: 75,
          automation_impact: {
            score: 60,
            category: 'Medium',
            description: 'This skill may be partially automated, but human expertise will still be needed for complex applications.'
          },
          future_relevance: {
            score: 65,
            trend: 'Stable',
            horizon: '5-10 years'
          }
        }
      ];
  }
  
  // Add proficiency criteria to all skills
  const allSkills = [...baseSkills, ...occupationSkills];
  allSkills.forEach(skill => {
    skill.proficiency_criteria = [
      {
        level: 1,
        description: 'Basic understanding',
        examples: ['Understands basic concepts', 'Can perform simple tasks with guidance'],
        assessment_criteria: ['Can define key terms', 'Recognizes when the skill should be applied']
      },
      {
        level: 3,
        description: 'Intermediate proficiency',
        examples: ['Can apply the skill independently in standard situations', 'Understands underlying principles'],
        assessment_criteria: ['Can solve routine problems', 'Requires minimal supervision']
      },
      {
        level: 5,
        description: 'Expert proficiency',
        examples: ['Can apply the skill in complex and novel situations', 'Can teach others'],
        assessment_criteria: ['Develops innovative approaches', 'Recognized as a resource by peers']
      }
    ];
    
    // Add related skills
    skill.related_skills = generateRelatedSkillsForMock(skill.id, allSkills);
  });
  
  return allSkills;
}

// Generate related skills for mock data
function generateRelatedSkillsForMock(skillId, allSkills) {
  // Select 2-3 random skills that aren't the current skill
  const otherSkills = allSkills.filter(s => s.id !== skillId);
  const numRelated = Math.floor(Math.random() * 2) + 2; // 2-3 related skills
  
  // Shuffle and take the first numRelated
  const shuffled = otherSkills.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, numRelated);
  
  // Format as related skills
  return selected.map(s => ({
    id: s.id,
    name: s.name,
    relationship_strength: Math.floor(Math.random() * 30) + 70, // 70-100% relationship strength
    relationship_type: Math.random() > 0.5 ? 'complementary' : 'prerequisite'
  }));
}
