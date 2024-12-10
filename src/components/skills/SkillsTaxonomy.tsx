import React, { useEffect, useState } from 'react';
import SkillsService from '../../services/SkillsService';
import { Box, CircularProgress, Typography, Grid, Modal, TextField } from '@mui/material';

interface Skill {
  id: string;
  name: string;
  description: string;
  importance?: number;
  category: string;
}

interface Category {
  name: string;
  skills: Skill[];
  expanded: boolean;
}

const SkillsTaxonomy: React.FC<{ occupationId: string }> = ({ occupationId }) => {
  const [loading, setLoading] = useState(true);
  const [skillCategories, setSkillCategories] = useState<Category[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const skills: Skill[] = await SkillsService.getSkillsForOccupation(occupationId);
        console.log('Fetched Skills:', skills); // Log the fetched skills
        // Group skills by category
        const categorizedSkills = skills.reduce((acc: { [key: string]: Skill[] }, skill) => {
          if (!acc[skill.category]) {
            acc[skill.category] = [];
          }
          acc[skill.category].push(skill);
          return acc;
        }, {});

        // Log categorized skills
        console.log('Categorized Skills:', categorizedSkills);

        const categories = Object.entries(categorizedSkills).map(([name, skills]) => ({
          name,
          skills: skills.sort((a, b) => (b.importance || 0) - (a.importance || 0)),
          expanded: false,
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

  const handleSkillClick = (skill: Skill) => {
    setSelectedSkill(skill);
  };

  const handleCloseModal = () => {
    setSelectedSkill(null);
  };

  const handleToggleCategory = (index: number) => {
    setSkillCategories(prevCategories => {
      const newCategories = [...prevCategories];
      newCategories[index].expanded = !newCategories[index].expanded;
      console.log(`Toggled category: ${newCategories[index].name}, Expanded: ${newCategories[index].expanded}`);
      return newCategories;
    });
  };

  const filteredSkills = skillCategories.flatMap(category => 
    category.skills.filter(skill => skill.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  console.log(`Search Term: ${searchTerm}`);
  console.log(`Filtered Skills: ${filteredSkills.map(skill => skill.name)}`);

  return (
    <Box sx={{ p: 2 }}>
      <TextField
        label="Search Skills"
        variant="outlined"
        fullWidth
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={2}>
          {skillCategories.map((category, index) => (
            <Grid item xs={12} key={category.name}>
              <Typography variant="h6" onClick={() => handleToggleCategory(index)}>
                {category.name} {category.expanded ? '▼' : '▲'}
              </Typography>
              {category.expanded && (
                <Box>
                  {category.skills.filter(skill => skill.name.toLowerCase().includes(searchTerm.toLowerCase())).map(skill => (
                    <Box key={skill.id} onClick={() => handleSkillClick(skill)}>
                      <Typography variant="subtitle1">{skill.name}</Typography>
                    </Box>
                  ))}
                  {category.skills.filter(skill => !skill.name.toLowerCase().includes(searchTerm.toLowerCase())).length > 0 && (
                    <Typography variant="body2">No matching skills found in this category.</Typography>
                  )}
                </Box>
              )}
              {filteredSkills.length === 0 && <Typography>No skills found.</Typography>}
            </Grid>
          ))}
        </Grid>
      )}
      <Modal open={!!selectedSkill} onClose={handleCloseModal}>
        <Box sx={{ p: 4, bgcolor: 'white', borderRadius: 2 }}>
          {selectedSkill && (
            <Box>
              <Typography variant="h6">{selectedSkill.name}</Typography>
              <Typography variant="body2">{selectedSkill.description}</Typography>
              <Typography variant="body2">Importance: {selectedSkill.importance}</Typography>
              {/* Add related occupations and training resources here */}
            </Box>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default SkillsTaxonomy;
