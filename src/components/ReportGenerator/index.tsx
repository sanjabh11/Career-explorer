import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Download, FileType, Share, Eye } from 'lucide-react';
import { AutomationFactor, AutomationTrend } from '@/types/automation';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ReportStyles, ReportStyle } from './ReportStyles';
import { ReportPreview } from './ReportPreview';
import { exportToExcel } from './excelExport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface ReportGeneratorProps {
  factors: AutomationFactor[];
  trends: AutomationTrend[];
  occupationTitle: string;
}

interface ReportSections {
  overview: boolean;
  factors: boolean;
  trends: boolean;
  recommendations: boolean;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  factors,
  trends,
  occupationTitle,
}) => {
  const [sections, setSections] = useState<ReportSections>({
    overview: true,
    factors: true,
    trends: true,
    recommendations: true,
  });

  const [style, setStyle] = useState<ReportStyle>({
    font: 'helvetica',
    primaryColor: '#1a365d',
    secondaryColor: '#2563eb',
    template: 'professional',
  });

  const generatePDF = () => {
    const doc = new jsPDF();
    let yPos = 20;

    // Apply styling
    doc.setFont(style.font);
    
    // Add logo if provided
    if (style.headerLogo) {
      doc.addImage(style.headerLogo, 'PNG', 20, yPos, 30, 15);
      yPos += 20;
    }

    // Title
    doc.setFontSize(20);
    doc.setTextColor(style.primaryColor);
    doc.text(`Career Automation Analysis: ${occupationTitle}`, 20, yPos);
    yPos += 20;

    if (sections.overview) {
      doc.setFontSize(16);
      doc.setTextColor(style.secondaryColor);
      doc.text('Overview', 20, yPos);
      yPos += 10;
      doc.setFontSize(12);
      doc.setTextColor('#000000');
      const overallScore = trends[trends.length - 1]?.score || 0;
      doc.text(`Current Automation Potential: ${overallScore.toFixed(1)}%`, 20, yPos);
      yPos += 20;
    }

    if (sections.factors) {
      doc.setFontSize(16);
      doc.setTextColor(style.secondaryColor);
      doc.text('Key Factors', 20, yPos);
      yPos += 10;
      
      const factorData = factors.map(factor => [
        factor.name,
        `${(factor.weight * 100).toFixed(1)}%`,
        `${(factor.emergingTechImpact * 100).toFixed(1)}%`,
        `${(factor.humanAICollaboration * 100).toFixed(1)}%`,
      ]);

      (doc as any).autoTable({
        startY: yPos,
        head: [['Factor', 'Impact', 'AI Impact', 'Collaboration']],
        body: factorData,
        margin: { top: 20 },
        headStyles: { fillColor: style.primaryColor },
        alternateRowStyles: { fillColor: `${style.primaryColor}10` },
      });
      yPos = (doc as any).lastAutoTable.finalY + 20;
    }

    if (sections.trends) {
      doc.setFontSize(16);
      doc.setTextColor(style.secondaryColor);
      doc.text('Automation Trends', 20, yPos);
      yPos += 10;

      const trendData = trends.map(trend => [
        trend.year.toString(),
        `${trend.score.toFixed(1)}%`,
        `${(trend.confidence * 100).toFixed(1)}%`,
        trend.keyFactors?.join(', ') || '',
      ]);

      (doc as any).autoTable({
        startY: yPos,
        head: [['Year', 'Score', 'Confidence', 'Key Factors']],
        body: trendData,
        margin: { top: 20 },
        headStyles: { fillColor: style.primaryColor },
        alternateRowStyles: { fillColor: `${style.primaryColor}10` },
      });
      yPos = (doc as any).lastAutoTable.finalY + 20;
    }

    if (sections.recommendations) {
      doc.setFontSize(16);
      doc.setTextColor(style.secondaryColor);
      doc.text('Recommendations', 20, yPos);
      yPos += 10;
      doc.setFontSize(12);
      doc.setTextColor('#000000');
      
      const recommendations = generateRecommendations(factors, trends);
      recommendations.forEach(rec => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        const lines = doc.splitTextToSize(rec, 170);
        doc.text(lines, 20, yPos);
        yPos += 10 * lines.length;
      });
    }

    doc.save(`${occupationTitle.toLowerCase().replace(/\s+/g, '-')}-automation-report.pdf`);
  };

  const generateRecommendations = (factors: AutomationFactor[], trends: AutomationTrend[]): string[] => {
    const recommendations: string[] = [];
    const latestTrend = trends[trends.length - 1];

    // Overall recommendation based on trend
    if (latestTrend) {
      if (latestTrend.score > 75) {
        recommendations.push('High automation potential detected. Focus on developing unique human skills and AI collaboration capabilities.');
      } else if (latestTrend.score > 50) {
        recommendations.push('Moderate automation potential. Consider upskilling in areas that complement AI capabilities.');
      } else {
        recommendations.push('Lower automation potential. Focus on maintaining current skills while monitoring technological developments.');
      }
    }

    // Factor-specific recommendations
    factors.forEach(factor => {
      if (factor.emergingTechImpact > 0.7) {
        recommendations.push(`${factor.name}: High AI impact detected. Prioritize learning how to work alongside AI tools in this area.`);
      }
      if (factor.humanAICollaboration > 0.8) {
        recommendations.push(`${factor.name}: Strong potential for human-AI collaboration. Focus on developing skills to effectively work with AI systems.`);
      }
    });

    return recommendations;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Custom Report</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="content" className="space-y-4">
          <TabsList>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <div className="space-y-4">
              <h4 className="font-medium">Include Sections:</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="overview"
                    checked={sections.overview}
                    onCheckedChange={(checked: boolean) => 
                      setSections(prev => ({ ...prev, overview: checked }))
                    }
                  />
                  <Label htmlFor="overview">Overview</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="factors"
                    checked={sections.factors}
                    onCheckedChange={(checked: boolean) => 
                      setSections(prev => ({ ...prev, factors: checked }))
                    }
                  />
                  <Label htmlFor="factors">Key Factors</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="trends"
                    checked={sections.trends}
                    onCheckedChange={(checked: boolean) => 
                      setSections(prev => ({ ...prev, trends: checked }))
                    }
                  />
                  <Label htmlFor="trends">Trends</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="recommendations"
                    checked={sections.recommendations}
                    onCheckedChange={(checked: boolean) => 
                      setSections(prev => ({ ...prev, recommendations: checked }))
                    }
                  />
                  <Label htmlFor="recommendations">Recommendations</Label>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="style">
            <ReportStyles style={style} onStyleChange={setStyle} />
          </TabsContent>

          <TabsContent value="preview">
            <ReportPreview
              style={style}
              sections={sections}
              factors={factors}
              trends={trends}
              occupationTitle={occupationTitle}
            />
          </TabsContent>
        </Tabs>
          
        <div className="flex space-x-4 mt-6">
          <Button onClick={generatePDF} className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => exportToExcel({ factors, trends, occupationTitle })}
            className="flex items-center space-x-2"
          >
            <FileType className="w-4 h-4" />
            <span>Export to Excel</span>
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>Full Preview</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <ReportPreview
                style={style}
                sections={sections}
                factors={factors}
                trends={trends}
                occupationTitle={occupationTitle}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};
