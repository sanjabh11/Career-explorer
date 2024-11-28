import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 py-6">
      <div className="container mx-auto px-4">
        <p className="text-center text-gray-600">
          © {new Date().getFullYear()} O*NET Career Explorer. All rights reserved.
        </p>
        <p className="text-center text-gray-500 mt-2">
          Data sourced from <a href="https://www.onetcenter.org/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">O*NET Resource Center</a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
