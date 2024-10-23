// src/types/react-heatmap-grid.d.ts
declare module 'react-heatmap-grid' {
    import { FC } from 'react';
    
    interface HeatMapProps {
      data: number[][];
      xLabels: string[];
      yLabels: string[];
      cellStyle?: (background: any, value: any, min: number, max: number, data: number[][], x: number, y: number) => React.CSSProperties;
      cellRender?: (value: any) => React.ReactNode;
      [key: string]: any;
    }
    
    const HeatMap: FC<HeatMapProps>;
    export default HeatMap;
  }