import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const SearchBar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    // Implement search functionality here
    console.log('Searching for:', searchTerm);
  };

  return (
    <div className="flex space-x-2">
      <Input
        type="text"
        placeholder="Search for occupations or skills"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-grow"
      />
      <Button onClick={handleSearch}>
        <Search className="mr-2 h-4 w-4" /> Search
      </Button>
    </div>
  );
};

export default SearchBar;
