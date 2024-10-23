import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FeaturedOccupations: React.FC = () => {
  const featuredOccupations = [
    { title: "Software Developer", apo: 65 },
    { title: "Data Scientist", apo: 72 },
    { title: "UX Designer", apo: 58 },
    { title: "Network Administrator", apo: 61 },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Featured Occupations</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {featuredOccupations.map((occupation, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{occupation.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>APO: {occupation.apo}%</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FeaturedOccupations;
