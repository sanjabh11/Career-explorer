import React from 'react';

const DWAList = ({ dwaList }) => {
  console.log('DWA List in component:', JSON.stringify(dwaList, null, 2));

  if (!dwaList || dwaList.length === 0) {
    return <p>No detailed work activities available.</p>;
  }

  return (
    <ul className="space-y-2">
      {dwaList.map((dwa, index) => (
        <li key={dwa.id || index} className="bg-gray-100 p-3 rounded-md">
          {dwa.description || 'No description available'}
        </li>
      ))}
    </ul>
  );
};

export default DWAList;
