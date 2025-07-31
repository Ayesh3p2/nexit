import { render, screen } from '@testing-library/react';
import { ChangeDetail } from './ChangeDetail';
import { ChangeStatus } from '../../types/change.types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the useChange hook
jest.mock('../../hooks/useChanges', () => ({
  useChange: (id: string) => ({
    data: {
      id,
      title: 'Test Change',
      description: 'Test Description',
      status: ChangeStatus.DRAFT,
      priority: 'medium',
      type: 'standard',
      scheduledStart: new Date().toISOString(),
      scheduledEnd: new Date(Date.now() + 86400000).toISOString(), // 1 day later
      changeOwner: { id: 'user1', firstName: 'John', lastName: 'Doe' },
      changeAdvisoryBoard: [
        { id: 'user2', firstName: 'Jane', lastName: 'Smith' },
      ],
      implementationPlan: 'Test implementation plan',
      backoutPlan: 'Test backout plan',
    },
    isLoading: false,
  }),
}));

describe('ChangeDetail', () => {
  const renderComponent = (changeId = '1') => {
    const queryClient = new QueryClient();
    return render(
      <QueryClientProvider client={queryClient}>
        <ChangeDetail changeId={changeId} />
      </QueryClientProvider>
    );
  };

  it('renders change details', () => {
    renderComponent();
    
    // Check basic information is displayed
    expect(screen.getByText('Change: Test Change')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    
    // Check status controls are rendered
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
    
    // Check approval controls are rendered
    expect(screen.getByText('Approval')).toBeInTheDocument();
    
    // Check tabs are rendered
    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.getByText('Timeline')).toBeInTheDocument();
    expect(screen.getByText('Approvals')).toBeInTheDocument();
  });

  it('displays the change owner information', () => {
    renderComponent();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('displays the change advisory board', () => {
    renderComponent();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('displays implementation and backout plans', () => {
    renderComponent();
    
    // Click on the Details tab if not already active
    const detailsTab = screen.getByText('Details');
    fireEvent.click(detailsTab);
    
    expect(screen.getByText('Implementation Plan')).toBeInTheDocument();
    expect(screen.getByText('Test implementation plan')).toBeInTheDocument();
    
    expect(screen.getByText('Backout Plan')).toBeInTheDocument();
    expect(screen.getByText('Test backout plan')).toBeInTheDocument();
  });

  it('shows loading state while fetching data', () => {
    // Mock loading state
    jest.spyOn(require('../../hooks/useChanges'), 'useChange').mockImplementation(() => ({
      data: null,
      isLoading: true,
    }));
    
    renderComponent();
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('handles error state', () => {
    // Mock error state
    jest.spyOn(require('../../hooks/useChanges'), 'useChange').mockImplementation(() => ({
      data: null,
      error: new Error('Failed to load change'),
      isLoading: false,
    }));
    
    renderComponent();
    
    expect(screen.getByText('Change not found')).toBeInTheDocument();
  });
});
