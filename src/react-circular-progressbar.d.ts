declare module 'react-circular-progressbar' {
  import React from 'react';

  export interface CircularProgressbarProps {
    value: number;
    circleRatio?: number;
    styles?: {
      root?: React.CSSProperties;
      path?: React.CSSProperties;
      trail?: React.CSSProperties;
      text?: React.CSSProperties;
    };
    [key: string]: any;
  }

  export const CircularProgressbar: React.FC<CircularProgressbarProps>;

  export function buildStyles(styles: {
    rotation?: number;
    strokeLinecap?: 'butt' | 'round' | 'square';
    textSize?: string;
    pathTransitionDuration?: number;
    pathColor?: string;
    textColor?: string;
    trailColor?: string;
    backgroundColor?: string;
  }): CircularProgressbarProps['styles'];
}
