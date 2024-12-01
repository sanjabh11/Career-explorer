import { AutomationTrend, ResearchData } from '@/types/automationTrends';

export const mockHistoricalData: AutomationTrend[] = Array.from({ length: 12 }, (_, i) => {
  const date = new Date();
  date.setMonth(date.getMonth() - (11 - i));
  return {
    date,
    apoScore: 45 + Math.sin(i / 2) * 10 + Math.random() * 5,
    factors: ['AI Advancement', 'Task Complexity', 'Human Interaction'],
    confidence: 75 + Math.random() * 15,
    industryImpact: 0.6 + Math.random() * 0.2,
    technologyAdoption: 0.7 + Math.random() * 0.2
  };
});

export const mockResearchData: ResearchData[] = [
  {
    id: '1',
    title: 'AI Impact on Professional Services',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    source: 'Journal of Automation Studies',
    findings: 'Recent advancements in large language models show significant potential for automating various aspects of professional services, particularly in data analysis and report generation.',
    impactScore: 85,
    relevantOccupations: ['13-2011', '15-1251', '13-1161'],
    confidenceLevel: 87
  },
  {
    id: '2',
    title: 'Robotics in Manufacturing: 2024 Trends',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    source: 'Industrial Automation Quarterly',
    findings: 'New collaborative robots are showing increased capability in complex assembly tasks, potentially affecting various manufacturing roles.',
    impactScore: 78,
    relevantOccupations: ['51-2092', '51-4041', '17-2112'],
    confidenceLevel: 92
  },
  {
    id: '3',
    title: 'Machine Learning in Healthcare Administration',
    date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    source: 'Healthcare Technology Review',
    findings: 'ML systems are increasingly capable of handling complex healthcare administrative tasks, including scheduling, billing, and basic patient interactions.',
    impactScore: 72,
    relevantOccupations: ['29-2071', '43-6013', '11-9111'],
    confidenceLevel: 84
  }
];

// Add mock data to the AutomationDataService
export const setupMockData = (service: any) => {
  const originalCollectHistorical = service.collectHistoricalData;
  const originalGetResearch = service.getLatestResearchData;

  service.collectHistoricalData = async () => mockHistoricalData;
  service.getLatestResearchData = async () => mockResearchData;

  return () => {
    service.collectHistoricalData = originalCollectHistorical;
    service.getLatestResearchData = originalGetResearch;
  };
};
