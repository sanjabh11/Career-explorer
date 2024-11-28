import React from 'react';
import HeatMap from 'react-heatmap-grid';

interface SkillsHeatmapProps {
  data: number[][];
  xLabels: string[];
  yLabels: string[];
}

const SkillsHeatmap: React.FC<SkillsHeatmapProps> = ({ data, xLabels, yLabels }) => {
  return (
    <div style={{ fontSize: '12px' }}>
      <HeatMap
        xLabels={xLabels}
        yLabels={yLabels}
        data={data}
        squares
        cellStyle={(background, value) => ({
          background: `rgb(66, 86, 244, ${value / 100})`,
          fontSize: '11px',
        })}
        cellRender={(value) => `${value}%`}
      />
    </div>
  );
};

export default SkillsHeatmap;