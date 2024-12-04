// src/components/JobTaxonomySelector.tsx

import React, { useState, useCallback, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import OccupationDetails from './OccupationDetails';
import { Task, Skill, WorkActivity, Technology, Knowledge, Ability, OccupationData } from '@/types/occupation';
import { APOItem, OccupationDetails as OccupationDetailsType } from '@/types/onet';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { InteractiveChart } from './InteractiveChart';
import APOChart from './APOChart';
import { useOccupationSearch } from '../hooks/useOccupationSearch';
import { useDebounce } from '../hooks/useDebounce';
import { calculateAPO, getAverageAPO, calculateOverallAPO } from '../utils/apoCalculations';
import { X, Search, Briefcase, Book, Brain, BarChart2, Cpu, Upload, Download } from 'lucide-react';
import TopCareers from './TopCareers';
import styles from '@/styles/JobTaxonomySelector.module.css';
import APOBreakdown from './APOBreakdown';

const JobTaxonomySelector: React.FC = () => {
  const {
    searchTerm,
    setSearchTerm,
    results,
    selectedOccupation,
    isLoading,
    error,
    handleSearch,
    handleOccupationSelect,
  } = useOccupationSearch();

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (debouncedSearchTerm) {
      handleSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, handleSearch]);

  const renderAccordionContent = useCallback((title: string, items: APOItem[], category: string) => {
    const averageAPO = getAverageAPO(items, category);
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="flex items-center gap-2">
            <span>Average APO:</span>
            <Progress value={averageAPO} className="w-24" />
            <span>{averageAPO.toFixed(2)}%</span>
          </div>
        </div>
        <APOBreakdown items={items} category={category} />
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="bg-gray-100 p-3 rounded-md">
              <div className="font-semibold">{item.name || 'Unnamed Item'}</div>
              <p className="text-sm text-gray-600">{item.description}</p>
              <div className="flex items-center mt-1">
                <span className="mr-2">APO:</span>
                <Progress value={calculateAPO(item, category)} className="w-24" />
                <span className="ml-2">{calculateAPO(item, category).toFixed(2)}%</span>
                {'genAIImpact' in item && item.genAIImpact && (
                  <span className="ml-2 text-sm font-semibold">
                    GenAI Impact: {item.genAIImpact}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }, []);

  const renderAutomationAnalysis = useCallback((occupation: OccupationDetailsType) => {
    const categories = [
      { name: 'Tasks', items: occupation.tasks, category: 'tasks' },
      { name: 'Knowledge', items: occupation.knowledge, category: 'knowledge' },
      { name: 'Skills', items: occupation.skills, category: 'skills' },
      { name: 'Abilities', items: occupation.abilities, category: 'abilities' },
      { name: 'Technologies', items: occupation.technologies, category: 'technologies' }
    ];

    const categoryAPOs = categories.map(category => ({
      category: category.name,
      apo: getAverageAPO(category.items, category.category)
    }));

    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Automation Exposure Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <APOChart data={categoryAPOs} />
        </CardContent>
      </Card>
    );
  }, []);

  const renderSearchResults = () => {
    if (isLoading) {
      return <div className={styles.loading}>Searching...</div>;
    }

    if (error) {
      return <div className={styles.error}>{error}</div>;
    }

    if (results.length > 0) {
      return (
        <div className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.map((occupation) => (
                  <button
                    key={occupation.code}
                    className="w-full text-left p-2 hover:bg-gray-100 rounded transition-colors"
                    onClick={() => handleOccupationSelect(occupation)}
                  >
                    <div className="font-medium">{occupation.title}</div>
                    <div className="text-sm text-gray-500">{occupation.code}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return null;
  };

  const convertSelectedOccupation = (selected: OccupationDetailsType): OccupationData => {
    return {
      code: selected.code || '',
      title: selected.title || '',
      description: selected.description || '',
      tasks: selected.tasks.map(item => ({
        name: item.name || '',
        description: item.description || '',
        value: item.value || 0,
        level: item.level,
        genAIImpact: item.genAIImpact as 'High' | 'Medium' | 'Low' | undefined
      })),
      workActivities: selected.tasks.slice(0, 3).map(item => ({
        name: item.name || '',
        description: item.description || '',
        value: item.value || 0
      })),
      industry_specific: false,
      industry: selected.code?.split('-')[0] || '', // Derive industry from occupation code
      knowledge: selected.knowledge.map(item => ({
        name: item.name || '',
        description: item.description || '',
        value: item.value || 0,
        level: item.level
      })),
      abilities: selected.abilities.map(item => ({
        name: item.name || '',
        description: item.description || '',
        value: item.value || 0,
        level: item.level
      })),
      skills: selected.skills.map(item => ({
        name: item.name || '',
        description: item.description || '',
        value: item.value || 0,
        level: item.level,
        category: item.scale || 'General' // Use scale as category or default to General
      })),
      technologies: selected.technologies.map(item => ({
        name: item.name || '',
        description: item.description || '',
        value: item.value || 0,
        level: item.level,
        hotTechnology: item.hotTechnology
      })),
      automationFactors: [],
      lastUpdated: new Date()
    };
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>GenAI Skill-Set Exposure Tool</h1>
      <p className={styles.subtitle}>Data sourced from <a href="https://www.onetcenter.org/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">O*NET Resource Center</a></p>
      
      <div className={styles.searchContainer}>
        <Input
          type="text"
          placeholder="Search for occupations or skills"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <Button onClick={() => handleSearch(searchTerm)}>
          <Search className="mr-2 h-4 w-4" /> Search
        </Button>
      </div>

      {renderSearchResults()}

      <div className={styles.mainContent}>
        <div className={styles.occupationDetails}>
          {selectedOccupation && (
            <div className="mt-4">
              <OccupationDetails 
                occupation={convertSelectedOccupation(selectedOccupation)} 
              />
            </div>
          )}
        </div>

        <div className={styles.sidebarContent}>
          <TopCareers onSelect={handleOccupationSelect} />
          <Card>
            <CardHeader>
              <CardTitle>Custom APO Data</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between">
              <Button>
                <Upload className="mr-2 h-4 w-4" /> Upload Data
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" /> Download Template
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <footer className={styles.footer}>
        &copy; Conceptualised & presented by Ignite IT consulting
      </footer>
    </div>
  );
};

export default JobTaxonomySelector;
