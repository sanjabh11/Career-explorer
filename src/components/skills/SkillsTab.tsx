import React, { useState } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import SkillsAssessment from './SkillsAssessment';
import TrainingRecommendations from './TrainingRecommendations';
import { Lightbulb, BookOpen, TrendingUp } from 'lucide-react';

interface SkillsTabProps {
  occupationId: string;
  userId: string;
}

const SkillsTab: React.FC<SkillsTabProps> = ({ occupationId, userId }) => {
  const [activeTab, setActiveTab] = useState('assessment');

  return (
    <Card className="p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 gap-4">
          <TabsTrigger value="assessment" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Skills Assessment
          </TabsTrigger>
          <TabsTrigger value="training" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Training
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Progress Tracking
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assessment">
          <SkillsAssessment 
            occupationId={occupationId}
            userId={userId}
          />
        </TabsContent>

        <TabsContent value="training">
          <TrainingRecommendations 
            occupationId={occupationId}
            userId={userId}
          />
        </TabsContent>

        <TabsContent value="progress">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Skills Progress Tracking</h3>
            <p className="text-gray-600">
              Track your progress in developing the skills needed for this occupation.
              This feature is coming soon!
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default SkillsTab;
