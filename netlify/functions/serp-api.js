const axios = require('axios');

exports.handler = async function(event, context) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
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
    // Parse request body
    const { query } = JSON.parse(event.body || '{}');
    
    if (!query) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Query parameter is required' })
      };
    }

    // Get API key from environment variable
    const apiKey = process.env.SERP_API_KEY;
    
    if (!apiKey) {
      console.log('SERP API key not found in environment variables');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'API key not configured',
          mockData: true,
          results: generateMockSerpResults(query)
        })
      };
    }

    // Make request to SERP API
    const response = await axios.get('https://serpapi.com/search.json', {
      params: {
        q: query,
        api_key: apiKey,
        engine: 'google',
        num: 10
      }
    });
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.log('Error in SERP API proxy:', error.message);
    
    // Return mock data on error
    return {
      statusCode: 200, // Return 200 with mock data instead of error
      headers,
      body: JSON.stringify({ 
        error: error.message,
        mockData: true,
        results: generateMockSerpResults(event.body ? JSON.parse(event.body).query : '')
      })
    };
  }
};

// Generate mock SERP results
function generateMockSerpResults(query) {
  const occupation = query.split(' ')[0]; // Extract occupation name
  
  return {
    search_metadata: {
      id: "mock-serp-id",
      status: "Success",
      json_endpoint: "https://serpapi.com/searches/mock/json",
      created_at: new Date().toISOString(),
      processed_at: new Date().toISOString(),
      google_url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      raw_html_file: "https://serpapi.com/searches/mock/html",
      total_time_taken: 0.14
    },
    search_parameters: {
      engine: "google",
      q: query,
      google_domain: "google.com",
      device: "desktop"
    },
    organic_results: [
      {
        position: 1,
        title: `${occupation} Automation Potential Report 2024`,
        link: "https://example.com/automation-report",
        snippet: `Recent studies show ${occupation} roles are experiencing significant automation with 45-55% of tasks potentially automatable using current technology.`
      },
      {
        position: 2,
        title: `The Future of ${occupation} Jobs in the Age of AI`,
        link: "https://example.com/future-jobs",
        snippet: `AI and automation technologies are transforming ${occupation} work, with routine analytical tasks seeing the highest automation potential of 60-70%.`
      },
      {
        position: 3,
        title: `${occupation} Skills That Will Remain Valuable Despite Automation`,
        link: "https://example.com/valuable-skills",
        snippet: `While technical tasks are increasingly automated, ${occupation} professionals who develop soft skills like complex problem solving and creativity will remain in demand.`
      },
      {
        position: 4,
        title: `How Technology is Changing ${occupation} Work`,
        link: "https://example.com/changing-work",
        snippet: `New tools are automating 40-50% of traditional ${occupation} tasks, particularly in data collection, analysis, and reporting.`
      },
      {
        position: 5,
        title: `${occupation} Automation Trends: 5-Year Outlook`,
        link: "https://example.com/automation-trends",
        snippet: `Industry experts predict automation in ${occupation} fields will increase by 15-20% annually over the next five years, primarily affecting routine tasks.`
      }
    ]
  };
}
