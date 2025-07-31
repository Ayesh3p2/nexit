# ChangeApprovalControls

A component for managing the approval workflow of a change request. It handles the approval process, including approving, rejecting, and tracking approval status.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `change` | `Change` | Yes | The change object containing approval details |
| `onApprove` | `(comment?: string) => Promise<void>` | No | Callback when change is approved |
| `onReject` | `(comment?: string) => Promise<void>` | No | Callback when change is rejected |
| `isLoading` | `boolean` | No | Loading state indicator |
| `currentUser` | `User` | No | Currently logged-in user |

## Features

- Displays current approval status
- Shows approval progress for multiple approvers
- Allows adding comments when approving/rejecting
- Handles loading and error states
- Shows approval history
- Validates user permissions

## Usage

```tsx
import { ChangeApprovalControls } from '@/modules/changes/components/ChangeApprovalControls';
import { useCurrentUser } from '@/hooks/useAuth';

function ChangeDetail({ change }) {
  const { approveChange, rejectChange, isLoading } = useChangeApprovals(change.id);
  const currentUser = useCurrentUser();
  
  return (
    <div>
      <h2>Approval Status</h2>
      <ChangeApprovalControls 
        change={change} 
        onApprove={approveChange}
        onReject={rejectChange}
        isLoading={isLoading}
        currentUser={currentUser}
      />
    </div>
  );
}
```

## Approval Workflow

1. **Initial State**: Change is submitted for approval
2. **Review**: Approvers review the change
3. **Decision**: Each approver can:
   - Approve: Move to next approver or complete if last approver
   - Reject: Send back to requester with comments
   - Request Changes: Provide feedback and return for updates
4. **Completion**: When all required approvals are received, the change can proceed

## Styling

Uses Tremor UI components for consistent styling. Status indicators are color-coded:

- Pending: Yellow
- Approved: Green
- Rejected: Red
- Changes Requested: Orange

## Testing

Component includes tests for:
- Rendering approval status
- Showing approval progress
- Handling approval/rejection
- Form validation
- Loading and error states
- Permission checks

Run tests with:

```bash
npm test src/modules/changes/components/ChangeApprovalControls
```

## Accessibility

- Uses semantic HTML elements
- Includes ARIA attributes for screen readers
- Keyboard navigable
- Color contrast meets WCAG AA standards

## Error Handling

- Shows error messages for failed API calls
- Validates input before submission
- Handles network errors gracefully
- Provides feedback for all user actions
