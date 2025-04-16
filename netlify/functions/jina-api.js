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
    const { texts, model } = JSON.parse(event.body || '{}');
    
    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Valid texts array is required' })
      };
    }

    // Get API key from environment variable
    const apiKey = process.env.JINA_API_KEY;
    
    if (!apiKey) {
      console.log('JINA API key not found in environment variables');
      return {
        statusCode: 200, // Return 200 with mock data
        headers,
        body: JSON.stringify({ 
          mockData: true,
          data: generateMockJinaEmbeddings(texts)
        })
      };
    }

    // Make request to JINA API
    const response = await axios.post('https://api.jina.ai/v1/embeddings', {
      input: texts,
      model: model || 'jina-embeddings-v2-base-en'
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
    console.log('Error in JINA API proxy:', error.message);
    
    // Return mock data on error
    const texts = event.body ? JSON.parse(event.body).texts || [] : [];
    
    return {
      statusCode: 200, // Return 200 with mock data instead of error
      headers,
      body: JSON.stringify({ 
        error: error.message,
        mockData: true,
        data: generateMockJinaEmbeddings(texts)
      })
    };
  }
};

// Generate mock JINA embeddings
function generateMockJinaEmbeddings(texts) {
  return texts.map((text, index) => {
    // Create a deterministic but seemingly random embedding based on the text
    const embedding = Array(128).fill(0).map((_, i) => {
      // Use a simple hash of the text and position to generate a value between -1 and 1
      const hash = (text.charCodeAt(i % text.length) + i) / 255;
      return (hash * 2 - 1).toFixed(6);
    });
    
    return {
      index: index,
      object: "embedding",
      embedding: embedding
    };
  });
}
