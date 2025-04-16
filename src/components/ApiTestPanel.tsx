import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchAutomationTrends } from '@/services/SerpApiService';
import { analyzeTaskAutomationPotential } from '@/services/JinaApiService';
import { crawlAutomationResearch } from '@/services/FireCrawlService';

interface ApiTestPanelProps {
  occupation: string;
}

const ApiTestPanel: React.FC<ApiTestPanelProps> = ({ occupation }) => {
  const [serpResult, setSerpResult] = useState<any>(null);
  const [jinaResult, setJinaResult] = useState<any>(null);
  const [fireCrawlResult, setFireCrawlResult] = useState<any>(null);
  const [loading, setLoading] = useState<{
    serp: boolean;
    jina: boolean;
    fireCrawl: boolean;
  }>({
    serp: false,
    jina: false,
    fireCrawl: false
  });
  const [error, setError] = useState<{
    serp: string | null;
    jina: string | null;
    fireCrawl: string | null;
  }>({
    serp: null,
    jina: null,
    fireCrawl: null
  });

  const testSerpApi = async () => {
    setLoading(prev => ({ ...prev, serp: true }));
    setError(prev => ({ ...prev, serp: null }));
    try {
      const result = await fetchAutomationTrends(occupation);
      setSerpResult(result);
    } catch (err) {
      setError(prev => ({ ...prev, serp: err instanceof Error ? err.message : 'Unknown error' }));
    } finally {
      setLoading(prev => ({ ...prev, serp: false }));
    }
  };

  const testJinaApi = async () => {
    setLoading(prev => ({ ...prev, jina: true }));
    setError(prev => ({ ...prev, jina: null }));
    try {
      const result = await analyzeTaskAutomationPotential([
        `Analyze ${occupation} data`,
        `Create reports for ${occupation}`,
        `Monitor ${occupation} systems`
      ]);
      setJinaResult(result);
    } catch (err) {
      setError(prev => ({ ...prev, jina: err instanceof Error ? err.message : 'Unknown error' }));
    } finally {
      setLoading(prev => ({ ...prev, jina: false }));
    }
  };

  const testFireCrawlApi = async () => {
    setLoading(prev => ({ ...prev, fireCrawl: true }));
    setError(prev => ({ ...prev, fireCrawl: null }));
    try {
      const result = await crawlAutomationResearch(occupation);
      setFireCrawlResult(result);
    } catch (err) {
      setError(prev => ({ ...prev, fireCrawl: err instanceof Error ? err.message : 'Unknown error' }));
    } finally {
      setLoading(prev => ({ ...prev, fireCrawl: false }));
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>API Integration Test Panel</CardTitle>
        <CardDescription>Test the integration of external APIs for dynamic APO calculations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">SERP API</h3>
            <Button 
              onClick={testSerpApi} 
              disabled={loading.serp}
              variant="outline"
            >
              {loading.serp ? 'Testing...' : 'Test SERP API'}
            </Button>
          </div>
          {error.serp && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              Error: {error.serp}
            </div>
          )}
          {serpResult && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Results</h4>
                <Badge variant="outline">{serpResult.trends.length} trends found</Badge>
              </div>
              <div className="max-h-40 overflow-y-auto text-sm">
                {serpResult.trends.slice(0, 3).map((trend: any, index: number) => (
                  <div key={index} className="mb-2 p-2 bg-white rounded border border-slate-100">
                    <div className="font-medium">{trend.title}</div>
                    <div className="text-xs text-slate-500">{trend.source} • {trend.year}</div>
                    {trend.automationPercentage && (
                      <Badge className="mt-1">{trend.automationPercentage}%</Badge>
                    )}
                  </div>
                ))}
                {serpResult.trends.length > 3 && (
                  <div className="text-xs text-center text-slate-500 mt-2">
                    + {serpResult.trends.length - 3} more results
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">JINA API</h3>
            <Button 
              onClick={testJinaApi} 
              disabled={loading.jina}
              variant="outline"
            >
              {loading.jina ? 'Testing...' : 'Test JINA API'}
            </Button>
          </div>
          {error.jina && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              Error: {error.jina}
            </div>
          )}
          {jinaResult && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Results</h4>
                <Badge variant="outline">{jinaResult.results?.length || 0} tasks analyzed</Badge>
              </div>
              <div className="max-h-40 overflow-y-auto text-sm">
                {jinaResult.results?.map((result: any, index: number) => (
                  <div key={index} className="mb-2 p-2 bg-white rounded border border-slate-100">
                    <div className="font-medium">{result.task}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={result.automationPotential > 0.6 ? 'default' : 'secondary'}>
                        {(result.automationPotential * 100).toFixed(1)}%
                      </Badge>
                      <span className="text-xs text-slate-500">
                        Confidence: {(result.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">FireCrawl API</h3>
            <Button 
              onClick={testFireCrawlApi} 
              disabled={loading.fireCrawl}
              variant="outline"
            >
              {loading.fireCrawl ? 'Testing...' : 'Test FireCrawl API'}
            </Button>
          </div>
          {error.fireCrawl && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              Error: {error.fireCrawl}
            </div>
          )}
          {fireCrawlResult && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Results</h4>
                <Badge variant="outline">
                  {fireCrawlResult.researchData?.length || 0} sources found
                </Badge>
              </div>
              {fireCrawlResult.error && (
                <div className="mb-2 p-2 bg-yellow-50 rounded border border-yellow-100 text-yellow-700 text-xs">
                  Note: {fireCrawlResult.error}
                </div>
              )}
              <div className="max-h-40 overflow-y-auto text-sm">
                {fireCrawlResult.researchData?.slice(0, 3).map((data: any, index: number) => (
                  <div key={index} className="mb-2 p-2 bg-white rounded border border-slate-100">
                    <div className="font-medium">{data.title}</div>
                    <div className="text-xs text-slate-500">{data.source} • {new Date(data.date).getFullYear()}</div>
                    {data.automationMentions?.length > 0 && (
                      <div className="mt-1 text-xs">
                        {data.automationMentions[0].automationPercentage && (
                          <Badge>{data.automationMentions[0].automationPercentage}%</Badge>
                        )}
                        <Badge variant="outline" className="ml-1">
                          {data.automationMentions[0].sentiment || 'neutral'}
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
                {fireCrawlResult.researchData?.length > 3 && (
                  <div className="text-xs text-center text-slate-500 mt-2">
                    + {fireCrawlResult.researchData.length - 3} more results
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-xs text-slate-500">
          API status: 
          <Badge variant={error.serp ? 'outline' : 'secondary'} className="ml-1">SERP</Badge>
          <Badge variant={error.jina ? 'outline' : 'secondary'} className="ml-1">JINA</Badge>
          <Badge variant={error.fireCrawl ? 'outline' : 'secondary'} className="ml-1">FireCrawl</Badge>
        </div>
        <Button variant="outline" onClick={() => {
          setSerpResult(null);
          setJinaResult(null);
          setFireCrawlResult(null);
          setError({ serp: null, jina: null, fireCrawl: null });
        }}>
          Clear Results
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ApiTestPanel;
