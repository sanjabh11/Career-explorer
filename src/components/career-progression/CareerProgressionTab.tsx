import React, { useEffect, useState } from 'react';
import { CareerPath } from './types';
import { careerProgressionService } from '@/services/careerProgressionService';
import CareerLadderVisualization from './CareerLadderVisualization';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  occupationId: string;
}

const CareerProgressionTab: React.FC<Props> = ({ occupationId }) => {
  const [loading, setLoading] = useState(true);
  const [careerPath, setCareerPath] = useState<CareerPath | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCareerPath = async () => {
      try {
        setLoading(true);
        const path = await careerProgressionService.getCareerPath(occupationId);
        setCareerPath(path);
        setError(null);
      } catch (err) {
        setError('Failed to load career progression data');
        console.error('Error loading career path:', err);
      } finally {
        setLoading(false);
      }
    };

    if (occupationId) {
      loadCareerPath();
    }
  }, [occupationId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!careerPath) {
    return null;
  }

  return (
    <Tabs defaultValue="ladder" className="w-full">
      <TabsList>
        <TabsTrigger value="ladder">Career Ladder</TabsTrigger>
        <TabsTrigger value="requirements">Requirements</TabsTrigger>
        <TabsTrigger value="milestones">Milestones</TabsTrigger>
      </TabsList>

      <TabsContent value="ladder" className="mt-4">
        <CareerLadderVisualization 
          careerPath={careerPath}
          currentLevelId="mid-dev" // This should be dynamic based on user's current level
        />
      </TabsContent>

      <TabsContent value="requirements" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Advancement Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Requirements calculator component will go here */}
            <p className="text-muted-foreground">Coming soon...</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="milestones" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Experience Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Milestones tracking component will go here */}
            <p className="text-muted-foreground">Coming soon...</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default CareerProgressionTab;
