'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { PencilIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button, Badge, Card, Title, Text, Divider } from '@tremor/react';
import { useIncident, useDeleteIncident } from '../../hooks/useIncidents';
import { Incident, IncidentStatus, IncidentPriority, IncidentImpact } from '../../types/incident.types';

const statusColors = {
  [IncidentStatus.OPEN]: 'blue',
  [IncidentStatus.IN_PROGRESS]: 'yellow',
  [IncidentStatus.ON_HOLD]: 'orange',
  [IncidentStatus.RESOLVED]: 'green',
  [IncidentStatus.CLOSED]: 'gray',
  [IncidentStatus.CANCELLED]: 'red',
};

const priorityColors = {
  [IncidentPriority.LOW]: 'gray',
  [IncidentPriority.MEDIUM]: 'blue',
  [IncidentPriority.HIGH]: 'yellow',
  [IncidentPriority.CRITICAL]: 'red',
};

const impactColors = {
  [IncidentImpact.LOW]: 'gray',
  [IncidentImpact.MEDIUM]: 'yellow',
  [IncidentImpact.HIGH]: 'orange',
  [IncidentImpact.CRITICAL]: 'red',
};

export function IncidentDetail({ incidentId }: { incidentId: string }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const { data: incident, isLoading, error } = useIncident(incidentId) as { 
    data: Incident | undefined; 
    isLoading: boolean; 
    error: Error | null;
  };
  const deleteMutation = useDeleteIncident();

  if (isLoading) return <div>Loading...</div>;
  if (!incident) return <div>Incident not found</div>;

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this incident?')) {
      await deleteMutation.mutateAsync(incidentId);
      router.push('/incidents');
    }
  };

  if (isEditing) {
    return (
      <div className="max-w-4xl mx-auto">
        <button onClick={() => setIsEditing(false)} className="mb-4 flex items-center text-sm text-blue-600">
          <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to incident
        </button>
        {/* TODO: Add edit form */}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <button onClick={() => router.back()} className="flex items-center text-sm text-blue-600">
          <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to incidents
        </button>
        <div className="flex space-x-2">
          <Button icon={PencilIcon} onClick={() => setIsEditing(true)}>Edit</Button>
          <Button color="red" icon={TrashIcon} onClick={handleDelete}>Delete</Button>
        </div>
      </div>

      <Card>
        <div className="flex justify-between items-start">
          <div>
            <Title>{incident.title}</Title>
            <Text className="text-gray-500">
              #{incident.id.split('-')[0]} • {format(new Date(incident.createdAt), 'MMM d, yyyy')}
            </Text>
          </div>
          <Badge color={statusColors[incident.status]} size="lg">
            {incident.status}
          </Badge>
        </div>

        <Divider />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Text className="text-sm text-gray-500">Priority</Text>
            <Badge color={priorityColors[incident.priority]} size="lg" className="mt-1">
              {incident.priority}
            </Badge>
          </div>
          
          <div>
            <Text className="text-sm text-gray-500">Impact</Text>
            <Badge color={impactColors[incident.impact]} size="lg" className="mt-1">
              {incident.impact}
            </Badge>
          </div>
          
          <div>
            <Text className="text-sm text-gray-500">Reported By</Text>
            <Text className="mt-1">
              {incident.reportedBy.firstName} {incident.reportedBy.lastName}
            </Text>
          </div>
        </div>

        <Divider />

        <div>
          <Title className="text-lg mb-2">Description</Title>
          <Text className="whitespace-pre-line">{incident.description}</Text>
        </div>
      </Card>
    </div>
  );
}
