# ChangeDetail

A comprehensive view component that displays all details of a change request, including status, approvals, comments, and related information.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `changeId` | `string` | Yes | The ID of the change to display |
| `onStatusChange` | `(status: ChangeStatus) => void` | No | Callback when status is updated |
| `onApproval` | `(approved: boolean, comment?: string) => void` | No | Callback when approval status changes |
| `onComment` | `(comment: string, isInternal: boolean) => void` | No | Callback when a new comment is added |

## Features

- Tabbed interface for organized information
- Status management with ChangeStatusControls
- Approval workflow with ChangeApprovalControls
- Comment thread with ChangeComments
- Detailed change information
- Related items (incidents, problems, etc.)
- Activity timeline
- Responsive layout

## Usage

```tsx
import { ChangeDetail } from '@/modules/changes/components/ChangeDetail';

function ChangeDetailPage({ params }) {
  const changeId = params.id;
  
  const handleStatusChange = async (status) => {
    // Handle status change
    console.log('Status changed to:', status);
  };
  
  const handleApproval = async (approved, comment) => {
    // Handle approval/rejection
    console.log(approved ? 'Approved' : 'Rejected', 'with comment:', comment);
  };
  
  const handleComment = async (text, isInternal) => {
    // Handle new comment
    console.log('New', isInternal ? 'internal' : 'public', 'comment:', text);
  };
  
  return (
    <div className="container mx-auto p-4">
      <ChangeDetail 
        changeId={changeId}
        onStatusChange={handleStatusChange}
        onApproval={handleApproval}
        onComment={handleComment}
      />
    </div>
  );
}
```

## Tabs

1. **Details**
   - Basic information
   - Description
   - Implementation plan
   - Backout plan
   - Risk assessment
   - Related items

2. **Timeline**
   - Activity log
   - Status changes
   - Comments
   - System events

3. **Approvals**
   - Approval status
   - Approvers list
   - Approval history
   - Comments

## State Management

Uses React Query for data fetching and caching:

- `useChange`: Fetches change details
- `useChangeStatus`: Manages status updates
- `useChangeApprovals`: Handles approval workflow
- `useChangeComments`: Manages comments

## Error Handling

- Displays loading states
- Shows error messages
- Provides retry options
- Graceful degradation when data is missing

## Styling

- Uses Tailwind CSS for styling
- Responsive layout
- Dark mode support
- Consistent spacing and typography
- Accessible color contrast

## Testing

Component includes tests for:
- Rendering all tabs
- Data loading states
- Error states
- Tab navigation
- Integration with child components

Run tests with:

```bash
npm test src/modules/changes/components/ChangeDetail
```

## Performance

- Code splitting for tabs
- Lazy loading of heavy components
- Memoization of expensive calculations
- Virtualized lists for long content
- Optimized re-renders

## Accessibility

- Semantic HTML
- ARIA attributes
- Keyboard navigation
- Screen reader support
- Focus management
- Reduced motion support
