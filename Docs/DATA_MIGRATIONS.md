# Data Migration Documentation

## Phase 1: Enhanced Automation Potential Calculation

### Migration: Add Complexity and Collaboration Factors
```sql
-- Add new columns to automation_factors table
ALTER TABLE automation_factors
ADD COLUMN complexity DECIMAL(3,2),
ADD COLUMN human_ai_collaboration DECIMAL(3,2);

-- Update existing records with default values
UPDATE automation_factors
SET complexity = 0.5,
    human_ai_collaboration = 0.5
WHERE complexity IS NULL;
```

### Data Validation
```typescript
interface ValidationRules {
  complexity: {
    min: 1,
    max: 5,
    required: true
  },
  humanAICollaboration: {
    min: 0,
    max: 1,
    required: true
  }
}
```

## Phase 2: Industry-Specific and Regional Adjustments

### Migration: Industry and Regional Factors
```sql
-- Create industry_factors table
CREATE TABLE industry_factors (
  id SERIAL PRIMARY KEY,
  industry VARCHAR(100),
  region VARCHAR(100),
  tech_adoption_rate DECIMAL(3,2),
  labor_market_factor DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for quick lookups
CREATE INDEX idx_industry_region ON industry_factors(industry, region);
```

### Data Seeding
```typescript
const seedIndustryFactors = async () => {
  const industries = ['Technology', 'Healthcare', 'Finance', /* ... */];
  const regions = ['North America', 'Western Europe', /* ... */];
  
  for (const industry of industries) {
    for (const region of regions) {
      await db.industryFactors.create({
        industry,
        region,
        techAdoptionRate: getDefaultTechRate(industry, region),
        laborMarketFactor: getDefaultLaborFactor(industry, region)
      });
    }
  }
};
```

## Phase 3: Time-Based and Emerging Technology Adjustments

### Migration: Emerging Technologies
```sql
-- Create emerging_technologies table
CREATE TABLE emerging_technologies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  impact_factor DECIMAL(3,2),
  time_to_maturity INTEGER,
  relevance_score DECIMAL(3,2),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create junction table for occupation-technology relevance
CREATE TABLE occupation_tech_relevance (
  occupation_code VARCHAR(10),
  tech_id INTEGER,
  relevance_score DECIMAL(3,2),
  PRIMARY KEY (occupation_code, tech_id),
  FOREIGN KEY (tech_id) REFERENCES emerging_technologies(id)
);
```

### Data Cleanup
```typescript
const cleanupLegacyData = async () => {
  // Remove deprecated automation factors
  await db.automationFactors.deleteMany({
    where: {
      version: { lt: currentVersion }
    }
  });
  
  // Update existing records to new schema
  await db.automationFactors.updateMany({
    data: {
      version: currentVersion,
      updatedAt: new Date()
    }
  });
};
```
