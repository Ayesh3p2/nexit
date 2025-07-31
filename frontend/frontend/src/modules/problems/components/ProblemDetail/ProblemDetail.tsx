import { useState } from 'react';
import { useRouter } from 'next/router';
import React from 'react';
import { format } from 'date-fns';
import { 
  PencilIcon, 
  TrashIcon, 
  ArrowLeftIcon,
  UserPlusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LinkIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { 
  Button, 
  Badge, 
  Card, 
  Title, 
  Text, 
  Divider,
  TabGroup,
  TabList,
  Tab,
  TabPanels,
  TabPanel
} from '@tremor/react';
import { Problem, ProblemStatus, ProblemPriority, ProblemImpact } from '../../types/problem.types';
import { useProblem, useDeleteProblem } from '../../hooks/useProblems';
import { CommentList } from '../CommentList';
import { CommentForm } from '../CommentForm';
import { ProblemTimeline } from '../ProblemTimeline';

const statusBadgeMap = {
  [ProblemStatus.IDENTIFIED]: 'blue',
  [ProblemStatus.IN_ANALYSIS]: 'yellow',
  [ProblemStatus.KNOWN_ERROR]: 'orange',
  [ProblemStatus.RESOLVED]: 'green',
  [ProblemStatus.CLOSED]: 'gray',
};

const priorityBadgeMap = {
  [ProblemPriority.LOW]: 'gray',
  [ProblemPriority.MEDIUM]: 'blue',
  [ProblemPriority.HIGH]: 'yellow',
  [ProblemPriority.CRITICAL]: 'red',
};

const impactBadgeMap = {
  [ProblemImpact.LOW]: 'gray',
  [ProblemImpact.MEDIUM]: 'yellow',
  [ProblemImpact.HIGH]: 'orange',
  [ProblemImpact.CRITICAL]: 'red',
};

interface ProblemDetailProps {
  problemId: string;
}

export function ProblemDetail({ problemId }: ProblemDetailProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const { data: problem, isLoading, isError } = useProblem(problemId);
  const deleteMutation = useDeleteProblem();

  if (isLoading) return <div>Loading problem details...</div>;
  if (isError || !problem) return <div>Error loading problem</div>;

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this problem?')) {
      await deleteMutation.mutateAsync(problemId);
      router.push('/problems');
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  if (isEditing) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setIsEditing(false)}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to problem
        </button>
        {/* TODO: Add edit form */}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <button
          onClick={() => router.back()}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to problems
        </button>
        
        <div className="flex space-x-2">
          <Button 
            variant="light" 
            icon={PencilIcon} 
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
          <Button 
            variant="light" 
            color="red" 
            icon={TrashIcon}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </div>

      <Card className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <Title>{problem.title}</Title>
            <Text className="text-gray-500">
              #{problem.id.split('-')[0]} • Created on {formatDate(problem.createdAt)}
              {problem.resolvedAt && ` • Resolved on ${formatDate(problem.resolvedAt)}`}
              {problem.closedAt && ` • Closed on ${formatDate(problem.closedAt)}`}
            </Text>
          </div>
          
          <Badge color={statusBadgeMap[problem.status]} size="lg">
            {problem.status.split('_').map(word => 
              word.charAt(0) + word.slice(1).toLowerCase()
            ).join(' ')}
          </Badge>
        </div>

        <Divider />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Text className="text-sm font-medium text-gray-500">Priority</Text>
            <Badge color={priorityBadgeMap[problem.priority]} size="lg" className="mt-1">
              {problem.priority.charAt(0) + problem.priority.slice(1).toLowerCase()}
            </Badge>
          </div>
          
          <div>
            <Text className="text-sm font-medium text-gray-500">Impact</Text>
            <Badge color={impactBadgeMap[problem.impact]} size="lg" className="mt-1">
              {problem.impact.charAt(0) + problem.impact.slice(1).toLowerCase()}
            </Badge>
          </div>
          
          <div>
            <Text className="text-sm font-medium text-gray-500">Reported By</Text>
            <div className="flex items-center mt-1">
              <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></div>
              <Text>
                {problem.reportedBy.firstName} {problem.reportedBy.lastName}
              </Text>
            </div>
          </div>
          
          <div>
            <Text className="text-sm font-medium text-gray-500">Assigned To</Text>
            {problem.assignedTo ? (
              <div className="flex items-center mt-1">
                <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></div>
                <Text>
                  {problem.assignedTo.firstName} {problem.assignedTo.lastName}
                </Text>
              </div>
            ) : (
              <Button 
                variant="light" 
                size="xs" 
                className="mt-1"
                icon={UserPlusIcon}
                onClick={() => {}}
              >
                Assign
              </Button>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <Title className="text-lg">Description</Title>
            <Text className="mt-2 whitespace-pre-line">{problem.description}</Text>
          </div>
          
          {problem.workaround && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <Title className="text-lg flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                Workaround
              </Title>
              <Text className="mt-2 whitespace-pre-line">{problem.workaround}</Text>
            </div>
          )}
          
          {problem.solution && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <Title className="text-lg flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                Solution
              </Title>
              <Text className="mt-2 whitespace-pre-line">{problem.solution}</Text>
            </div>
          )}
        </div>
      </Card>
      
      <Card>
        <TabGroup>
          <TabList>
            <Tab>Overview</Tab>
            <Tab>Timeline</Tab>
            <Tab>Comments</Tab>
            <Tab>Related Incidents</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <div className="mt-6 space-y-6">
                <div>
                  <Title className="text-lg mb-2">Status</Title>
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="h-5 w-5 text-gray-400" />
                    <Text>Created on {format(new Date(problem.createdAt), 'MMM d, yyyy h:mm a')}</Text>
                    {problem.resolvedAt && (
                      <>
                        <span className="text-gray-300">•</span>
                        <Text>Resolved on {format(new Date(problem.resolvedAt), 'MMM d, yyyy h:mm a')}</Text>
                      </>
                    )}
                    {problem.closedAt && (
                      <>
                        <span className="text-gray-300">•</span>
                        <Text>Closed on {format(new Date(problem.closedAt), 'MMM d, yyyy h:mm a')}</Text>
                      </>
                    )}
                  </div>
                </div>

                {problem.rootCause && (
                  <div>
                    <Title className="text-lg mb-2">Root Cause</Title>
                    <Text className="whitespace-pre-line">{problem.rootCause}</Text>
                  </div>
                )}

                {problem.workaround && (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <Title className="text-lg flex items-center mb-2">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                      Workaround
                    </Title>
                    <Text className="whitespace-pre-line">{problem.workaround}</Text>
                  </div>
                )}

                {problem.solution && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <Title className="text-lg flex items-center mb-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                      Solution
                    </Title>
                    <Text className="whitespace-pre-line">{problem.solution}</Text>
                  </div>
                )}
              </div>
            </TabPanel>
            
            <TabPanel>
              <div className="mt-6">
                <ProblemTimeline 
                  events={problem.events || []} 
                  className="max-h-[600px] overflow-y-auto" 
                />
              </div>
            </TabPanel>

            <TabPanel>
              <div className="mt-6">
                <CommentForm onSubmit={() => {}} isSubmitting={false} />
                <div className="mt-8">
                  <Title className="text-lg mb-4">All Comments</Title>
                  <CommentList 
                    comments={problem.comments || []} 
                    currentUserId={problem.reportedBy.id} 
                  />
                </div>
              </div>
            </TabPanel>
            
            <TabPanel>
              <div className="mt-6">
                {problem.relatedIncidents.length > 0 ? (
                  <div className="space-y-2">
                    {problem.relatedIncidents.map(incident => (
                      <div key={incident.id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                        <LinkIcon className="h-4 w-4 text-blue-500 mr-2" />
                        <span className="text-blue-600 hover:underline">
                          #{incident.id.split('-')[0]}
                        </span>
                        <span className="mx-2 text-gray-400">•</span>
                        <span className="truncate">{incident.title}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No related incidents found</p>
                    <Button 
                      variant="light" 
                      icon={LinkIcon}
                      className="mt-4"
                      onClick={() => {}}
                    >
                      Link Incident
                    </Button>
                  </div>
                )}
              </div>
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </Card>
    </div>
  );
}
