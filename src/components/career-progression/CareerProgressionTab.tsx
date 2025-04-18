import React from 'react';
import CareerPathwaysContainer from '../career-pathways/CareerPathwaysContainer';

interface Props {
  occupationId: string;
}

const CareerProgressionTab: React.FC<Props> = ({ occupationId }) => {
  return <CareerPathwaysContainer occupationId={occupationId} />;
};

export default CareerProgressionTab;
