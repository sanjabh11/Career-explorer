# Career Explorer API Endpoints Documentation

## Phase 1: Enhanced Automation Potential Calculation

### GET /api/automation-potential
Calculate automation potential for a given occupation.

**Request Parameters:**
```typescript
{
  occupationCode: string;
  includeFactors?: boolean;
}
```

**Response:**
```typescript
{
  score: number;
  factors?: {
    baseAPO: number;
    complexityFactor: number;
    collaborationFactor: number;
    industryFactor: number;
    emergingTechFactor: number;
  };
  confidence: number;
  recommendations: string[];
}
```

## Phase 2: Industry-Specific and Regional Adjustments

### GET /api/industry-factors
Get industry-specific automation factors.

**Request Parameters:**
```typescript
{
  industry: string;
  region: string;
}
```

**Response:**
```typescript
{
  industryFactor: number;
  regionalFactor: number;
  techAdoptionRate: number;
  laborMarketFactors: number;
}
```

## Phase 3: Time-Based and Emerging Technology Adjustments

### GET /api/emerging-tech-impact
Calculate emerging technology impact on automation potential.

**Request Parameters:**
```typescript
{
  occupationCode: string;
  timeframe: number;
  selectedTechnologies: string[];
}
```

**Response:**
```typescript
{
  timeAdjustedScore: number;
  techImpact: number;
  relevantTechnologies: Array<{
    name: string;
    impactFactor: number;
    timeToMaturity: number;
  }>;
  projectedTimeline: Array<{
    year: number;
    score: number;
  }>;
}
