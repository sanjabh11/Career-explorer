import React from 'react';

interface TooltipProps {
  content: string;
  x: number;
  y: number;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, x, y }) => {
  return (
    <div
      className="absolute z-50 bg-black text-white px-3 py-2 rounded-lg text-sm shadow-lg"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -100%)',
        marginTop: '-10px',
      }}
    >
      {content}
      <div
        className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2"
        style={{
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '6px solid black',
        }}
      />
    </div>
  );
};
