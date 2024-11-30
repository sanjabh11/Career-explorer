import { getOccupationDetails } from './OnetService';
import { assignGenAIImpact } from '@/utils/apoCalculations';
import type { OccupationDetails, APOItem } from '@/types/onet';

export interface APOTrendData {
  year: number;
  apo: number;
  industry: string;
  occupationCode: string;
  skillChanges: {
    skill: string;
    impact: number;
  }[];
}

export interface IndustryData {
  id: string;
  name: IndustryName;
  occupations: string[];
}

export type IndustryName = 
  | 'Information Technology'
  | 'Healthcare'
  | 'Manufacturing'
  | 'Finance'
  | 'Education';

// Real industry data from O*NET
export const industries: IndustryData[] = [
  {
    id: '11',
    name: 'Information Technology',
    occupations: ['15-1251.00', '15-1256.00', '15-1299.08'],
  },
  {
    id: '12',
    name: 'Healthcare',
    occupations: ['29-1141.00', '29-1151.00', '29-2061.00'],
  },
  {
    id: '13',
    name: 'Manufacturing',
    occupations: ['17-2112.00', '51-1011.00', '51-4041.00'],
  },
  {
    id: '14',
    name: 'Finance',
    occupations: ['13-2011.00', '13-2051.00', '13-2098.00'],
  },
  {
    id: '15',
    name: 'Education',
    occupations: ['25-1000.00', '25-2021.00', '25-3031.00'],
  },
];

const calculateAPOScore = (occupation: OccupationDetails, yearFactor: number): number => {
  const item: APOItem = {
    name: occupation.title,
    description: occupation.description,
    value: occupation.skills?.reduce((sum, skill) => sum + (skill.importance || 0), 0) || 0
  };
  
  const result = assignGenAIImpact(item);
  return Number(((result.value || 0) * (1 - yearFactor)).toFixed(2));
};

const getTopSkills = (occupation: OccupationDetails, yearFactor: number) => {
  return (occupation.skills || [])
    .slice(0, 3)
    .map(skill => ({
      skill: skill.name || '',
      impact: Number(((skill.importance || 0) * (1 - yearFactor)).toFixed(2))
    }));
};

export async function fetchIndustryAPOData(industry: IndustryName): Promise<APOTrendData[]> {
  const industryData = industries.find(i => i.name === industry);
  if (!industryData) throw new Error('Industry not found');

  try {
    // Fetch occupation details for all occupations in the industry
    const occupationPromises = industryData.occupations.map(code => 
      getOccupationDetails(code)
    );
    const occupations = await Promise.all(occupationPromises);

    // Calculate APO scores and trends
    const baseYear = new Date().getFullYear() - 4;
    const trendData: APOTrendData[] = Array.from({ length: 5 }, (_, i) => {
      const year = baseYear + i;
      const yearFactor = i * 0.05; // Simulate historical changes

      // Calculate average APO for the industry
      const industryAPO = occupations.reduce((sum, occ) => {
        const apoScore = calculateAPOScore(occ, yearFactor);
        return sum + apoScore;
      }, 0) / occupations.length;

      // Get top impacted skills
      const skillChanges = occupations.flatMap(occ => getTopSkills(occ, yearFactor));

      return {
        year,
        apo: Number(industryAPO.toFixed(2)),
        industry: industryData.name,
        occupationCode: industryData.occupations[0],
        skillChanges: skillChanges.slice(0, 5)
      };
    });

    return trendData;
  } catch (error) {
    console.error('Error fetching APO data:', error);
    throw error;
  }
}
