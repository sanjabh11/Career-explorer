// src/components/bright-outlook/BrightOutlookIndicator.tsx
// Version 1.3.0

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Tooltip, 
  Chip,
  CircularProgress,
  Badge
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  WorkOutline as WorkIcon,
  NewReleases as NewReleasesIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { BrightOutlookData, BrightOutlookReason } from '@/types/brightOutlook';
import { checkBrightOutlookStatus } from '@/services/BrightOutlookService';

interface BrightOutlookIndicatorProps {
  occupationCode: string;
  compact?: boolean;
  showTooltip?: boolean;
}

const BrightOutlookIndicator: React.FC<BrightOutlookIndicatorProps> = ({
  occupationCode,
  compact = false,
  showTooltip = true
}) => {
  const [brightOutlookData, setBrightOutlookData] = useState<BrightOutlookData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchBrightOutlookStatus = async () => {
      if (!occupationCode) return;
      
      try {
        setLoading(true);
        const data = await checkBrightOutlookStatus(occupationCode);
        setBrightOutlookData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching Bright Outlook status:', err);
        setError('Failed to check Bright Outlook status');
        setLoading(false);
      }
    };
    
    fetchBrightOutlookStatus();
  }, [occupationCode]);
  
  const getReasonLabel = (reason: BrightOutlookReason): string => {
    switch (reason) {
      case BrightOutlookReason.RapidGrowth:
        return 'Rapid Growth';
      case BrightOutlookReason.NumeroursJobOpenings:
        return 'Many Openings';
      case BrightOutlookReason.NewAndEmerging:
        return 'New & Emerging';
      default:
        return reason;
    }
  };
  
  const getReasonIcon = (reason: BrightOutlookReason) => {
    switch (reason) {
      case BrightOutlookReason.RapidGrowth:
        return <TrendingUpIcon fontSize="small" />;
      case BrightOutlookReason.NumeroursJobOpenings:
        return <WorkIcon fontSize="small" />;
      case BrightOutlookReason.NewAndEmerging:
        return <NewReleasesIcon fontSize="small" />;
      default:
        return <InfoIcon fontSize="small" />;
    }
  };
  
  if (loading) {
    return compact ? (
      <CircularProgress size={16} />
    ) : (
      <CircularProgress size={24} />
    );
  }
  
  if (error || !brightOutlookData) {
    return null;
  }
  
  // If it's not a Bright Outlook occupation, return null
  if (!brightOutlookData) {
    return null;
  }
  
  const tooltipContent = (
    <Box sx={{ p: 1 }}>
      <Typography variant="subtitle2">
        Bright Outlook Occupation
      </Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>
        This occupation is expected to experience one or more of:
      </Typography>
      <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
        {brightOutlookData.reasons.map((reason) => (
          <li key={reason}>
            <Typography variant="body2">
              {getReasonLabel(reason)}
              {reason === BrightOutlookReason.RapidGrowth && brightOutlookData.projectedGrowth && (
                ` (${brightOutlookData.projectedGrowth}% projected growth)`
              )}
              {reason === BrightOutlookReason.NumeroursJobOpenings && brightOutlookData.projectedJobOpenings && (
                ` (${brightOutlookData.projectedJobOpenings.toLocaleString()} projected annual openings)`
              )}
            </Typography>
          </li>
        ))}
      </ul>
    </Box>
  );
  
  // Compact version (just an icon)
  if (compact) {
    return (
      <Tooltip title={showTooltip ? tooltipContent : ''} arrow>
        <Badge
          badgeContent={brightOutlookData.reasons.length}
          color="warning"
          sx={{ 
            '& .MuiBadge-badge': { 
              fontSize: '0.5rem', 
              height: '16px', 
              minWidth: '16px'
            } 
          }}
        >
          <TrendingUpIcon 
            color="warning" 
            fontSize="small"
            sx={{ cursor: 'pointer' }}
          />
        </Badge>
      </Tooltip>
    );
  }
  
  // Full version (chips with reasons)
  return (
    <Box>
      <Tooltip title={showTooltip ? tooltipContent : ''} arrow>
        <Chip
          icon={<TrendingUpIcon />}
          label="Bright Outlook"
          color="warning"
          sx={{ mr: 1, mb: 1 }}
        />
      </Tooltip>
      
      {brightOutlookData.reasons.map((reason) => (
        <Tooltip 
          key={reason} 
          title={
            reason === BrightOutlookReason.RapidGrowth && brightOutlookData.projectedGrowth
              ? `${brightOutlookData.projectedGrowth}% projected growth`
              : reason === BrightOutlookReason.NumeroursJobOpenings && brightOutlookData.projectedJobOpenings
              ? `${brightOutlookData.projectedJobOpenings.toLocaleString()} projected annual openings`
              : getReasonLabel(reason)
          }
          arrow
        >
          <Chip
            icon={getReasonIcon(reason)}
            label={getReasonLabel(reason)}
            variant="outlined"
            size="small"
            sx={{ mr: 1, mb: 1 }}
          />
        </Tooltip>
      ))}
    </Box>
  );
};

export default BrightOutlookIndicator;
