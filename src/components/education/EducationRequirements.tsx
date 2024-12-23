import React, { useEffect, useState, useMemo } from 'react';
import EducationService, { EducationData } from '../../services/EducationService';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import EducationFilter, { educationLevels } from './EducationFilter';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { GraduationCap, Book, Trophy } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  occupationId: string;
}

interface TrackedCertification {
  name: string;
  status: 'planned' | 'in-progress' | 'completed';
  startDate?: string;
  completionDate?: string;
}

const EducationRequirements: React.FC<Props> = ({ occupationId }) => {
  const [educationData, setEducationData] = useState<EducationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [trackedCerts, setTrackedCerts] = useLocalStorage<Record<string, TrackedCertification>>(`tracked-certs-${occupationId}`, {});

  const [filters, setFilters] = useState({
    educationLevel: 'All Levels',
    certificationStatus: 'all',
    searchQuery: ''
  });

  const filteredEducation = useMemo(() => {
    if (!educationData) return { levels: [], certifications: [] };

    let levels = educationData.educationLevels;
    let certifications = educationData.certifications;

    // Filter by education level
    if (filters.educationLevel !== 'All Levels') {
      levels = levels.filter(level => level.level === filters.educationLevel);
    }

    // Filter certifications by status
    if (filters.certificationStatus !== 'all') {
      certifications = certifications.filter(cert => {
        const tracked = trackedCerts[cert.name];
        return tracked?.status === filters.certificationStatus;
      });
    }

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      levels = levels.filter(level => 
        level.level.toLowerCase().includes(query) || 
        level.description.toLowerCase().includes(query)
      );
      certifications = certifications.filter(cert =>
        cert.name.toLowerCase().includes(query) ||
        cert.description.toLowerCase().includes(query)
      );
    }

    return { levels, certifications };
  }, [educationData, filters, trackedCerts]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await EducationService.getEducationRequirements(occupationId);
        setEducationData(data);
      } catch (error) {
        console.error('Error fetching education data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [occupationId]);

  const toggleCertificationTracking = (certName: string) => {
    setTrackedCerts(prev => {
      const updated = { ...prev };
      if (certName in updated) {
        delete updated[certName];
      } else {
        updated[certName] = {
          name: certName,
          status: 'planned',
          startDate: new Date().toISOString().split('T')[0]
        };
      }
      return updated;
    });
  };

  const updateCertStatus = (certName: string, status: TrackedCertification['status']) => {
    setTrackedCerts(prev => ({
      ...prev,
      [certName]: {
        ...prev[certName],
        status,
        ...(status === 'completed' ? { completionDate: new Date().toISOString().split('T')[0] } : {})
      }
    }));
  };

  if (loading) {
    return <Progress value={33} />;
  }

  if (!educationData) {
    return <div className="text-red-500">Failed to load education requirements</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <GraduationCap className="h-5 w-5" />
          <h2 className="text-2xl font-bold">Education Requirements</h2>
        </div>
        <EducationFilter selectedLevel={selectedLevel} onLevelChange={setSelectedLevel} />
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <Input
            placeholder="Search education requirements..."
            value={filters.searchQuery}
            onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            className="max-w-xs"
          />
          <Select
            value={filters.certificationStatus}
            onValueChange={(value) => setFilters(prev => ({ ...prev, certificationStatus: value }))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Certification Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Quick Filters:</span>
          {['Required', 'Optional', 'Recommended'].map(filter => (
            <Badge
              key={filter}
              variant="outline"
              className="cursor-pointer hover:bg-primary/10"
              onClick={() => setFilters(prev => ({
                ...prev,
                searchQuery: filter.toLowerCase()
              }))}
            >
              {filter}
            </Badge>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Book className="h-5 w-5" />
            <span>Education Levels</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Typical Education Level</h3>
            <Badge variant="default">{educationData.typicalEducation}</Badge>
          </div>

          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {filteredEducation.levels.map((level, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span>{level.level}</span>
                    {level.required && <Badge variant="destructive">Required</Badge>}
                  </div>
                  <Progress value={level.preferredPercentage} />
                  <p className="text-sm text-muted-foreground">{level.description}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>Certification Tracking</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {filteredEducation.certifications.map((cert, index) => (
                <div key={index} className="space-y-2 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="font-semibold">{cert.name}</h4>
                      {cert.required && <Badge variant="destructive">Required</Badge>}
                    </div>
                    <Button
                      variant={cert.name in trackedCerts ? "secondary" : "outline"}
                      onClick={() => toggleCertificationTracking(cert.name)}
                    >
                      {cert.name in trackedCerts ? "Untrack" : "Track"}
                    </Button>
                  </div>
                  
                  {cert.name in trackedCerts && (
                    <div className="mt-2 space-y-2">
                      <div className="flex space-x-2">
                        {(['planned', 'in-progress', 'completed'] as const).map((status) => (
                          <Button
                            key={status}
                            variant={trackedCerts[cert.name].status === status ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateCertStatus(cert.name, status)}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Button>
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Started: {trackedCerts[cert.name].startDate}
                        {trackedCerts[cert.name].completionDate && (
                          <span className="ml-2">
                            Completed: {trackedCerts[cert.name].completionDate}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-sm">Provider: {cert.provider}</p>
                  <p className="text-sm">{cert.description}</p>
                  {cert.validityPeriod && (
                    <p className="text-sm">Validity: {cert.validityPeriod}</p>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {educationData.continuingEducation && (
        <Accordion type="single" collapsible>
          <AccordionItem value="continuing-education">
            <AccordionTrigger>Continuing Education</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc list-inside space-y-2">
                {educationData.continuingEducation.map((item, index) => (
                  <li key={index} className="text-sm">{item}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
};

export default EducationRequirements;
