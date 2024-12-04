import React from 'react';
import { DataCard } from '../shared/DataCard';
import { Badge, BadgeVariant } from '../shared/Badge';
import { ProgressBar } from '../shared/ProgressBar';

interface Certification {
  id: string;
  name: string;
  provider: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'pending';
  progress?: number;
  requirements: string[];
}

interface CertificationTrackerProps {
  certifications: Certification[];
  onUpdateProgress: (certId: string, progress: number) => void;
}

export const CertificationTracker: React.FC<CertificationTrackerProps> = ({
  certifications,
  onUpdateProgress
}) => {
  const getStatusColor = (status: Certification['status']): BadgeVariant => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expired':
        return 'danger';
      case 'pending':
        return 'warning';
      default:
        return 'primary';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <DataCard title="Certification Tracker">
      <div className="space-y-6">
        {certifications.map(cert => (
          <div
            key={cert.id}
            className="border-b last:border-b-0 pb-6 last:pb-0"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-medium">{cert.name}</h4>
                <p className="text-sm text-gray-500">{cert.provider}</p>
              </div>
              <Badge
                text={cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                variant={getStatusColor(cert.status)}
              />
            </div>

            {cert.status === 'active' && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">
                  Expires: {formatDate(cert.expiryDate)}
                </p>
              </div>
            )}

            {cert.status === 'pending' && cert.progress !== undefined && (
              <div className="mb-4">
                <h5 className="text-sm font-medium mb-2">Progress</h5>
                <ProgressBar
                  value={cert.progress}
                  max={100}
                  color="blue"
                  label="Completion Progress"
                />
              </div>
            )}

            <div>
              <h5 className="text-sm font-medium mb-2">Requirements</h5>
              <div className="flex flex-wrap gap-2">
                {cert.requirements.map((req, index) => (
                  <Badge
                    key={index}
                    text={req}
                    variant="secondary"
                  />
                ))}
              </div>
            </div>

            {cert.status === 'pending' && (
              <div className="mt-4">
                <button
                  onClick={() => onUpdateProgress(cert.id, (cert.progress || 0) + 10)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                  disabled={(cert.progress || 0) >= 100}
                >
                  Update Progress
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </DataCard>
  );
};
