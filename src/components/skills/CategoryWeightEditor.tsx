import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CategoryWeight } from '@/types/skills';
import { defaultCategoryWeights, validateWeights, adjustWeightsByIndustry } from '@/utils/categoryWeights';
import styles from '@/styles/CategoryWeightEditor.module.css';

interface CategoryWeightEditorProps {
  initialWeights?: CategoryWeight;
  industry?: string;
  onChange?: (weights: CategoryWeight) => void;
}

const CategoryWeightEditor: React.FC<CategoryWeightEditorProps> = ({
  initialWeights = defaultCategoryWeights,
  industry,
  onChange
}) => {
  const [weights, setWeights] = useState<CategoryWeight>(initialWeights);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (industry) {
      const adjustedWeights = adjustWeightsByIndustry(weights, industry);
      setWeights(adjustedWeights);
      onChange?.(adjustedWeights);
    }
  }, [industry]);

  const handleWeightChange = (category: keyof CategoryWeight, value: number) => {
    const newWeights = { ...weights, [category]: value };
    
    if (!validateWeights(newWeights)) {
      setError('Weights must sum to 100%');
      return;
    }

    setError('');
    setWeights(newWeights);
    onChange?.(newWeights);
  };

  const resetWeights = () => {
    const baseWeights = industry 
      ? adjustWeightsByIndustry(defaultCategoryWeights, industry)
      : defaultCategoryWeights;
    
    setWeights(baseWeights);
    setError('');
    onChange?.(baseWeights);
  };

  return (
    <Card className={styles.container}>
      <div className={styles.header}>
        <h3 className="text-lg font-semibold">Category Weights</h3>
        <Button variant="outline" size="sm" onClick={resetWeights}>
          Reset
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className={styles.alert}>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className={styles.categories}>
        {(Object.entries(weights) as [keyof CategoryWeight, number][]).map(([category, weight]) => (
          <div key={category} className={styles.category}>
            <div className={styles.categoryHeader}>
              <span className={styles.categoryName}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </span>
              <span className={styles.weightValue}>
                {(weight * 100).toFixed(0)}%
              </span>
            </div>
            <Slider
              value={[weight * 100]}
              min={0}
              max={100}
              step={5}
              onValueChange={(values: number[]) => handleWeightChange(category, values[0] / 100)}
              className={styles.slider}
              aria-label={`${category} weight`}
            />
          </div>
        ))}
      </div>

      <div className={styles.summary}>
        <div className={styles.total}>
          <span>Total</span>
          <span className={error ? 'text-destructive' : ''}>
            {(Object.values(weights).reduce((sum, w) => sum + w, 0) * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </Card>
  );
};

export default CategoryWeightEditor;
