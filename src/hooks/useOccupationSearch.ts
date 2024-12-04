// src/hooks/useOccupationSearch.ts

import { useState, useCallback } from 'react';
import { searchOccupations, getOccupationDetails } from '../services/OnetService';
import { Occupation, OccupationDetails } from '@/types/onet';
import { assignGenAIImpact } from '@/utils/apoCalculations';

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
        if (searchResults.length === 0) {
          setError('No results found. Please try a different search term.');
        }
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
      const updatedOccupation: OccupationDetails = {
        code: details.code,
        title: details.title,
        description: details.description,
        sample_of_reported_job_titles: details.sample_of_reported_job_titles,
        updated: details.updated,
        categories: details.categories || [],
        overallAPO: 0,
        tasks: details.tasks.map((task: any) => ({
          name: task.name,
          description: task.description,
          value: task.value || 0,
          level: task.level,
          genAIImpact: undefined
        })),
        knowledge: details.knowledge.map((item: any) => ({
          name: item.name,
          description: item.description,
          value: item.value || 0,
          level: item.level,
          category: item.category || ''
        })),
        skills: details.skills.map((item: any) => ({
          name: item.name,
          description: item.description,
          value: item.value || 0,
          level: item.level,
          category: item.category || ''
        })),
        abilities: details.abilities.map((item: any) => ({
          name: item.name,
          description: item.description,
          value: item.value || 0,
          level: item.level
        })),
        technologies: details.technologies.map((item: any) => ({
          name: item.name,
          description: item.description,
          value: item.value || 0,
          level: item.level,
          hotTechnology: item.hotTechnology,
          category: item.category || ''
        })),
        responsibilities: details.tasks.map((task: any) => task.description)
      };
      setSelectedOccupation(updatedOccupation);
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
