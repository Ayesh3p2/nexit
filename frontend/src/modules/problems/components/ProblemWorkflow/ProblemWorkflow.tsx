import { useState } from 'react';
import { useRouter } from 'next/router';
import { 
  Dialog, 
  DialogPanel, 
  DialogTitle, 
  DialogDescription,
  Button,
  Select,
  SelectItem,
  Textarea,
  Toggle,
  ToggleItem,
  Badge,
  Flex,
  Text,
  Divider
} from '@tremor/react';
import { 
  CheckCircleIcon, 
  ArrowPathIcon, 
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useUpdateProblemStatus } from '../../hooks/useProblems';
import { Problem, ProblemStatus } from '../../types/problem.types';

type StatusTransition = {
  from: ProblemStatus;
  to: ProblemStatus[];
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  requiresComment: boolean;
};

const statusTransitions: StatusTransition[] = [
  {
    from: ProblemStatus.IDENTIFIED,
    to: [ProblemStatus.IN_ANALYSIS, ProblemStatus.KNOWN_ERROR, ProblemStatus.CLOSED],
    label: 'Analyze',
    description: 'Move to analysis to start investigating the root cause',
    icon: ArrowPathIcon,
    color: 'yellow',
    requiresComment: true,
  },
  {
    from: ProblemStatus.IN_ANALYSIS,
    to: [ProblemStatus.KNOWN_ERROR, ProblemStatus.CLOSED],
    label: 'Resolve',
    description: 'Mark as known error if root cause is identified',
    icon: CheckCircleIcon,
    color: 'green',
    requiresComment: true,
  },
  {
    from: ProblemStatus.KNOWN_ERROR,
    to: [ProblemStatus.RESOLVED, ProblemStatus.CLOSED],
    label: 'Resolve',
    description: 'Mark as resolved when a permanent fix is implemented',
    icon: CheckCircleIcon,
    color: 'green',
    requiresComment: true,
  },
  {
    from: ProblemStatus.RESOLVED,
    to: [ProblemStatus.CLOSED],
    label: 'Close',
    description: 'Close the problem after verification',
    icon: XCircleIcon,
    color: 'gray',
    requiresComment: false,
  },
];

const statusLabels: Record<ProblemStatus, string> = {
  [ProblemStatus.IDENTIFIED]: 'Identified',
  [ProblemStatus.IN_ANALYSIS]: 'In Analysis',
  [ProblemStatus.KNOWN_ERROR]: 'Known Error',
  [ProblemStatus.RESOLVED]: 'Resolved',
  [ProblemStatus.CLOSED]: 'Closed',
};

interface ProblemWorkflowProps {
  problem: Pick<Problem, 'id' | 'status'>;
  onStatusChange?: () => void;
}

export function ProblemWorkflow({ problem, onStatusChange }: ProblemWorkflowProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ProblemStatus>();
  const [comment, setComment] = useState('');
  const [isWorkaround, setIsWorkaround] = useState(false);
  
  const { mutateAsync: updateStatus, isLoading } = useUpdateProblemStatus(problem.id);
  
  const currentStatus = problem.status;
  const availableTransitions = statusTransitions.filter(t => t.from === currentStatus);
  const selectedTransition = availableTransitions.find(t => t.to.includes(selectedStatus as ProblemStatus));
  
  const handleStatusChange = async () => {
    if (!selectedStatus) return;
    
    try {
      await updateStatus({
        status: selectedStatus,
        comment: comment || undefined,
        isWorkaround
      });
      
      setIsOpen(false);
      setComment('');
      setSelectedStatus(undefined);
      setIsWorkaround(false);
      
      if (onStatusChange) {
        onStatusChange();
      }
      
      // Refresh the page data
      router.replace(router.asPath);
    } catch (error) {
      console.error('Failed to update problem status:', error);
    }
  };
  
  const getStatusColor = (status: ProblemStatus) => {
    switch (status) {
      case ProblemStatus.IDENTIFIED: return 'blue';
      case ProblemStatus.IN_ANALYSIS: return 'yellow';
      case ProblemStatus.KNOWN_ERROR: return 'orange';
      case ProblemStatus.RESOLVED: return 'green';
      case ProblemStatus.CLOSED: return 'gray';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Text className="font-medium">Status</Text>
          <div className="mt-1">
            <Badge 
              color={getStatusColor(currentStatus)} 
              size="lg"
              className="capitalize"
            >
              {statusLabels[currentStatus]}
            </Badge>
          </div>
        </div>
        
        {availableTransitions.length > 0 && (
          <Button 
            variant="light" 
            icon={ArrowPathIcon}
            onClick={() => setIsOpen(true)}
            disabled={isLoading}
          >
            Update Status
          </Button>
        )}
      </div>
      
      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        <DialogPanel>
          <DialogTitle>Update Problem Status</DialogTitle>
          <DialogDescription>
            Update the status of this problem and add any relevant comments.
          </DialogDescription>
          
          <div className="mt-4 space-y-4">
            <div className="flex items-center space-x-4">
              <Badge color={getStatusColor(currentStatus)} size="lg" className="capitalize">
                {statusLabels[currentStatus]}
              </Badge>
              
              <ArrowRightIcon className="h-5 w-5 text-gray-400" />
              
              <Select 
                value={selectedStatus} 
                onValueChange={(value) => setSelectedStatus(value as ProblemStatus)}
                placeholder="Select new status..."
                disabled={isLoading}
              >
                {availableTransitions.flatMap(transition => 
                  transition.to.map(status => (
                    <SelectItem key={status} value={status}>
                      {statusLabels[status as ProblemStatus]}
                    </SelectItem>
                  ))
                )}
              </Select>
            </div>
            
            {selectedStatus && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <Flex className="items-start space-x-3">
                  <div className={`p-1 rounded-full bg-${selectedTransition?.color}-100`}>
                    {selectedTransition?.icon && (
                      <selectedTransition.icon 
                        className={`h-5 w-5 text-${selectedTransition?.color}-600`} 
                        aria-hidden="true" 
                      />
                    )}
                  </div>
                  <div>
                    <Text className="font-medium">
                      {selectedTransition?.label}: {statusLabels[selectedStatus]}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {selectedTransition?.description}
                    </Text>
                  </div>
                </Flex>
                
                {(selectedTransition?.requiresComment || isWorkaround) && (
                  <div className="mt-4 space-y-3">
                    <Textarea
                      placeholder="Add a comment about this status change..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      disabled={isLoading}
                    />
                    
                    {selectedStatus === ProblemStatus.RESOLVED && (
                      <div className="flex items-center space-x-2">
                        <Toggle
                          color="yellow"
                          defaultValue={false}
                          onValueChange={setIsWorkaround}
                          disabled={isLoading}
                        >
                          <ToggleItem value={true} text="Workaround" />
                        </Toggle>
                        <Text className="text-sm text-gray-500">
                          Mark as workaround
                        </Text>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            <Divider />
            
            <div className="flex justify-end space-x-3">
              <Button 
                variant="light" 
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleStatusChange}
                loading={isLoading}
                disabled={!selectedStatus || (selectedTransition?.requiresComment && !comment)}
              >
                Update Status
              </Button>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </div>
  );
}
