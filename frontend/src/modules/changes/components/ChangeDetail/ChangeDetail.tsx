'use client';

import { useRouter } from 'next/navigation';
import { Card, Title, Text, Badge, Button, Grid } from '@tremor/react';
import { useChange } from '../../hooks/useChanges';
import { format } from 'date-fns';
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline';
import { ChangeStatusControls } from '../ChangeStatusControls/ChangeStatusControls';
import { ChangeApprovalControls } from '../ChangeApprovalControls/ChangeApprovalControls';
import { ChangeRequest } from '../../types/change.types';

const statusColors: Record<string, string> = {
  draft: 'gray',
  submitted: 'blue',
  in_review: 'yellow',
  scheduled: 'purple',
  in_progress: 'blue',
  implemented: 'green',
  rejected: 'red',
  closed: 'green',
  failed: 'red',
  rolled_back: 'orange',
};

const priorityColors: Record<string, string> = {
  low: 'green',
  medium: 'yellow',
  high: 'orange',
  critical: 'red',
};

interface ChangeDetailProps {
  changeId: string;
}

export function ChangeDetail({ changeId }: ChangeDetailProps) {
  const router = useRouter();
  const { data: changeResponse, isLoading, isError } = useChange(changeId);

  if (isLoading) return <div>Loading...</div>;
  if (isError || !changeResponse) return <div>Change not found</div>;
  
  // Type assertion to ensure we have the correct type
  const change = changeResponse as unknown as ChangeRequest;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button 
          icon={ArrowLeftIcon} 
          variant="light" 
          onClick={() => router.back()}
        >
          Back
        </Button>
        <Title>Change: {change.title}</Title>
        <div className="ml-auto flex space-x-2">
          <Button 
            icon={PencilIcon} 
            variant="light"
            onClick={() => router.push(`/changes/${change.id}/edit`)}
          >
            Edit
          </Button>
        </div>
      </div>

      <Grid numItemsMd={3} className="gap-6">
        <Card>
          <ChangeStatusControls change={change} />
        </Card>

        <Card>
          <ChangeApprovalControls change={change} />
        </Card>

        <Card>
          <div className="space-y-2">
            <div>
              <Text>Priority</Text>
              <Badge 
                color={priorityColors[change.priority.toLowerCase()] as 'green' | 'yellow' | 'orange' | 'red'}
                className="capitalize mt-1"
              >
                {change.priority.toLowerCase()}
              </Badge>
            </div>
            <div>
              <Text>Type</Text>
              <Text className="capitalize">{change.type.toLowerCase()}</Text>
            </div>
          </div>
        </Card>
      </Grid>

      <Card>
        <Title className="mb-4">Details</Title>
        <div className="space-y-4">
          <div>
            <Text>Description</Text>
            <Text className="mt-1">{change.description}</Text>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Text>Planned Start</Text>
              <Text className="mt-1">{formatDate(change.scheduledStart)}</Text>
            </div>
            <div>
              <Text>Planned End</Text>
              <Text className="mt-1">{formatDate(change.scheduledEnd)}</Text>
            </div>
          </div>
          
          {change.actualStart && (
            <div>
              <Text>Actual Start</Text>
              <Text className="mt-1">{formatDate(change.actualStart)}</Text>
            </div>
          )}
          
          {change.actualEnd && (
            <div>
              <Text>Actual End</Text>
              <Text className="mt-1">{formatDate(change.actualEnd)}</Text>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <Title className="mb-4">Change Owner</Title>
        <Text>
          {change.changeOwner.firstName} {change.changeOwner.lastName}
        </Text>
        <Text className="text-gray-500">{change.changeOwner.email}</Text>
      </Card>
    </div>
  );
}
