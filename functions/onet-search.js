const axios = require('axios');

exports.handler = async (event, context) => {
  const { keyword } = event.queryStringParameters;
  const ONET_API_URL = 'https://services.onetcenter.org/ws/online/search';

  try {
    const response = await axios.get(ONET_API_URL, {
      params: {
        keyword: keyword,
        end: 10,
      },
      auth: {
        username: process.env.ONET_USERNAME,
        password: process.env.ONET_PASSWORD,
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error('Error fetching data from O*NET:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch data from O*NET' }),
    };
  }
};
