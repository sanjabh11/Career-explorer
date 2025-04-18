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
    const { query, limit } = JSON.parse(event.body || '{}');
    
    if (!query) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Query parameter is required' })
      };
    }

    // Get API key from environment variable
    const apiKey = process.env.FIRECRAWL_API_KEY;
    
    if (!apiKey) {
      console.log('FireCrawl API key not found in environment variables');
      return {
        statusCode: 200, // Return 200 with mock data
        headers,
        body: JSON.stringify({ 
          mockData: true,
          results: generateMockFireCrawlResults(query)
        })
      };
    }

    // Version 1.3.1-firecrawl-endpoint-fix: Use correct Firecrawl endpoint per docs
    const response = await axios.post('https://api.firecrawl.dev/v1/search', {
      query: query,
      limit: limit || 5
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.log('Error in FireCrawl API proxy:', error.message);
    
    // Return mock data on error
    const query = event.body ? JSON.parse(event.body).query : '';
    
    return {
      statusCode: 200, // Return 200 with mock data instead of error
      headers,
      body: JSON.stringify({ 
        error: error.message,
        mockData: true,
        results: generateMockFireCrawlResults(query)
      })
    };
  }
};

// Generate mock FireCrawl results
function generateMockFireCrawlResults(query) {
  const occupation = query.split(' ')[0]; // Extract occupation name
  
  return {
    query: query,
    total_results: 5,
    search_time: 0.75,
    results: [
      {
        title: `${occupation} Automation Research Study`,
        url: "https://example.com/research-study",
        snippet: `Our comprehensive study of ${occupation} roles found that approximately 48% of tasks could be automated with current technology. The most susceptible tasks include data processing, routine analysis, and standardized reporting.`,
        published_date: "2023-11-15"
      },
      {
        title: `The Impact of AI on ${occupation} Careers`,
        url: "https://example.com/ai-impact",
        snippet: `Recent advancements in AI are transforming ${occupation} work. While 52-58% of technical tasks may be automated, the demand for ${occupation} professionals with advanced problem-solving and interpersonal skills is expected to grow by 15% over the next decade.`,
        published_date: "2024-01-22"
      },
      {
        title: `${occupation} Skills in the Age of Automation`,
        url: "https://example.com/future-skills",
        snippet: `As automation technologies handle routine ${occupation} tasks (estimated at 45-50% of current workload), professionals should focus on developing creativity, strategic thinking, and complex decision-making abilities that remain difficult to automate.`,
        published_date: "2023-09-08"
      },
      {
        title: `Automation Trends Affecting ${occupation} Work`,
        url: "https://example.com/automation-trends",
        snippet: `Industry analysis shows that ${occupation} roles are experiencing significant technological disruption, with approximately 40% of traditional tasks now augmented or replaced by software tools and AI systems.`,
        published_date: "2024-02-03"
      },
      {
        title: `Future-Proofing Your ${occupation} Career`,
        url: "https://example.com/future-proofing",
        snippet: `With automation expected to impact 45-55% of ${occupation} tasks by 2030, professionals should develop expertise in emerging technologies, cross-functional collaboration, and complex problem-solving to remain competitive in the changing job market.`,
        published_date: "2023-12-11"
      }
    ]
  };
}
#test