import React from 'react';
import { DWA } from '@/types/onet';

interface DWAListProps {
  dwaList: DWA[];
}

const DWAList: React.FC<DWAListProps> = ({ dwaList }) => {
  return (
    <ul className="space-y-2">
      {dwaList.map((dwa, index) => (
        <li key={dwa.id || index} className="bg-gray-100 p-3 rounded-md">
          {dwa.description}
        </li>
      ))}
    </ul>
  );
};

export default DWAList;
