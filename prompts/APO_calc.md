A mindmap process flow that illustrates how the final APO% is calculated, including the relevant file names and the data flow from the search engine to the final outcome. Let's break this down step by step:
mermaid
Copy Code
mindmap
  root((APO Calculation))
    Search Input
      src/components/JobTaxonomySelector.tsx
        Search bar
      src/hooks/useDebounce.ts
        Debounce search input
    API Request
      src/hooks/useOccupationSearch.ts
        handleSearch function
      src/services/OnetService.ts
        API call to O*NET
      netlify/functions/onet-proxy.js
        Proxy for O*NET API
    Data Processing
      src/hooks/useOccupationSearch.ts
        Process API response
      src/components/JobTaxonomySelector.tsx
        Set selectedOccupation
    APO Calculation
      src/utils/apoCalculations.ts
        calculateAPO function
        getAverageAPO function
      src/components/JobTaxonomySelector.tsx
        Calculate overall APO
    Data Visualization
      src/components/APOChart.tsx
        Render APO charts
      src/components/CategoryAccordion.tsx
        Display category details
    Final Display
      src/components/JobTaxonomySelector.tsx
        Render occupation details
        Show overall APO
Now, let's break down the process flow:
1.	Search Input
o	File: src/components/JobTaxonomySelector.tsx
o	The user enters a search term in the search bar.
o	File: src/hooks/useDebounce.ts
o	The search input is debounced to prevent excessive API calls.
2.	API Request
o	File: src/hooks/useOccupationSearch.ts
o	The handleSearch function is triggered with the debounced search term.
o	File: src/services/OnetService.ts
o	An API call is made to the O*NET database.
o	File: netlify/functions/onet-proxy.js
o	The Netlify function acts as a proxy for the O*NET API, handling authentication and CORS issues.
3.	Data Processing
o	File: src/hooks/useOccupationSearch.ts
o	The API response is processed and stored in the component state.
o	File: src/components/JobTaxonomySelector.tsx
o	The selectedOccupation state is updated with the chosen occupation data.
4.	APO Calculation
o	File: src/utils/apoCalculations.ts
o	The calculateAPO function calculates the APO for individual items in each category (Tasks, Knowledge, Skills, Abilities, Technologies).
o	The getAverageAPO function calculates the average APO for each category.
o	File: src/components/JobTaxonomySelector.tsx
o	The overall APO is calculated by averaging the APO scores from all categories.
5.	Data Visualization
o	File: src/components/APOChart.tsx
o	APO charts are rendered based on the calculated APO scores.
o	File: src/components/CategoryAccordion.tsx
o	Detailed APO information for each category is displayed in accordion sections.
6.	Final Display
o	File: src/components/JobTaxonomySelector.tsx
o	The occupation details are rendered, including the overall APO score and individual category scores.
Data Flow:
1.	User enters a search term in JobTaxonomySelector.tsx
2.	The search term is debounced in useDebounce.ts
3.	useOccupationSearch.ts triggers an API call via OnetService.ts
4.	The API request is proxied through onet-proxy.js Netlify function
5.	The API response is processed in useOccupationSearch.ts
6.	JobTaxonomySelector.tsx updates the selectedOccupation state
7.	apoCalculations.ts functions are called to calculate APO scores
8.	JobTaxonomySelector.tsx calculates the overall APO
9.	APO data is passed to APOChart.tsx and CategoryAccordion.tsx for visualization
10.	JobTaxonomySelector.tsx renders the final occupation details with APO scores
This process ensures that the APO calculation is based on the latest data from the O*NET database and provides a comprehensive overview of the automation potential for the selected occupation.
