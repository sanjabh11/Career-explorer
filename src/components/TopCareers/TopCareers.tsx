import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Info } from 'lucide-react';
import styles from '@/styles/TopCareers.module.css';
import TopCareersBubbleChart from './TopCareersBubbleChart';

interface TopCareer {
  title: string;
  apo: number;
  code: string;
  similarity?: number;
}

interface TopCareersProps {
  careers: TopCareer[];
  onSelect: (occupation: { code: string; title: string }) => void;
}

const TopCareers: React.FC<TopCareersProps> = ({ careers, onSelect }) => {
  const bubbleData = careers.map((career) => ({
    name: career.title,
    similarity: career.similarity || 0,
    apo: career.apo,
  }));

  return (
    <Card className={styles.topCareersCard}>
      <CardHeader>
        <CardTitle>Top Careers</CardTitle>
      </CardHeader>
      <CardContent>
        <TopCareersBubbleChart data={bubbleData} />
        <ul className={styles.careerList}>
          {careers.map((career, index) => (
            <li key={index} className={styles.careerItem}>
              <span>{career.title}</span>
              <div className={styles.careerDetails}>
                <Progress value={career.apo} className={styles.careerProgress} />
                <span className={styles.apoValue}>{career.apo}% APO</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onSelect({ code: career.code, title: career.title })}
                  className={styles.infoButton}
                >
                  <Info className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default TopCareers;