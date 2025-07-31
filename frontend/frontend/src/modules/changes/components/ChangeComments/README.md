# ChangeComments

A component for managing and displaying comments on a change request. Supports threaded discussions, internal notes, and file attachments.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `changeId` | `string` | Yes | ID of the change for which to manage comments |
| `currentUser` | `User` | No | Currently logged-in user |
| `onNewComment` | `(comment: Comment) => void` | No | Callback when a new comment is added |
| `onDeleteComment` | `(commentId: string) => Promise<void>` | No | Callback when a comment is deleted |
| `showInternalToggle` | `boolean` | No | Whether to show the internal comment toggle (default: true) |

## Features

- Real-time comment display
- Support for internal (private) comments
- File attachments
- @mentions for team members
- Rich text formatting
- Comment editing and deletion (for comment authors)
- Loading states and error handling

## Usage

```tsx
import { ChangeComments } from '@/modules/changes/components/ChangeComments';
import { useCurrentUser } from '@/hooks/useAuth';

function ChangeDetail({ changeId }) {
  const currentUser = useCurrentUser();
  
  const handleNewComment = (comment) => {
    // Optional: Handle new comment (e.g., show notification)
    console.log('New comment:', comment);
  };
  
  const handleDeleteComment = async (commentId) => {
    // Optional: Custom delete handling
    await deleteComment(commentId);
  };
  
  return (
    <div className="mt-6">
      <h2 className="text-lg font-medium mb-4">Discussion</h2>
      <ChangeComments 
        changeId={changeId}
        currentUser={currentUser}
        onNewComment={handleNewComment}
        onDeleteComment={handleDeleteComment}
        showInternalToggle={true}
      />
    </div>
  );
}
```

## Comment Object

```typescript
interface Comment {
  id: string;
  text: string;
  isInternal: boolean;
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  createdAt: string;
  updatedAt?: string;
  attachments: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
  }>;
  mentions?: Array<{
    userId: string;
    name: string;
  }>;
}
```

## Styling

- Uses Tailwind CSS for styling
- Responsive layout
- Dark mode support
- Custom scrollbars for comment threads
- Hover states for interactive elements

## Keyboard Navigation

- `Tab` to navigate between interactive elements
- `Enter` to submit comment (with `Shift+Enter` for new line)
- `Escape` to cancel editing
- `Arrow keys` to navigate between comments

## Testing

Component includes tests for:
- Rendering comments
- Adding new comments
- Toggling between internal/public comments
- Loading states
- Error handling
- Keyboard navigation

Run tests with:

```bash
npm test src/modules/changes/components/ChangeComments
```

## Accessibility

- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly
- Color contrast compliant with WCAG 2.1
- Focus management for modals and dialogs

## Performance

- Virtualized list for large comment threads
- Optimistic UI updates
- Lazy loading of images and attachments
- Memoized components to prevent unnecessary re-renders
