import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChangeApprovalControls } from './ChangeApprovalControls';
import { ChangeStatus, ApprovalStatus } from '../../types/change.types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';

// Mock the useApproveChange hook
jest.mock('../../hooks/useChanges', () => ({
  useApproveChange: () => ({
    mutateAsync: jest.fn().mockResolvedValue({}),
    isLoading: false,
  }),
}));

describe('ChangeApprovalControls', () => {
  const mockChange = {
    id: '1',
    status: ChangeStatus.IN_REVIEW,
    title: 'Test Change',
    approvals: [
      {
        id: 'approval1',
        status: ApprovalStatus.PENDING,
        approver: { id: 'current-user-id', firstName: 'Current', lastName: 'User' },
        required: true,
        comment: '',
        approvedAt: null,
      },
    ],
  };

  const renderComponent = (change = mockChange) => {
    const queryClient = new QueryClient();
    return render(
      <QueryClientProvider client={queryClient}>
        <ChangeApprovalControls change={change} />
        <ToastContainer />
      </QueryClientProvider>
    );
  };

  it('renders approval status', () => {
    renderComponent();
    expect(screen.getByText('Approval')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('shows review button when user can approve', () => {
    renderComponent();
    expect(screen.getByText('Review')).toBeInTheDocument();
  });

  it('opens approval dialog when review button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Review'));
    expect(screen.getByText('Approve Change')).toBeInTheDocument();
  });

  it('allows adding a comment when approving/rejecting', async () => {
    renderComponent();
    fireEvent.click(screen.getByText('Review'));
    
    const commentInput = screen.getByPlaceholderText('Add a comment (optional)');
    fireEvent.change(commentInput, { target: { value: 'Approving with comments' } });
    
    expect(commentInput).toHaveValue('Approving with comments');
  });

  it('shows approval progress when there are multiple approvers', () => {
    const changeWithMultipleApprovers = {
      ...mockChange,
      approvals: [
        ...mockChange.approvals,
        {
          id: 'approval2',
          status: ApprovalStatus.APPROVED,
          approver: { id: 'user2', firstName: 'Another', lastName: 'Approver' },
          required: true,
          comment: 'Looks good',
          approvedAt: new Date().toISOString(),
        },
      ],
    };
    
    renderComponent(changeWithMultipleApprovers);
    
    // Should show progress (1/2 approved)
    expect(screen.getByText('Approved (1/2)')).toBeInTheDocument();
    // Should show the approval progress section
    expect(screen.getByText('Approval Progress')).toBeInTheDocument();
  });
});
