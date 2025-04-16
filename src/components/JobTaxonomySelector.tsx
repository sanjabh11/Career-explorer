// src/components/JobTaxonomySelector.tsx

import React, { useState, useCallback, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
import { X, Search, Briefcase, Book, Brain, BarChart2, Cpu, Upload, Download, TrendingUp } from 'lucide-react';
import TopCareers from './TopCareers';
import styles from '@/styles/JobTaxonomySelector.module.css';
import APOBreakdown from './APOBreakdown';
import { jobOutlookService } from '@/services/JobOutlookService';
import { searchOccupations, getOccupationDetails } from '@/services/OnetService';

const JobTaxonomySelector: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [results, setResults] = useState<any[]>([]);
  const [selectedOccupation, setSelectedOccupation] = useState<OccupationDetailsType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [brightOutlookOnly, setBrightOutlookOnly] = useState<boolean>(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Handle occupation selection
  const handleOccupationSelect = useCallback(async (occupation: any) => {
    try {
      setIsLoading(true);
      console.log(`[Selection] Selected occupation: ${occupation.title} (${occupation.code})`);

      // Try to get full occupation details from the API
      try {
        // First try to get real data from the API
        const occupationDetails = await getOccupationDetails(occupation.code);
        console.log('[Selection] Got occupation details from API');
        setSelectedOccupation(occupationDetails);
      } catch (apiError) {
        console.error('Error getting occupation details from API:', apiError);

        // If API fails, fall back to mock data
        try {
          console.log('[Selection] Falling back to mock data');
          const mockOccupationDetails = jobOutlookService.getMockOccupationDetails(occupation.code);
          setSelectedOccupation(mockOccupationDetails);
        } catch (mockError) {
          console.error('Error getting mock occupation details:', mockError);
          // If all else fails, just use the basic occupation data
          setSelectedOccupation(occupation);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle search with filters
  const handleSearch = useCallback(async (term: string) => {
    if (!term.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log(`[Search] Searching for "${term}" with brightOutlookOnly=${brightOutlookOnly}`);

      // Try to get results from the API first
      try {
        let searchResults;
        if (brightOutlookOnly) {
          // If filtering by bright outlook, use the filter function
          searchResults = await jobOutlookService.searchOccupationsWithFilters(term, true);
        } else {
          // Otherwise, use the regular search function
          searchResults = await searchOccupations(term);
        }

        console.log(`[Search] Got ${searchResults?.length || 0} results from API`);

        if (searchResults && searchResults.length > 0) {
          setResults(searchResults);
        } else {
          // If no results from API, try mock data
          const mockResults = getMockSearchResults(term);
          if (mockResults.length > 0) {
            console.log('[Search] Using mock search results');
            setResults(mockResults);
          } else {
            setError(`No occupations found matching "${term}". Try a different search term.`);
          }
        }
      } catch (apiError) {
        console.error('API search error:', apiError);

        // If API fails, use mock data
        const mockResults = getMockSearchResults(term);
        if (mockResults.length > 0) {
          console.log('[Search] Using mock search results after API error');
          setResults(mockResults);
        } else {
          setError('An error occurred while searching. Please try again.');
        }
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('An error occurred while searching. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [brightOutlookOnly]);

  // Helper function to get mock search results
  const getMockSearchResults = (term: string) => {
    const lowercaseTerm = term.toLowerCase();

    // Special case for 'audit' searches
    if (lowercaseTerm.includes('audit')) {
      return [
        { code: '13-2011.00', title: 'Accountants and Auditors' },
        { code: '13-2011.02', title: 'Internal Auditors' },
        { code: '13-2011.01', title: 'Forensic Accountants and Auditors' },
        { code: '13-1041.00', title: 'Compliance Officers and Auditors' },
        { code: '13-1199.05', title: 'Sustainability Auditors and Specialists' }
      ];
    }

    // Special case for 'talent' searches
    if (lowercaseTerm.includes('talent')) {
      return [
        { code: '13-1071.00', title: 'Human Resources Specialists' },
        { code: '13-1141.00', title: 'Compensation, Benefits, and Job Analysis Specialists' },
        { code: '11-3121.00', title: 'Human Resources Managers' },
        { code: '13-1151.00', title: 'Training and Development Specialists' },
        { code: '27-2012.00', title: 'Producers and Directors' },
        { code: '27-2041.00', title: 'Music Directors and Composers' }
      ];
    }

    // Default mock data for other searches
    return jobOutlookService.getMockOccupations(term);
  };

  useEffect(() => {
    if (debouncedSearchTerm) {
      handleSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, handleSearch, brightOutlookOnly]);

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
    // Ensure all required properties exist with fallbacks
    const tasks = selected.tasks || [];
    const knowledge = selected.knowledge || [];
    const abilities = selected.abilities || [];
    const skills = selected.skills || [];
    const technologies = selected.technologies || [];

    return {
      code: selected.code || '',
      title: selected.title || '',
      description: selected.description || '',
      tasks: tasks.map(item => ({
        name: item.name || '',
        description: item.description || '',
        value: item.value || 0,
        level: item.level || 0,
        genAIImpact: item.genAIImpact as 'High' | 'Medium' | 'Low' | undefined
      })),
      workActivities: tasks.slice(0, 3).map(item => ({
        name: item.name || '',
        description: item.description || '',
        value: item.value || 0
      })),
      industry_specific: false,
      industry: selected.code?.split('-')[0] || '', // Derive industry from occupation code
      knowledge: knowledge.map(item => ({
        name: item.name || '',
        description: item.description || '',
        value: item.value || 0,
        level: item.level || 0
      })),
      abilities: abilities.map(item => ({
        name: item.name || '',
        description: item.description || '',
        value: item.value || 0,
        level: item.level || 0
      })),
      skills: skills.map(item => ({
        name: item.name || '',
        description: item.description || '',
        value: item.value || 0,
        level: item.level || 0,
        category: item.category || 'General'
      })),
      technologies: technologies.map(item => ({
        name: item.name || '',
        description: item.description || '',
        value: item.value || 0,
        level: item.level || 0,
        hotTechnology: item.hotTechnology || false
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
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className="flex-grow">
            <Input
              type="text"
              placeholder="Search for occupations or skills"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="bright-outlook"
                checked={brightOutlookOnly}
                onCheckedChange={setBrightOutlookOnly}
              />
              <Label htmlFor="bright-outlook" className="flex items-center cursor-pointer">
                <TrendingUp className="h-4 w-4 mr-1 text-yellow-500" />
                Bright Outlook Only
              </Label>
            </div>
            <Button onClick={() => handleSearch(searchTerm)}>
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
          </div>
        </div>
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
