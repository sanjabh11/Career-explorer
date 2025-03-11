# Enhanced API Integration: SerpAPI and JinaAPI

## Version 1.0

This document outlines the integration of SerpAPI and JinaAPI into the Career Explorer application for enhanced APO calculations.

## 1. API Overview

### 1.1 SerpAPI
- **Purpose**: Retrieve current research data on occupation automation potential
- **API Key**: `7e3aa9cacd93806c7b8f31b3f84e0c31149546f95f97bab73e4b62048dafd256`
- **Base URL**: `https://serpapi.com/search`
- **Documentation**: [SerpAPI Documentation](https://serpapi.com/docs)

### 1.2 JinaAPI
- **Purpose**: Perform semantic analysis and ranking of occupation tasks
- **API Key**: `jina_f538de4fd4be4147909f381c14854289F5zkC_DM6KCyTfbbHaEIkyg41syn`
- **Base URL**: `https://api.jina.ai/v1`
- **Documentation**: [JinaAPI Documentation](https://docs.jina.ai/)

## 2. Implementation Details

### 2.1 SerpAPI Integration

#### Service Implementation
```typescript
// src/services/SerpApiService.ts
import axios from 'axios';
import { AutomationResearchData } from '@/types/research';

export class SerpApiService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl = 'https://serpapi.com/search') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async getAutomationResearch(occupation: string): Promise<AutomationResearchData> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          api_key: this.apiKey,
          q: `${occupation} automation potential research`,
          engine: 'google_scholar',
          num: 20,
          as_ylo: 2020 // Research from 2020 onwards
        }
      });
      
      return this.processResearchResults(response.data);
    } catch (error) {
      console.error('Error fetching automation research:', error);
      throw error;
    }
  }

  private processResearchResults(data: any): AutomationResearchData {
    // Process and structure the research data
    // Extract relevant information about automation potential
    // Return structured data for APO calculation
  }
}
```

### 2.2 JinaAPI Integration

#### Service Implementation
```typescript
// src/services/JinaApiService.ts
import axios from 'axios';
import { OccupationTask, RankedTaskResults } from '@/types/occupation';

export class JinaApiService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl = 'https://api.jina.ai/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async rankAutomationPotential(tasks: OccupationTask[]): Promise<RankedTaskResults> {
    try {
      const taskDescriptions = tasks.map(task => task.description);
      
      const response = await axios.post(
        `${this.baseUrl}/embeddings`,
        {
          input: taskDescriptions,
          model: "jina-embeddings-v2"
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return this.processTaskRankings(response.data, tasks);
    } catch (error) {
      console.error('Error ranking tasks:', error);
      throw error;
    }
  }

  private processTaskRankings(data: any, originalTasks: OccupationTask[]): RankedTaskResults {
    // Process embeddings and calculate similarity scores
    // Rank tasks based on automation potential
    // Return structured rankings for APO calculation
  }
}
```

## 3. API Proxy Implementation

To securely manage API keys and handle CORS issues, we'll implement a Netlify function to proxy all API requests:

```javascript
// netlify/functions/api-proxy.js
const axios = require('axios');

exports.handler = async function(event, context) {
  try {
    const { path, apiType, params } = JSON.parse(event.body);
    
    let response;
    
    // Select the appropriate API based on the request
    switch (apiType) {
      case 'serp':
        response = await callSerpApi(path, params);
        break;
      case 'jina':
        response = await callJinaApi(path, params);
        break;
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid API type' })
        };
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

async function callSerpApi(path, params) {
  const apiKey = process.env.SERP_API_KEY;
  return axios.get(`https://serpapi.com/${path}`, {
    params: {
      ...params,
      api_key: apiKey
    }
  });
}

async function callJinaApi(path, params) {
  const apiKey = process.env.JINA_API_KEY;
  return axios.post(`https://api.jina.ai/v1/${path}`, params, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });
}
```

## 4. Environment Configuration

### 4.1 Environment Variables

Create or update `.env.local` with the following variables:

```
# API Keys
SERP_API_KEY=7e3aa9cacd93806c7b8f31b3f84e0c31149546f95f97bab73e4b62048dafd256
JINA_API_KEY=jina_f538de4fd4be4147909f381c14854289F5zkC_DM6KCyTfbbHaEIkyg41syn

# API Configuration
NEXT_PUBLIC_API_PROXY_URL=/.netlify/functions/api-proxy
```

### 4.2 Netlify Configuration

Update `netlify.toml` to include the necessary environment variables:

```toml
[build]
  command = "npm run build"
  publish = "build"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "18"

[dev]
  command = "npm run dev"
  port = 8888
  targetPort = 3000

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

## 5. Usage Examples

### 5.1 Retrieving Automation Research

```typescript
// Example usage in a component
import { SerpApiService } from '@/services/SerpApiService';

const serpApiService = new SerpApiService(process.env.SERP_API_KEY);

async function getResearchData(occupation) {
  try {
    const researchData = await serpApiService.getAutomationResearch(occupation);
    console.log('Research data:', researchData);
    // Process and display research data
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### 5.2 Ranking Task Automation Potential

```typescript
// Example usage in a component
import { JinaApiService } from '@/services/JinaApiService';

const jinaApiService = new JinaApiService(process.env.JINA_API_KEY);

async function rankTasks(tasks) {
  try {
    const rankings = await jinaApiService.rankAutomationPotential(tasks);
    console.log('Task rankings:', rankings);
    // Process and display task rankings
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## 6. Error Handling and Fallbacks

To ensure robustness, implement the following error handling strategies:

1. **API Timeouts**: Set appropriate timeouts for all API calls
2. **Retry Logic**: Implement exponential backoff for failed requests
3. **Caching**: Cache API responses to reduce dependency on external services
4. **Fallback Data**: Provide default values when API calls fail
5. **Error Logging**: Log all API errors for monitoring and debugging

## 7. Testing Strategy

1. **Unit Tests**: Test individual API service methods
2. **Mock Responses**: Create mock API responses for testing
3. **Integration Tests**: Test end-to-end API integration
4. **Error Scenarios**: Test error handling and fallback mechanisms

This integration plan provides a comprehensive approach to incorporating SerpAPI and JinaAPI into the Career Explorer application for enhanced APO calculations.