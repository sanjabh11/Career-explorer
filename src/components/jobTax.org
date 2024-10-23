// src/components/JobTaxonomySelector.tsx

import React, { useCallback, useEffect } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { InteractiveChart } from './InteractiveChart';
import APOChart from './APOChart';
import { Occupation, OccupationDetails } from '@/types/onet';
import { useOccupationSearch } from '../hooks/useOccupationSearch';
import { useDebounce } from '../hooks/useDebounce';
import { calculateAPO, getAverageAPO } from '../utils/apoCalculations';
import { X, Search, Briefcase, Book, Brain, BarChart2, Cpu, Upload, Download } from 'lucide-react';
import TopCareers from './TopCareers';
import styles from '@/styles/JobTaxonomySelector.module.css';

const calculateOverallAPO = (categoryAPOs: { apo: number }[]) => {
  const totalAPO = categoryAPOs.reduce((sum, category) => sum + category.apo, 0);
  return (totalAPO / categoryAPOs.length).toFixed(2);
};

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

  const calculateOverallAPO = (categoryAPOs: { apo: number }[]) => {
    const totalAPO = categoryAPOs.reduce((sum, category) => sum + category.apo, 0);
    return (totalAPO / categoryAPOs.length).toFixed(2);
  };

  const renderAccordionContent = useCallback((title: string, items: any[], category: string) => {
    const averageAPO = getAverageAPO(items, category);
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="flex items-center">
            <span className="mr-2">Average APO:</span>
            <Progress value={averageAPO} className="w-24" />
            <span className="ml-2">{averageAPO.toFixed(2)}%</span>
          </div>
        </div>
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="bg-gray-100 p-3 rounded-md">
              <div className="font-semibold">{item.name || 'Unnamed Item'}</div>
              <p className="text-sm text-gray-600">{item.description}</p>
              <div className="flex items-center mt-1">
                <span className="mr-2">APO:</span>
                <Progress value={calculateAPO(item, category)} className="w-24" />
                <span className="ml-2">{calculateAPO(item, category).toFixed(2)}%</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }, []);
  
  const renderAutomationAnalysis = useCallback((occupation: OccupationDetails) => {
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
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {results.map((occupation) => (
                <li key={occupation.code} className="flex justify-between items-center">
                  <span>{occupation.title}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOccupationSelect(occupation)}
                  >
                    View Details
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title} style={{ color: '#00008B' }}>GenAI Skill-Set Exposure Tool</h1>
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
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{selectedOccupation.title}</span>
                  <span className="text-sm font-normal text-gray-500">O*NET-SOC Code: {selectedOccupation.code}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{selectedOccupation.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-lg">Overall APO:</span>
                  <div className="flex items-center">
                    <Progress 
                      value={parseFloat(calculateOverallAPO(renderAutomationAnalysis(selectedOccupation).props.children[1].props.children.props.data))} 
                      className={`w-32 mr-2 ${styles.apoProgress}`} 
                    />
                    <span className="text-2xl font-bold">
                      {calculateOverallAPO(renderAutomationAnalysis(selectedOccupation).props.children[1].props.children.props.data)}%
                    </span>
                  </div>
                </div>
                {renderAutomationAnalysis(selectedOccupation)}
                <Accordion type="single" collapsible className="mb-4">
                  <AccordionItem value="tasks">
                    <AccordionTrigger className="flex items-center">
                      <Briefcase className="mr-2" /> Tasks
                    </AccordionTrigger>
                    <AccordionContent>
                      {renderAccordionContent('Tasks', selectedOccupation.tasks, 'tasks')}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="knowledge">
                    <AccordionTrigger className="flex items-center">
                      <Book className="mr-2" /> Knowledge
                    </AccordionTrigger>
                    <AccordionContent>
                      {renderAccordionContent('Knowledge', selectedOccupation.knowledge, 'knowledge')}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="skills">
                    <AccordionTrigger className="flex items-center">
                      <Brain className="mr-2" /> Skills
                    </AccordionTrigger>
                    <AccordionContent>
                      {renderAccordionContent('Skills', selectedOccupation.skills, 'skills')}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="abilities">
                    <AccordionTrigger className="flex items-center">
                      <BarChart2 className="mr-2" /> Abilities
                    </AccordionTrigger>
                    <AccordionContent>
                      {renderAccordionContent('Abilities', selectedOccupation.abilities, 'abilities')}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="technologies">
                    <AccordionTrigger className="flex items-center">
                      <Cpu className="mr-2" /> Technologies
                    </AccordionTrigger>
                    <AccordionContent>
                      {renderAccordionContent('Technologies', selectedOccupation.technologies, 'technologies')}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
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
        © Conceptualised & presented by Ignite IT consulting
      </footer>
    </div>
  );
};

export default JobTaxonomySelector;