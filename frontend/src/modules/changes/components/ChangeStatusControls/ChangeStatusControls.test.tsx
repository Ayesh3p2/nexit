import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChangeStatusControls } from './ChangeStatusControls';
import { ChangeStatus } from '../../types/change.types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';

// Mock the useUpdateChangeStatus hook
jest.mock('../../hooks/useChanges', () => ({
  useUpdateChangeStatus: () => ({
    mutateAsync: jest.fn().mockResolvedValue({}),
    isLoading: false,
  }),
}));

describe('ChangeStatusControls', () => {
  const mockChange = {
    id: '1',
    status: ChangeStatus.DRAFT,
    title: 'Test Change',
    description: 'Test Description',
    priority: 'medium',
    type: 'standard',
    changeOwner: { id: 'user1', firstName: 'John', lastName: 'Doe' },
  };

  const renderComponent = (change = mockChange) => {
    const queryClient = new QueryClient();
    return render(
      <QueryClientProvider client={queryClient}>
        <ChangeStatusControls change={change} />
        <ToastContainer />
      </QueryClientProvider>
    );
  };

  it('renders current status', () => {
    renderComponent();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('shows update status button when status can be changed', () => {
    renderComponent();
    expect(screen.getByText('Update Status')).toBeInTheDocument();
  });

  it('opens status update dialog when update button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Update Status'));
    expect(screen.getByText('Update Change Status')).toBeInTheDocument();
  });

  it('shows available status transitions in the dialog', async () => {
    renderComponent();
    fireEvent.click(screen.getByText('Update Status'));
    
    // For DRAFT status, only SUBMITTED should be available
    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);
    
    await waitFor(() => {
      expect(screen.getByText('Submitted')).toBeInTheDocument();
    });
  });

  it('allows adding a comment when changing status', async () => {
    renderComponent();
    fireEvent.click(screen.getByText('Update Status'));
    
    const commentInput = screen.getByPlaceholderText('Add a comment about this status change');
    fireEvent.change(commentInput, { target: { value: 'Testing status update' } });
    
    expect(commentInput).toHaveValue('Testing status update');
  });
});
