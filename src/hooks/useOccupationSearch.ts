// src/hooks/useOccupationSearch.ts

import { useState, useCallback } from 'react';
import { searchOccupations, getOccupationDetails } from '../services/OnetService';
import { Occupation, OccupationDetails } from '@/types/onet';

export const useOccupationSearch = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [results, setResults] = useState<Occupation[]>([]);
  const [selectedOccupation, setSelectedOccupation] = useState<OccupationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (term: string) => {
    if (term.trim() !== '') {
      setIsLoading(true);
      setError(null);
      try {
        const searchResults = await searchOccupations(term);
        setResults(searchResults);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setError('Failed to fetch search results. Please try again.');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setResults([]);
    }
  }, []);

  const handleOccupationSelect = useCallback(async (occupation: Occupation) => {
    setIsLoading(true);
    setError(null);
    try {
      const details = await getOccupationDetails(occupation.code);
      setSelectedOccupation({ ...occupation, ...details });
    } catch (error) {
      console.error('Error fetching occupation details:', error);
      setError('Failed to fetch occupation details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    results,
    selectedOccupation,
    isLoading,
    error,
    handleSearch,
    handleOccupationSelect,
  };
};