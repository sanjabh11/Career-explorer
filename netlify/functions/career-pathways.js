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
        body: JSON.stringify(generateMockCareerPathways(occupationId))
      };
    }

    // Make request to O*NET API for related occupations
    const response = await axios.get(
      `https://services.onetcenter.org/ws/online/occupations/${occupationId}/summary/related_occupations`,
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

    // Get the current occupation details
    const currentOccupationResponse = await axios.get(
      `https://services.onetcenter.org/ws/online/occupations/${occupationId}`,
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

    // Transform the O*NET data to create career pathways
    const careerPathways = await createCareerPathways(
      currentOccupationResponse.data,
      response.data
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(careerPathways)
    };
  } catch (error) {
    console.log('Error fetching career pathways data from O*NET:', error.message);

    // Return mock data on error
    return {
      statusCode: 200, // Return 200 with mock data instead of error
      headers,
      body: JSON.stringify({
        error: error.message,
        mockData: true,
        ...generateMockCareerPathways(occupationId)
      })
    };
  }
};

// Create career pathways from O*NET data
async function createCareerPathways(currentOccupation, relatedData) {
  if (!relatedData || !relatedData.occupation || !currentOccupation) {
    return { pathways: [] };
  }

  try {
    // Get current occupation details
    const current = {
      id: currentOccupation.code,
      title: currentOccupation.title,
      description: currentOccupation.description,
      education: await getEducationLevel(currentOccupation),
      experience: await getExperienceLevel(currentOccupation),
      salary: await getSalaryInfo(currentOccupation),
      skills: [], // Will be populated later
      level: 'current'
    };

    // Get skills for current occupation
    try {
      const username = process.env.ONET_USERNAME;
      const password = process.env.ONET_PASSWORD;

      if (username && password) {
        const skillsResponse = await axios.get(
          `https://services.onetcenter.org/ws/online/occupations/${current.id}/skills`,
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

        if (skillsResponse.data && skillsResponse.data.skill) {
          current.skills = skillsResponse.data.skill.slice(0, 10).map(skill => ({
            name: skill.element_name,
            level: Math.ceil((parseFloat(skill.scale_id) || 0) * 5) // Convert to 1-5 scale
          }));
        }
      }
    } catch (error) {
      console.log('Error fetching skills for current occupation:', error.message);
      // Continue with empty skills array
    }

    // Process related occupations
    const relatedOccupationsPromises = relatedData.occupation.map(async (occupation) => {
      // Determine if this is a higher level position (advancement)
      const isAdvancement = isHigherLevel(current, occupation);

      // Get detailed information for this occupation
      let occupationDetails;
      try {
        const occupationDetailsResponse = await axios.get(
          occupation.href,
          {
            auth: {
              username: process.env.ONET_USERNAME,
              password: process.env.ONET_PASSWORD
            },
            headers: {
              'Accept': 'application/json'
            }
          }
        );
        occupationDetails = occupationDetailsResponse.data;
      } catch (error) {
        console.log(`Error fetching details for occupation ${occupation.code}:`, error.message);
        occupationDetails = {
          code: occupation.code,
          title: occupation.title,
          description: ''
        };
      }

      const processedOccupation = {
        id: occupation.code,
        title: occupation.title,
        description: occupationDetails.description || '',
        education: await getEducationLevel(occupationDetails),
        experience: await getExperienceLevel(occupationDetails),
        salary: await getSalaryInfo(occupationDetails),
        skills: [], // Will be populated for advancements
        level: isAdvancement ? 'advancement' : 'lateral',
        similarity: occupation.relevance_score || 0,
        advancement_criteria: null // Will be populated for advancements
      };

      // Get skills for advancement occupations
      if (isAdvancement) {
        try {
          const username = process.env.ONET_USERNAME;
          const password = process.env.ONET_PASSWORD;

          if (username && password) {
            const skillsResponse = await axios.get(
              `https://services.onetcenter.org/ws/online/occupations/${processedOccupation.id}/skills`,
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

            if (skillsResponse.data && skillsResponse.data.skill) {
              processedOccupation.skills = skillsResponse.data.skill.slice(0, 10).map(skill => ({
                name: skill.element_name,
                level: Math.ceil((parseFloat(skill.scale_id) || 0) * 5) // Convert to 1-5 scale
              }));
            }
          }
        } catch (error) {
          console.log(`Error fetching skills for occupation ${processedOccupation.id}:`, error.message);
          // Continue with empty skills array
        }

        // Generate advancement criteria
        processedOccupation.advancement_criteria = await generateAdvancementCriteria(current, processedOccupation);
      }

      return processedOccupation;
    });

    // Wait for all related occupations to be processed
    const relatedOccupations = await Promise.all(relatedOccupationsPromises);

    // Sort by advancement level and similarity
    const sortedOccupations = relatedOccupations.sort((a, b) => {
      // First sort by level (advancements first)
      if (a.level === 'advancement' && b.level !== 'advancement') return -1;
      if (a.level !== 'advancement' && b.level === 'advancement') return 1;

      // Then by similarity
      return b.similarity - a.similarity;
    });

    // Get only the top advancements (vertical progression)
    const advancements = sortedOccupations
      .filter(occ => occ.level === 'advancement')
      .slice(0, 5);

    return {
      current_occupation: current,
      advancement_pathways: advancements,
      related_occupations: sortedOccupations.filter(occ => occ.level !== 'advancement').slice(0, 5),
      last_updated: new Date().toISOString()
    };
  } catch (error) {
    console.log('Error creating career pathways:', error.message);
    throw error;
  }
}

// Determine if an occupation is likely a higher level position
function isHigherLevel(current, related) {
  // Use a scoring system to determine if this is an advancement
  let advancementScore = 0;

  // Check if the title suggests advancement
  const advancementKeywords = [
    'senior', 'lead', 'manager', 'director', 'supervisor', 'chief', 'head',
    'principal', 'executive', 'architect', 'administrator', 'president', 'officer',
    'specialist', 'expert', 'advanced', 'master', 'coordinator', 'leader'
  ];

  // Handle different data formats
  const relatedTitle = typeof related.title === 'string' ? related.title.toLowerCase() :
                      (Array.isArray(related.title) ? related.title[0].toLowerCase() : '');
  const currentTitle = typeof current.title === 'string' ? current.title.toLowerCase() :
                      (Array.isArray(current.title) ? current.title[0].toLowerCase() : '');

  // Check for advancement keywords
  for (const keyword of advancementKeywords) {
    if (relatedTitle.includes(keyword) && !currentTitle.includes(keyword)) {
      advancementScore += 3;
      break;
    }
  }

  // Check if the related title contains the current title (suggesting progression)
  // e.g., "Software Developer" -> "Senior Software Developer"
  if (relatedTitle.includes(currentTitle.replace(/senior|lead|manager|director|supervisor|chief|head/g, '').trim())) {
    advancementScore += 2;
  }

  // Check if the education requirements are higher
  const currentEducationLevel = getEducationLevelValue(current.education);
  const relatedEducationLevel = getEducationLevelValue(related.education);

  if (relatedEducationLevel > currentEducationLevel) {
    advancementScore += 2;
  }

  // Check if experience requirements are higher
  const currentExpYears = parseExperienceYears(current.experience);
  const relatedExpYears = parseExperienceYears(related.experience);

  if (relatedExpYears > currentExpYears) {
    advancementScore += 2;
  }

  // Check salary if available
  if (current.salary && related.salary) {
    // Calculate percentage increase
    const salaryIncrease = (related.salary.median - current.salary.median) / current.salary.median;

    if (salaryIncrease > 0.3) { // More than 30% increase
      advancementScore += 3;
    } else if (salaryIncrease > 0.15) { // 15-30% increase
      advancementScore += 2;
    } else if (salaryIncrease > 0.05) { // 5-15% increase
      advancementScore += 1;
    }
  }

  // Check job zone if available
  if (current.job_zone && related.job_zone) {
    const currentJobZone = parseInt(current.job_zone.value || current.job_zone) || 0;
    const relatedJobZone = parseInt(related.job_zone.value || related.job_zone) || 0;

    if (relatedJobZone > currentJobZone) {
      advancementScore += 3; // Job zone is a strong indicator of advancement
    }
  }

  // Check similarity - too low similarity might indicate a different career path
  // rather than advancement
  const similarity = related.similarity || related.relevance_score || 0;
  if (similarity < 30) {
    advancementScore -= 2;
  }

  // Consider an occupation an advancement if it scores 3 or higher
  return advancementScore >= 3;
}

// Get education level from occupation data
async function getEducationLevel(occupation) {
  try {
    // Get O*NET credentials
    const username = process.env.ONET_USERNAME;
    const password = process.env.ONET_PASSWORD;

    if (!username || !password) {
      return getDefaultEducationLevel(occupation);
    }

    // Fetch job zone data which contains education information
    const response = await axios.get(
      `https://services.onetcenter.org/ws/online/occupations/${occupation.code}/summary`,
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

    // Extract education from job zone
    if (response.data && response.data.job_zone) {
      const jobZone = parseInt(response.data.job_zone.value) || 0;

      // Map job zone to education level
      switch (jobZone) {
        case 1: return 'No formal education';
        case 2: return 'High school diploma';
        case 3: return 'Associate\'s degree';
        case 4: return 'Bachelor\'s degree';
        case 5: return 'Master\'s degree or higher';
        default: return 'Bachelor\'s degree';
      }
    }

    return getDefaultEducationLevel(occupation);
  } catch (error) {
    console.log('Error fetching education data:', error.message);
    return getDefaultEducationLevel(occupation);
  }
}

// Get default education level based on occupation code
function getDefaultEducationLevel(occupation) {
  const code = occupation.code || '';
  const firstDigit = parseInt(code.charAt(0)) || 0;

  // Higher first digit often correlates with higher education requirements
  if (firstDigit >= 2) {
    return 'Bachelor\'s degree';
  } else if (firstDigit >= 1) {
    return 'Associate\'s degree';
  } else {
    return 'High school diploma';
  }
}

// Get experience level from occupation data
async function getExperienceLevel(occupation) {
  try {
    // Get O*NET credentials
    const username = process.env.ONET_USERNAME;
    const password = process.env.ONET_PASSWORD;

    if (!username || !password) {
      return getDefaultExperienceLevel(occupation);
    }

    // Fetch job zone data which contains experience information
    const response = await axios.get(
      `https://services.onetcenter.org/ws/online/occupations/${occupation.code}/summary`,
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

    // Extract experience from job zone
    if (response.data && response.data.job_zone) {
      const jobZone = parseInt(response.data.job_zone.value) || 0;

      // Map job zone to experience level
      switch (jobZone) {
        case 1: return 'Little or no experience';
        case 2: return 'Some experience (< 1 year)';
        case 3: return '1-5 years';
        case 4: return '5-8 years';
        case 5: return '8+ years';
        default: return '1-5 years';
      }
    }

    return getDefaultExperienceLevel(occupation);
  } catch (error) {
    console.log('Error fetching experience data:', error.message);
    return getDefaultExperienceLevel(occupation);
  }
}

// Get default experience level based on occupation code
function getDefaultExperienceLevel(occupation) {
  const code = occupation.code || '';
  const firstDigit = parseInt(code.charAt(0)) || 0;

  // Higher first digit often correlates with more experience
  if (firstDigit >= 2) {
    return '5+ years';
  } else if (firstDigit >= 1) {
    return '1-5 years';
  } else {
    return 'Less than 1 year';
  }
}

// Get salary information from occupation data
async function getSalaryInfo(occupation) {
  try {
    // Get O*NET credentials
    const username = process.env.ONET_USERNAME;
    const password = process.env.ONET_PASSWORD;

    if (!username || !password) {
      return getDefaultSalaryInfo(occupation);
    }

    // Fetch wage data
    const response = await axios.get(
      `https://services.onetcenter.org/ws/online/occupations/${occupation.code}/summary/wages`,
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

    // Extract salary information
    if (response.data && response.data.annual) {
      const median = parseInt(response.data.annual.median.replace(/[^0-9]/g, '')) || 0;
      const low = parseInt(response.data.annual.percentile_10.replace(/[^0-9]/g, '')) || 0;
      const high = parseInt(response.data.annual.percentile_90.replace(/[^0-9]/g, '')) || 0;

      return {
        median: median,
        range: {
          low: low,
          high: high
        }
      };
    }

    return getDefaultSalaryInfo(occupation);
  } catch (error) {
    console.log('Error fetching salary data:', error.message);
    return getDefaultSalaryInfo(occupation);
  }
}

// Get default salary information based on occupation code
function getDefaultSalaryInfo(occupation) {
  const code = occupation.code || '';
  const firstDigit = parseInt(code.charAt(0)) || 0;

  // Higher first digit often correlates with higher salary
  const baseMedian = 40000 + (firstDigit * 10000);

  return {
    median: baseMedian,
    range: {
      low: Math.round(baseMedian * 0.8),
      high: Math.round(baseMedian * 1.2)
    }
  };
}

// Convert education level to numeric value for comparison
function getEducationLevelValue(educationLevel) {
  const levels = {
    'Less than high school': 1,
    'High school diploma': 2,
    'Some college, no degree': 3,
    'Associate\'s degree': 4,
    'Bachelor\'s degree': 5,
    'Master\'s degree': 6,
    'Doctoral or professional degree': 7
  };

  return levels[educationLevel] || 0;
}

// Generate advancement criteria
async function generateAdvancementCriteria(current, advancement) {
  // Get O*NET credentials
  const username = process.env.ONET_USERNAME;
  const password = process.env.ONET_PASSWORD;

  // Calculate experience gap
  const currentExpYears = parseExperienceYears(current.experience);
  const requiredExpYears = parseExperienceYears(advancement.experience);
  const experienceGap = requiredExpYears > currentExpYears;

  // Default skills and certifications
  let skills = [
    {
      name: 'Leadership',
      current_level: 3,
      required_level: 4,
      gap: 1
    },
    {
      name: 'Strategic Planning',
      current_level: 2,
      required_level: 4,
      gap: 2
    },
    {
      name: 'Communication',
      current_level: 3,
      required_level: 4,
      gap: 1
    }
  ];

  let certifications = [
    {
      name: 'Project Management Professional (PMP)',
      required: true,
      has: false
    }
  ];

  // Try to get real skills data from O*NET
  if (username && password) {
    try {
      // Fetch skills for current occupation
      const currentSkillsResponse = await axios.get(
        `https://services.onetcenter.org/ws/online/occupations/${current.id}/skills`,
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

      // Fetch skills for advancement occupation
      const advancementSkillsResponse = await axios.get(
        `https://services.onetcenter.org/ws/online/occupations/${advancement.id}/skills`,
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

      if (currentSkillsResponse.data && advancementSkillsResponse.data) {
        const currentSkills = currentSkillsResponse.data.skill || [];
        const advancementSkills = advancementSkillsResponse.data.skill || [];

        // Map skills to our format and calculate gaps
        skills = advancementSkills.slice(0, 5).map(advSkill => {
          // Find matching skill in current occupation
          const currentSkill = currentSkills.find(cs => cs.element_id === advSkill.element_id);

          // Calculate current and required levels (scale 1-5)
          const requiredLevel = Math.ceil((parseFloat(advSkill.scale_id) || 0) * 5);
          const currentLevel = currentSkill ? Math.ceil((parseFloat(currentSkill.scale_id) || 0) * 5) : 0;
          const gap = Math.max(0, requiredLevel - currentLevel);

          return {
            name: advSkill.element_name,
            current_level: currentLevel,
            required_level: requiredLevel,
            gap: gap
          };
        });
      }

      // Try to get certifications data
      // Note: O*NET doesn't directly provide certification data, so we'll use a heuristic approach
      const advancementDetailsResponse = await axios.get(
        `https://services.onetcenter.org/ws/online/occupations/${advancement.id}`,
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

      if (advancementDetailsResponse.data && advancementDetailsResponse.data.description) {
        // Look for certification keywords in the description
        const description = advancementDetailsResponse.data.description.toLowerCase();
        const certKeywords = [
          'certification', 'certificate', 'license', 'credential', 'PMP', 'CPA', 'CFA',
          'CISSP', 'CISA', 'CISM', 'ITIL', 'Six Sigma', 'CCNA', 'MCSE', 'AWS', 'Azure'
        ];

        // Extract potential certifications
        const potentialCerts = [];
        certKeywords.forEach(keyword => {
          if (description.includes(keyword.toLowerCase())) {
            // Try to extract the full certification name
            const regex = new RegExp(`[\\w\\s]*(${keyword})[\\w\\s]*`, 'i');
            const match = description.match(regex);
            if (match && match[0]) {
              potentialCerts.push(match[0].trim());
            } else {
              potentialCerts.push(keyword);
            }
          }
        });

        // Use extracted certifications if found
        if (potentialCerts.length > 0) {
          certifications = potentialCerts.map(cert => ({
            name: cert,
            required: true,
            has: false
          }));
        }
      }
    } catch (error) {
      console.log('Error fetching skills or certifications data:', error.message);
      // Fall back to default skills and certifications
    }
  }

  return {
    education: {
      current: current.education,
      required: advancement.education,
      gap: current.education !== advancement.education
    },
    experience: {
      current: current.experience,
      required: advancement.experience,
      gap: experienceGap
    },
    skills: skills,
    certifications: certifications
  };
}

// Parse experience years from string
function parseExperienceYears(experienceStr) {
  const match = experienceStr.match(/(\d+)(?:-(\d+))?\s*\+?\s*years?/i);
  if (match) {
    return parseInt(match[1], 10);
  }
  return 0;
}

// Generate mock career pathways data
function generateMockCareerPathways(occupationId) {
  // Extract occupation code parts for more realistic mock data
  const codeParts = occupationId.split('-');
  const majorGroup = codeParts[0] || '00';

  // Determine occupation type based on major group
  let occupationType = 'General';
  let occupationTitle = 'Professional';

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

  // Generate career pathways based on occupation type
  const pathways = generatePathwaysForOccupationType(occupationType, occupationTitle, occupationId);

  return {
    current_occupation: pathways.current,
    advancement_pathways: pathways.advancements,
    related_occupations: pathways.related,
    last_updated: new Date().toISOString(),
    mockData: true
  };
}

// Generate career pathways for a specific occupation type
function generatePathwaysForOccupationType(occupationType, occupationTitle, occupationId) {
  // Current occupation
  const current = {
    id: occupationId,
    title: occupationTitle,
    description: `${occupationTitle}s perform various tasks related to ${occupationType.toLowerCase()}.`,
    education: 'Bachelor\'s degree',
    experience: '1-5 years',
    salary: {
      median: 65000,
      range: {
        low: 55000,
        high: 75000
      }
    },
    skills: [
      { name: 'Critical Thinking', level: 4 },
      { name: 'Active Learning', level: 3 },
      { name: 'Communication', level: 4 }
    ],
    level: 'current'
  };

  // Generate advancement pathways based on occupation type
  let advancements = [];
  let related = [];

  switch (occupationType) {
    case 'Computer and Mathematical':
      advancements = [
        {
          id: '15-1252.00',
          title: 'Senior Software Developer',
          description: 'Lead software development projects and mentor junior developers.',
          education: 'Bachelor\'s degree',
          experience: '5+ years',
          salary: {
            median: 95000,
            range: {
              low: 85000,
              high: 110000
            }
          },
          skills: [
            { name: 'Programming', level: 5 },
            { name: 'Systems Design', level: 4 },
            { name: 'Project Management', level: 4 }
          ],
          level: 'advancement',
          similarity: 85,
          advancement_criteria: {
            education: {
              current: 'Bachelor\'s degree',
              required: 'Bachelor\'s degree',
              gap: false
            },
            experience: {
              current: '1-5 years',
              required: '5+ years',
              gap: true
            },
            skills: [
              {
                name: 'Programming',
                current_level: 4,
                required_level: 5,
                gap: 1
              },
              {
                name: 'Systems Design',
                current_level: 3,
                required_level: 4,
                gap: 1
              },
              {
                name: 'Project Management',
                current_level: 2,
                required_level: 4,
                gap: 2
              }
            ],
            certifications: []
          }
        },
        {
          id: '11-3021.00',
          title: 'Software Development Manager',
          description: 'Manage software development teams and oversee project delivery.',
          education: 'Bachelor\'s degree',
          experience: '8+ years',
          salary: {
            median: 125000,
            range: {
              low: 110000,
              high: 145000
            }
          },
          skills: [
            { name: 'Leadership', level: 5 },
            { name: 'Project Management', level: 5 },
            { name: 'Strategic Planning', level: 4 }
          ],
          level: 'advancement',
          similarity: 70,
          advancement_criteria: {
            education: {
              current: 'Bachelor\'s degree',
              required: 'Bachelor\'s degree',
              gap: false
            },
            experience: {
              current: '1-5 years',
              required: '8+ years',
              gap: true
            },
            skills: [
              {
                name: 'Leadership',
                current_level: 2,
                required_level: 5,
                gap: 3
              },
              {
                name: 'Project Management',
                current_level: 2,
                required_level: 5,
                gap: 3
              },
              {
                name: 'Strategic Planning',
                current_level: 2,
                required_level: 4,
                gap: 2
              }
            ],
            certifications: [
              {
                name: 'Project Management Professional (PMP)',
                required: true,
                has: false
              }
            ]
          }
        }
      ];
      related = [
        {
          id: '15-1243.00',
          title: 'Database Administrator',
          description: 'Design, implement, and maintain database systems.',
          education: 'Bachelor\'s degree',
          experience: '1-5 years',
          salary: {
            median: 70000,
            range: {
              low: 60000,
              high: 85000
            }
          },
          skills: [
            { name: 'Database Management', level: 4 },
            { name: 'SQL', level: 5 },
            { name: 'Data Modeling', level: 4 }
          ],
          level: 'lateral',
          similarity: 75
        },
        {
          id: '15-1211.00',
          title: 'Systems Analyst',
          description: 'Analyze and design information systems to meet business needs.',
          education: 'Bachelor\'s degree',
          experience: '1-5 years',
          salary: {
            median: 68000,
            range: {
              low: 58000,
              high: 80000
            }
          },
          skills: [
            { name: 'Systems Analysis', level: 4 },
            { name: 'Business Analysis', level: 4 },
            { name: 'Problem Solving', level: 4 }
          ],
          level: 'lateral',
          similarity: 70
        }
      ];
      break;
    case 'Management':
      advancements = [
        {
          id: '11-1021.00',
          title: 'Senior Manager',
          description: 'Oversee multiple departments and implement strategic initiatives.',
          education: 'Bachelor\'s degree',
          experience: '8+ years',
          salary: {
            median: 110000,
            range: {
              low: 95000,
              high: 130000
            }
          },
          skills: [
            { name: 'Leadership', level: 5 },
            { name: 'Strategic Planning', level: 5 },
            { name: 'Decision Making', level: 5 }
          ],
          level: 'advancement',
          similarity: 85,
          advancement_criteria: {
            education: {
              current: 'Bachelor\'s degree',
              required: 'Bachelor\'s degree',
              gap: false
            },
            experience: {
              current: '1-5 years',
              required: '8+ years',
              gap: true
            },
            skills: [
              {
                name: 'Leadership',
                current_level: 4,
                required_level: 5,
                gap: 1
              },
              {
                name: 'Strategic Planning',
                current_level: 3,
                required_level: 5,
                gap: 2
              },
              {
                name: 'Decision Making',
                current_level: 4,
                required_level: 5,
                gap: 1
              }
            ],
            certifications: []
          }
        },
        {
          id: '11-1011.00',
          title: 'Chief Executive Officer',
          description: 'Provide overall direction and leadership for the organization.',
          education: 'Master\'s degree',
          experience: '15+ years',
          salary: {
            median: 185000,
            range: {
              low: 150000,
              high: 250000
            }
          },
          skills: [
            { name: 'Executive Leadership', level: 5 },
            { name: 'Strategic Vision', level: 5 },
            { name: 'Business Development', level: 5 }
          ],
          level: 'advancement',
          similarity: 60,
          advancement_criteria: {
            education: {
              current: 'Bachelor\'s degree',
              required: 'Master\'s degree',
              gap: true
            },
            experience: {
              current: '1-5 years',
              required: '15+ years',
              gap: true
            },
            skills: [
              {
                name: 'Executive Leadership',
                current_level: 3,
                required_level: 5,
                gap: 2
              },
              {
                name: 'Strategic Vision',
                current_level: 3,
                required_level: 5,
                gap: 2
              },
              {
                name: 'Business Development',
                current_level: 2,
                required_level: 5,
                gap: 3
              }
            ],
            certifications: [
              {
                name: 'MBA or equivalent',
                required: true,
                has: false
              }
            ]
          }
        }
      ];
      related = [
        {
          id: '11-3031.00',
          title: 'Financial Manager',
          description: 'Direct financial activities for an organization.',
          education: 'Bachelor\'s degree',
          experience: '5+ years',
          salary: {
            median: 95000,
            range: {
              low: 80000,
              high: 115000
            }
          },
          skills: [
            { name: 'Financial Analysis', level: 5 },
            { name: 'Budgeting', level: 5 },
            { name: 'Risk Management', level: 4 }
          ],
          level: 'lateral',
          similarity: 70
        },
        {
          id: '11-2021.00',
          title: 'Marketing Manager',
          description: 'Plan and direct marketing strategies and campaigns.',
          education: 'Bachelor\'s degree',
          experience: '5+ years',
          salary: {
            median: 90000,
            range: {
              low: 75000,
              high: 110000
            }
          },
          skills: [
            { name: 'Marketing Strategy', level: 5 },
            { name: 'Brand Management', level: 4 },
            { name: 'Market Research', level: 4 }
          ],
          level: 'lateral',
          similarity: 65
        }
      ];
      break;
    default:
      // Generic career pathways for other occupation types
      advancements = [
        {
          id: `${majorGroup}-9001.00`,
          title: `Senior ${occupationTitle}`,
          description: `Lead ${occupationTitle.toLowerCase()} activities and mentor junior staff.`,
          education: 'Bachelor\'s degree',
          experience: '5+ years',
          salary: {
            median: 85000,
            range: {
              low: 70000,
              high: 100000
            }
          },
          skills: [
            { name: 'Leadership', level: 4 },
            { name: 'Advanced Technical Skills', level: 5 },
            { name: 'Mentoring', level: 4 }
          ],
          level: 'advancement',
          similarity: 85,
          advancement_criteria: {
            education: {
              current: 'Bachelor\'s degree',
              required: 'Bachelor\'s degree',
              gap: false
            },
            experience: {
              current: '1-5 years',
              required: '5+ years',
              gap: true
            },
            skills: [
              {
                name: 'Leadership',
                current_level: 3,
                required_level: 4,
                gap: 1
              },
              {
                name: 'Advanced Technical Skills',
                current_level: 3,
                required_level: 5,
                gap: 2
              },
              {
                name: 'Mentoring',
                current_level: 2,
                required_level: 4,
                gap: 2
              }
            ],
            certifications: []
          }
        },
        {
          id: `${majorGroup}-9002.00`,
          title: `${occupationTitle} Manager`,
          description: `Manage teams of ${occupationTitle.toLowerCase()}s and oversee projects.`,
          education: 'Bachelor\'s degree',
          experience: '8+ years',
          salary: {
            median: 105000,
            range: {
              low: 90000,
              high: 125000
            }
          },
          skills: [
            { name: 'Team Management', level: 5 },
            { name: 'Project Planning', level: 4 },
            { name: 'Strategic Thinking', level: 4 }
          ],
          level: 'advancement',
          similarity: 70,
          advancement_criteria: {
            education: {
              current: 'Bachelor\'s degree',
              required: 'Bachelor\'s degree',
              gap: false
            },
            experience: {
              current: '1-5 years',
              required: '8+ years',
              gap: true
            },
            skills: [
              {
                name: 'Team Management',
                current_level: 2,
                required_level: 5,
                gap: 3
              },
              {
                name: 'Project Planning',
                current_level: 3,
                required_level: 4,
                gap: 1
              },
              {
                name: 'Strategic Thinking',
                current_level: 3,
                required_level: 4,
                gap: 1
              }
            ],
            certifications: [
              {
                name: 'Management Certification',
                required: true,
                has: false
              }
            ]
          }
        }
      ];
      related = [
        {
          id: `${majorGroup}-8001.00`,
          title: `${occupationTitle} Specialist`,
          description: `Specialize in a specific area of ${occupationType.toLowerCase()}.`,
          education: 'Bachelor\'s degree',
          experience: '1-5 years',
          salary: {
            median: 70000,
            range: {
              low: 60000,
              high: 85000
            }
          },
          skills: [
            { name: 'Specialized Knowledge', level: 5 },
            { name: 'Technical Skills', level: 4 },
            { name: 'Problem Solving', level: 4 }
          ],
          level: 'lateral',
          similarity: 75
        },
        {
          id: `${majorGroup}-8002.00`,
          title: `${occupationTitle} Consultant`,
          description: `Provide expert advice on ${occupationType.toLowerCase()} matters.`,
          education: 'Bachelor\'s degree',
          experience: '3-7 years',
          salary: {
            median: 80000,
            range: {
              low: 65000,
              high: 95000
            }
          },
          skills: [
            { name: 'Consulting', level: 4 },
            { name: 'Client Management', level: 4 },
            { name: 'Industry Knowledge', level: 5 }
          ],
          level: 'lateral',
          similarity: 70
        }
      ];
  }

  return {
    current,
    advancements,
    related
  };
}
