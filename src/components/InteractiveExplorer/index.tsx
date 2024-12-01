import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { AutomationFactor } from '@/types/automation';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface InteractiveExplorerProps {
  factors: AutomationFactor[];
  onFactorUpdate: (factors: AutomationFactor[]) => void;
}

export const InteractiveExplorer: React.FC<InteractiveExplorerProps> = ({
  factors,
  onFactorUpdate,
}) => {
  const [adjustedFactors, setAdjustedFactors] = useState(factors);
  const [selectedFactor, setSelectedFactor] = useState<string | null>(null);

  const handleFactorChange = (factorId: string, field: keyof AutomationFactor, value: number) => {
    const updatedFactors = adjustedFactors.map(factor => {
      if (factor.id === factorId) {
        return {
          ...factor,
          [field]: value,
        };
      }
      return factor;
    });
    setAdjustedFactors(updatedFactors);
  };

  const handleApplyChanges = () => {
    onFactorUpdate(adjustedFactors);
  };

  const handleReset = () => {
    setAdjustedFactors(factors);
    setSelectedFactor(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Interactive Factor Explorer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={adjustedFactors}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="weight"
                    fill="#8884d8"
                    onClick={(data: any) => data?.id && setSelectedFactor(data.id)}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex space-x-4">
              <Button onClick={handleApplyChanges}>Apply Changes</Button>
              <Button variant="outline" onClick={handleReset}>Reset</Button>
            </div>
          </div>

          <div className="space-y-6">
            {selectedFactor && (
              <div className="space-y-4">
                <h3 className="font-medium">
                  Adjust {adjustedFactors.find(f => f.id === selectedFactor)?.name}
                </h3>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Impact Weight</label>
                    <Slider
                      value={[adjustedFactors.find(f => f.id === selectedFactor)?.weight || 0]}
                      onValueChange={([value]) => 
                        handleFactorChange(selectedFactor, 'weight', value)
                      }
                      max={1}
                      step={0.1}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">AI Impact</label>
                    <Slider
                      value={[adjustedFactors.find(f => f.id === selectedFactor)?.emergingTechImpact || 0]}
                      onValueChange={([value]) =>
                        handleFactorChange(selectedFactor, 'emergingTechImpact', value)
                      }
                      max={1}
                      step={0.1}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Human-AI Collaboration</label>
                    <Slider
                      value={[adjustedFactors.find(f => f.id === selectedFactor)?.humanAICollaboration || 0]}
                      onValueChange={([value]) =>
                        handleFactorChange(selectedFactor, 'humanAICollaboration', value)
                      }
                      max={1}
                      step={0.1}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Complexity</label>
                    <Slider
                      value={[adjustedFactors.find(f => f.id === selectedFactor)?.complexity || 0]}
                      onValueChange={([value]) =>
                        handleFactorChange(selectedFactor, 'complexity', value)
                      }
                      max={5}
                      step={1}
                    />
                  </div>
                </div>
              </div>
            )}
            {!selectedFactor && (
              <div className="flex items-center justify-center h-full text-gray-500">
                Click on a factor in the chart to adjust its values
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
