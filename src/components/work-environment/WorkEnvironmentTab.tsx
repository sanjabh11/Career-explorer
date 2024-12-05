import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { WorkEnvironmentData } from './types';
import { workEnvironmentService } from '@/services/workEnvironmentService';

export const WorkEnvironmentTab: React.FC<{ occupationId: string }> = ({ occupationId }) => {
  const [data, setData] = useState<WorkEnvironmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const environmentData = await workEnvironmentService.getWorkEnvironmentData(occupationId);
        setData(environmentData);
      } catch (err) {
        setError('Failed to load work environment data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [occupationId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Work Conditions */}
      <Card>
        <CardHeader>
          <CardTitle>Working Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.conditions.map((condition, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h3 className="font-semibold">{condition.type}</h3>
                <p className="text-sm text-gray-600">{condition.description}</p>
                <div className="mt-2 flex gap-2">
                  <Badge variant="secondary">Level {condition.level}</Badge>
                  <Badge variant="outline">{condition.frequency}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Safety Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Safety Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.safety.map((requirement) => (
              <div key={requirement.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{requirement.name}</h3>
                  <Badge variant={
                    requirement.priority === 'high' ? 'destructive' :
                    requirement.priority === 'medium' ? 'secondary' : 'outline'
                  }>{requirement.priority}</Badge>
                </div>
                <p className="text-sm text-gray-600 mt-2">{requirement.description}</p>
                <div className="mt-4">
                  <h4 className="text-sm font-semibold">Required Equipment:</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {requirement.equipment.map((item, i) => (
                      <Badge key={i} variant="outline">{item}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Schedule Flexibility */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule & Flexibility</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Work Hours</h3>
              <p className="text-sm text-gray-600">{data.schedule.workHours.description}</p>
              <Badge className="mt-2">{data.schedule.workHours.type}</Badge>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Remote Work</h3>
              <p className="text-sm text-gray-600">
                {data.schedule.remoteWork.available
                  ? `${data.schedule.remoteWork.type} (${data.schedule.remoteWork.percentage}% remote)`
                  : 'Remote work not available'}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Flexibility Levels</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Schedule Flexibility:</span>
                  <Badge variant="outline">{data.schedule.flexibility.schedule}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Location Flexibility:</span>
                  <Badge variant="outline">{data.schedule.flexibility.location}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Time Off Flexibility:</span>
                  <Badge variant="outline">{data.schedule.flexibility.timeOff}</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
