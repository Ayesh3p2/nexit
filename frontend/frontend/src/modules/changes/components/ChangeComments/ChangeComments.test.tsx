import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChangeComments } from './ChangeComments';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the useAddComment and useChangeComments hooks
jest.mock('../../hooks/useChanges', () => ({
  useAddComment: () => ({
    mutateAsync: jest.fn().mockResolvedValue({}),
    isLoading: false,
  }),
  useChangeComments: () => ({
    data: [
      {
        id: 'comment1',
        text: 'First comment',
        isInternal: false,
        author: {
          id: 'user1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          avatarUrl: '',
        },
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      },
    ],
    refetch: jest.fn(),
  }),
}));

describe('ChangeComments', () => {
  const renderComponent = () => {
    const queryClient = new QueryClient();
    return render(
      <QueryClientProvider client={queryClient}>
        <ChangeComments changeId="change-123" />
      </QueryClientProvider>
    );
  };

  it('renders comments section', () => {
    renderComponent();
    expect(screen.getByText('Comments (1)')).toBeInTheDocument();
  });

  it('displays existing comments', () => {
    renderComponent();
    expect(screen.getByText('First comment')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText(/1 hour ago/)).toBeInTheDocument();
  });

  it('allows adding a new comment', async () => {
    renderComponent();
    
    const commentInput = screen.getByPlaceholderText('Add a comment...');
    fireEvent.change(commentInput, { target: { value: 'New test comment' } });
    
    expect(commentInput).toHaveValue('New test comment');
    
    fireEvent.click(screen.getByText('Add Comment'));
    
    // The input should be cleared after submission
    await waitFor(() => {
      expect(commentInput).toHaveValue('');
    });
  });

  it('disables the submit button when comment is empty', () => {
    renderComponent();
    
    const submitButton = screen.getByText('Add Comment');
    expect(submitButton).toBeDisabled();
    
    const commentInput = screen.getByPlaceholderText('Add a comment...');
    fireEvent.change(commentInput, { target: { value: '   ' } });
    
    expect(submitButton).toBeDisabled();
    
    fireEvent.change(commentInput, { target: { value: 'Valid comment' } });
    expect(submitButton).not.toBeDisabled();
  });

  it('shows a message when there are no comments', () => {
    // Mock empty comments
    jest.spyOn(require('../../hooks/useChanges'), 'useChangeComments').mockImplementation(() => ({
      data: [],
      refetch: jest.fn(),
    }));
    
    renderComponent();
    
    expect(screen.getByText('No comments yet. Be the first to comment!')).toBeInTheDocument();
  });
});
