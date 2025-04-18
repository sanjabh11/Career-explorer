import React from 'react';
import { Box, Typography, Card, CardContent, CardActionArea, Chip, Grid, Divider, Stack } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { CurrentOccupation, AdvancementOccupation } from '../../types/careerPathways';

interface CareerLadderVisualizationProps {
  currentOccupation: CurrentOccupation;
  advancementPathways: AdvancementOccupation[];
  selectedAdvancement: AdvancementOccupation | null;
  onAdvancementSelect: (advancement: AdvancementOccupation) => void;
}

const CareerLadderVisualization: React.FC<CareerLadderVisualizationProps> = ({
  currentOccupation,
  advancementPathways,
  selectedAdvancement,
  onAdvancementSelect
}) => {
  if (!advancementPathways || advancementPathways.length === 0) {
    return (
      <Box mb={3}>
        <Typography variant="body1">
          No advancement pathways found for this occupation.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ position: 'relative', mb: 4 }}>
        {/* Current position */}
        <Card
          sx={{
            mb: 2,
            border: '2px solid #2196f3',
            maxWidth: 500,
            mx: 'auto'
          }}
        >
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Current Position
            </Typography>
            <Typography variant="h6" gutterBottom>
              {currentOccupation.title}
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
              <Chip
                size="small"
                label={`Education: ${currentOccupation.education}`}
                variant="outlined"
              />
              <Chip
                size="small"
                label={`Experience: ${currentOccupation.experience}`}
                variant="outlined"
              />
              <Chip
                size="small"
                label={`Salary: $${currentOccupation.salary.median.toLocaleString()}/year`}
                variant="outlined"
              />
            </Box>
          </CardContent>
        </Card>

        {/* Arrow */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            my: 2
          }}
        >
          <ArrowUpwardIcon fontSize="large" color="action" />
        </Box>

        {/* Advancement pathways */}
        <Grid container spacing={2} justifyContent="center">
          {advancementPathways.map((advancement) => (
            <Grid item xs={12} sm={6} md={4} key={advancement.id}>
              <Card
                sx={{
                  height: '100%',
                  border: selectedAdvancement?.id === advancement.id
                    ? '2px solid #4caf50'
                    : '1px solid #e0e0e0',
                  bgcolor: selectedAdvancement?.id === advancement.id
                    ? 'rgba(76, 175, 80, 0.08)'
                    : 'background.paper'
                }}
              >
                <CardActionArea
                  onClick={() => onAdvancementSelect(advancement)}
                  sx={{ height: '100%' }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Advancement Opportunity
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      {advancement.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      {advancement.description.length > 100
                        ? `${advancement.description.substring(0, 100)}...`
                        : advancement.description}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Stack spacing={1}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Education:</Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {advancement.education}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Experience:</Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {advancement.experience}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Salary:</Typography>
                        <Typography variant="body2" fontWeight="medium">
                          ${advancement.salary.median.toLocaleString()}/year
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Salary Increase:</Typography>
                        <Typography
                          variant="body2"
                          fontWeight="medium"
                          color="success.main"
                        >
                          {calculateSalaryIncrease(currentOccupation.salary.median, advancement.salary.median)}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

// Helper function to calculate salary increase
function calculateSalaryIncrease(currentSalary: number, newSalary: number): string {
  const increase = newSalary - currentSalary;
  const percentIncrease = (increase / currentSalary) * 100;

  return `+$${increase.toLocaleString()} (+${percentIncrease.toFixed(0)}%)`;
}

export default CareerLadderVisualization;
