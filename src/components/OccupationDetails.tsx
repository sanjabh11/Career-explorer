import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EnhancedAPOAnalysis from './EnhancedAPOAnalysis';
import APOVisualization from './APOVisualization';
import IndustryAnalysis from './IndustryAnalysis';
import { AutomationFactor } from '@/types/automation';
import { calculateAPO, getAverageAPO, calculateOverallAPO } from '../utils/apoCalculations';
import { Briefcase, Book, Brain, BarChart2, Cpu, GitBranch } from 'lucide-react';
import { OccupationData, Task, Skill, WorkActivity, Technology, Knowledge, Ability } from '@/types/occupation';
import { APOItem } from '@/types/onet';
import { AutomationDataService } from '@/services/AutomationDataService';
import { predictAutomationTrend } from '@/utils/automationPrediction';
import { AutomationTrend, PredictedAPO, ResearchData } from '@/types/automationTrends';
import HistoricalTrendChart from './HistoricalTrendChart';
import ResearchInsights from './ResearchInsights';
import FactorImpactAnalysis from './FactorImpactAnalysis';
import EducationRequirements from './education/EducationRequirements';
import CareerProgressionTab from './career-progression/CareerProgressionTab';

const convertToAPOItem = (item: Task | Skill | WorkActivity | Technology | Knowledge | Ability): APOItem => {
  const value = 'level' in item && item.level !== undefined 
    ? (item.level / 5) * 100 
    : item.value || 50;

  return {
    ...item,
    value
  };
};

interface OccupationDetailsProps {
  occupation: OccupationData;
}

const OccupationDetails: React.FC<OccupationDetailsProps> = ({ occupation }) => {
  const [historicalData, setHistoricalData] = useState<AutomationTrend[]>([]);
  const [prediction, setPrediction] = useState<PredictedAPO | null>(null);
  const [researchData, setResearchData] = useState<ResearchData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartType, setChartType] = useState<'radar' | 'bar' | 'pie'>('bar');
  const automationService = new AutomationDataService();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch historical data
        const endDate = new Date();
        const startDate = new Date();
        startDate.setFullYear(endDate.getFullYear() - 1);

        const [historical, research] = await Promise.all([
          automationService.collectHistoricalData(
            occupation.code || '',
            { startDate, endDate }
          ),
          automationService.getLatestResearchData()
        ]);

        setHistoricalData(historical);
        setResearchData(research);

        const predictionResult = await predictAutomationTrend(
          historical,
          occupation.automationFactors || [],
          12 // predict for next 12 months
        );
        setPrediction(await predictionResult);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [occupation.code]);

  const getAutomationFactor = (occupation: OccupationData): AutomationFactor => {
    return {
      id: occupation.code || '',
      name: occupation.title || '',
      weight: 0.8,
      category: determineCategory(occupation),
      complexity: calculateComplexity(occupation),
      repetitiveness: calculateRepetitiveness(occupation),
      humanAICollaboration: calculateHumanAICollaboration(occupation),
      industrySpecific: isIndustrySpecific(occupation),
      emergingTechImpact: calculateEmergingTechImpact(occupation)
    };
  };

  const determineCategory = (occupation: OccupationData): string => {
    const description = (occupation.description || '').toLowerCase();
    if (description.includes('analyze') || description.includes('research')) return 'cognitive';
    if (description.includes('physical') || description.includes('operate')) return 'manual';
    if (description.includes('communicate') || description.includes('coordinate')) return 'social';
    if (description.includes('design') || description.includes('create')) return 'creative';
    return 'analytical';
  };

  const calculateComplexity = (occupation: OccupationData): number => {
    const skills = occupation.skills || [];
    const avgSkillLevel = skills.reduce((acc: number, skill: Skill) => 
      acc + (skill.level || 0), 0) / (skills.length || 1);
    return Math.max(1, Math.min(5, Math.round(avgSkillLevel)));
  };

  const calculateRepetitiveness = (occupation: OccupationData): number => {
    const tasks = occupation.tasks || [];
    const routineTasks = tasks.filter((task: Task) => {
      const description = (task.description || '').toLowerCase();
      return description.includes('routine') || 
             description.includes('repetitive') ||
             description.includes('regular') ||
             description.includes('standard') ||
             description.includes('daily');
    });

    const standardizationScore = routineTasks.length / (tasks.length || 1);
    
    const skills = occupation.skills || [];
    const uniqueSkillCategories = new Set(skills.map((skill: Skill) => skill.category));
    const skillVarietyScore = 1 - (uniqueSkillCategories.size / 10); 

    const activities = occupation.workActivities || [];
    const activityVarietyScore = 1 - (activities.length / 20); 

    const repetitiveness = (
      standardizationScore * 0.5 +
      skillVarietyScore * 0.3 +
      activityVarietyScore * 0.2
    );

    return Math.max(0, Math.min(1, repetitiveness));
  };

  const calculateHumanAICollaboration = (occupation: OccupationData): number => {
    const description = (occupation.description || '').toLowerCase();
    if (description.includes('team') || description.includes('collaborate')) return 0.8;
    if (description.includes('independent') || description.includes('autonomous')) return 0.3;
    return 0.5;
  };

  const isIndustrySpecific = (occupation: OccupationData): boolean => {
    return occupation.industry_specific || false;
  };

  const calculateEmergingTechImpact = (occupation: OccupationData): number => {
    const technologies = occupation.technologies || [];
    return Math.min(1, (technologies.length || 0) / 10);
  };

  const renderAccordionContent = (title: string, items: APOItem[], category: string) => {
    return (
      <div className="space-y-4">
        {items?.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <span>{item.name}</span>
            <div className="flex items-center gap-2">
              <Progress value={item.value} className="w-24" />
              <span className="text-sm font-medium">
                {Math.round(item.value)}%
              </span>
            </div>
          </div>
        )) || null}
      </div>
    );
  };

  const categories = [
    { name: 'Tasks', items: occupation.tasks.map(convertToAPOItem), category: 'tasks' },
    { name: 'Knowledge', items: occupation.knowledge.map(convertToAPOItem), category: 'knowledge' },
    { name: 'Skills', items: occupation.skills.map(convertToAPOItem), category: 'skills' },
    { name: 'Abilities', items: occupation.abilities.map(convertToAPOItem), category: 'abilities' },
    { name: 'Technologies', items: occupation.technologies.map(convertToAPOItem), category: 'technologies' }
  ];

  const categoryAPOs = categories.map(category => ({
    category: category.name,
    apo: getAverageAPO(category.items, category.category)
  }));

  const occupationWithAPOItems = {
    tasks: occupation.tasks.map(convertToAPOItem),
    knowledge: occupation.knowledge.map(convertToAPOItem),
    skills: occupation.skills.map(convertToAPOItem),
    abilities: occupation.abilities.map(convertToAPOItem),
    technologies: occupation.technologies.map(convertToAPOItem)
  };

  const overallAPO = calculateOverallAPO(occupation);
  
  const categoryData = {
    categories: [
      { name: 'Tasks', value: getAverageAPO(occupation.tasks.map(convertToAPOItem), 'tasks') },
      { name: 'Knowledge', value: getAverageAPO(occupation.knowledge.map(convertToAPOItem), 'knowledge') },
      { name: 'Skills', value: getAverageAPO(occupation.skills.map(convertToAPOItem), 'skills') },
      { name: 'Abilities', value: getAverageAPO(occupation.abilities.map(convertToAPOItem), 'abilities') },
      { name: 'Technologies', value: getAverageAPO((occupation.technologies || []).map(convertToAPOItem), 'technologies') }
    ]
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="apo" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6 mb-8">
          <TabsTrigger value="apo">
            <Briefcase className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="education">
            <Book className="h-4 w-4 mr-2" />
            Education
          </TabsTrigger>
          <TabsTrigger value="progression">
            <GitBranch className="h-4 w-4 mr-2" />
            Career Path
          </TabsTrigger>
          <TabsTrigger value="automation">
            <Cpu className="h-4 w-4 mr-2" />
            Automation
          </TabsTrigger>
          <TabsTrigger value="skills">
            <Brain className="h-4 w-4 mr-2" />
            Skills
          </TabsTrigger>
          <TabsTrigger value="trends">
            <BarChart2 className="h-4 w-4 mr-2" />
            Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="apo">
          <Card>
            <CardHeader>
              <CardTitle>Overall Automation Potential</CardTitle>
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center gap-4">
                  <span className="text-lg font-semibold">Overall APO:</span>
                  <div className="flex items-center gap-2">
                    <Progress value={calculateOverallAPO(occupation)} className="w-[200px]" />
                    <span className="text-lg">{calculateOverallAPO(occupation).toFixed(2)}%</span>
                  </div>
                </div>
                <Select value={chartType} onValueChange={(value: 'radar' | 'bar' | 'pie') => setChartType(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select chart type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="radar">Radar Chart</SelectItem>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="pie">Pie Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <APOVisualization 
                data={categoryData}
                chartType={chartType}
                onChartTypeChange={setChartType}
                className="mt-4"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education" className="space-y-4">
          <EducationRequirements occupationId={occupation.code} />
        </TabsContent>

        <TabsContent value="progression" className="space-y-4">
          <CareerProgressionTab occupationId={occupation.code} />
        </TabsContent>

        <TabsContent value="automation">
          <Card>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="tasks">
                  <AccordionTrigger className="flex items-center">
                    <Briefcase className="mr-2" /> Tasks
                  </AccordionTrigger>
                  <AccordionContent>
                    {renderAccordionContent('Tasks', occupationWithAPOItems.tasks, 'tasks')}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="knowledge">
                  <AccordionTrigger className="flex items-center">
                    <Book className="mr-2" /> Knowledge
                  </AccordionTrigger>
                  <AccordionContent>
                    {renderAccordionContent('Knowledge', occupationWithAPOItems.knowledge, 'knowledge')}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="skills">
                  <AccordionTrigger className="flex items-center">
                    <Brain className="mr-2" /> Skills
                  </AccordionTrigger>
                  <AccordionContent>
                    {renderAccordionContent('Skills', occupationWithAPOItems.skills, 'skills')}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="abilities">
                  <AccordionTrigger className="flex items-center">
                    <BarChart2 className="mr-2" /> Abilities
                  </AccordionTrigger>
                  <AccordionContent>
                    {renderAccordionContent('Abilities', occupationWithAPOItems.abilities, 'abilities')}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="technologies">
                  <AccordionTrigger className="flex items-center">
                    <Cpu className="mr-2" /> Technologies
                  </AccordionTrigger>
                  <AccordionContent>
                    {renderAccordionContent('Technologies', occupationWithAPOItems.technologies, 'technologies')}
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
          <div className="space-y-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading analysis...</p>
              </div>
            ) : (
              <>
                <EnhancedAPOAnalysis 
                  automationFactor={getAutomationFactor(occupation)}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <HistoricalTrendChart 
                    data={historicalData}
                    predictedTrend={prediction ? [{
                      date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                      apoScore: prediction.predictedAPO
                    }] : undefined}
                  />
                  {prediction && (
                    <FactorImpactAnalysis
                      currentFactors={[getAutomationFactor(occupation)]}
                      prediction={prediction}
                    />
                  )}
                </div>
                <ResearchInsights
                  data={researchData}
                  occupationCode={occupation.code || ''}
                />
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="tasks">
                  <AccordionTrigger className="flex items-center">
                    <Briefcase className="mr-2" /> Tasks
                  </AccordionTrigger>
                  <AccordionContent>
                    {renderAccordionContent('Tasks', occupationWithAPOItems.tasks, 'tasks')}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="knowledge">
                  <AccordionTrigger className="flex items-center">
                    <Book className="mr-2" /> Knowledge
                  </AccordionTrigger>
                  <AccordionContent>
                    {renderAccordionContent('Knowledge', occupationWithAPOItems.knowledge, 'knowledge')}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="skills">
                  <AccordionTrigger className="flex items-center">
                    <Brain className="mr-2" /> Skills
                  </AccordionTrigger>
                  <AccordionContent>
                    {renderAccordionContent('Skills', occupationWithAPOItems.skills, 'skills')}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="abilities">
                  <AccordionTrigger className="flex items-center">
                    <BarChart2 className="mr-2" /> Abilities
                  </AccordionTrigger>
                  <AccordionContent>
                    {renderAccordionContent('Abilities', occupationWithAPOItems.abilities, 'abilities')}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="technologies">
                  <AccordionTrigger className="flex items-center">
                    <Cpu className="mr-2" /> Technologies
                  </AccordionTrigger>
                  <AccordionContent>
                    {renderAccordionContent('Technologies', occupationWithAPOItems.technologies, 'technologies')}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="tasks">
                  <AccordionTrigger className="flex items-center">
                    <Briefcase className="mr-2" /> Tasks
                  </AccordionTrigger>
                  <AccordionContent>
                    {renderAccordionContent('Tasks', occupationWithAPOItems.tasks, 'tasks')}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="knowledge">
                  <AccordionTrigger className="flex items-center">
                    <Book className="mr-2" /> Knowledge
                  </AccordionTrigger>
                  <AccordionContent>
                    {renderAccordionContent('Knowledge', occupationWithAPOItems.knowledge, 'knowledge')}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="skills">
                  <AccordionTrigger className="flex items-center">
                    <Brain className="mr-2" /> Skills
                  </AccordionTrigger>
                  <AccordionContent>
                    {renderAccordionContent('Skills', occupationWithAPOItems.skills, 'skills')}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="abilities">
                  <AccordionTrigger className="flex items-center">
                    <BarChart2 className="mr-2" /> Abilities
                  </AccordionTrigger>
                  <AccordionContent>
                    {renderAccordionContent('Abilities', occupationWithAPOItems.abilities, 'abilities')}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="technologies">
                  <AccordionTrigger className="flex items-center">
                    <Cpu className="mr-2" /> Technologies
                  </AccordionTrigger>
                  <AccordionContent>
                    {renderAccordionContent('Technologies', occupationWithAPOItems.technologies, 'technologies')}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OccupationDetails;
