/**
 * OccupationSearch Component
 * Version 1.0
 * 
 * A search component for finding occupations by title or keyword.
 * Provides autocomplete functionality and displays search results.
 */

import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Autocomplete, 
  Box, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  CircularProgress,
  Chip
} from '@mui/material';
import { Occupation } from '../../types/occupation';
import { OnetApiService } from '../../services/api/OnetApiService';

interface OccupationSearchProps {
  onOccupationSelect: (occupation: Occupation) => void;
  placeholder?: string;
  label?: string;
}

/**
 * OccupationSearch component for searching and selecting occupations
 */
const OccupationSearch: React.FC<OccupationSearchProps> = ({
  onOccupationSelect,
  placeholder = 'Search for an occupation...',
  label = 'Occupation'
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Occupation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedOccupation, setSelectedOccupation] = useState<Occupation | null>(null);
  
  const onetApiService = new OnetApiService();
  
  // Debounce search to avoid excessive API calls
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }
    
    const timer = setTimeout(() => {
      searchOccupations(searchQuery);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  /**
   * Search for occupations by query
   * @param query Search query
   */
  const searchOccupations = async (query: string) => {
    if (!query || query.length < 3) return;
    
    setLoading(true);
    try {
      const results = await onetApiService.searchOccupations(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching occupations:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Handle occupation selection
   * @param occupation Selected occupation
   */
  const handleOccupationSelect = (occupation: Occupation | null) => {
    if (occupation) {
      setSelectedOccupation(occupation);
      onOccupationSelect(occupation);
    }
  };
  
  /**
   * Format automation risk as a chip with color based on risk level
   * @param risk Automation risk (0-1)
   * @returns Formatted chip component
   */
  const formatAutomationRisk = (risk: number) => {
    let color = 'success';
    let label = 'Low';
    
    if (risk >= 0.7) {
      color = 'error';
      label = 'High';
    } else if (risk >= 0.4) {
      color = 'warning';
      label = 'Medium';
    }
    
    return (
      <Chip 
        label={`${label} Risk (${Math.round(risk * 100)}%)`} 
        color={color as 'success' | 'warning' | 'error'} 
        size="small" 
        variant="outlined" 
      />
    );
  };
  
  return (
    <Box sx={{ width: '100%', mb: 3 }}>
      <Autocomplete
        id="occupation-search"
        options={searchResults}
        getOptionLabel={(option) => option.title}
        onChange={(_, value) => handleOccupationSelect(value)}
        onInputChange={(_, value) => setSearchQuery(value)}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            variant="outlined"
            fullWidth
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, option) => (
          <ListItem {...props} key={option.id} component="li" divider>
            <Box sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {option.title}
                </Typography>
                {formatAutomationRisk(option.automationRisk)}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {option.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label={option.category} size="small" />
                <Chip label={option.educationLevel} size="small" />
                <Chip 
                  label={`$${option.salary.median.toLocaleString()}/yr`} 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                />
                <Chip 
                  label={`${option.outlook.category} (${(option.outlook.growth * 100).toFixed(0)}%)`} 
                  size="small" 
                  color="info" 
                  variant="outlined" 
                />
              </Box>
            </Box>
          </ListItem>
        )}
        noOptionsText="No occupations found. Try a different search term."
        loading={loading}
        loadingText="Searching occupations..."
      />
      
      {selectedOccupation && (
        <Paper elevation={1} sx={{ mt: 2, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Selected Occupation: {selectedOccupation.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
            <Chip label={selectedOccupation.category} />
            <Chip label={selectedOccupation.educationLevel} />
            {formatAutomationRisk(selectedOccupation.automationRisk)}
          </Box>
          <Typography variant="body1" paragraph>
            {selectedOccupation.description}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Box>
              <Typography variant="subtitle2">Median Salary</Typography>
              <Typography variant="h6">${selectedOccupation.salary.median.toLocaleString()}/year</Typography>
              <Typography variant="caption">
                Range: ${selectedOccupation.salary.range.min.toLocaleString()} - ${selectedOccupation.salary.range.max.toLocaleString()}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2">Job Outlook</Typography>
              <Typography variant="h6">{selectedOccupation.outlook.category}</Typography>
              <Typography variant="caption">
                {(selectedOccupation.outlook.growth * 100).toFixed(0)}% growth projected
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default OccupationSearch;
