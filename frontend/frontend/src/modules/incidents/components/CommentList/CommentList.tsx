import { Avatar, Card, Text } from '@tremor/react';
import { format } from 'date-fns';
import { Comment } from '../../../types/incident.types';

interface CommentListProps {
  comments: Comment[];
  currentUserId?: string;
}

export function CommentList({ comments, currentUserId }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <Card className="mt-6">
        <Text className="text-center text-gray-500">No comments yet</Text>
      </Card>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {comments.map((comment) => (
        <Card 
          key={comment.id} 
          className={`relative ${comment.isInternal ? 'border-l-4 border-blue-500' : ''}`}
        >
          <div className="flex items-start space-x-3">
            <Avatar 
              src={comment.user.avatar} 
              alt={`${comment.user.firstName} ${comment.user.lastName}`}
              size="md"
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <Text className="font-medium">
                  {comment.user.firstName} {comment.user.lastName}
                </Text>
                <Text className="text-sm text-gray-500">
                  {format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a')}
                </Text>
              </div>
              
              {comment.isInternal && (
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-md mb-1">
                  Internal Note
                </span>
              )}
              
              <Text className="mt-1 whitespace-pre-line">{comment.content}</Text>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
