import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Grid } from '@mui/material';
import SkillsService from '../../services/SkillsService';
import { Skill } from '../../types/skills';

interface SkillCategory {
  name: string;
  skills: Skill[];
}

const SkillsTaxonomy: React.FC<{ occupationId: string }> = ({ occupationId }) => {
  const [loading, setLoading] = useState(true);
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const skills = await SkillsService.getSkillsForOccupation(occupationId);
        
        // Group skills by category
        const categorizedSkills = skills.reduce((acc: { [key: string]: Skill[] }, skill) => {
          if (!acc[skill.category]) {
            acc[skill.category] = [];
          }
          acc[skill.category].push(skill);
          return acc;
        }, {});

        // Convert to array format
        const categories = Object.entries(categorizedSkills).map(([name, skills]) => ({
          name,
          skills: skills.sort((a, b) => (b.importance || 0) - (a.importance || 0))
        }));

        setSkillCategories(categories);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching skills:', error);
        setLoading(false);
      }
    };

    fetchSkills();
  }, [occupationId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Skills Taxonomy
      </Typography>
      <Grid container spacing={3}>
        {skillCategories.map((category) => (
          <Grid item xs={12} md={6} key={category.name}>
            <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>
                {category.name}
              </Typography>
              {category.skills.map((skill) => (
                <Box key={skill.id} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">{skill.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {skill.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="caption" sx={{ mr: 1 }}>
                      Importance:
                    </Typography>
                    <Box
                      sx={{
                        width: '100%',
                        height: 4,
                        bgcolor: 'grey.200',
                        borderRadius: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: `${(skill.importance || 0) * 100}%`,
                          height: '100%',
                          bgcolor: 'primary.main',
                          borderRadius: 2,
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SkillsTaxonomy;
