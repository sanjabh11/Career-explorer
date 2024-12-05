import React, { useEffect, useState } from 'react';
import EducationService, { EducationData } from '../../services/EducationService';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

interface Props {
  occupationId: string;
}

const EducationRequirements: React.FC<Props> = ({ occupationId }) => {
  const [educationData, setEducationData] = useState<EducationData | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <Progress value={33} />;
  }

  if (!educationData) {
    return <div className="text-red-500">Failed to load education requirements</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Education Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Typical Education Level</h3>
            <Badge variant="default">{educationData.typicalEducation}</Badge>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Education Level Requirements</h3>
            {educationData.educationLevels.map((level, index) => (
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
        </CardContent>
      </Card>

      <Accordion type="single" collapsible>
        <AccordionItem value="certifications">
          <AccordionTrigger>Certifications</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              {educationData.certifications.map((cert, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{cert.name}</h4>
                    {cert.required && <Badge variant="destructive">Required</Badge>}
                  </div>
                  <p className="text-sm">Provider: {cert.provider}</p>
                  <p className="text-sm">{cert.description}</p>
                  {cert.validityPeriod && (
                    <p className="text-sm">Validity: {cert.validityPeriod}</p>
                  )}
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {educationData.continuingEducation && (
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
        )}
      </Accordion>
    </div>
  );
};

export default EducationRequirements;
