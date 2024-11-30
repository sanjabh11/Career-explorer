import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import EnhancedAPOAnalysis from './EnhancedAPOAnalysis';
import APOChart from './APOChart';
import IndustryAnalysis from './IndustryAnalysis';
import { AutomationFactor } from '@/types/automation';
import { calculateAPO, getAverageAPO, calculateOverallAPO } from '../utils/apoCalculations';
import { Briefcase, Book, Brain, BarChart2, Cpu } from 'lucide-react';

interface OccupationDetailsProps {
  occupation: any;
}

const OccupationDetails: React.FC<OccupationDetailsProps> = ({ occupation }) => {
  const getAutomationFactor = (occupation: any): AutomationFactor => {
    return {
      id: occupation.code || '',
      name: occupation.title || '',
      weight: 0.8,
      category: determineCategory(occupation),
      complexity: calculateComplexity(occupation),
      humanAICollaboration: calculateHumanAICollaboration(occupation),
      industrySpecific: isIndustrySpecific(occupation),
      emergingTechImpact: calculateEmergingTechImpact(occupation)
    };
  };

  const determineCategory = (occupation: any): string => {
    const description = (occupation.description || '').toLowerCase();
    if (description.includes('analyze') || description.includes('research')) return 'cognitive';
    if (description.includes('physical') || description.includes('operate')) return 'manual';
    if (description.includes('communicate') || description.includes('coordinate')) return 'social';
    if (description.includes('design') || description.includes('create')) return 'creative';
    return 'analytical';
  };

  const calculateComplexity = (occupation: any): number => {
    const skills = occupation.skills || [];
    return Math.min(5, Math.ceil((skills.length || 1) / 2));
  };

  const calculateHumanAICollaboration = (occupation: any): number => {
    const description = (occupation.description || '').toLowerCase();
    if (description.includes('team') || description.includes('collaborate')) return 0.8;
    if (description.includes('independent') || description.includes('autonomous')) return 0.3;
    return 0.5;
  };

  const isIndustrySpecific = (occupation: any): boolean => {
    return occupation.industry_specific || false;
  };

  const calculateEmergingTechImpact = (occupation: any): number => {
    const technologies = occupation.technologies || [];
    return Math.min(1, (technologies.length || 0) / 10);
  };

  const renderAccordionContent = (title: string, items: any[], category: string) => {
    return (
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <span>{item.name || item}</span>
            <div className="flex items-center gap-2">
              <Progress value={calculateAPO(item, category)} className="w-24" />
              <span className="text-sm font-medium">
                {Math.round(calculateAPO(item, category))}%
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{occupation.title}</span>
            <span className="text-sm font-normal text-gray-500">O*NET-SOC Code: {occupation.code}</span>
          </CardTitle>
          <CardDescription>{occupation.description}</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="apo" className="space-y-4">
        <TabsList>
          <TabsTrigger value="apo">Automation Potential</TabsTrigger>
          <TabsTrigger value="details">Category Details</TabsTrigger>
          <TabsTrigger value="industry">Industry Analysis</TabsTrigger>
          <TabsTrigger value="enhanced">Enhanced Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="apo">
          <Card>
            <CardHeader>
              <CardTitle>Overall Automation Potential</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-lg">Overall APO:</span>
                <div className="flex items-center">
                  <Progress 
                    value={calculateOverallAPO(occupation)} 
                    className="w-32 mr-2" 
                  />
                  <span className="text-2xl font-bold">
                    {calculateOverallAPO(occupation).toFixed(2)}%
                  </span>
                </div>
              </div>
              <APOChart data={categoryAPOs} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="tasks">
                  <AccordionTrigger className="flex items-center">
                    <Briefcase className="mr-2" /> Tasks
                  </AccordionTrigger>
                  <AccordionContent>
                    {renderAccordionContent('Tasks', occupation.tasks, 'tasks')}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="knowledge">
                  <AccordionTrigger className="flex items-center">
                    <Book className="mr-2" /> Knowledge
                  </AccordionTrigger>
                  <AccordionContent>
                    {renderAccordionContent('Knowledge', occupation.knowledge, 'knowledge')}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="skills">
                  <AccordionTrigger className="flex items-center">
                    <Brain className="mr-2" /> Skills
                  </AccordionTrigger>
                  <AccordionContent>
                    {renderAccordionContent('Skills', occupation.skills, 'skills')}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="abilities">
                  <AccordionTrigger className="flex items-center">
                    <BarChart2 className="mr-2" /> Abilities
                  </AccordionTrigger>
                  <AccordionContent>
                    {renderAccordionContent('Abilities', occupation.abilities, 'abilities')}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="technologies">
                  <AccordionTrigger className="flex items-center">
                    <Cpu className="mr-2" /> Technologies
                  </AccordionTrigger>
                  <AccordionContent>
                    {renderAccordionContent('Technologies', occupation.technologies, 'technologies')}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="industry">
          <IndustryAnalysis
            baseAutomationScore={calculateOverallAPO(occupation) / 100}
            onIndustryFactorChange={(factor) => {
              // You can store this factor in state if needed
              console.log('Industry factor updated:', factor);
            }}
          />
        </TabsContent>

        <TabsContent value="enhanced">
          <EnhancedAPOAnalysis 
            automationFactor={getAutomationFactor(occupation)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OccupationDetails;
