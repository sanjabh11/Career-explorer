import React from 'react';

interface Word {
  text: string;
  value: number;
}

interface SimpleWordCloudProps {
  words: Word[];
}

const SimpleWordCloud: React.FC<SimpleWordCloudProps> = ({ words }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {words.map((word, index) => (
        <div
          key={index}
          className="bg-blue-100 text-blue-800 px-2 py-1 rounded"
          style={{ fontSize: `${Math.max(12, Math.min(word.value, 24))}px` }}
        >
          {word.text}
        </div>
      ))}
    </div>
  );
};

export default SimpleWordCloud;

