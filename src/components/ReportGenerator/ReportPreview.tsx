import React from 'react';
import { Card } from '@/components/ui/card';
import { ReportStyle } from './ReportStyles';
import { AutomationFactor, AutomationTrend } from '@/types/automation';

interface ReportPreviewProps {
  style: ReportStyle;
  sections: {
    overview: boolean;
    factors: boolean;
    trends: boolean;
    recommendations: boolean;
  };
  factors: AutomationFactor[];
  trends: AutomationTrend[];
  occupationTitle: string;
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({
  style,
  sections,
  factors,
  trends,
  occupationTitle,
}) => {
  return (
    <Card className="p-6 bg-white shadow-lg max-h-[600px] overflow-y-auto">
      <div className="space-y-6" style={{ fontFamily: style.font }}>
        {/* Header */}
        <div className="border-b pb-4" style={{ borderColor: style.primaryColor }}>
          {style.headerLogo && (
            <img src={style.headerLogo} alt="Logo" className="h-8 mb-4" />
          )}
          <h1 className="text-2xl font-bold" style={{ color: style.primaryColor }}>
            Career Automation Analysis: {occupationTitle}
          </h1>
        </div>

        {/* Overview Section */}
        {sections.overview && (
          <div className="space-y-2">
            <h2 className="text-xl font-semibold" style={{ color: style.secondaryColor }}>
              Overview
            </h2>
            <p>
              Current Automation Potential:{' '}
              <span className="font-bold">
                {(trends[trends.length - 1]?.score || 0).toFixed(1)}%
              </span>
            </p>
          </div>
        )}

        {/* Factors Section */}
        {sections.factors && (
          <div className="space-y-2">
            <h2 className="text-xl font-semibold" style={{ color: style.secondaryColor }}>
              Key Factors
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr style={{ backgroundColor: style.primaryColor + '20' }}>
                    <th className="px-4 py-2 text-left">Factor</th>
                    <th className="px-4 py-2 text-left">Impact</th>
                    <th className="px-4 py-2 text-left">AI Impact</th>
                    <th className="px-4 py-2 text-left">Collaboration</th>
                  </tr>
                </thead>
                <tbody>
                  {factors.map((factor, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-4 py-2">{factor.name}</td>
                      <td className="px-4 py-2">{(factor.weight * 100).toFixed(1)}%</td>
                      <td className="px-4 py-2">
                        {(factor.emergingTechImpact * 100).toFixed(1)}%
                      </td>
                      <td className="px-4 py-2">
                        {(factor.humanAICollaboration * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Trends Section */}
        {sections.trends && (
          <div className="space-y-2">
            <h2 className="text-xl font-semibold" style={{ color: style.secondaryColor }}>
              Automation Trends
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr style={{ backgroundColor: style.primaryColor + '20' }}>
                    <th className="px-4 py-2 text-left">Year</th>
                    <th className="px-4 py-2 text-left">Score</th>
                    <th className="px-4 py-2 text-left">Confidence</th>
                    <th className="px-4 py-2 text-left">Key Factors</th>
                  </tr>
                </thead>
                <tbody>
                  {trends.map((trend, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-4 py-2">{trend.year}</td>
                      <td className="px-4 py-2">{trend.score.toFixed(1)}%</td>
                      <td className="px-4 py-2">
                        {(trend.confidence * 100).toFixed(1)}%
                      </td>
                      <td className="px-4 py-2">{trend.keyFactors?.join(', ') || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
