// src/components/detailed-work-activities/DWACategory.tsx
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
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
  Chip,
  IconButton
} from '@mui/material';
import {
  Work as WorkIcon,
  Info as InfoIcon,
  BarChart as BarChartIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { 
  DetailedWorkActivity, 
  DWACategory as DWACategoryType
} from '@/types/detailedWorkActivities';
import { getDWACategories } from '@/services/DetailedWorkActivitiesService';

interface DWACategoryProps {
  occupationCode: string;
  onCategoryClick?: (category: DWACategoryType) => void;
}

const DWACategory: React.FC<DWACategoryProps> = ({
  occupationCode,
  onCategoryClick
}) => {
  const [categories, setCategories] = useState<DWACategoryType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCategories = async () => {
      if (!occupationCode) return;
      
      try {
        setLoading(true);
        const data = await getDWACategories(occupationCode);
        setCategories(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching DWA categories:', err);
        setError('Failed to load detailed work activities categories');
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, [occupationCode]);
  
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
  
  if (categories.length === 0) {
    return (
      <Alert severity="info">
        No detailed work activity categories available for this occupation.
      </Alert>
    );
  }
  
  // Sort categories by count (highest first)
  const sortedCategories = [...categories].sort((a, b) => 
    (b.activitiesCount || 0) - (a.activitiesCount || 0)
  );
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Detailed Work Activities by Category
      </Typography>
      
      <Grid container spacing={2}>
        {sortedCategories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category.id}>
            <Card 
              variant="outlined" 
              sx={{ 
                height: '100%',
                cursor: onCategoryClick ? 'pointer' : 'default',
                '&:hover': onCategoryClick ? { boxShadow: 2 } : {}
              }}
              onClick={() => onCategoryClick && onCategoryClick(category)}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <CategoryIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1" component="div">
                    {category.name}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {category.description || 'No description available'}
                </Typography>
                
                <Divider sx={{ my: 1 }} />
                
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Chip 
                    icon={<WorkIcon fontSize="small" />}
                    label={`${category.activitiesCount} activities`}
                    size="small"
                    variant="outlined"
                  />
                  
                  {category.mostImportant && (
                    <Tooltip title="Most important activity in this category" arrow>
                      <Chip
                        icon={<BarChartIcon fontSize="small" />}
                        label="Top activity"
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Tooltip>
                  )}
                </Box>
                
                {category.mostImportant && (
                  <Box mt={2} bgcolor="#f5f5f5" p={1} borderRadius={1}>
                    <Typography variant="caption" color="text.secondary">
                      Most important activity:
                    </Typography>
                    <Typography variant="body2">
                      {category.mostImportant}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DWACategory;
