# UI Component Documentation

## Phase 1: Enhanced Automation Potential Calculation

### OccupationDetails Component
- **Purpose**: Display detailed automation potential analysis for an occupation
- **Props**:
  - `occupation: OccupationData`
  - `onFactorChange?: (factor: AutomationFactor) => void`
- **Key Features**:
  - Displays base automation score
  - Shows factor breakdown
  - Provides confidence rating
  - Lists automation recommendations

### APOBreakdown Component
- **Purpose**: Visualize automation potential factors
- **Props**:
  - `factors: APOFactors`
  - `confidence: number`
- **Key Features**:
  - Factor-by-factor breakdown
  - Interactive tooltips
  - Visual progress indicators

## Phase 2: Industry-Specific and Regional Adjustments

### IndustryAnalysis Component
- **Purpose**: Analyze industry and regional impact on automation
- **Props**:
  - `baseAutomationScore: number`
  - `onIndustryFactorChange: (factor: number) => void`
- **Key Features**:
  - Industry sector selection
  - Regional selection
  - Technology adoption slider
  - Labor market factors
  - Real-time score adjustment

### Accessibility Features
- ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## Phase 3: Time-Based and Emerging Technology Adjustments

### TimeBasedAnalysis Component
- **Purpose**: Project automation potential over time
- **Props**:
  - `baseAutomationScore: number`
  - `industry: string`
  - `region: string`
  - `skillset: string[]`
  - `task: AutomationFactor`
- **Key Features**:
  - Timeframe selection
  - Emerging technology selection
  - Impact visualization
  - Projected timeline display

### State Management
```typescript
interface TimeBasedState {
  timeframe: number;
  selectedTechs: EmergingTechnology[];
  projectedScores: number[];
}
```

### Event Handlers
```typescript
onTimeframeChange: (years: number) => void
onTechnologySelect: (tech: EmergingTechnology) => void
onScoreUpdate: (score: number) => void
```
