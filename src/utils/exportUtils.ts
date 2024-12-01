import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { OccupationDetails, AutomationFactor } from '@/types/occupation';

interface ExportData {
  occupation: OccupationDetails;
  factors: AutomationFactor[];
  enhancedAPO: number;
  trends: any[];
}

export type ExportFormat = 'excel' | 'pdf' | 'json';

const generateExcelFile = (data: ExportData): Blob => {
  const workbook = XLSX.utils.book_new();

  // Summary sheet
  const summaryData = [
    ['Occupation Details'],
    ['Title', data.occupation.title],
    ['Code', data.occupation.code],
    ['Enhanced APO Score', data.enhancedAPO.toFixed(2) + '%'],
    ['Last Updated', new Date().toLocaleDateString()],
    [],
    ['Automation Factors'],
    ['Factor', 'Weight', 'Category', 'Complexity', 'Tech Impact'],
    ...data.factors.map(f => [
      f.name,
      (f.weight * 100).toFixed(2) + '%',
      f.category,
      (f.complexity * 100).toFixed(2) + '%',
      (f.emergingTechImpact * 100).toFixed(2) + '%'
    ])
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Trends sheet
  const trendsData = [
    ['Date', 'APO Value', 'Type'],
    ...data.trends.map(t => [
      t.date,
      t.apo.toFixed(2) + '%',
      t.type
    ])
  ];

  const trendsSheet = XLSX.utils.aoa_to_sheet(trendsData);
  XLSX.utils.book_append_sheet(workbook, trendsSheet, 'Trends');

  // Generate blob
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

const generatePDFFile = (data: ExportData): Blob => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.text('Automation Potential Analysis Report', 14, 20);

  // Occupation Details
  doc.setFontSize(16);
  doc.text('Occupation Details', 14, 40);
  
  autoTable(doc, {
    startY: 45,
    head: [['Field', 'Value']],
    body: [
      ['Title', data.occupation.title || ''],
      ['Code', data.occupation.code || ''],
      ['Enhanced APO Score', `${data.enhancedAPO.toFixed(2)}%`],
      ['Last Updated', new Date().toLocaleDateString()]
    ]
  });

  // Automation Factors
  doc.setFontSize(16);
  const finalY = (doc as any).lastAutoTable?.finalY || 20;
  doc.text('Automation Factors', 14, finalY + 20);

  autoTable(doc, {
    startY: finalY + 25,
    head: [['Factor', 'Weight', 'Category', 'Impact']],
    body: data.factors.map(f => [
      f.name,
      `${(f.weight * 100).toFixed(2)}%`,
      f.category,
      `${(f.emergingTechImpact * 100).toFixed(2)}%`
    ])
  });

  return doc.output('blob');
};

export const exportData = async (
  format: ExportFormat,
  data: ExportData
): Promise<{ blob: Blob; filename: string }> => {
  const timestamp = new Date().toISOString().split('T')[0];
  const occupationCode = data.occupation.code || 'unknown';

  switch (format) {
    case 'excel': {
      const blob = generateExcelFile(data);
      return {
        blob,
        filename: `apo-analysis-${occupationCode}-${timestamp}.xlsx`
      };
    }
    case 'pdf': {
      const blob = generatePDFFile(data);
      return {
        blob,
        filename: `apo-analysis-${occupationCode}-${timestamp}.pdf`
      };
    }
    case 'json': {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      return {
        blob,
        filename: `apo-analysis-${occupationCode}-${timestamp}.json`
      };
    }
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};
