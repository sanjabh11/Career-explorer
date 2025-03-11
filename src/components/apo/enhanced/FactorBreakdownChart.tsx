/**
 * Factor Breakdown Chart Component
 * Version 1.2
 * 
 * This component visualizes the factor breakdown of the enhanced APO calculation
 * using a radar chart to show the impact of different factors.
 */

import React, { useEffect, useRef } from 'react';
import { FactorBreakdown } from '../../../types/apo';
import * as d3 from 'd3';

interface FactorBreakdownChartProps {
  factorBreakdown: FactorBreakdown;
}

// Define types for the chart data
interface RadarChartDataPoint {
  axis: string;
  value: number;
  description: string;
}

const FactorBreakdownChart: React.FC<FactorBreakdownChartProps> = ({ 
  factorBreakdown 
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!chartRef.current || !factorBreakdown) return;
    
    // Clear previous chart
    d3.select(chartRef.current).selectAll('*').remove();
    
    // Convert factor breakdown to radar chart data format
    const data: RadarChartDataPoint[] = [
      { axis: 'Task Complexity', value: factorBreakdown.taskComplexity, description: 'Impact of task complexity on automation potential' },
      { axis: 'Collaboration', value: factorBreakdown.collaborationRequirements, description: 'Impact of human collaboration requirements' },
      { axis: 'Industry Adoption', value: factorBreakdown.industryAdoption, description: 'Current industry adoption of automation' },
      { axis: 'Emerging Tech', value: factorBreakdown.emergingTechImpact, description: 'Impact of emerging technologies' },
      { axis: 'Regional Factors', value: (
        factorBreakdown.regionalFactors.highIncome + 
        factorBreakdown.regionalFactors.middleIncome + 
        factorBreakdown.regionalFactors.lowIncome
      ) / 3, description: 'Regional economic and policy factors' }
    ];
    
    // Chart dimensions
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const width = 500 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    const radius = Math.min(width, height) / 2;
    
    // Create SVG
    const svg = d3.select(chartRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr('style', 'max-width: 100%; height: auto;')
      .append('g')
      .attr('transform', `translate(${(width + margin.left + margin.right) / 2},${(height + margin.top + margin.bottom) / 2})`);
    
    // Number of axes (factors)
    const allAxis = data.map(d => d.axis);
    const total = allAxis.length;
    const angleSlice = (Math.PI * 2) / total;
    
    // Scale for the radius
    const rScale = d3.scaleLinear()
      .domain([0, 1])
      .range([0, radius]);
    
    // Draw the circular grid
    // Draw the background circles
    const axisGrid = svg.append('g').attr('class', 'axis-grid');
    
    // Draw the circles
    const circles = [0.2, 0.4, 0.6, 0.8, 1];
    circles.forEach(d => {
      axisGrid.append('circle')
        .attr('r', rScale(d))
        .attr('fill', 'none')
        .attr('stroke', '#e2e8f0')
        .attr('stroke-dasharray', '4,4');
      
      // Add circle labels
      axisGrid.append('text')
        .attr('x', 0)
        .attr('y', -rScale(d))
        .attr('dy', '0.4em')
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', '#718096')
        .text(`${d * 100}%`);
    });
    
    // Draw the axes
    const axis = axisGrid.selectAll('.axis')
      .data(allAxis)
      .enter()
      .append('g')
      .attr('class', 'axis');
    
    // Draw the lines
    axis.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', (d: string, i: number) => rScale(1.1) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('y2', (d: string, i: number) => rScale(1.1) * Math.sin(angleSlice * i - Math.PI / 2))
      .attr('stroke', '#cbd5e0')
      .attr('stroke-width', 1);
    
    // Draw the axis labels
    axis.append('text')
      .attr('x', (d: string, i: number) => rScale(1.2) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('y', (d: string, i: number) => rScale(1.2) * Math.sin(angleSlice * i - Math.PI / 2))
      .attr('text-anchor', (d: string, i: number) => {
        if (i === 0 || i === total / 2) return 'middle';
        return i < total / 2 ? 'start' : 'end';
      })
      .attr('dy', '0.35em')
      .attr('font-size', '12px')
      .attr('fill', '#4a5568')
      .text((d: string) => d);
    
    // Draw the radar chart blobs
    // Create the wrapper for the blobs
    const radarWrapper = svg.append('g').attr('class', 'radar-wrapper');
    
    // Draw the radar area
    const radarLine = d3.lineRadial<RadarChartDataPoint>()
      .radius((d: RadarChartDataPoint) => rScale(d.value))
      .angle((d: RadarChartDataPoint, i: number) => i * angleSlice)
      .curve(d3.curveLinearClosed);
    
    // Create a wrapper for the radar area
    const blobWrapper = radarWrapper.append('g').attr('class', 'blob-wrapper');
    
    // Append the radar area
    blobWrapper.append('path')
      .datum(data)
      .attr('d', d => radarLine(d as any))
      .attr('fill', 'rgba(66, 153, 225, 0.5)')
      .attr('stroke', '#3182ce')
      .attr('stroke-width', 2);
    
    // Append dots at each data point
    blobWrapper.selectAll('.radar-dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'radar-dot')
      .attr('r', 6)
      .attr('cx', (d: RadarChartDataPoint, i: number) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('cy', (d: RadarChartDataPoint, i: number) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2))
      .attr('fill', '#3182ce')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);
    
    // Add value labels at each data point
    blobWrapper.selectAll('.radar-value')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'radar-value')
      .attr('x', (d: RadarChartDataPoint, i: number) => rScale(d.value + 0.1) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('y', (d: RadarChartDataPoint, i: number) => rScale(d.value + 0.1) * Math.sin(angleSlice * i - Math.PI / 2))
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', '#2d3748')
      .text((d: RadarChartDataPoint) => `${Math.round(d.value * 100)}%`);
    
    // Add title
    svg.append('text')
      .attr('x', 0)
      .attr('y', -height / 2 - 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('fill', '#2d3748')
      .text('Factor Breakdown Analysis');
    
  }, [factorBreakdown]);
  
  return (
    <div className="factor-breakdown-chart" ref={chartRef}></div>
  );
};

export default FactorBreakdownChart;
