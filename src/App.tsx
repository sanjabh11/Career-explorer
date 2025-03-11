import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Box, Container, AppBar, Toolbar, Typography, Button, CssBaseline } from '@mui/material';
import JobTaxonomySelector from './components/JobTaxonomySelector';
import EnhancedApoController from './components/dashboard/EnhancedApoController';
import './App.css';

/**
 * Main Application Component
 * Version 1.0
 */
function App() {
  return (
    <Router>
      <CssBaseline />
      <Box className="App">
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Career Explorer
            </Typography>
            <Button color="inherit" component={Link} to="/">
              Home
            </Button>
            <Button color="inherit" component={Link} to="/enhanced-apo">
              Enhanced APO Dashboard
            </Button>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Routes>
            <Route path="/" element={<JobTaxonomySelector />} />
            <Route path="/enhanced-apo" element={<EnhancedApoController />} />
            <Route path="/enhanced-apo/:occupationId" element={<EnhancedApoController />} />
          </Routes>
        </Container>
      </Box>
    </Router>
  );
}

export default App;