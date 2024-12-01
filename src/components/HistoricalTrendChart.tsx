import React from 'react';
import { ResponsiveLine } from '@nivo/line';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AutomationTrend } from '@/types/automationTrends';

interface HistoricalTrendChartProps {
  data: AutomationTrend[];
  predictedTrend?: {
    date: Date;
    apoScore: number;
  }[];
}

const HistoricalTrendChart: React.FC<HistoricalTrendChartProps> = ({ data, predictedTrend }) => {
  const formatData = () => {
    const historical = data.map(d => ({
      x: d.date.toISOString().split('T')[0],
      y: d.apoScore,
      type: 'historical'
    }));

    const predicted = predictedTrend?.map(d => ({
      x: d.date.toISOString().split('T')[0],
      y: d.apoScore,
      type: 'predicted'
    })) || [];

    return [
      {
        id: 'Historical APO',
        data: historical
      },
      {
        id: 'Predicted APO',
        data: predicted
      }
    ];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historical Automation Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: '400px' }}>
          <ResponsiveLine
            data={formatData()}
            margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
            xScale={{
              type: 'time',
              format: '%Y-%m-%d',
              useUTC: false,
              precision: 'day'
            }}
            yScale={{
              type: 'linear',
              min: 0,
              max: 100,
              stacked: false
            }}
            axisLeft={{
              legend: 'APO Score (%)',
              legendOffset: -40
            }}
            axisBottom={{
              format: '%b %d, %Y',
              tickRotation: -45,
              legend: 'Date',
              legendOffset: 36
            }}
            pointSize={8}
            pointColor={{ theme: 'background' }}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            enablePointLabel={true}
            pointLabel="y"
            pointLabelYOffset={-12}
            useMesh={true}
            legends={[
              {
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 100,
                translateY: 0,
                itemsSpacing: 0,
                itemDirection: 'left-to-right',
                itemWidth: 80,
                itemHeight: 20,
                symbolSize: 12,
                symbolShape: 'circle'
              }
            ]}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default HistoricalTrendChart;
