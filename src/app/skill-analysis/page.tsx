import React from 'react';
import SkillRelationshipGraph from '@/components/skills/SkillRelationshipGraph';
import CategoryWeightEditor from '@/components/skills/CategoryWeightEditor';
import SkillTransferabilityMatrix from '@/components/skills/SkillTransferabilityMatrix';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Sample data - In production, this would come from your API
const sampleSkillRelationships = [
  {
    primarySkill: "JavaScript",
    relatedSkills: [
      { skill: "TypeScript", impact: 0.8 },
      { skill: "React", impact: 0.7 },
      { skill: "Node.js", impact: 0.6 },
      { skill: "HTML/CSS", impact: 0.5 }
    ]
  },
  {
    primarySkill: "Data Analysis",
    relatedSkills: [
      { skill: "Python", impact: 0.9 },
      { skill: "SQL", impact: 0.8 },
      { skill: "Statistics", impact: 0.7 },
      { skill: "Machine Learning", impact: 0.6 }
    ]
  }
];

const sampleTransferability = [
  {
    sourceSkill: "JavaScript",
    targetOccupations: [
      {
        occupationId: "Frontend Developer",
        transferabilityScore: 0.9,
        requiredUpskilling: ["React", "UI/UX Design"]
      },
      {
        occupationId: "Full Stack Developer",
        transferabilityScore: 0.8,
        requiredUpskilling: ["Node.js", "Databases"]
      },
      {
        occupationId: "Mobile Developer",
        transferabilityScore: 0.6,
        requiredUpskilling: ["React Native", "Mobile UI Patterns"]
      }
    ]
  }
];

export default function SkillAnalysisPage() {
  const [selectedSkill, setSelectedSkill] = React.useState<string>("JavaScript");
  const [selectedIndustry, setSelectedIndustry] = React.useState<string>("Technology");

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Advanced Skill Analysis</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Skill Impact Overview</h2>
          <p className="text-muted-foreground mb-6">
            Analyze how different skills relate to each other and their impact on career paths.
          </p>
          <SkillRelationshipGraph
            relationships={sampleSkillRelationships}
            selectedSkill={selectedSkill}
            onSkillSelect={setSelectedSkill}
          />
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Category Weights</h2>
          <p className="text-muted-foreground mb-6">
            Customize the importance of different factors based on industry standards.
          </p>
          <CategoryWeightEditor
            industry={selectedIndustry}
            onChange={(weights) => console.log('Weights updated:', weights)}
          />
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Skill Transferability</h2>
        <p className="text-muted-foreground mb-6">
          Explore how your skills can transfer to different roles and what additional skills you need.
        </p>
        <SkillTransferabilityMatrix
          transferability={sampleTransferability}
          selectedSkill={selectedSkill}
          onOccupationSelect={(occupationId) => console.log('Selected occupation:', occupationId)}
        />
      </Card>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Analysis Insights</h2>
        <Tabs defaultValue="impact">
          <TabsList>
            <TabsTrigger value="impact">Skill Impact</TabsTrigger>
            <TabsTrigger value="trends">Industry Trends</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="impact">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Key Insights</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-2">
                  <span className="font-medium">High Impact Skills:</span>
                  <span>TypeScript and React show strong relationships with core JavaScript skills</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium">Skill Clusters:</span>
                  <span>Frontend development skills form a tight cluster with high transferability</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium">Growth Areas:</span>
                  <span>Full-stack development shows highest potential for skill application</span>
                </li>
              </ul>
            </Card>
          </TabsContent>

          <TabsContent value="trends">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Industry Trends</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-2">
                  <span className="font-medium">Emerging Technologies:</span>
                  <span>AI/ML integration becoming crucial across all development roles</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium">Market Demand:</span>
                  <span>Full-stack and cloud skills showing increased demand</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium">Future Outlook:</span>
                  <span>Cross-functional skills becoming more valuable</span>
                </li>
              </ul>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Personalized Recommendations</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-2">
                  <span className="font-medium">Skill Development:</span>
                  <span>Focus on TypeScript and React for immediate impact</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium">Career Path:</span>
                  <span>Consider transitioning to Full Stack Development</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium">Learning Path:</span>
                  <span>Start with Node.js fundamentals for backend development</span>
                </li>
              </ul>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
