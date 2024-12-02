import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { AutomationFactor, AutomationTrend } from '@/types/automation';
import { ReportStyle } from './ReportStyles';

interface PDFGeneratorOptions {
  factors: AutomationFactor[];
  trends: AutomationTrend[];
  occupationTitle: string;
  style: ReportStyle;
  sections: {
    overview: boolean;
    factors: boolean;
    trends: boolean;
    recommendations: boolean;
  };
}

export class PDFGenerator {
  private doc: jsPDF;
  private yPos: number = 20;
  private readonly marginLeft: number = 20;
  private readonly pageWidth: number = 210; // A4 width in mm
  private readonly contentWidth: number = 170;

  constructor(private options: PDFGeneratorOptions) {
    this.doc = new jsPDF();
    this.setupDocument();
  }

  private setupDocument() {
    this.doc.setFont(this.options.style.font);
    this.addHeaderLogo();
  }

  private addHeaderLogo() {
    if (this.options.style.headerLogo) {
      const img = new Image();
      img.src = this.options.style.headerLogo;
      this.doc.addImage(img, 'PNG', this.marginLeft, this.yPos, 30, 15);
      this.yPos += 20;
    }
  }

  private addTitle() {
    this.doc.setFontSize(24);
    this.doc.setTextColor(this.options.style.primaryColor);
    this.doc.text(
      `Career Automation Analysis`,
      this.marginLeft,
      this.yPos
    );
    this.yPos += 10;

    this.doc.setFontSize(18);
    this.doc.text(
      this.options.occupationTitle,
      this.marginLeft,
      this.yPos
    );
    this.yPos += 20;
  }

  private addSection(title: string, callback: () => void) {
    // Add section header
    this.doc.setFontSize(16);
    this.doc.setTextColor(this.options.style.secondaryColor);
    this.doc.text(title, this.marginLeft, this.yPos);
    this.yPos += 10;

    // Reset text color for content
    this.doc.setTextColor('#000000');
    this.doc.setFontSize(12);

    // Execute section content
    callback();

    // Add spacing after section
    this.yPos += 15;
  }

  private addOverviewSection() {
    if (!this.options.sections.overview) return;

    this.addSection('Overview', () => {
      const overallScore = this.options.trends[this.options.trends.length - 1]?.score || 0;
      const scoreText = `Current Automation Potential: ${overallScore.toFixed(1)}%`;
      
      // Add score gauge
      this.addScoreGauge(overallScore);
      this.yPos += 30;

      // Add summary text
      const summary = this.getAutomationSummary(overallScore);
      const lines = this.doc.splitTextToSize(summary, this.contentWidth);
      this.doc.text(lines, this.marginLeft, this.yPos);
      this.yPos += lines.length * 7;
    });
  }

  private addScoreGauge(score: number) {
    // Draw gauge background
    this.doc.setFillColor('#e5e7eb');
    this.doc.rect(this.marginLeft, this.yPos, 100, 10, 'F');

    // Draw score fill
    this.doc.setFillColor(this.getScoreColor(score));
    this.doc.rect(this.marginLeft, this.yPos, score, 10, 'F');

    // Add score text
    this.doc.setFontSize(12);
    this.doc.text(`${score.toFixed(1)}%`, this.marginLeft + 105, this.yPos + 7);
  }

  private getScoreColor(score: number): string {
    if (score >= 75) return '#ef4444'; // High risk - red
    if (score >= 50) return '#f59e0b'; // Medium risk - amber
    return '#22c55e'; // Low risk - green
  }

  private getAutomationSummary(score: number): string {
    if (score >= 75) {
      return 'High automation potential detected. This occupation shows significant exposure to automation technologies. Focus on developing unique human skills and AI collaboration capabilities to remain competitive.';
    } else if (score >= 50) {
      return 'Moderate automation potential observed. While some aspects of this role may be automated, there are opportunities to adapt and upskill in areas that complement AI capabilities.';
    }
    return 'Lower automation potential identified. This occupation currently shows resilience to automation. Continue focusing on core competencies while monitoring technological developments in the field.';
  }

  private addFactorsSection() {
    if (!this.options.sections.factors) return;

    this.addSection('Key Factors', () => {
      const factorData = this.options.factors.map(factor => [
        factor.name,
        `${(factor.weight * 100).toFixed(1)}%`,
        `${(factor.emergingTechImpact * 100).toFixed(1)}%`,
        `${(factor.humanAICollaboration * 100).toFixed(1)}%`,
      ]);

      (this.doc as any).autoTable({
        startY: this.yPos,
        head: [['Factor', 'Impact', 'AI Impact', 'Collaboration']],
        body: factorData,
        headStyles: {
          fillColor: this.options.style.primaryColor,
          textColor: '#FFFFFF',
          fontSize: 12,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: `${this.options.style.primaryColor}15`,
        },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 30, halign: 'center' },
          3: { cellWidth: 40, halign: 'center' },
        },
        margin: { left: this.marginLeft },
        tableWidth: this.contentWidth,
      });

      this.yPos = (this.doc as any).lastAutoTable.finalY + 10;
    });
  }

  private addTrendsSection() {
    if (!this.options.sections.trends) return;

    this.addSection('Automation Trends', () => {
      const trendData = this.options.trends.map(trend => [
        trend.year.toString(),
        `${trend.score.toFixed(1)}%`,
        `${(trend.confidence * 100).toFixed(1)}%`,
        trend.keyFactors?.join(', ') || '',
      ]);

      (this.doc as any).autoTable({
        startY: this.yPos,
        head: [['Year', 'Score', 'Confidence', 'Key Factors']],
        body: trendData,
        headStyles: {
          fillColor: this.options.style.primaryColor,
          textColor: '#FFFFFF',
          fontSize: 12,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: `${this.options.style.primaryColor}15`,
        },
        columnStyles: {
          0: { cellWidth: 30, halign: 'center' },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 30, halign: 'center' },
          3: { cellWidth: 70 },
        },
        margin: { left: this.marginLeft },
        tableWidth: this.contentWidth,
      });

      this.yPos = (this.doc as any).lastAutoTable.finalY + 10;
    });
  }

  private addRecommendationsSection() {
    if (!this.options.sections.recommendations) return;

    this.addSection('Recommendations', () => {
      const recommendations = this.generateRecommendations();
      
      recommendations.forEach((rec, index) => {
        // Add new page if needed
        if (this.yPos > 270) {
          this.doc.addPage();
          this.yPos = 20;
        }

        // Add recommendation number
        this.doc.setFontSize(12);
        this.doc.setFont(this.options.style.font, 'bold');
        this.doc.text(`${index + 1}.`, this.marginLeft, this.yPos);

        // Add recommendation text
        this.doc.setFont(this.options.style.font, 'normal');
        const lines = this.doc.splitTextToSize(rec, this.contentWidth - 10);
        this.doc.text(lines, this.marginLeft + 10, this.yPos);
        this.yPos += lines.length * 7 + 5;
      });
    });
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const latestTrend = this.options.trends[this.options.trends.length - 1];

    // Overall recommendation based on trend
    if (latestTrend) {
      if (latestTrend.score > 75) {
        recommendations.push(
          'High automation risk identified. Prioritize developing skills in areas that AI currently struggles with, such as creative problem-solving, emotional intelligence, and complex decision-making. Focus on roles that require human oversight of AI systems.'
        );
      } else if (latestTrend.score > 50) {
        recommendations.push(
          'Moderate automation potential detected. Consider upskilling in areas that complement AI capabilities. Focus on developing a mix of technical and soft skills to remain competitive in the evolving job market.'
        );
      } else {
        recommendations.push(
          'Lower automation risk observed. While your role shows resilience to automation, stay updated with technological advancements in your field. Consider learning how to leverage AI tools to enhance your productivity.'
        );
      }
    }

    // Factor-specific recommendations
    this.options.factors.forEach(factor => {
      if (factor.emergingTechImpact > 0.7) {
        recommendations.push(
          `${factor.name}: High AI impact detected. Prioritize learning how to work alongside AI tools in this area. Focus on understanding AI capabilities and limitations to effectively collaborate with automated systems.`
        );
      }
      if (factor.humanAICollaboration > 0.8) {
        recommendations.push(
          `${factor.name}: Strong potential for human-AI collaboration. Develop skills in AI system oversight, quality control, and exception handling. Consider training in prompt engineering and AI system management.`
        );
      }
    });

    return recommendations;
  }

  public generate() {
    this.addTitle();
    this.addOverviewSection();
    this.addFactorsSection();
    this.addTrendsSection();
    this.addRecommendationsSection();

    // Add footer with date and page numbers
    const totalPages = this.doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(10);
      this.doc.setTextColor('#666666');
      
      // Add date
      const date = new Date().toLocaleDateString();
      this.doc.text(date, this.marginLeft, 290);
      
      // Add page numbers
      this.doc.text(
        `Page ${i} of ${totalPages}`,
        this.pageWidth - this.marginLeft - 20,
        290,
        { align: 'right' }
      );
    }

    // Save the PDF
    this.doc.save(
      `${this.options.occupationTitle.toLowerCase().replace(/\s+/g, '-')}-automation-report.pdf`
    );
  }
}
