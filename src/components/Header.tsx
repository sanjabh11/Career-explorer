import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-blue-600 text-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <a href="/" className="text-2xl font-bold">O*NET Career Explorer</a>
        <nav>
          <ul className="flex space-x-4">
            <li><a href="/about">About</a></li>
            <li><a href="/occupations">Occupations</a></li>
            <li><a href="/skills">Skills</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
