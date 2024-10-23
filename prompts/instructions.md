## Purpose and Objectives

The purpose of this project is to improve the existing model to an accurate and flexible Automation Potential Overview (APO) calculation system for various occupations based on O*NET data. 

Initial objectives:
1. Document existing basic APO calculation for tasks, knowledge, skills, abilities, and technologies.
2. Document the steps to Improve APO results.

Improvement objectives:
1. Enhance APO calculation accuracy to 95% or higher.
2. Implement more sophisticated text matching and synonym handling.
3. Consider task categories, importance ratings, and level ratings in APO calculations.
4. Account for data age and GenAI impact in APO calculations.
5. Keep the existing user interface as is

## Step-by-step Instructions

### 1. Set up the project

TODO:
- Check the existing project structure step by step & list your observations along with the project tree
- Insert comments on EVERY key files for better tracking
- Install necessary dependencies, if needed



### 2. Improve existing APO calculation

TODO: Very important- These are ONLY suggestions. Feel free to improvise
- Create `apoCalculations.ts` file with initial APO categories and calculation logic
- Implement `calculateAPO` and `getAverageAPO` functions

NOT TODO:
- Don't use hard-coded APO values for all items

### 3. Continue using the existing user interface, if needed improvise the same

### 4. Enhance APO calculation accuracy

TODO:
- Implement synonym mapping in `apoData.ts`
- Use natural language processing for better text matching
- Consider task categories, importance, and level ratings in calculations

NOT TODO:
- Don't remove the original calculation method entirely; keep it as a fallback

### 5. Implement date-based and GenAI impact adjustments (Very important- These are ONLY suggestions. Feel free to improvise)

TODO:
- Add date field to item data structure
- Implement `adjustAPOForDate` function
- Add GenAI impact field and implement `adjustAPOForGenAIImpact` function

NOT TODO:
- Don't apply these adjustments to historical data without clear labeling

### 6. Improve user interface and data visualization

TODO:
- Implement a more detailed results view with individual APO breakdowns
- Add data visualization components (charts, graphs) for APO results
- Create an interface for custom APO data input

NOT TODO:
- Don't sacrifice performance for visual complexity. Also improve the existing UI, rather than changing it fully