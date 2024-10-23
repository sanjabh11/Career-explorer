import React from 'react';
import SimpleWordCloud from '../SimpleWordCloud';

interface KnowledgeAreasWordCloudProps {
  words: {
    text: string;
    value: number;
  }[];
}

const KnowledgeAreasWordCloud: React.FC<KnowledgeAreasWordCloudProps> = ({ words }) => {
  return (
    <div style={{ height: 300, width: '100%' }}>
      <SimpleWordCloud words={words} />
    </div>
  );
};

export default KnowledgeAreasWordCloud;
