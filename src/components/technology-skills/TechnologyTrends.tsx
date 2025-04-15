// src/components/technology-skills/TechnologyTrends.tsx
// Version 1.3.0

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Info as InfoIcon,
  Computer as ComputerIcon
} from '@mui/icons-material';
import { TechnologyTrend, TechnologyTrendData } from '@/types/technologySkills';
import { getTechnologyTrends } from '@/services/TechnologySkillsService';

// Placeholder component for chart visualization
// In a real implementation, you would use a library like recharts, visx, or chart.js
const TrendChart: React.FC<{
  data: { year: number; value: number }[];
  width?: number;
  height?: number;
  color?: string;
}> = ({ data, width = 200, height = 60, color = '#2196f3' }) => {
  // Find min and max values for scaling
  const values = data.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue;

  // Function to scale value to chart height
  const scaleY = (value: number): number => {
    if (range === 0) return height / 2;
    return height - ((value - minValue) / range) * height;
  };

  // Function to scale year to chart width
  const scaleX = (index: number): number => {
    if (data.length <= 1) return width / 2;
    return (index / (data.length - 1)) * width;
  };

  // Generate SVG path
  const linePath = data.map((point, index) =>
    `${index === 0 ? 'M' : 'L'} ${scaleX(index)} ${scaleY(point.value)}`
  ).join(' ');

  return (
    <Box sx={{ width, height, position: 'relative' }}>
      <Typography variant="caption" color="text.secondary" sx={{ position: 'absolute', top: 0, left: 0 }}>
        {maxValue.toFixed(1)}
      </Typography>

      <Typography variant="caption" color="text.secondary" sx={{ position: 'absolute', bottom: 0, left: 0 }}>
        {minValue.toFixed(1)}
      </Typography>

      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={2}
        />

        {data.map((point, index) => (
          <circle
            key={index}
            cx={scaleX(index)}
            cy={scaleY(point.value)}
            r={3}
            fill={color}
          />
        ))}
      </svg>

      <Typography variant="caption" color="text.secondary" sx={{ position: 'absolute', bottom: -20, left: 0 }}>
        {data[0].year}
      </Typography>

      <Typography variant="caption" color="text.secondary" sx={{ position: 'absolute', bottom: -20, right: 0 }}>
        {data[data.length - 1].year}
      </Typography>
    </Box>
  );
};

interface TechnologyTrendsProps {
  occupationCode?: string;
  industryCode?: string;
  limit?: number;
}

const TechnologyTrends: React.FC<TechnologyTrendsProps> = ({
  occupationCode,
  industryCode,
  limit = 10
}) => {
  const [trendData, setTrendData] = useState<TechnologyTrendData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getTechnologyTrends(5); // Use default timespan of 5 years
        setTrendData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching technology trends:', err);
        setError('Failed to load technology trends');
        setLoading(false);
      }
    };

    fetchData();
  }, [occupationCode, industryCode]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'emerging':
      case 'growing':
        return <TrendingUpIcon color="success" />;
      case 'stable':
        return <TrendingFlatIcon color="action" />;
      case 'declining':
        return <TrendingDownIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getTrendColor = (trend: string): string => {
    switch (trend) {
      case 'emerging':
        return '#4caf50'; // Green
      case 'growing':
        return '#2196f3'; // Blue
      case 'stable':
        return '#ff9800'; // Orange
      case 'declining':
        return '#f44336'; // Red
      default:
        return '#9e9e9e'; // Grey
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={2}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  if (!trendData || trendData.trends.length === 0) {
    return (
      <Alert severity="info">
        No technology trend data available.
      </Alert>
    );
  }

  // Limit the number of trends to display
  const displayTrends = trendData.trends.slice(0, limit);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Technology Trends
        {occupationCode && <Typography variant="caption" sx={{ ml: 1 }}>for this Occupation</Typography>}
        {industryCode && <Typography variant="caption" sx={{ ml: 1 }}>in this Industry</Typography>}
      </Typography>

      <Typography variant="body2" paragraph>
        Analysis of technology adoption trends, growth rates, and projected importance over time.
      </Typography>

      <TableContainer component={Paper} variant="outlined">
        <Table sx={{ minWidth: 650 }} size="medium">
          <TableHead>
            <TableRow>
              <TableCell>Technology</TableCell>
              <TableCell>Trend</TableCell>
              <TableCell>Current Adoption</TableCell>
              <TableCell>5-Year Growth</TableCell>
              <TableCell>Trend Visualization</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayTrends.map((trend: TechnologyTrend) => (
              <TableRow
                key={trend.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                hover
              >
                <TableCell component="th" scope="row">
                  <Box display="flex" flexDirection="column">
                    <Typography variant="subtitle2">
                      {trend.name}
                    </Typography>
                    {trend.category && (
                      <Typography variant="caption" color="text.secondary">
                        {trend.category}
                      </Typography>
                    )}
                  </Box>
                </TableCell>

                <TableCell>
                  <Chip
                    icon={getTrendIcon(trend.maturityLevel)}
                    label={trend.maturityLevel}
                    size="small"
                    sx={{
                      bgcolor: `${getTrendColor(trend.maturityLevel)}20`,
                      color: getTrendColor(trend.maturityLevel),
                      fontWeight: 'medium'
                    }}
                  />
                </TableCell>

                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={(trend.currentAdoption || trend.adoptionRate) * 100}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    <Box sx={{ minWidth: 35 }}>
                      <Typography variant="body2" color="text.secondary">
                        {Math.round((trend.currentAdoption || trend.adoptionRate) * 100)}%
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                <TableCell>
                  <Typography
                    variant="body2"
                    color={trend.growthRate > 0 ? 'success.main' : trend.growthRate < 0 ? 'error.main' : 'text.secondary'}
                    fontWeight="medium"
                  >
                    {trend.growthRate > 0 ? '+' : ''}{trend.growthRate}%
                  </Typography>
                </TableCell>

                <TableCell>
                  {trend.historicalData && trend.historicalData.length > 1 ? (
                    <TrendChart
                      data={trend.historicalData}
                      color={getTrendColor(trend.maturityLevel)}
                    />
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      No historical data available
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={2} display="flex" justifyContent="flex-end">
        <Typography variant="caption" color="text.secondary">
          Data source: O*NET Technology Skills Database and labor market analysis
        </Typography>
      </Box>
    </Box>
  );
};

export default TechnologyTrends;
