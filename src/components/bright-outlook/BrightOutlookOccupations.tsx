// src/components/bright-outlook/BrightOutlookOccupations.tsx
// Version 1.3.0

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Chip, 
  CircularProgress, 
  Alert,
  Divider,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Pagination,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  WorkOutline as WorkIcon,
  NewReleases as NewReleasesIcon,
  Info as InfoIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { BrightOutlookData, BrightOutlookReason } from '@/types/brightOutlook';
import { getBrightOutlookOccupations, getOccupationsByOutlookCategory } from '@/services/BrightOutlookService';

interface BrightOutlookOccupationsProps {
  onViewOccupation: (code: string) => void;
  filter?: BrightOutlookReason | 'all';
  limit?: number;
}

const BrightOutlookOccupations: React.FC<BrightOutlookOccupationsProps> = ({
  onViewOccupation,
  filter = 'all',
  limit = 50
}) => {
  const [occupations, setOccupations] = useState<BrightOutlookData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState<BrightOutlookReason | 'all'>(filter);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'title' | 'growth' | 'openings'>('title');
  const [page, setPage] = useState<number>(1);
  const itemsPerPage = 12;
  
  useEffect(() => {
    const fetchOccupations = async () => {
      try {
        setLoading(true);
        
        let data: BrightOutlookData[];
        
        if (currentFilter === 'all') {
          data = await getBrightOutlookOccupations();
        } else {
          const categoryData = await getOccupationsByOutlookCategory(currentFilter);
          data = categoryData.occupations.map(occ => ({
            code: occ.code,
            title: occ.title,
            reasons: [currentFilter],
            // Additional properties may be undefined for category-specific fetching
            projectedGrowth: undefined,
            projectedJobOpenings: undefined,
            newOccupation: undefined
          }));
        }
        
        setOccupations(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching Bright Outlook occupations:', err);
        setError('Failed to load Bright Outlook occupations');
        setLoading(false);
      }
    };
    
    fetchOccupations();
  }, [currentFilter]);
  
  const handleFilterChange = (event: SelectChangeEvent) => {
    setCurrentFilter(event.target.value as BrightOutlookReason | 'all');
    setPage(1); // Reset to first page when filter changes
  };
  
  const handleSortChange = (event: SelectChangeEvent) => {
    setSortOrder(event.target.value as 'title' | 'growth' | 'openings');
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page when search changes
  };
  
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo(0, 0); // Scroll to top when page changes
  };
  
  // Filter occupations by search term
  const filteredOccupations = occupations.filter(occ => 
    occ.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort occupations
  const sortedOccupations = [...filteredOccupations].sort((a, b) => {
    if (sortOrder === 'title') {
      return a.title.localeCompare(b.title);
    } else if (sortOrder === 'growth' && a.projectedGrowth && b.projectedGrowth) {
      return b.projectedGrowth - a.projectedGrowth;
    } else if (sortOrder === 'openings' && a.projectedJobOpenings && b.projectedJobOpenings) {
      return b.projectedJobOpenings - a.projectedJobOpenings;
    }
    return 0;
  });
  
  // Paginate occupations
  const paginatedOccupations = sortedOccupations.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  
  const totalPages = Math.ceil(filteredOccupations.length / itemsPerPage);
  
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
  
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Bright Outlook Occupations
      </Typography>
      
      <Typography variant="body1" paragraph>
        These occupations are expected to grow rapidly, have large numbers of job openings, or are new and emerging occupations.
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              placeholder="Search occupations..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="filter-label">Filter by Reason</InputLabel>
              <Select
                labelId="filter-label"
                value={currentFilter}
                label="Filter by Reason"
                onChange={handleFilterChange}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterListIcon fontSize="small" />
                  </InputAdornment>
                }
              >
                <MenuItem value="all">All Bright Outlook</MenuItem>
                <MenuItem value={BrightOutlookReason.RapidGrowth}>Rapid Growth</MenuItem>
                <MenuItem value={BrightOutlookReason.NumeroursJobOpenings}>Many Openings</MenuItem>
                <MenuItem value={BrightOutlookReason.NewAndEmerging}>New & Emerging</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="sort-label">Sort by</InputLabel>
              <Select
                labelId="sort-label"
                value={sortOrder}
                label="Sort by"
                onChange={handleSortChange}
                startAdornment={
                  <InputAdornment position="start">
                    <SortIcon fontSize="small" />
                  </InputAdornment>
                }
              >
                <MenuItem value="title">Title (A-Z)</MenuItem>
                <MenuItem value="growth">Growth Rate</MenuItem>
                <MenuItem value="openings">Job Openings</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Showing {paginatedOccupations.length} of {filteredOccupations.length} occupations
      </Typography>
      
      <Grid container spacing={3}>
        {paginatedOccupations.map((occupation) => (
          <Grid item xs={12} sm={6} md={4} key={occupation.code}>
            <Card 
              variant="outlined" 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: 3
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="div" gutterBottom>
                  {occupation.title}
                </Typography>
                
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  O*NET Code: {occupation.code}
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  {occupation.reasons.map((reason) => (
                    <Tooltip 
                      key={reason} 
                      title={
                        reason === BrightOutlookReason.RapidGrowth && occupation.projectedGrowth
                          ? `${occupation.projectedGrowth}% projected growth`
                          : reason === BrightOutlookReason.NumeroursJobOpenings && occupation.projectedJobOpenings
                          ? `${occupation.projectedJobOpenings.toLocaleString()} projected annual openings`
                          : getReasonLabel(reason)
                      }
                      arrow
                    >
                      <Chip
                        icon={getReasonIcon(reason)}
                        label={getReasonLabel(reason)}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    </Tooltip>
                  ))}
                </Box>
                
                {occupation.projectedGrowth && (
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Growth: {occupation.projectedGrowth}%
                    </Typography>
                  </Box>
                )}
                
                {occupation.projectedJobOpenings && (
                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                    <WorkIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Openings: {occupation.projectedJobOpenings.toLocaleString()} per year
                    </Typography>
                  </Box>
                )}
              </CardContent>
              
              <CardActions>
                <Button 
                  size="small" 
                  color="primary"
                  onClick={() => onViewOccupation(occupation.code)}
                >
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange} 
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
};

export default BrightOutlookOccupations;
