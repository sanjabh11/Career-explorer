import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';
import APORadarChart from '../APOCharts/APORadarChart';
import APOStackedBarChart from '../APOCharts/APOStackedBarChart';
import TaskDistributionPieChart from '../TaskComponents/TaskDistributionPieChart';
import { APOData, CategoryData } from '@/types/apo';

type ChartType = 'radar' | 'bar' | 'pie';
type TimeRange = '1M' | '3M' | '6M' | '1Y' | 'ALL';

interface APOVisualizationProps {
  data: APOData;
  className?: string;
  chartType?: ChartType;
  onChartTypeChange?: (type: ChartType) => void;
}

const APOVisualization: React.FC<APOVisualizationProps> = ({ 
  data, 
  className,
  chartType: externalChartType,
  onChartTypeChange 
}) => {
  const [internalChartType, setInternalChartType] = useState<ChartType>('radar');
  const [timeRange, setTimeRange] = useState<TimeRange>('1Y');
  const [sortBy, setSortBy] = useState<'value' | 'name'>('value');

  // Use external chart type if provided, otherwise use internal state
  const chartType = externalChartType || internalChartType;

  const handleChartTypeChange = (type: ChartType) => {
    if (onChartTypeChange) {
      onChartTypeChange(type);
    } else {
      setInternalChartType(type);
    }
  };

  const handleExport = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'apo_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: 'APO Analysis',
        text: 'Check out this APO analysis',
        url: window.location.href,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const processedData = useMemo(() => {
    if (!data.categories || data.categories.length === 0) {
      return {
        radar: [],
        bar: [],
        pie: [],
      };
    }

    const sortedCategories = [...data.categories].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return b.value - a.value;
    });

    return {
      radar: sortedCategories.map(cat => ({
        category: cat.name,
        apo: cat.value,
      })),
      bar: sortedCategories.map(cat => ({
        name: cat.name,
        apo: cat.value,
      })),
      pie: sortedCategories.map(cat => ({
        name: cat.name,
        value: cat.value,
      })),
    };
  }, [data.categories, sortBy]);

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>Automation Potential Overview</CardTitle>
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {!externalChartType && (
                <Select value={chartType} onValueChange={handleChartTypeChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select chart type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="radar">Radar Chart</SelectItem>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="pie">Pie Chart</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1M">1 Month</SelectItem>
                  <SelectItem value="3M">3 Months</SelectItem>
                  <SelectItem value="6M">6 Months</SelectItem>
                  <SelectItem value="1Y">1 Year</SelectItem>
                  <SelectItem value="ALL">All Time</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: 'value' | 'name') => setSortBy(value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="value">Value</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handleExport}>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {chartType === 'radar' && (
            <APORadarChart data={processedData.radar} />
          )}
          {chartType === 'bar' && (
            <APOStackedBarChart data={processedData.bar} />
          )}
          {chartType === 'pie' && (
            <TaskDistributionPieChart data={processedData.pie} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default APOVisualization;
