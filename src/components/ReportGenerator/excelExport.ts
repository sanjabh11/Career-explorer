import * as XLSX from 'xlsx';
import { AutomationFactor, AutomationTrend } from '@/types/automation';

interface ExcelData {
  factors: AutomationFactor[];
  trends: AutomationTrend[];
  occupationTitle: string;
}

export const exportToExcel = ({ factors, trends, occupationTitle }: ExcelData) => {
  const workbook = XLSX.utils.book_new();

  // Overview Sheet
  const overviewData = [
    ['Occupation Title', occupationTitle],
    ['Current Automation Potential', `${(trends[trends.length - 1]?.score || 0).toFixed(1)}%`],
    ['Analysis Date', new Date().toLocaleDateString()],
  ];
  const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
  XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Overview');

  // Factors Sheet
  const factorsData = [
    ['Factor', 'Impact', 'AI Impact', 'Collaboration'],
    ...factors.map(factor => [
      factor.name,
      `${(factor.weight * 100).toFixed(1)}%`,
      `${(factor.emergingTechImpact * 100).toFixed(1)}%`,
      `${(factor.humanAICollaboration * 100).toFixed(1)}%`,
    ]),
  ];
  const factorsSheet = XLSX.utils.aoa_to_sheet(factorsData);
  XLSX.utils.book_append_sheet(workbook, factorsSheet, 'Factors');

  // Trends Sheet
  const trendsData = [
    ['Year', 'Score', 'Confidence', 'Key Factors'],
    ...trends.map(trend => [
      trend.year.toString(),
      `${trend.score.toFixed(1)}%`,
      `${(trend.confidence * 100).toFixed(1)}%`,
      trend.keyFactors?.join(', ') || '',
    ]),
  ];
  const trendsSheet = XLSX.utils.aoa_to_sheet(trendsData);
  XLSX.utils.book_append_sheet(workbook, trendsSheet, 'Trends');

  // Save the file
  XLSX.writeFile(workbook, `${occupationTitle.toLowerCase().replace(/\s+/g, '-')}-automation-analysis.xlsx`);
};
