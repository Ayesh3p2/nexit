import { useState } from 'react';
import { 
  Button, 
  Dialog, 
  DialogPanel, 
  Textarea, 
  Title, 
  Text,
  Select,
  SelectItem,
  Badge
} from '@tremor/react';
import { 
  ChangeStatus, 
  ChangeRequest,
  UpdateChangeStatusData
} from '../../types/change.types';
import { useUpdateChangeStatus } from '../../hooks/useChanges';
import { toast } from 'react-hot-toast';

const statusOptions = [
  { value: ChangeStatus.DRAFT, label: 'Draft' },
  { value: ChangeStatus.SUBMITTED, label: 'Submitted' },
  { value: ChangeStatus.IN_REVIEW, label: 'In Review' },
  { value: ChangeStatus.SCHEDULED, label: 'Scheduled' },
  { value: ChangeStatus.IN_PROGRESS, label: 'In Progress' },
  { value: ChangeStatus.IMPLEMENTED, label: 'Implemented' },
  { value: ChangeStatus.REJECTED, label: 'Rejected' },
  { value: ChangeStatus.CLOSED, label: 'Closed' },
  { value: ChangeStatus.FAILED, label: 'Failed' },
  { value: ChangeStatus.ROLLED_BACK, label: 'Rolled Back' },
];

const statusTransitions: Record<ChangeStatus, ChangeStatus[]> = {
  [ChangeStatus.DRAFT]: [ChangeStatus.SUBMITTED],
  [ChangeStatus.SUBMITTED]: [ChangeStatus.IN_REVIEW, ChangeStatus.REJECTED],
  [ChangeStatus.IN_REVIEW]: [ChangeStatus.SCHEDULED, ChangeStatus.REJECTED],
  [ChangeStatus.SCHEDULED]: [ChangeStatus.IN_PROGRESS, ChangeStatus.REJECTED],
  [ChangeStatus.IN_PROGRESS]: [
    ChangeStatus.IMPLEMENTED, 
    ChangeStatus.FAILED, 
    ChangeStatus.ROLLED_BACK
  ],
  [ChangeStatus.IMPLEMENTED]: [ChangeStatus.CLOSED],
  [ChangeStatus.REJECTED]: [ChangeStatus.DRAFT],
  [ChangeStatus.CLOSED]: [],
  [ChangeStatus.FAILED]: [ChangeStatus.IN_PROGRESS, ChangeStatus.ROLLED_BACK],
  [ChangeStatus.ROLLED_BACK]: [ChangeStatus.DRAFT, ChangeStatus.REJECTED],
};

interface ChangeStatusControlsProps {
  change: ChangeRequest;
  onStatusUpdate?: () => void;
}

export function ChangeStatusControls({ change, onStatusUpdate }: ChangeStatusControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ChangeStatus>();
  const [comment, setComment] = useState('');
  const updateStatus = useUpdateChangeStatus(change.id);

  const availableStatuses = statusTransitions[change.status] || [];
  const isStatusChangeAllowed = availableStatuses.length > 0;

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return;

    try {
      const updateData: UpdateChangeStatusData = {
        status: selectedStatus,
        comment: comment || undefined
      };

      await updateStatus.mutateAsync(updateData);
      
      toast.success(`Status updated to ${selectedStatus}`);
      setIsOpen(false);
      setComment('');
      
      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (error) {
      toast.error('Failed to update status');
      console.error('Error updating status:', error);
    }
  };

  const getStatusBadge = (status: ChangeStatus) => {
    const statusColors = {
      [ChangeStatus.DRAFT]: 'gray',
      [ChangeStatus.SUBMITTED]: 'blue',
      [ChangeStatus.IN_REVIEW]: 'yellow',
      [ChangeStatus.SCHEDULED]: 'purple',
      [ChangeStatus.IN_PROGRESS]: 'blue',
      [ChangeStatus.IMPLEMENTED]: 'green',
      [ChangeStatus.REJECTED]: 'red',
      [ChangeStatus.CLOSED]: 'green',
      [ChangeStatus.FAILED]: 'red',
      [ChangeStatus.ROLLED_BACK]: 'orange',
    };

    return (
      <Badge 
        color={statusColors[status] as any}
        className="capitalize"
      >
        {status.split('_').join(' ').toLowerCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Title className="text-sm font-medium text-gray-700">Status</Title>
          <div className="mt-1">
            {getStatusBadge(change.status)}
          </div>
        </div>
        
        {isStatusChangeAllowed && (
          <Button 
            size="xs"
            onClick={() => setIsOpen(true)}
            disabled={updateStatus.isLoading}
          >
            Update Status
          </Button>
        )}
      </div>

      <Dialog open={isOpen} onClose={setIsOpen}>
        <DialogPanel className="max-w-md">
          <Title className="mb-4">Update Change Status</Title>
          
          <div className="space-y-4">
            <div>
              <Text className="mb-1">Current Status</Text>
              <div className="p-2 bg-gray-50 rounded-md">
                {getStatusBadge(change.status)}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Status
              </label>
              <Select
                value={selectedStatus}
                onValueChange={(value) => setSelectedStatus(value as ChangeStatus)}
                placeholder="Select status"
              >
                {availableStatuses.map((status) => {
                  const option = statusOptions.find(opt => opt.value === status);
                  return (
                    <SelectItem key={status} value={status}>
                      {option?.label || status}
                    </SelectItem>
                  );
                })}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comment (Optional)
              </label>
              <Textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment about this status change"
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button 
                variant="light" 
                onClick={() => {
                  setIsOpen(false);
                  setComment('');
                }}
                disabled={updateStatus.isLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleStatusUpdate}
                loading={updateStatus.isLoading}
                disabled={!selectedStatus}
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
