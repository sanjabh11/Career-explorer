/**
 * Time Projection Chart Component
 * Version 1.1
 * 
 * This component visualizes time-based APO projections
 * using a line chart with confidence intervals.
 */

import React, { useEffect, useRef } from 'react';
import { TimeProjection } from '../../../types/apo';
import * as d3 from 'd3';

interface TimeProjectionChartProps {
  projections: TimeProjection[];
  currentScore: number;
}

// Define types for the chart data
interface ChartDataPoint extends TimeProjection {
  year: number;
  score: number;
  confidence: number;
  keyDrivers: string[];
}

const TimeProjectionChart: React.FC<TimeProjectionChartProps> = ({ 
  projections,
  currentScore 
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!chartRef.current || !projections.length) return;
    
    // Clear previous chart
    d3.select(chartRef.current).selectAll('*').remove();
    
    // Add current year to projections for complete visualization
    const currentYear = new Date().getFullYear();
    const allData: ChartDataPoint[] = [
      { year: currentYear, score: currentScore, confidence: 1, keyDrivers: [] },
      ...projections
    ];
    
    // Chart dimensions
    const margin = { top: 40, right: 80, bottom: 60, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select(chartRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr('style', 'max-width: 100%; height: auto;')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([currentYear, d3.max(allData, (d: ChartDataPoint) => d.year) || currentYear + 5])
      .range([0, width]);
    
    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([height, 0]);
    
    // Line generator
    const line = d3.line<ChartDataPoint>()
      .x((d: ChartDataPoint) => xScale(d.year))
      .y((d: ChartDataPoint) => yScale(d.score))
      .curve(d3.curveMonotoneX);
    
    // Confidence area generator
    const area = d3.area<ChartDataPoint>()
      .x((d: ChartDataPoint) => xScale(d.year))
      .y0((d: ChartDataPoint) => yScale(Math.max(0, d.score - (1 - d.confidence) / 2)))
      .y1((d: ChartDataPoint) => yScale(Math.min(1, d.score + (1 - d.confidence) / 2)))
      .curve(d3.curveMonotoneX);
    
    // Add confidence area
    svg.append('path')
      .datum(allData)
      .attr('fill', 'rgba(66, 153, 225, 0.2)')
      .attr('d', area);
    
    // Add line
    svg.append('path')
      .datum(allData)
      .attr('fill', 'none')
      .attr('stroke', '#3182ce')
      .attr('stroke-width', 3)
      .attr('d', line);
    
    // Add points
    svg.selectAll('.point')
      .data(allData)
      .enter()
      .append('circle')
      .attr('class', 'point')
      .attr('cx', (d: ChartDataPoint) => xScale(d.year))
      .attr('cy', (d: ChartDataPoint) => yScale(d.score))
      .attr('r', 6)
      .attr('fill', '#3182ce')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);
    
    // Add point labels
    svg.selectAll('.point-label')
      .data(allData)
      .enter()
      .append('text')
      .attr('class', 'point-label')
      .attr('x', (d: ChartDataPoint) => xScale(d.year))
      .attr('y', (d: ChartDataPoint) => yScale(d.score) - 15)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#4a5568')
      .text((d: ChartDataPoint) => `${Math.round(d.score * 100)}%`);
    
    // Add axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat((d: any) => d.toString())
      .ticks(allData.length);
    
    const yAxis = d3.axisLeft(yScale)
      .tickFormat((d: any) => `${Math.round(d * 100)}%`)
      .ticks(5);
    
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text')
      .attr('font-size', '12px')
      .attr('fill', '#4a5568');
    
    svg.append('g')
      .call(yAxis)
      .selectAll('text')
      .attr('font-size', '12px')
      .attr('fill', '#4a5568');
    
    // Add axis labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + 40)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('fill', '#2d3748')
      .text('Year');
    
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -40)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('fill', '#2d3748')
      .text('Automation Potential');
    
    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('fill', '#2d3748')
      .text('Automation Potential Over Time');
    
    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - 120}, 0)`);
    
    legend.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 120)
      .attr('height', 60)
      .attr('fill', 'white')
      .attr('stroke', '#e2e8f0')
      .attr('rx', 4);
    
    legend.append('line')
      .attr('x1', 10)
      .attr('y1', 15)
      .attr('x2', 30)
      .attr('y2', 15)
      .attr('stroke', '#3182ce')
      .attr('stroke-width', 3);
    
    legend.append('text')
      .attr('x', 40)
      .attr('y', 19)
      .attr('font-size', '12px')
      .attr('fill', '#4a5568')
      .text('APO Score');
    
    legend.append('rect')
      .attr('x', 10)
      .attr('y', 30)
      .attr('width', 20)
      .attr('height', 10)
      .attr('fill', 'rgba(66, 153, 225, 0.2)');
    
    legend.append('text')
      .attr('x', 40)
      .attr('y', 39)
      .attr('font-size', '12px')
      .attr('fill', '#4a5568')
      .text('Confidence');
    
  }, [projections, currentScore]);
  
  return (
    <div className="time-projection-chart" ref={chartRef}></div>
  );
};

export default TimeProjectionChart;
