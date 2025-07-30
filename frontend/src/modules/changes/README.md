# Change Management Module

This module provides components and utilities for managing IT changes in the NexIT ITSM platform. It implements the full change management workflow including creation, review, approval, and implementation of changes.

## Components

### 1. ChangeList
Displays a paginated list of changes with filtering and sorting capabilities.

### 2. ChangeDetail
Shows detailed information about a specific change including status, approvals, and related items.

### 3. ChangeForm
Form for creating and editing changes with validation.

### 4. ChangeStatusControls
Manages the status of a change with appropriate transitions.

### 5. ChangeApprovalControls
Handles the approval workflow for changes.

### 6. ChangeComments
Manages comments and discussions related to a change.

## Hooks

### useChanges
Central hook for all change-related data fetching and mutations.

### useChange
Fetches a single change by ID.

### useChangeStatus
Manages change status updates.

### useChangeApprovals
Handles change approval workflows.

## Types

### Change
```typescript
interface Change {
  id: string;
  title: string;
  description: string;
  status: ChangeStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'standard' | 'emergency' | 'normal';
  scheduledStart: string;
  scheduledEnd: string;
  changeOwner: User;
  changeAdvisoryBoard: User[];
  implementationPlan: string;
  backoutPlan: string;
  riskAssessment: string;
  relatedIncidents: string[];
  relatedProblems: string[];
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}
```

### ChangeStatus
```typescript
type ChangeStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'IMPLEMENTED'
  | 'REJECTED'
  | 'CANCELLED';
```

## Usage Example

```tsx
import { 
  ChangeList,
  ChangeDetail,
  ChangeForm,
  useChanges,
  ChangeStatus
} from '@/modules/changes';

// Example: Using ChangeList
function ChangesPage() {
  return (
    <div>
      <h1>Change Management</h1>
      <ChangeList />
    </div>
  );
}

// Example: Using ChangeDetail
function ChangeDetailPage({ changeId }) {
  return <ChangeDetail changeId={changeId} />;
}

// Example: Creating a new change
function NewChangePage() {
  const { createChange } = useChanges();
  
  const handleSubmit = async (data) => {
    try {
      await createChange(data);
      // Handle success
    } catch (error) {
      // Handle error
    }
  };
  
  return <ChangeForm onSubmit={handleSubmit} />;
}
```

## API Integration

All API calls are abstracted through the `useChanges` hook. The following endpoints are used:

- `GET /api/changes` - List changes
- `POST /api/changes` - Create a change
- `GET /api/changes/:id` - Get a single change
- `PUT /api/changes/:id` - Update a change
- `POST /api/changes/:id/status` - Update change status
- `POST /api/changes/:id/approve` - Approve a change
- `POST /api/changes/:id/reject` - Reject a change
- `GET /api/changes/:id/comments` - Get change comments
- `POST /api/changes/:id/comments` - Add a comment

## Testing

Run tests with:

```bash
npm test src/modules/changes
```

## Contributing

1. Follow the existing code style and patterns
2. Write tests for new features
3. Update documentation when making changes
4. Ensure all tests pass before submitting a PR
