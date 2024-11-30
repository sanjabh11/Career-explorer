import React, { useState, useEffect, useCallback } from 'react';
import APOTrendAnalysis from './APOTrendAnalysis';
import APOAdvancedVisuals from './APOAdvancedVisuals';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, SlidersHorizontal } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { industries, fetchIndustryAPOData, type APOTrendData, type IndustryName } from '@/services/APOService';
import { Button } from '@/components/ui/button';
import { Download, ZoomIn, ZoomOut, RefreshCw, Share2 } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface APOVisualizationProps {
  className?: string;
}

const APOVisualization: React.FC<APOVisualizationProps> = ({ className }) => {
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryName>(industries[0].name);
  const [trendData, setTrendData] = useState<APOTrendData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(5);
  const [smoothing, setSmoothing] = useState(0.5);
  const [showProjections, setShowProjections] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');
  const [showSettings, setShowSettings] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchIndustryAPOData(selectedIndustry);
      
      // Apply smoothing if enabled
      const smoothedData = data.map((item, index, array) => {
        if (index === 0 || index === array.length - 1) return item;
        const prevAPO = array[index - 1].apo;
        const nextAPO = array[index + 1].apo;
        const smoothedAPO = (prevAPO + item.apo + nextAPO) / 3 * smoothing + item.apo * (1 - smoothing);
        return { ...item, apo: Number(smoothedAPO.toFixed(2)) };
      });

      // Add projections if enabled
      if (showProjections) {
        const lastYear = data[data.length - 1].year;
        const projectedYears = [1, 2];
        const projectedData = projectedYears.map(year => {
          const projectedYear = lastYear + year;
          const trend = (data[data.length - 1].apo - data[0].apo) / (data.length - 1);
          const projectedAPO = data[data.length - 1].apo + trend * year;
          return {
            ...data[data.length - 1],
            year: projectedYear,
            apo: Number(projectedAPO.toFixed(2)),
            isProjected: true
          };
        });
        setTrendData([...smoothedData, ...projectedData]);
      } else {
        setTrendData(smoothedData);
      }
    } catch (err) {
      setError('Failed to fetch APO data. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedIndustry, smoothing, showProjections]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoRefresh) {
      interval = setInterval(fetchData, refreshInterval * 60 * 1000);
    }
    return () => clearInterval(interval);
  }, [isAutoRefresh, refreshInterval, fetchData]);

  const handleShare = async () => {
    try {
      await navigator.share({
        title: 'APO Trends',
        text: `Check out the APO trends for ${selectedIndustry}`,
        url: window.location.href
      });
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleDownload = () => {
    const jsonString = JSON.stringify(trendData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apo_data_${selectedIndustry.toLowerCase().replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <div className="h-[500px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex justify-between items-center">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 2))}
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.5))}
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            title="Download Data"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant={isAutoRefresh ? "secondary" : "outline"}
            size="sm"
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            title={isAutoRefresh ? "Auto-refresh enabled" : "Auto-refresh disabled"}
          >
            <RefreshCw className={`h-4 w-4 ${isAutoRefresh ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            title="Share"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(true)}
            title="Settings"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Chart Settings"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <h4 className="font-medium">Chart Type</h4>
            <Select
              value={chartType}
              onValueChange={(value: 'line' | 'area' | 'bar') => setChartType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select chart type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Line Chart</SelectItem>
                <SelectItem value="area">Area Chart</SelectItem>
                <SelectItem value="bar">Bar Chart</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Refresh Interval (minutes)</h4>
            <Select
              value={refreshInterval.toString()}
              onValueChange={(value) => setRefreshInterval(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 minute</SelectItem>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Data Smoothing</h4>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={smoothing}
                onChange={(e) => setSmoothing(Number(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-gray-500">{smoothing.toFixed(1)}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="projections"
              checked={showProjections}
              onChange={(e) => setShowProjections(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="projections" className="text-sm font-medium">
              Show Projections
            </label>
          </div>
        </div>
      </Modal>

      <Tabs defaultValue="trends" className="w-full">
        <TabsList>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="trends">
          <APOTrendAnalysis
            data={trendData}
            industries={industries.map(i => i.name)}
            selectedIndustry={selectedIndustry}
            onIndustryChange={setSelectedIndustry}
            zoomLevel={zoomLevel}
            chartType={chartType}
          />
        </TabsContent>
        <TabsContent value="advanced">
          <APOAdvancedVisuals
            data={trendData}
            selectedIndustry={selectedIndustry}
          />
        </TabsContent>
      </Tabs>

      {trendData.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">Top Impacted Skills</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trendData[trendData.length - 1].skillChanges.map((skill, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span>{skill.skill}</span>
                  <span className="font-medium text-blue-600">
                    {skill.impact.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default APOVisualization;
