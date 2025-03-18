// src/components/technology-skills/TechnologyList.tsx
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
  IconButton,
  TextField,
  InputAdornment,
  Collapse
} from '@mui/material';
import {
  Computer as ComputerIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { TechnologySkill, TechnologyCategory } from '@/types/technologySkills';
import { getTechnologySkills } from '@/services/TechnologySkillsService';

interface TechnologyListProps {
  occupationCode: string;
  maxItems?: number;
  compact?: boolean;
}

const TechnologyList: React.FC<TechnologyListProps> = ({
  occupationCode,
  maxItems,
  compact = false
}) => {
  const [technologies, setTechnologies] = useState<TechnologySkill[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    const fetchData = async () => {
      if (!occupationCode) return;
      
      try {
        setLoading(true);
        const data = await getTechnologySkills(occupationCode);
        setTechnologies(data);
        setLoading(false);
        
        // Auto-expand categories if there are few of them or we're in compact mode
        if (getCategories(data).length <= 3 || compact) {
          setExpandedCategories(new Set(getCategories(data)));
        }
      } catch (err) {
        console.error('Error fetching technology skills:', err);
        setError('Failed to load technology skills');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [occupationCode, compact]);
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  // Get unique categories from technologies
  const getCategories = (techData: TechnologySkill[]): string[] => {
    const categories = new Set<string>();
    techData.forEach(tech => {
      if (tech.category) {
        categories.add(tech.category);
      }
    });
    return Array.from(categories).sort();
  };
  
  // Check if category is expanded
  const isCategoryExpanded = (category: string): boolean => {
    return expandedCategories.has(category);
  };
  
  // Toggle category expansion
  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };
  
  // Filter technologies by search term
  const filteredTechnologies = technologies.filter(tech => 
    tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tech.description && tech.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (tech.category && tech.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Limit the number of items if maxItems is set
  const displayTechnologies = maxItems
    ? filteredTechnologies.slice(0, maxItems)
    : filteredTechnologies;
  
  // Group technologies by category
  const groupedTechnologies: Record<string, TechnologySkill[]> = {};
  
  displayTechnologies.forEach(tech => {
    const category = tech.category || 'Uncategorized';
    if (!groupedTechnologies[category]) {
      groupedTechnologies[category] = [];
    }
    groupedTechnologies[category].push(tech);
  });
  
  // Sort categories
  const sortedCategories = Object.keys(groupedTechnologies).sort();
  
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
  
  if (technologies.length === 0) {
    return (
      <Alert severity="info">
        No technology skills data available for this occupation.
      </Alert>
    );
  }
  
  if (compact) {
    return (
      <Box>
        <List dense>
          {displayTechnologies.map((tech, index) => (
            <React.Fragment key={tech.id || index}>
              <ListItem sx={{ px: 1, py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <ComputerIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary={tech.name}
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondary={tech.category}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
                {tech.hot && (
                  <Tooltip title="Hot Technology" arrow>
                    <StarIcon color="warning" fontSize="small" />
                  </Tooltip>
                )}
              </ListItem>
              {index < displayTechnologies.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
        
        {maxItems && technologies.length > maxItems && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Showing {maxItems} of {technologies.length} technologies
          </Typography>
        )}
      </Box>
    );
  }
  
  return (
    <Box>
      <TextField
        fullWidth
        placeholder="Search technologies..."
        value={searchTerm}
        onChange={handleSearchChange}
        margin="normal"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />
      
      <Grid container spacing={2}>
        {sortedCategories.map(category => (
          <Grid item xs={12} key={category}>
            <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  p: 2,
                  bgcolor: 'background.default',
                  cursor: 'pointer'
                }}
                onClick={() => toggleCategory(category)}
              >
                <Box display="flex" alignItems="center">
                  <ComputerIcon sx={{ mr: 1 }} color="primary" />
                  <Typography variant="subtitle1">
                    {category} ({groupedTechnologies[category].length})
                  </Typography>
                </Box>
                
                <IconButton size="small">
                  {isCategoryExpanded(category) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              
              <Collapse in={isCategoryExpanded(category)}>
                <Divider />
                <List>
                  {groupedTechnologies[category].map((tech, index) => (
                    <React.Fragment key={tech.id || index}>
                      <ListItem alignItems="flex-start" sx={{ py: 1 }}>
                        <ListItemText 
                          primary={
                            <Box display="flex" alignItems="center">
                              <Typography variant="subtitle2">
                                {tech.name}
                              </Typography>
                              {tech.hot && (
                                <Tooltip title="Hot Technology" arrow>
                                  <StarIcon color="warning" fontSize="small" sx={{ ml: 1 }} />
                                </Tooltip>
                              )}
                            </Box>
                          }
                          secondary={
                            <Box mt={0.5}>
                              {tech.description && (
                                <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 0.5 }}>
                                  {tech.description}
                                </Typography>
                              )}
                              
                              <Box mt={1} display="flex" flexWrap="wrap">
                                {tech.skillLevel && (
                                  <Chip 
                                    label={`Skill Level: ${tech.skillLevel}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ mr: 1, mb: 1 }}
                                  />
                                )}
                                
                                {tech.importance && (
                                  <Chip 
                                    label={`Importance: ${tech.importance.toFixed(1)}/5`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ mr: 1, mb: 1 }}
                                  />
                                )}
                                
                                {tech.hot && (
                                  <Chip 
                                    icon={<StarIcon />}
                                    label="Hot Technology"
                                    size="small"
                                    color="warning"
                                    sx={{ mr: 1, mb: 1 }}
                                  />
                                )}
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < groupedTechnologies[category].length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Collapse>
            </Paper>
          </Grid>
        ))}
      </Grid>
      
      {filteredTechnologies.length === 0 && searchTerm !== '' && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No technologies found matching "{searchTerm}"
        </Alert>
      )}
    </Box>
  );
};

export default TechnologyList;
