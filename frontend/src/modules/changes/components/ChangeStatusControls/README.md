# ChangeStatusControls

A component for managing the status of a change request. It handles status transitions, validation, and provides a user interface for updating the status.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `change` | `Change` | Yes | The change object containing current status and other details |
| `onStatusUpdate` | `(status: ChangeStatus, comment?: string) => Promise<void>` | No | Callback when status is updated |
| `isLoading` | `boolean` | No | Loading state indicator |

## Features

- Displays current status with appropriate styling
- Shows available status transitions based on current status
- Allows adding comments when changing status
- Handles loading and error states
- Validates status transitions

## Usage

```tsx
import { ChangeStatusControls } from '@/modules/changes/components/ChangeStatusControls';

function ChangeDetail({ change }) {
  const { updateStatus, isLoading } = useChangeStatus(change.id);
  
  return (
    <div>
      <h2>Change Status</h2>
      <ChangeStatusControls 
        change={change} 
        onStatusUpdate={updateStatus}
        isLoading={isLoading}
      />
    </div>
  );
}
```

## Status Transitions

| Current Status | Allowed Next Statuses |
|----------------|----------------------|
| DRAFT         | SUBMITTED           |
| SUBMITTED     | IN_REVIEW, REJECTED  |
| IN_REVIEW     | APPROVED, REJECTED   |
| APPROVED      | SCHEDULED, CANCELLED |
| SCHEDULED     | IN_PROGRESS, CANCELLED |
| IN_PROGRESS   | IMPLEMENTED, FAILED  |
| IMPLEMENTED   | CLOSED              |
| REJECTED      | DRAFT               |
| CANCELLED     | -                   |
| FAILED        | DRAFT, CANCELLED     |

## Styling

Uses Tremor UI components for consistent styling. Status badges are color-coded:

- DRAFT: Gray
- SUBMITTED: Blue
- IN_REVIEW: Yellow
- APPROVED: Green
- SCHEDULED: Purple
- IN_PROGRESS: Blue
- IMPLEMENTED: Green
- REJECTED: Red
- CANCELLED: Gray
- FAILED: Red

## Testing

Component includes tests for:
- Rendering current status
- Showing available transitions
- Handling status updates
- Form validation
- Loading and error states

Run tests with:

```bash
npm test src/modules/changes/components/ChangeStatusControls
```
