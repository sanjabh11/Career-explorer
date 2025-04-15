// src/components/skills-transferability/SkillTransferabilityChart.tsx
// Version 1.3.0

import React, { useState, useEffect, useRef } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Slider
} from '@mui/material';
import {
  CompareArrows as CompareArrowsIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import {
  SkillNode,
  SkillEdge,
  SkillTransferabilityData
} from '@/types/skillsTransferability';
import {
  getSkillTransferabilityData,
  compareSkillsBetweenOccupations
} from '@/services/SkillsTransferabilityService';

// Mock force-directed graph component
// In a real implementation, you would use a library like d3.js, react-force-graph, or visx
interface ForceGraphProps {
  nodes: SkillNode[];
  edges: SkillEdge[];
  width: number;
  height: number;
  onNodeClick?: (node: SkillNode) => void;
  selectedNode?: string | null;
  zoom?: number;
}

const ForceGraph: React.FC<ForceGraphProps> = ({
  nodes,
  edges,
  width,
  height,
  onNodeClick,
  selectedNode = null,
  zoom = 1
}) => {
  // This is a placeholder for a real force-directed graph
  // In a real implementation, you would render an actual interactive visualization
  return (
    <Paper
      elevation={0}
      sx={{
        width,
        height,
        p: 2,
        position: 'relative',
        border: '1px dashed #ccc',
        bgcolor: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Typography variant="body2" color="text.secondary" textAlign="center">
        This is a placeholder for the force-directed graph visualization.
        In a real implementation, a library like d3.js, react-force-graph, or visx would be used.
      </Typography>

      <Box mt={2}>
        <Typography variant="body2">
          Graph contains {nodes.length} nodes and {edges.length} edges
        </Typography>
        <Typography variant="body2">
          Current zoom level: {zoom.toFixed(1)}x
        </Typography>
        {selectedNode && (
          <Typography variant="body2">
            Selected node: {selectedNode}
          </Typography>
        )}
      </Box>

      <Box mt={3} display="flex" flexWrap="wrap" justifyContent="center">
        {nodes.slice(0, 10).map(node => (
          <Chip
            key={node.id}
            label={node.label}
            color={node.id === selectedNode ? "primary" : "default"}
            variant="outlined"
            onClick={() => onNodeClick && onNodeClick(node)}
            sx={{ m: 0.5 }}
          />
        ))}
        {nodes.length > 10 && (
          <Chip
            label={`+${nodes.length - 10} more`}
            variant="outlined"
            sx={{ m: 0.5 }}
          />
        )}
      </Box>
    </Paper>
  );
};

interface SkillTransferabilityChartProps {
  sourceOccupationCode: string;
  targetOccupationCode?: string;
  width?: number;
  height?: number;
  onOccupationSelect?: (code: string) => void;
}

const SkillTransferabilityChart: React.FC<SkillTransferabilityChartProps> = ({
  sourceOccupationCode,
  targetOccupationCode,
  width = 800,
  height = 600,
  onOccupationSelect
}) => {
  const [transferabilityData, setTransferabilityData] = useState<SkillTransferabilityData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState<boolean>(!!targetOccupationCode);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        let data: SkillTransferabilityData;

        if (targetOccupationCode && compareMode) {
          const comparisonData = await compareSkillsBetweenOccupations(sourceOccupationCode, targetOccupationCode);
          // Convert comparison data to transferability data format
          data = {
            nodes: [
              // Create nodes for each skill
              ...comparisonData.skillComparisons.map(skill => ({
                id: skill.skillId,
                label: skill.skillName,
                type: 'skill' as const,
                level: skill.sourceLevel,
                importance: skill.transferability * 100
              })),
              // Create nodes for occupations
              {
                id: comparisonData.sourceOccupation.code,
                label: comparisonData.sourceOccupation.title,
                type: 'occupation' as const
              },
              {
                id: comparisonData.targetOccupation.code,
                label: comparisonData.targetOccupation.title,
                type: 'occupation' as const
              }
            ],
            edges: [
              // Create edges between skills and source occupation
              ...comparisonData.skillComparisons.map(skill => ({
                source: comparisonData.sourceOccupation.code,
                target: skill.skillId,
                weight: skill.sourceLevel / 5,
                type: 'requires' as const
              })),
              // Create edges between skills and target occupation
              ...comparisonData.skillComparisons.map(skill => ({
                source: comparisonData.targetOccupation.code,
                target: skill.skillId,
                weight: skill.targetLevel / 5,
                type: 'requires' as const
              }))
            ],
            sourceOccupation: comparisonData.sourceOccupation,
            targetOccupation: comparisonData.targetOccupation
          };
        } else {
          data = await getSkillTransferabilityData(sourceOccupationCode);
        }

        setTransferabilityData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching skill transferability data:', err);
        setError('Failed to load skill transferability data');
        setLoading(false);
      }
    };

    fetchData();
  }, [sourceOccupationCode, targetOccupationCode, compareMode]);

  const handleNodeClick = (node: SkillNode) => {
    setSelectedNode(selectedNode === node.id ? null : node.id);

    // If the node is an occupation and we have an onOccupationSelect handler
    if (node.type === 'occupation' && onOccupationSelect) {
      onOccupationSelect(node.id);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
    setSelectedNode(null);
  };

  const handleCompareModeToggle = () => {
    if (!targetOccupationCode) return;
    setCompareMode(prev => !prev);
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

  if (!transferabilityData) {
    return (
      <Alert severity="info">
        No skill transferability data available.
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          {compareMode && targetOccupationCode
            ? 'Skills Comparison Visualization'
            : 'Skills Transferability Visualization'}
        </Typography>

        <Box>
          {targetOccupationCode ? (
            <Button
              variant={compareMode ? "contained" : "outlined"}
              color="primary"
              size="small"
              startIcon={<CompareArrowsIcon />}
              onClick={handleCompareModeToggle}
              sx={{ mr: 1 }}
            >
              {compareMode ? 'Showing Comparison' : 'Show Comparison'}
            </Button>
          ) : null}

          {/* Zoom controls */}
          <Tooltip title="Zoom in">
            <IconButton size="small" onClick={handleZoomIn}>
              <ZoomInIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Zoom out">
            <IconButton size="small" onClick={handleZoomOut}>
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Reset view">
            <IconButton size="small" onClick={handleReset}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center">
              <Typography variant="body2" sx={{ mr: 1 }}>
                Source Occupation:
              </Typography>
              <Typography variant="subtitle2">
                {transferabilityData.sourceOccupation?.title || 'Source Occupation'} ({transferabilityData.sourceOccupation?.code || 'N/A'})
              </Typography>
            </Box>
          </Grid>

          {compareMode && targetOccupationCode && transferabilityData.targetOccupation ? (
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center">
                <Typography variant="body2" sx={{ mr: 1 }}>
                  Target Occupation:
                </Typography>
                <Typography variant="subtitle2">
                  {transferabilityData.targetOccupation?.title || 'Target Occupation'} ({transferabilityData.targetOccupation?.code || 'N/A'})
                </Typography>
              </Box>
            </Grid>
          ) : null}

          <Grid item xs={12}>
            <Box display="flex" alignItems="center" mt={1}>
              <InfoIcon fontSize="small" color="info" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {compareMode && targetOccupationCode
                  ? 'The visualization shows skills comparison between the source and target occupations. Matched skills are highlighted.'
                  : 'The visualization shows how skills from this occupation can transfer to other occupations. Click on nodes to explore connections.'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Box display="flex" flexDirection="column" alignItems="center">
        <ForceGraph
          nodes={transferabilityData.nodes}
          edges={transferabilityData.edges}
          width={width}
          height={height}
          onNodeClick={handleNodeClick}
          selectedNode={selectedNode}
          zoom={zoom}
        />

        <Box width="100%" mt={2} px={2}>
          <Typography id="zoom-slider" gutterBottom>
            Zoom
          </Typography>
          <Slider
            value={zoom}
            min={0.5}
            max={2}
            step={0.1}
            marks
            valueLabelDisplay="auto"
            onChange={(_, value) => setZoom(value as number)}
            aria-labelledby="zoom-slider"
          />
        </Box>
      </Box>

      {selectedNode && (
        <Box mt={3}>
          <Typography variant="subtitle1" gutterBottom>
            Selected Node Details
          </Typography>

          <Card variant="outlined">
            <CardContent>
              {transferabilityData.nodes.filter((node: SkillNode) => node.id === selectedNode).map((node: SkillNode) => (
                <Box key={node.id}>
                  <Typography variant="h6">
                    {node.label}
                  </Typography>

                  <Chip
                    label={node.type.charAt(0).toUpperCase() + node.type.slice(1)}
                    color={node.type === 'skill' ? 'primary' : 'secondary'}
                    size="small"
                    sx={{ mt: 1, mb: 2 }}
                  />

                  {node.type === 'skill' && node.level !== undefined && (
                    <Typography variant="body2" gutterBottom>
                      Required Level: {node.level.toFixed(1)}/5
                    </Typography>
                  )}

                  {node.description && (
                    <Typography variant="body2" paragraph>
                      {node.description}
                    </Typography>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2" gutterBottom>
                    Connections:
                  </Typography>

                  <Grid container spacing={1}>
                    {transferabilityData.edges
                      .filter((edge: SkillEdge) => edge.source === node.id || edge.target === node.id)
                      .map((edge: SkillEdge, index: number) => {
                        const connectedNodeId = edge.source === node.id ? edge.target : edge.source;
                        const connectedNode = transferabilityData.nodes.find((n: SkillNode) => n.id === connectedNodeId);

                        if (!connectedNode) return null;

                        return (
                          <Grid item key={index} xs={12} sm={6} md={4}>
                            <Chip
                              label={connectedNode.label}
                              variant="outlined"
                              color={connectedNode.type === 'skill' ? 'primary' : 'secondary'}
                              onClick={() => handleNodeClick(connectedNode)}
                              sx={{ width: '100%', justifyContent: 'flex-start' }}
                            />
                          </Grid>
                        );
                      })}
                  </Grid>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default SkillTransferabilityChart;
