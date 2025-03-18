// src/components/bright-outlook/GrowthIndicators.tsx
// Version 1.3.0

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  CircularProgress, 
  Alert,
  Tooltip,
  Card,
  CardContent,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { GrowthIndicator } from '@/types/brightOutlook';
import { getGrowthIndicators } from '@/services/BrightOutlookService';

interface GrowthIndicatorsProps {
  occupationCode: string;
}

const GrowthIndicators: React.FC<GrowthIndicatorsProps> = ({ occupationCode }) => {
  const [indicators, setIndicators] = useState<GrowthIndicator[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchGrowthIndicators = async () => {
      if (!occupationCode) return;
      
      try {
        setLoading(true);
        const data = await getGrowthIndicators(occupationCode);
        setIndicators(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching growth indicators:', err);
        setError('Failed to load growth indicators');
        setLoading(false);
      }
    };
    
    fetchGrowthIndicators();
  }, [occupationCode]);
  
  const getInterpretationColor = (interpretation: string): string => {
    switch (interpretation) {
      case 'very_positive':
        return '#388e3c'; // Dark green
      case 'positive':
        return '#4caf50'; // Green
      case 'neutral':
        return '#9e9e9e'; // Gray
      case 'negative':
        return '#f44336'; // Red
      case 'very_negative':
        return '#d32f2f'; // Dark red
      default:
        return '#9e9e9e'; // Default gray
    }
  };
  
  const getInterpretationIcon = (interpretation: string) => {
    switch (interpretation) {
      case 'very_positive':
      case 'positive':
        return <TrendingUpIcon fontSize="small" sx={{ color: getInterpretationColor(interpretation) }} />;
      case 'neutral':
        return <TrendingFlatIcon fontSize="small" sx={{ color: getInterpretationColor(interpretation) }} />;
      case 'negative':
      case 'very_negative':
        return <TrendingDownIcon fontSize="small" sx={{ color: getInterpretationColor(interpretation) }} />;
      default:
        return <InfoIcon fontSize="small" />;
    }
  };
  
  const getNormalizedValue = (value: number, indicator: GrowthIndicator): number => {
    // Convert any value to a 0-100 scale for visualization
    if (indicator.name.includes('Growth') || indicator.name.includes('Change')) {
      // For percentage values, normalize between -20% and +50%
      return Math.max(0, Math.min(100, ((value + 20) / 70) * 100));
    } else if (indicator.name.includes('Openings')) {
      // For job openings, normalize between 0 and 100,000
      return Math.max(0, Math.min(100, (value / 100000) * 100));
    }
    return Math.max(0, Math.min(100, value));
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
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
  
  if (indicators.length === 0) {
    return (
      <Alert severity="info">
        No growth indicators available for this occupation.
      </Alert>
    );
  }
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Growth & Employment Outlook
      </Typography>
      
      <Grid container spacing={2}>
        {indicators.map((indicator, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {getInterpretationIcon(indicator.interpretation)}
                  <Typography variant="subtitle1" sx={{ ml: 1 }}>
                    {indicator.name}
                  </Typography>
                </Box>
                
                <Tooltip title={indicator.description} arrow>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, cursor: 'help' }}>
                    {indicator.description.length > 80 
                      ? `${indicator.description.substring(0, 80)}...` 
                      : indicator.description}
                  </Typography>
                </Tooltip>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                    {typeof indicator.value === 'number' && indicator.value % 1 === 0
                      ? indicator.value.toLocaleString()
                      : typeof indicator.value === 'number'
                      ? indicator.value.toFixed(1)
                      : indicator.value}
                    {indicator.name.includes('Growth') || indicator.name.includes('Change') ? '%' : ''}
                  </Typography>
                </Box>
                
                {typeof indicator.value === 'number' && (
                  <Box sx={{ width: '100%', mt: 2 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={getNormalizedValue(indicator.value, indicator)}
                      sx={{ 
                        height: 8, 
                        borderRadius: 5,
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getInterpretationColor(indicator.interpretation)
                        }
                      }}
                    />
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 1, borderTop: '1px solid #eee' }}>
                  <Typography variant="caption" color="text.secondary">
                    Timeframe: {indicator.timeframe}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Source: {indicator.source}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default GrowthIndicators;
