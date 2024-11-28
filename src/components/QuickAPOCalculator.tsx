import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const QuickAPOCalculator: React.FC = () => {
  const [occupation, setOccupation] = useState('');
  const [apo, setApo] = useState<number | null>(null);

  const calculateAPO = () => {
    // Implement quick APO calculation logic here
    // This is a placeholder implementation
    setApo(Math.floor(Math.random() * 100));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick APO Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-4">
          <Input
            type="text"
            placeholder="Enter occupation"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
          />
          <Button onClick={calculateAPO}>Calculate</Button>
        </div>
        {apo !== null && (
          <p>Estimated APO for {occupation}: {apo}%</p>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickAPOCalculator;
