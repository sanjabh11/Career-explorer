# API Response Examples

## Phase 1: Enhanced Automation Potential Calculation

### Scenario 1: Software Developer Role Analysis
```http
GET /api/automation-potential?occupationCode=15-1252.00&includeFactors=true
```

```json
{
  "score": 0.65,
  "factors": {
    "baseAPO": 0.55,
    "complexityFactor": 0.8,
    "collaborationFactor": 0.7,
    "industryFactor": 0.85,
    "emergingTechFactor": 0.75
  },
  "confidence": 0.85,
  "recommendations": [
    "Focus on high-level system design and architecture",
    "Develop expertise in AI/ML integration",
    "Strengthen collaborative development skills",
    "Build competency in emerging technologies"
  ],
  "skillBreakdown": {
    "automatable": [
      "Code documentation",
      "Unit testing",
      "Basic debugging"
    ],
    "humanCentric": [
      "System architecture",
      "Client communication",
      "Complex problem solving"
    ]
  }
}
```

### Scenario 2: Data Entry Clerk Analysis
```http
GET /api/automation-potential?occupationCode=43-9021.00&includeFactors=true
```

```json
{
  "score": 0.92,
  "factors": {
    "baseAPO": 0.95,
    "complexityFactor": 0.3,
    "collaborationFactor": 0.2,
    "industryFactor": 0.9,
    "emergingTechFactor": 0.95
  },
  "confidence": 0.95,
  "recommendations": [
    "Develop skills in data validation and quality assurance",
    "Learn database management",
    "Acquire expertise in data visualization",
    "Build skills in process optimization"
  ],
  "skillBreakdown": {
    "automatable": [
      "Data entry",
      "Form processing",
      "Basic data validation"
    ],
    "humanCentric": [
      "Data quality assessment",
      "Exception handling",
      "Process improvement"
    ]
  }
}
```

## Phase 2: Industry-Specific and Regional Adjustments

### Scenario 1: Technology Sector in Silicon Valley
```http
GET /api/industry-factors?industry=Technology&region=NA-CA-SF
```

```json
{
  "industryFactor": 0.85,
  "regionalFactor": 0.95,
  "techAdoptionRate": 0.92,
  "laborMarketFactors": {
    "skillAvailability": 0.9,
    "wageLevel": 0.85,
    "competitionIndex": 0.88
  },
  "marketDynamics": {
    "growthRate": 15.5,
    "innovationIndex": 0.92,
    "investmentLevel": "high"
  },
  "regionalCharacteristics": {
    "techHubProximity": "high",
    "talentPool": "extensive",
    "infrastructureReadiness": 0.95
  }
}
```

### Scenario 2: Manufacturing in Midwest
```http
GET /api/industry-factors?industry=Manufacturing&region=NA-US-MW
```

```json
{
  "industryFactor": 0.75,
  "regionalFactor": 0.65,
  "techAdoptionRate": 0.58,
  "laborMarketFactors": {
    "skillAvailability": 0.6,
    "wageLevel": 0.55,
    "competitionIndex": 0.45
  },
  "marketDynamics": {
    "growthRate": 5.5,
    "innovationIndex": 0.48,
    "investmentLevel": "medium"
  },
  "regionalCharacteristics": {
    "techHubProximity": "medium",
    "talentPool": "moderate",
    "infrastructureReadiness": 0.65
  }
}
```

## Phase 3: Time-Based and Emerging Technology Adjustments

### Scenario 1: AI/ML Impact on Data Science
```http
GET /api/emerging-tech-impact?occupationCode=15-2051.00&timeframe=5&selectedTechnologies=["AI_ML","AutoML","NLP"]
```

```json
{
  "timeAdjustedScore": 0.78,
  "techImpact": 0.85,
  "relevantTechnologies": [
    {
      "name": "Advanced AI/ML",
      "impactFactor": 0.9,
      "timeToMaturity": 2,
      "relevanceScore": 0.95,
      "skillsAffected": [
        "Model Training",
        "Feature Engineering",
        "Hyperparameter Tuning"
      ]
    },
    {
      "name": "AutoML",
      "impactFactor": 0.85,
      "timeToMaturity": 1,
      "relevanceScore": 0.9,
      "skillsAffected": [
        "Model Selection",
        "Parameter Optimization"
      ]
    },
    {
      "name": "NLP",
      "impactFactor": 0.8,
      "timeToMaturity": 3,
      "relevanceScore": 0.85,
      "skillsAffected": [
        "Text Processing",
        "Sentiment Analysis"
      ]
    }
  ],
  "projectedTimeline": [
    {
      "year": 2024,
      "score": 0.65,
      "keyTechnologies": ["AutoML"]
    },
    {
      "year": 2025,
      "score": 0.72,
      "keyTechnologies": ["AutoML", "Advanced AI/ML"]
    },
    {
      "year": 2027,
      "score": 0.78,
      "keyTechnologies": ["AutoML", "Advanced AI/ML", "NLP"]
    }
  ],
  "adaptationStrategies": [
    {
      "timeframe": "immediate",
      "focus": "AutoML tools proficiency",
      "impact": "high"
    },
    {
      "timeframe": "medium-term",
      "focus": "Advanced AI/ML integration",
      "impact": "high"
    },
    {
      "timeframe": "long-term",
      "focus": "NLP specialization",
      "impact": "medium"
    }
  ]
}
```

### Scenario 2: Robotics Impact on Manufacturing
```http
GET /api/emerging-tech-impact?occupationCode=51-2092.00&timeframe=10&selectedTechnologies=["Robotics","IoT","AI_Vision"]
```

```json
{
  "timeAdjustedScore": 0.92,
  "techImpact": 0.95,
  "relevantTechnologies": [
    {
      "name": "Industrial Robotics",
      "impactFactor": 0.95,
      "timeToMaturity": 1,
      "relevanceScore": 0.98,
      "skillsAffected": [
        "Assembly",
        "Quality Control",
        "Material Handling"
      ]
    },
    {
      "name": "IoT Automation",
      "impactFactor": 0.85,
      "timeToMaturity": 2,
      "relevanceScore": 0.9,
      "skillsAffected": [
        "Process Monitoring",
        "Equipment Maintenance"
      ]
    },
    {
      "name": "AI Vision Systems",
      "impactFactor": 0.9,
      "timeToMaturity": 3,
      "relevanceScore": 0.92,
      "skillsAffected": [
        "Quality Inspection",
        "Defect Detection"
      ]
    }
  ],
  "projectedTimeline": [
    {
      "year": 2024,
      "score": 0.82,
      "keyTechnologies": ["Industrial Robotics"]
    },
    {
      "year": 2026,
      "score": 0.88,
      "keyTechnologies": ["Industrial Robotics", "IoT Automation"]
    },
    {
      "year": 2029,
      "score": 0.92,
      "keyTechnologies": ["Industrial Robotics", "IoT Automation", "AI Vision Systems"]
    }
  ],
  "adaptationStrategies": [
    {
      "timeframe": "immediate",
      "focus": "Robotics operation and programming",
      "impact": "critical"
    },
    {
      "timeframe": "medium-term",
      "focus": "IoT systems management",
      "impact": "high"
    },
    {
      "timeframe": "long-term",
      "focus": "AI vision systems maintenance",
      "impact": "medium"
    }
  ]
}
```
