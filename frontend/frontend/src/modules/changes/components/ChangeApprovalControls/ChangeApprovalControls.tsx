import { useState } from 'react';
import { 
  Button, 
  Dialog, 
  DialogPanel, 
  Textarea, 
  Title, 
  Text,
  Badge,
  Card,
  Flex
} from '@tremor/react';
import { 
  ChangeRequest,
  ApprovalStatus,
  ApproveChangeData
} from '../../types/change.types';
import { useApproveChange } from '../../hooks/useChanges';
import { toast } from 'react-hot-toast';

export function ChangeApprovalControls({ change }: { change: ChangeRequest }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isApproving, setIsApproving] = useState<boolean | null>(null);
  const [comment, setComment] = useState('');
  const approveChange = useApproveChange(change.id);

  // In a real app, get current user from auth context
  const currentUserApproval = change.approvals?.find(
    approval => approval.approver.id === 'current-user-id'
  );

  const userCanApprove = currentUserApproval?.status === ApprovalStatus.PENDING;

  const handleApproval = async (approved: boolean) => {
    if (!currentUserApproval) return;

    try {
      const approvalData: ApproveChangeData = {
        approvalId: currentUserApproval.id,
        approved,
        comment: comment || undefined
      };

      await approveChange.mutateAsync(approvalData);
      toast.success(`Change ${approved ? 'approved' : 'rejected'}`);
      setIsOpen(false);
      setComment('');
    } catch (error) {
      toast.error(`Failed to update approval`);
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Title className="text-sm font-medium text-gray-700">Approval</Title>
          <Badge color="yellow" className="mt-1 capitalize">
            {change.approvals?.some(a => a.status === 'rejected') ? 'Rejected' :
             change.approvals?.every(a => a.status === 'approved') ? 'Approved' : 'Pending'}
          </Badge>
        </div>
        
        {userCanApprove && (
          <Button 
            size="xs"
            onClick={() => setIsOpen(true)}
            disabled={approveChange.isLoading}
          >
            Review
          </Button>
        )}
      </div>

      <Dialog open={isOpen} onClose={setIsOpen}>
        <DialogPanel className="max-w-md">
          <Title className="mb-4">Approve Change</Title>
          
          <div className="space-y-4">
            <Text>Are you sure you want to {isApproving ? 'approve' : 'reject'} this change?</Text>
            
            <Textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment (optional)"
            />

            <div className="flex justify-end space-x-3 mt-6">
              <Button 
                variant="light" 
                onClick={() => setIsOpen(false)}
                disabled={approveChange.isLoading}
              >
                Cancel
              </Button>
              <Button 
                variant="light"
                color="red"
                onClick={() => handleApproval(false)}
                loading={approveChange.isLoading && isApproving === false}
                disabled={isApproving === true}
              >
                Reject
              </Button>
              <Button 
                onClick={() => handleApproval(true)}
                loading={approveChange.isLoading && isApproving === true}
                disabled={isApproving === false}
              >
                Approve
              </Button>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </div>
  );
}
