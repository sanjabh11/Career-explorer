import React from 'react';

interface BrightOutlookBadgeProps {
  reasons: string[];
}

/**
 * Badge component for bright outlook occupations
 */
const BrightOutlookBadge: React.FC<BrightOutlookBadgeProps> = ({ reasons }) => {
  // Map reason codes to human-readable text
  const getReasonText = (reason: string): string => {
    const reasonMap: Record<string, string> = {
      'rapid_growth': 'Rapid Growth',
      'numerous_openings': 'Numerous Job Openings',
      'new_emerging': 'New & Emerging Occupation'
    };
    
    return reasonMap[reason] || reason;
  };
  
  return (
    <div className="relative group">
      <div className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium text-sm">
        <svg className="w-5 h-5 mr-1 text-yellow-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
        </svg>
        Bright Outlook
      </div>
      
      {/* Tooltip with reasons */}
      <div className="absolute z-10 hidden group-hover:block bg-white border border-gray-200 rounded-md shadow-lg p-3 mt-2 w-64">
        <h4 className="font-semibold text-gray-800 mb-2">Bright Outlook Occupation</h4>
        <p className="text-sm text-gray-600 mb-2">
          This occupation is expected to experience strong employment growth in the coming years.
        </p>
        {reasons.length > 0 && (
          <div className="mt-2">
            <h5 className="text-xs font-semibold text-gray-700 mb-1">Reasons:</h5>
            <ul className="list-disc list-inside text-xs text-gray-600">
              {reasons.map((reason, index) => (
                <li key={index}>{getReasonText(reason)}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrightOutlookBadge;
