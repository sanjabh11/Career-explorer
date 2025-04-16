const axios = require('axios');

// Helper function to create a standardized response
const createResponse = (statusCode, data) => {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  };
};

// Helper function to handle errors
const handleError = (error) => {
  console.error('Error in Netlify Function:', error.message);
  console.error('Error response:', error.response ? JSON.stringify(error.response.data) : 'No response');
  return createResponse(
    error.response?.status || 500,
    {
      error: error.message,
      details: error.response ? error.response.data : 'No details available'
    }
  );
};

// Handle occupation search
const handleSearch = async (keyword) => {
  console.log('Handling occupation search for keyword:', keyword);
  const url = `https://services.onetcenter.org/ws/mnm/search?keyword=${encodeURIComponent(keyword)}`;
  console.log('Request URL:', url);

  const response = await axios.get(url, {
    auth: {
      username: process.env.ONET_USERNAME,
      password: process.env.ONET_PASSWORD
    },
    headers: {
      'Accept': 'application/json'
    }
  });

  console.log('O*NET API Response Status:', response.status);
  return createResponse(200, response.data);
};

// Handle occupation details
const handleDetails = async (code) => {
  console.log('Handling occupation details for code:', code);
  const url = `https://services.onetcenter.org/ws/online/occupations/${encodeURIComponent(code)}`;
  console.log('Request URL:', url);

  const response = await axios.get(url, {
    auth: {
      username: process.env.ONET_USERNAME,
      password: process.env.ONET_PASSWORD
    },
    headers: {
      'Accept': 'application/json'
    }
  });

  console.log('O*NET API Response Status:', response.status);
  return createResponse(200, response.data);
};

// Handle job outlook data
const handleOutlook = async (code) => {
  console.log('Handling job outlook for code:', code);

  // Check if we have valid credentials
  if (!process.env.ONET_USERNAME || !process.env.ONET_PASSWORD) {
    console.log('O*NET credentials not found, returning mock data');
    return createResponse(200, generateMockJobOutlook(code));
  }

  try {
    // First, check if this is a bright outlook occupation
    const brightOutlookUrl = `https://services.onetcenter.org/ws/online/occupations/${encodeURIComponent(code)}/bright_outlook`;
    const brightOutlookResponse = await axios.get(brightOutlookUrl, {
      auth: {
        username: process.env.ONET_USERNAME,
        password: process.env.ONET_PASSWORD
      },
      headers: {
        'Accept': 'application/json'
      }
    }).catch(() => ({ data: { bright_outlook: false } })); // Default if not found

    // Then get the career outlook data
    const outlookUrl = `https://services.onetcenter.org/ws/mnm/careers/${encodeURIComponent(code)}/outlook`;
    const outlookResponse = await axios.get(outlookUrl, {
      auth: {
        username: process.env.ONET_USERNAME,
        password: process.env.ONET_PASSWORD
      },
      headers: {
        'Accept': 'application/json'
      }
    }).catch(() => ({ data: {} })); // Default if not found

    // Get wage data
    const wageUrl = `https://services.onetcenter.org/ws/mnm/careers/${encodeURIComponent(code)}/wages`;
    const wageResponse = await axios.get(wageUrl, {
      auth: {
        username: process.env.ONET_USERNAME,
        password: process.env.ONET_PASSWORD
      },
      headers: {
        'Accept': 'application/json'
      }
    }).catch(() => ({ data: {} })); // Default if not found

    // Combine all data
    const combinedData = {
      bright_outlook: brightOutlookResponse.data.bright_outlook || false,
      bright_outlook_reasons: brightOutlookResponse.data.bright_outlook_categories || [],
      growth_rate: outlookResponse.data.growth_rate || 0,
      projected_openings: outlookResponse.data.projected_openings || 0,
      salary_min: wageResponse.data.lowest_10_percent || 0,
      salary_median: wageResponse.data.median || 0,
      salary_max: wageResponse.data.highest_10_percent || 0,
      employment_current: outlookResponse.data.current_employment || 0,
      employment_projected: outlookResponse.data.projected_employment || 0,
      employment_change_percent: outlookResponse.data.growth_rate || 0,
      employment_change_value: outlookResponse.data.employment_change || 0,
      last_updated: new Date().toISOString(),
      source: 'O*NET'
    };

    console.log('Combined job outlook data:', JSON.stringify(combinedData));
    return createResponse(200, combinedData);
  } catch (error) {
    console.log('Error fetching job outlook data, returning mock data:', error.message);
    return createResponse(200, {
      ...generateMockJobOutlook(code),
      mockData: true,
      error: error.message
    });
  }
};

// Handle bright outlook occupations list
const handleBrightOutlook = async () => {
  console.log('Handling bright outlook occupations list');
  const url = 'https://services.onetcenter.org/ws/online/bright_outlook_occupations';

  const response = await axios.get(url, {
    auth: {
      username: process.env.ONET_USERNAME,
      password: process.env.ONET_PASSWORD
    },
    headers: {
      'Accept': 'application/json'
    }
  });

  // Extract just the occupation codes
  const occupationCodes = response.data.bright_outlook_occupations.map(occ => occ.code);
  return createResponse(200, { occupations: occupationCodes });
};

// Generate mock job outlook data
function generateMockJobOutlook(occupationCode) {
  // Extract major group from occupation code
  const majorGroup = occupationCode.split('-')[0];

  // Determine growth category based on major group
  let growthCategory;
  let growthRate;

  switch (majorGroup) {
    case '15': // Computer and Mathematical Occupations
    case '29': // Healthcare Practitioners
    case '13': // Business and Financial Operations
      growthCategory = "Much faster than average";
      growthRate = 15 + Math.floor(Math.random() * 10); // 15-25%
      break;
    case '17': // Architecture and Engineering
    case '19': // Life, Physical, and Social Science
    case '25': // Education, Training, and Library
      growthCategory = "Faster than average";
      growthRate = 8 + Math.floor(Math.random() * 7); // 8-15%
      break;
    case '11': // Management
    case '21': // Community and Social Service
    case '27': // Arts, Design, Entertainment, Sports, and Media
      growthCategory = "Average";
      growthRate = 3 + Math.floor(Math.random() * 5); // 3-8%
      break;
    case '43': // Office and Administrative Support
    case '51': // Production
    case '41': // Sales
      growthCategory = "Slower than average";
      growthRate = -2 + Math.floor(Math.random() * 5); // -2 to 3%
      break;
    case '45': // Farming, Fishing, and Forestry
    case '47': // Construction and Extraction
      growthCategory = "Little or no change";
      growthRate = -1 + Math.floor(Math.random() * 2); // -1 to 1%
      break;
    default:
      growthCategory = "Average";
      growthRate = 5;
  }

  // Current year
  const currentYear = new Date().getFullYear();
  const projectionYear = currentYear + 10;

  // Generate employment numbers
  const currentEmployment = Math.floor(100000 + Math.random() * 900000); // Random between 100,000 and 1,000,000
  const projectedEmployment = Math.floor(currentEmployment * (1 + (growthRate / 100)));
  const employmentChange = projectedEmployment - currentEmployment;

  // Generate salary data
  const medianSalary = Math.floor(40000 + Math.random() * 80000); // Random between $40,000 and $120,000
  const minSalary = Math.floor(medianSalary * 0.7); // 70% of median
  const maxSalary = Math.floor(medianSalary * 1.5); // 150% of median

  // Determine if bright outlook based on growth rate
  const brightOutlook = growthRate >= 10;

  return {
    bright_outlook: brightOutlook,
    bright_outlook_reasons: brightOutlook ? ["Projected to grow much faster than average"] : [],
    growth_rate: growthRate,
    projected_openings: Math.floor(employmentChange * 0.2), // 20% of change as annual openings
    salary_min: minSalary,
    salary_median: medianSalary,
    salary_max: maxSalary,
    employment_current: currentEmployment,
    employment_projected: projectedEmployment,
    employment_change_percent: growthRate,
    employment_change_value: employmentChange,
    last_updated: new Date().toISOString(),
    source: 'Mock Data (O*NET format)',
    projection_period: `${currentYear}-${projectionYear}`
  };
}

// Main handler function
exports.handler = async function(event, context) {
  console.log('Function invoked with event:', JSON.stringify(event));
  console.log('ONET_USERNAME:', process.env.ONET_USERNAME ? 'Set' : 'Not set');
  console.log('ONET_PASSWORD:', process.env.ONET_PASSWORD ? 'Set' : 'Not set');

  const { path } = event;
  const { keyword, code } = event.queryStringParameters || {};

  try {
    // Route the request based on the path
    if (path === '/.netlify/functions/onet-proxy/details') {
      if (!code) {
        return createResponse(400, { error: 'Occupation code is required' });
      }
      return await handleDetails(code);
    }
    else if (path === '/.netlify/functions/onet-proxy/outlook') {
      if (!code) {
        return createResponse(400, { error: 'Occupation code is required' });
      }
      return await handleOutlook(code);
    }
    else if (path === '/.netlify/functions/onet-proxy/bright-outlook') {
      return await handleBrightOutlook();
    }
    else if (path === '/.netlify/functions/onet-proxy/bright-outlook-check') {
      if (!code) {
        return createResponse(400, { error: 'Occupation code is required' });
      }
      const brightOutlookUrl = `https://services.onetcenter.org/ws/online/occupations/${encodeURIComponent(code)}/bright_outlook`;
      const brightOutlookResponse = await axios.get(brightOutlookUrl, {
        auth: {
          username: process.env.ONET_USERNAME,
          password: process.env.ONET_PASSWORD
        },
        headers: {
          'Accept': 'application/json'
        }
      }).catch(() => ({ data: { bright_outlook: false } }));

      return createResponse(200, { brightOutlook: brightOutlookResponse.data.bright_outlook || false });
    }
    else {
      // Default to search
      if (!keyword) {
        return createResponse(400, { error: 'Keyword is required' });
      }
      return await handleSearch(keyword);
    }
  } catch (error) {
    return handleError(error);
  }
};