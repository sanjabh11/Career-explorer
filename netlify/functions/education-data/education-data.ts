import { Handler } from '@netlify/functions';
import axios from 'axios';

const ONET_API_BASE = 'https://services.onetcenter.org/ws/online/occupations';

const handler: Handler = async (event) => {
  const { occupationCode } = event.queryStringParameters || {};

  if (!occupationCode) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Occupation code is required' }),
    };
  }

  try {
    // Fetch education data from O*NET
    const response = await axios.get(`${ONET_API_BASE}/${occupationCode}/education_training_experience`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.ONET_USERNAME}:${process.env.ONET_PASSWORD}`).toString('base64')}`,
        'Accept': 'application/json'
      }
    });

    // Transform the data to match our schema
    const educationData = {
      occupationId: occupationCode,
      typicalEducation: response.data.education.typical.category,
      educationLevels: response.data.education.categories.map((cat: any) => ({
        level: cat.category,
        required: cat.required,
        preferredPercentage: cat.percentReporting,
        description: cat.description
      })),
      certifications: response.data.licenses_certifications?.map((cert: any) => ({
        name: cert.name,
        provider: cert.provider,
        description: cert.description,
        required: cert.required,
        validityPeriod: cert.validityPeriod
      })) || [],
      continuingEducation: response.data.related_courses?.map((course: any) => course.name) || []
    };

    return {
      statusCode: 200,
      body: JSON.stringify(educationData),
    };
  } catch (error) {
    console.error('Error fetching education data:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch education data' }),
    };
  }
};

export { handler };
