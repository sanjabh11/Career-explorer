exports.handler = async function(event, context) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
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
    // Get query parameters
    const { occupation, startDate, endDate } = event.queryStringParameters || {};
    
    if (!occupation) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Occupation parameter is required' })
      };
    }

    // Parse dates or use defaults
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // 1 year ago
    const end = endDate ? new Date(endDate) : new Date(); // Now
    
    // Generate mock historical data
    const historicalData = generateMockHistoricalData(occupation, start, end);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(historicalData)
    };
  } catch (error) {
    console.log('Error in historical-data function:', error.message);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

// Generate mock historical data
function generateMockHistoricalData(occupation, startDate, endDate) {
  // Get occupation code if available
  const occupationCode = occupation.match(/\d+-\d+\.\d+/) ? occupation : null;
  const occupationName = occupationCode ? occupation.split(' ')[0] : occupation;
  
  // Calculate number of data points (one per month)
  const months = getMonthsBetweenDates(startDate, endDate);
  
  // Base APO value - different for different occupations
  const baseApo = getBaseApoForOccupation(occupationName);
  
  // Generate data points
  return months.map((date, index) => {
    // Create a slight upward trend with some randomness
    const trend = index * 0.2; // 0.2% increase per month
    const random = (Math.random() * 2 - 1) * 2; // Random fluctuation of ±2%
    const apo = Math.min(95, Math.max(5, baseApo + trend + random)); // Keep between 5% and 95%
    
    return {
      date: date.toISOString().split('T')[0], // YYYY-MM-DD format
      apo: apo.toFixed(2),
      source: 'historical-model',
      confidence: 0.7 + (Math.random() * 0.2) // Random confidence between 0.7 and 0.9
    };
  });
}

// Get months between two dates
function getMonthsBetweenDates(startDate, endDate) {
  const months = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    months.push(new Date(currentDate));
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return months;
}

// Get base APO value for different occupations
function getBaseApoForOccupation(occupation) {
  // Map common occupations to base APO values
  const occupationMap = {
    'Software': 45,
    'Developer': 45,
    'Engineer': 40,
    'Teacher': 25,
    'Doctor': 20,
    'Nurse': 30,
    'Accountant': 65,
    'Manager': 35,
    'Designer': 30,
    'Writer': 35,
    'Energy': 50,
    'Auditor': 55,
    'Analyst': 60,
    'Scientist': 30,
    'Technician': 50,
    'Assistant': 70,
    'Clerk': 75,
    'Driver': 80,
    'Cashier': 85,
    'Chef': 40
  };
  
  // Look for matches in the occupation name
  for (const [key, value] of Object.entries(occupationMap)) {
    if (occupation.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  
  // Default value if no match
  return 45;
}
