/**
 * Factor Breakdown Chart Component
 * Version 1.3
 * 
 * Enhanced with interactive features, tooltips, and detailed factor information
 */

import React, { useEffect, useRef, useState } from 'react';
import { FactorBreakdown } from '../../../types/apo';
import * as d3 from 'd3';
import { Modal } from '../../common/Modal';
import { Card } from '../../common/Card';
import { Tooltip } from '../../common/Tooltip';

interface FactorBreakdownChartProps {
  factorBreakdown: FactorBreakdown;
}

// Define types for the chart data
interface RadarChartDataPoint {
  axis: string;
  value: number;
  description: string;
  detailedInfo: {
    impact: string;
    trend: string;
    recommendations: string[];
  };
}

const FactorBreakdownChart: React.FC<FactorBreakdownChartProps> = ({ 
  factorBreakdown 
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [selectedFactor, setSelectedFactor] = useState<RadarChartDataPoint | null>(null);
  const [tooltipContent, setTooltipContent] = useState<{ content: string; x: number; y: number } | null>(null);
  
  useEffect(() => {
    if (!chartRef.current || !factorBreakdown) return;
    
    // Clear previous chart
    d3.select(chartRef.current).selectAll('*').remove();
    
    // Convert factor breakdown to radar chart data format with detailed information
    const data: RadarChartDataPoint[] = [
      {
        axis: 'Task Complexity',
        value: factorBreakdown.taskComplexity,
        description: 'Impact of task complexity on automation potential',
        detailedInfo: {
          impact: 'Higher complexity reduces automation potential',
          trend: 'Increasing with AI advancement',
          recommendations: [
            'Break down complex tasks into smaller components',
            'Document decision-making processes',
            'Identify automation opportunities in subtasks'
          ]
        }
      },
      {
        axis: 'Collaboration',
        value: factorBreakdown.collaborationRequirements,
        description: 'Impact of human collaboration requirements',
        detailedInfo: {
          impact: 'High collaboration needs reduce automation potential',
          trend: 'Stable with some AI assistance potential',
          recommendations: [
            'Identify core collaborative elements',
            'Consider hybrid human-AI workflows',
            'Document communication patterns'
          ]
        }
      },
      {
        axis: 'Industry Adoption',
        value: factorBreakdown.industryAdoption,
        description: 'Current industry adoption of automation',
        detailedInfo: {
          impact: 'Higher adoption indicates greater automation potential',
          trend: 'Rapidly increasing across sectors',
          recommendations: [
            'Monitor industry automation trends',
            'Identify leading automation use cases',
            'Assess competitive automation landscape'
          ]
        }
      },
      {
        axis: 'Emerging Tech',
        value: factorBreakdown.emergingTechImpact,
        description: 'Impact of emerging technologies',
        detailedInfo: {
          impact: 'New technologies expand automation possibilities',
          trend: 'Exponential growth in capabilities',
          recommendations: [
            'Track relevant technology developments',
            'Assess emerging tech applicability',
            'Plan for technology integration'
          ]
        }
      },
      {
        axis: 'Regional Factors',
        value: (
          factorBreakdown.regionalFactors.highIncome + 
          factorBreakdown.regionalFactors.middleIncome + 
          factorBreakdown.regionalFactors.lowIncome
        ) / 3,
        description: 'Regional economic and policy factors',
        detailedInfo: {
          impact: 'Regional variations affect automation adoption',
          trend: 'Varying by economic development',
          recommendations: [
            'Consider regional economic factors',
            'Assess local automation regulations',
            'Evaluate regional skill availability'
          ]
        }
      }
    ];
    
    // Chart dimensions
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const width = 500 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    
    // Create SVG container
    const svg = d3.select(chartRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${width/2 + margin.left},${height/2 + margin.top})`);
    
    // Scales and axes
    const angleScale = d3.scaleLinear()
      .domain([0, data.length])
      .range([0, 2 * Math.PI]);
      
    const radiusScale = d3.scaleLinear()
      .domain([0, 1])
      .range([0, width/2]);
    
    // Draw the circles
    const circles = [0.2, 0.4, 0.6, 0.8, 1];
    circles.forEach(circle => {
      svg.append('circle')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', radiusScale(circle))
        .attr('class', 'grid-circle')
        .style('fill', 'none')
        .style('stroke', '#ddd')
        .style('stroke-dasharray', '4,4');
    });
    
    // Draw the axes
    data.forEach((d, i) => {
      const angle = angleScale(i);
      const line = svg.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', radiusScale(1) * Math.cos(angle - Math.PI/2))
        .attr('y2', radiusScale(1) * Math.sin(angle - Math.PI/2))
        .style('stroke', '#ddd');
        
      // Add axis labels
      svg.append('text')
        .attr('x', radiusScale(1.1) * Math.cos(angle - Math.PI/2))
        .attr('y', radiusScale(1.1) * Math.sin(angle - Math.PI/2))
        .style('text-anchor', 'middle')
        .style('dominant-baseline', 'middle')
        .style('font-size', '12px')
        .text(d.axis);
    });
    
    // Create the radar path
    const lineGenerator = d3.lineRadial<RadarChartDataPoint>()
      .angle((d, i) => angleScale(i) - Math.PI/2)
      .radius(d => radiusScale(d.value))
      .curve(d3.curveLinearClosed);
    
    // Draw the radar path
    const path = svg.append('path')
      .datum(data)
      .attr('d', lineGenerator)
      .style('fill', 'rgba(65, 105, 225, 0.3)')
      .style('stroke', 'rgb(65, 105, 225)')
      .style('stroke-width', 2);
    
    // Add interactive points
    data.forEach((d, i) => {
      const angle = angleScale(i) - Math.PI/2;
      const radius = radiusScale(d.value);
      
      svg.append('circle')
        .attr('cx', radius * Math.cos(angle))
        .attr('cy', radius * Math.sin(angle))
        .attr('r', 6)
        .style('fill', 'white')
        .style('stroke', 'rgb(65, 105, 225)')
        .style('cursor', 'pointer')
        .on('mouseover', (event) => {
          setTooltipContent({
            content: d.description,
            x: event.pageX,
            y: event.pageY
          });
          d3.select(event.target)
            .transition()
            .duration(200)
            .attr('r', 8);
        })
        .on('mouseout', (event) => {
          setTooltipContent(null);
          d3.select(event.target)
            .transition()
            .duration(200)
            .attr('r', 6);
        })
        .on('click', () => {
          setSelectedFactor(d);
        });
    });
  }, [factorBreakdown]);

  return (
    <div className="relative">
      <div ref={chartRef} className="w-full h-full" />
      
      {tooltipContent && (
        <Tooltip
          content={tooltipContent.content}
          x={tooltipContent.x}
          y={tooltipContent.y}
        />
      )}
      
      {selectedFactor && (
        <Modal
          title={selectedFactor.axis}
          onClose={() => setSelectedFactor(null)}
        >
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-2">{selectedFactor.axis}</h3>
            <p className="text-gray-600 mb-4">{selectedFactor.description}</p>
            
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Impact</h4>
              <p className="text-gray-600">{selectedFactor.detailedInfo.impact}</p>
            </div>
            
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Trend</h4>
              <p className="text-gray-600">{selectedFactor.detailedInfo.trend}</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Recommendations</h4>
              <ul className="list-disc pl-4">
                {selectedFactor.detailedInfo.recommendations.map((rec, index) => (
                  <li key={index} className="text-gray-600 mb-1">{rec}</li>
                ))}
              </ul>
            </div>
          </Card>
        </Modal>
      )}
    </div>
  );
};

export default FactorBreakdownChart;
