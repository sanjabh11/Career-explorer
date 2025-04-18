// Version 1.0-vercel-firecrawl: Vercel-compatible Firecrawl API route. Modular, non-destructive to Netlify setup.
import axios from 'axios';

export default async function handler(req, res) {
  // Allow CORS for testing (adjust as needed)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { query, limit } = req.body || {};
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      console.log('FireCrawl API key not found in environment variables');
      return res.status(200).json({
        mockData: true,
        results: generateMockFireCrawlResults(query)
      });
    }
    // Use correct Firecrawl endpoint per docs
    const response = await axios.post('https://api.firecrawl.dev/v1/search', {
      query: query,
      limit: limit || 5
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('FireCrawl API error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}

// Helper for mock data (copied from Netlify function)
function generateMockFireCrawlResults(occupation) {
  return {
    query: occupation,
    total_results: 5,
    search_time: 0.75,
    results: [
      {
        title: 'Data Automation Research Study',
        url: 'https://example.com/research-study',
        snippet: `Our comprehensive study of ${occupation} roles found that approximately 48% of tasks could be automated with current technology. The most susceptible tasks include data processing, routine analysis, and standardized reporting.`,
        published_date: '2023-11-15'
      },
      {
        title: 'The Impact of AI on Data Careers',
        url: 'https://example.com/ai-impact',
        snippet: `Recent advancements in AI are transforming ${occupation} work. While 52-58% of technical tasks may be automated, the demand for professionals with advanced problem-solving and interpersonal skills is expected to grow by 15% over the next decade.`,
        published_date: '2024-01-22'
      },
      {
        title: 'Data Skills in the Age of Automation',
        url: 'https://example.com/future-skills',
        snippet: `As automation technologies handle routine ${occupation} tasks (estimated at 45-50% of current workload), professionals should focus on developing creativity, strategic thinking, and complex decision-making abilities that remain difficult to automate.`,
        published_date: '2023-09-08'
      },
      {
        title: 'Automation Trends Affecting Data Work',
        url: 'https://example.com/automation-trends',
        snippet: `Industry analysis shows that ${occupation} roles are experiencing significant technological disruption, with approximately 40% of traditional tasks now augmented or replaced by software tools and AI systems.`,
        published_date: '2024-02-03'
      },
      {
        title: 'Future-Proofing Your Data Career',
        url: 'https://example.com/future-proofing',
        snippet: `With automation expected to impact 45-55% of ${occupation} tasks by 2030, professionals should develop expertise in emerging technologies, cross-functional collaboration, and complex problem-solving to remain competitive in the changing job market.`,
        published_date: '2023-12-11'
      }
    ]
  };
}
