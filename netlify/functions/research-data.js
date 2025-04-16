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

  try {
    // Get query parameters
    const { occupation } = event.queryStringParameters || {};
    
    if (!occupation) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Occupation parameter is required' })
      };
    }
    
    // Generate mock research data
    const researchData = generateMockResearchData(occupation);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(researchData)
    };
  } catch (error) {
    console.log('Error in research-data function:', error.message);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

// Generate mock research data
function generateMockResearchData(occupation) {
  // Extract occupation name (remove code if present)
  const occupationName = occupation.split('(')[0].trim();
  
  // Current date for timestamps
  const now = new Date();
  const timestamp = now.toISOString();
  const year = now.getFullYear();
  
  return {
    occupation: occupationName,
    timestamp: timestamp,
    data: {
      automationRisk: generateAutomationRiskData(occupationName),
      marketTrends: generateMarketTrendsData(occupationName),
      skillsAnalysis: generateSkillsAnalysisData(occupationName),
      futureOutlook: generateFutureOutlookData(occupationName, year)
    },
    sources: [
      {
        name: "Bureau of Labor Statistics",
        url: "https://www.bls.gov/",
        accessed: timestamp
      },
      {
        name: "World Economic Forum Future of Jobs Report",
        url: "https://www.weforum.org/reports/the-future-of-jobs-report-2023/",
        accessed: timestamp
      },
      {
        name: "McKinsey Global Institute",
        url: "https://www.mckinsey.com/mgi/overview",
        accessed: timestamp
      }
    ],
    confidence: 0.75 // Mock confidence score
  };
}

// Generate automation risk data
function generateAutomationRiskData(occupation) {
  // Base automation risk based on occupation type
  let baseRisk = 0.45; // Default risk
  
  // Adjust risk based on occupation keywords
  const highRiskJobs = ['clerk', 'cashier', 'driver', 'operator', 'assembler', 'teller'];
  const mediumRiskJobs = ['technician', 'analyst', 'accountant', 'auditor', 'assistant'];
  const lowRiskJobs = ['manager', 'designer', 'teacher', 'nurse', 'therapist', 'developer'];
  const veryLowRiskJobs = ['doctor', 'researcher', 'scientist', 'engineer', 'artist'];
  
  const occupationLower = occupation.toLowerCase();
  
  if (highRiskJobs.some(job => occupationLower.includes(job))) {
    baseRisk = 0.7 + (Math.random() * 0.15); // 70-85%
  } else if (mediumRiskJobs.some(job => occupationLower.includes(job))) {
    baseRisk = 0.45 + (Math.random() * 0.15); // 45-60%
  } else if (lowRiskJobs.some(job => occupationLower.includes(job))) {
    baseRisk = 0.25 + (Math.random() * 0.15); // 25-40%
  } else if (veryLowRiskJobs.some(job => occupationLower.includes(job))) {
    baseRisk = 0.1 + (Math.random() * 0.15); // 10-25%
  }
  
  return {
    overallRisk: baseRisk.toFixed(2),
    taskBreakdown: [
      {
        category: "Routine analytical tasks",
        automationPotential: (baseRisk + 0.15).toFixed(2),
        examples: ["Data processing", "Standard reporting", "Basic analysis"]
      },
      {
        category: "Physical tasks",
        automationPotential: (baseRisk + (occupationLower.includes('physical') ? 0.2 : -0.1)).toFixed(2),
        examples: ["Material handling", "Equipment operation", "Repetitive assembly"]
      },
      {
        category: "Customer interaction",
        automationPotential: (baseRisk - 0.2).toFixed(2),
        examples: ["Basic customer service", "Information provision", "Standard transactions"]
      },
      {
        category: "Creative work",
        automationPotential: (baseRisk - 0.3).toFixed(2),
        examples: ["Design", "Content creation", "Problem-solving"]
      },
      {
        category: "Strategic decision making",
        automationPotential: (baseRisk - 0.35).toFixed(2),
        examples: ["Planning", "Resource allocation", "Complex judgments"]
      }
    ]
  };
}

// Generate market trends data
function generateMarketTrendsData(occupation) {
  const occupationLower = occupation.toLowerCase();
  
  // Base growth rate
  let baseGrowth = 0.05; // 5% default growth
  
  // Adjust growth based on occupation type
  const highGrowthJobs = ['software', 'data', 'cyber', 'ai', 'renewable', 'healthcare'];
  const mediumGrowthJobs = ['engineer', 'analyst', 'specialist', 'technician', 'therapist'];
  const lowGrowthJobs = ['clerk', 'cashier', 'administrative', 'production', 'assembly'];
  
  if (highGrowthJobs.some(job => occupationLower.includes(job))) {
    baseGrowth = 0.12 + (Math.random() * 0.08); // 12-20%
  } else if (mediumGrowthJobs.some(job => occupationLower.includes(job))) {
    baseGrowth = 0.05 + (Math.random() * 0.07); // 5-12%
  } else if (lowGrowthJobs.some(job => occupationLower.includes(job))) {
    baseGrowth = -0.05 + (Math.random() * 0.1); // -5% to +5%
  }
  
  return {
    employmentGrowth: {
      rate: baseGrowth.toFixed(2),
      trend: baseGrowth > 0 ? "Growing" : baseGrowth < 0 ? "Declining" : "Stable"
    },
    salaryTrends: {
      currentMedian: generateSalaryForOccupation(occupation),
      growthRate: (baseGrowth * 0.7).toFixed(2) // Salary growth typically lower than employment growth
    },
    regionalDemand: [
      {
        region: "Urban centers",
        demandLevel: baseGrowth > 0.1 ? "High" : baseGrowth > 0 ? "Moderate" : "Low"
      },
      {
        region: "Suburban areas",
        demandLevel: baseGrowth > 0.05 ? "Moderate" : "Low"
      },
      {
        region: "Rural areas",
        demandLevel: baseGrowth > 0.15 ? "Moderate" : "Low"
      }
    ]
  };
}

// Generate skills analysis data
function generateSkillsAnalysisData(occupation) {
  return {
    emergingSkills: [
      {
        skill: "AI and Machine Learning Literacy",
        importance: (0.6 + Math.random() * 0.3).toFixed(2),
        automationImpact: "Complementary"
      },
      {
        skill: "Data Analysis and Interpretation",
        importance: (0.7 + Math.random() * 0.3).toFixed(2),
        automationImpact: "Complementary"
      },
      {
        skill: "Complex Problem Solving",
        importance: (0.8 + Math.random() * 0.2).toFixed(2),
        automationImpact: "Resistant"
      },
      {
        skill: "Digital Collaboration",
        importance: (0.6 + Math.random() * 0.3).toFixed(2),
        automationImpact: "Complementary"
      },
      {
        skill: "Adaptability and Continuous Learning",
        importance: (0.8 + Math.random() * 0.2).toFixed(2),
        automationImpact: "Resistant"
      }
    ],
    decliningSkills: [
      {
        skill: "Basic Data Entry",
        decline: (0.6 + Math.random() * 0.3).toFixed(2),
        automationImpact: "Replaceable"
      },
      {
        skill: "Routine Report Generation",
        decline: (0.5 + Math.random() * 0.3).toFixed(2),
        automationImpact: "Replaceable"
      },
      {
        skill: "Basic Information Retrieval",
        decline: (0.4 + Math.random() * 0.3).toFixed(2),
        automationImpact: "Replaceable"
      },
      {
        skill: "Manual Calculation",
        decline: (0.7 + Math.random() * 0.3).toFixed(2),
        automationImpact: "Replaceable"
      }
    ]
  };
}

// Generate future outlook data
function generateFutureOutlookData(occupation, currentYear) {
  const occupationLower = occupation.toLowerCase();
  
  // Determine outlook based on occupation type
  let outlookCategory;
  let transformationLevel;
  
  // High transformation occupations
  if (occupationLower.includes('data') || 
      occupationLower.includes('analyst') || 
      occupationLower.includes('clerk') || 
      occupationLower.includes('assistant')) {
    outlookCategory = "Significant Transformation";
    transformationLevel = (0.7 + Math.random() * 0.2).toFixed(2);
  } 
  // Medium transformation occupations
  else if (occupationLower.includes('engineer') || 
           occupationLower.includes('technician') || 
           occupationLower.includes('specialist') || 
           occupationLower.includes('developer')) {
    outlookCategory = "Moderate Transformation";
    transformationLevel = (0.4 + Math.random() * 0.3).toFixed(2);
  } 
  // Low transformation occupations
  else if (occupationLower.includes('manager') || 
           occupationLower.includes('director') || 
           occupationLower.includes('therapist') || 
           occupationLower.includes('doctor')) {
    outlookCategory = "Augmentation";
    transformationLevel = (0.2 + Math.random() * 0.2).toFixed(2);
  } 
  // Default
  else {
    outlookCategory = "Moderate Transformation";
    transformationLevel = (0.3 + Math.random() * 0.4).toFixed(2);
  }
  
  return {
    fiveYearProjection: {
      category: outlookCategory,
      transformationLevel: transformationLevel,
      year: (currentYear + 5).toString()
    },
    keyTechnologies: generateKeyTechnologiesForOccupation(occupation),
    adaptationStrategies: [
      "Continuous skill development in emerging technologies",
      "Focus on human-AI collaboration capabilities",
      "Develop expertise in areas resistant to automation",
      "Build transferable skills applicable across multiple domains",
      "Pursue specialized certifications in high-demand areas"
    ]
  };
}

// Generate salary for occupation
function generateSalaryForOccupation(occupation) {
  const occupationLower = occupation.toLowerCase();
  
  // Base salary
  let baseSalary = 55000;
  
  // Adjust salary based on occupation keywords
  const highPayingJobs = ['engineer', 'developer', 'manager', 'director', 'architect', 'doctor', 'scientist'];
  const mediumPayingJobs = ['analyst', 'specialist', 'technician', 'therapist', 'nurse', 'teacher'];
  const lowerPayingJobs = ['assistant', 'clerk', 'cashier', 'driver', 'operator'];
  
  if (highPayingJobs.some(job => occupationLower.includes(job))) {
    baseSalary = 85000 + Math.floor(Math.random() * 40000);
  } else if (mediumPayingJobs.some(job => occupationLower.includes(job))) {
    baseSalary = 60000 + Math.floor(Math.random() * 25000);
  } else if (lowerPayingJobs.some(job => occupationLower.includes(job))) {
    baseSalary = 35000 + Math.floor(Math.random() * 15000);
  }
  
  return baseSalary;
}

// Generate key technologies for occupation
function generateKeyTechnologiesForOccupation(occupation) {
  const occupationLower = occupation.toLowerCase();
  
  // Common technologies across all occupations
  const commonTechnologies = [
    {
      name: "AI Assistants",
      impact: "High",
      timeframe: "Current"
    },
    {
      name: "Advanced Data Analytics",
      impact: "High",
      timeframe: "Current"
    }
  ];
  
  // Specific technologies based on occupation
  const specificTechnologies = [];
  
  // Tech-related occupations
  if (occupationLower.includes('software') || 
      occupationLower.includes('developer') || 
      occupationLower.includes('programmer')) {
    specificTechnologies.push(
      {
        name: "Automated Code Generation",
        impact: "High",
        timeframe: "Current"
      },
      {
        name: "Low-Code/No-Code Platforms",
        impact: "Medium",
        timeframe: "Current"
      }
    );
  }
  
  // Data-related occupations
  else if (occupationLower.includes('data') || 
           occupationLower.includes('analyst') || 
           occupationLower.includes('scientist')) {
    specificTechnologies.push(
      {
        name: "Automated Machine Learning (AutoML)",
        impact: "High",
        timeframe: "Current"
      },
      {
        name: "Augmented Analytics",
        impact: "High",
        timeframe: "Current"
      }
    );
  }
  
  // Administrative occupations
  else if (occupationLower.includes('assistant') || 
           occupationLower.includes('clerk') || 
           occupationLower.includes('administrative')) {
    specificTechnologies.push(
      {
        name: "Robotic Process Automation",
        impact: "High",
        timeframe: "Current"
      },
      {
        name: "Intelligent Document Processing",
        impact: "High",
        timeframe: "Current"
      }
    );
  }
  
  // Healthcare occupations
  else if (occupationLower.includes('doctor') || 
           occupationLower.includes('nurse') || 
           occupationLower.includes('healthcare')) {
    specificTechnologies.push(
      {
        name: "AI Diagnostic Tools",
        impact: "Medium",
        timeframe: "Near-term"
      },
      {
        name: "Telemedicine Platforms",
        impact: "High",
        timeframe: "Current"
      }
    );
  }
  
  // Engineering occupations
  else if (occupationLower.includes('engineer') || 
           occupationLower.includes('designer')) {
    specificTechnologies.push(
      {
        name: "Generative Design Software",
        impact: "Medium",
        timeframe: "Current"
      },
      {
        name: "Digital Twins",
        impact: "Medium",
        timeframe: "Near-term"
      }
    );
  }
  
  // Default technologies for other occupations
  else {
    specificTechnologies.push(
      {
        name: "Workflow Automation Tools",
        impact: "Medium",
        timeframe: "Current"
      },
      {
        name: "Collaborative Platforms",
        impact: "Medium",
        timeframe: "Current"
      }
    );
  }
  
  // Add future technology for all occupations
  specificTechnologies.push({
    name: "Advanced Natural Language Processing",
    impact: "High",
    timeframe: "Near-term"
  });
  
  return [...commonTechnologies, ...specificTechnologies];
}
