# Career Explorer Testing Guide

This guide will help you test all the features implemented across Phases 1-3 of the Career Explorer application.

## Prerequisites
1. Node.js installed (v16 or higher)
2. npm or yarn package manager
3. Modern web browser (Chrome, Firefox, or Edge recommended)

## Setup Instructions
1. Clone the repository
2. Install dependencies:
```bash
npm install
# or
yarn install
```
3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

## Phase 1: Core APO (Automation Potential Overview) Features

### 1. Basic APO Score Calculation
1. Navigate to the main dashboard
2. Enter an occupation (e.g., "Software Developer")
3. Expected: View the base APO score (0-100%)
4. Verify the score breakdown shows:
   - Task complexity
   - Required education
   - Physical requirements
   - Social interaction level

### 2. Skill Analysis
1. Click on "Skill Analysis" tab
2. Enter or select skills for the occupation
3. Verify:
   - Individual skill automation scores
   - Skill importance weights
   - Combined skill impact on APO

### 3. Task Decomposition
1. Navigate to "Task Analysis"
2. Add multiple tasks for the occupation
3. Check:
   - Task complexity ratings
   - Automation feasibility scores
   - Task frequency impact

## Phase 2: Industry & Regional Analysis

### 1. Industry Factor Analysis
1. Select an industry from the dropdown
2. Verify display of:
   - Industry automation readiness
   - Technology adoption rate
   - Market competition factors
   - Regulatory environment impact

### 2. Regional Impact Assessment
1. Choose a geographic region
2. Check visualization of:
   - Regional technology adoption rates
   - Labor market conditions
   - Economic indicators
   - Policy impact factors

### 3. Combined Impact View
1. Select both industry and region
2. Verify:
   - Combined score adjustments
   - Interactive visualization
   - Detailed factor breakdown

## Phase 3: Time-Based & Technology Impact Analysis

### 1. Time-Based Projections
1. Navigate to "Time-Based Analysis"
2. Test different timeframes (1-10 years)
3. Verify:
   - APO score projections
   - Confidence intervals
   - Trend indicators

### 2. Emerging Technology Impact
1. In the Technology section:
   - Select multiple emerging technologies
   - Check individual impact scores
   - Verify combined effects
2. Validate display of:
   - Technology maturity levels
   - Time to mainstream adoption
   - Impact magnitude
   - Implementation requirements

### 3. Historical Correlation Analysis
1. View historical data section
2. Verify:
   - Trend visualization
   - Correlation strength indicators
   - Confidence scoring
   - Data point details

### 4. Advanced Features
1. Test Confidence Scoring:
   - Data quality indicators
   - Prediction reliability metrics
   - Uncertainty visualization

2. Check Time-Based Adjustments:
   - Short-term projections
   - Medium-term analysis
   - Long-term forecasting

3. Verify Technology Recommendations:
   - Industry-specific suggestions
   - Occupation relevance
   - Implementation timeline
   - Impact assessment

## Running Automated Tests

### Unit Tests
```bash
npm run test:unit
# or
yarn test:unit
```
Verify all tests pass for:
- APO calculations
- Industry factors
- Regional adjustments
- Time-based projections
- Technology impact assessment

### Integration Tests
```bash
npm run test:integration
# or
yarn test:integration
```
Check integration between:
- Core APO and industry factors
- Time-based and technology impacts
- Historical data and projections

### End-to-End Tests
```bash
npm run test:e2e
# or
yarn test:e2e
```
Validates complete user workflows:
1. Full occupation analysis
2. Time-based projections
3. Technology impact assessment

## Performance Testing

### Load Testing
1. Run with multiple concurrent users
2. Check response times for:
   - APO calculations
   - Data visualizations
   - Technology impact assessments

### Resource Usage
Monitor:
- Memory consumption
- CPU utilization
- Network requests
- Database queries

## Common Issues & Troubleshooting

### Data Loading
If data doesn't load:
1. Check console for errors
2. Verify network connectivity
3. Clear browser cache
4. Restart development server

### Calculation Issues
If scores seem incorrect:
1. Verify input data
2. Check calculation logs
3. Compare with test cases
4. Review factor weights

### Visualization Problems
If charts don't render:
1. Check browser compatibility
2. Verify data format
3. Clear browser cache
4. Update dependencies

## Reporting Issues

When reporting bugs:
1. Provide steps to reproduce
2. Include browser/environment details
3. Attach console logs
4. Screenshot any error messages

## Feature Validation Checklist

- [ ] Core APO calculations accurate
- [ ] Industry factors properly weighted
- [ ] Regional impacts correctly applied
- [ ] Time-based projections reasonable
- [ ] Technology impacts properly assessed
- [ ] Historical correlations accurate
- [ ] Confidence scoring reliable
- [ ] UI/UX responsive and intuitive
- [ ] Data visualizations clear and informative
- [ ] Performance meets requirements

## Next Steps

After testing:
1. Document any issues found
2. Suggest potential improvements
3. Identify performance bottlenecks
4. Propose new features
5. Share user feedback

For additional support or questions, please refer to the project documentation or contact the development team.
