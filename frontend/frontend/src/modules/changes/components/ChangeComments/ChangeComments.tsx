import { useState } from 'react';
import { 
  Textarea, 
  Button, 
  Card, 
  Title, 
  Text,
  Avatar,
  Badge
} from '@tremor/react';
import { useAddComment, useChangeComments } from '../../hooks/useChanges';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface ChangeCommentsProps {
  changeId: string;
}

export function ChangeComments({ changeId }: ChangeCommentsProps) {
  const [commentText, setCommentText] = useState('');
  const { data: comments = [], refetch } = useChangeComments(changeId);
  const addComment = useAddComment(changeId);

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    
    try {
      await addComment.mutateAsync({
        text: commentText,
        isInternal: false
      });
      
      setCommentText('');
      refetch();
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
      console.error('Error adding comment:', error);
    }
  };

  return (
    <Card className="mt-6">
      <Title className="mb-4">Comments ({comments.length})</Title>
      
      <div className="space-y-6">
        {/* Comment input */}
        <div className="space-y-2">
          <Textarea
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button 
              size="sm" 
              onClick={handleAddComment}
              disabled={!commentText.trim() || addComment.isLoading}
              loading={addComment.isLoading}
            >
              Add Comment
            </Button>
          </div>
        </div>

        {/* Comments list */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <Avatar 
                  className="mt-1"
                  src={comment.author.avatarUrl}
                  alt={`${comment.author.firstName} ${comment.author.lastName}`}
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Text className="font-medium">
                      {comment.author.firstName} {comment.author.lastName}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </Text>
                    {comment.isInternal && (
                      <Badge size="xs" color="blue">
                        Internal
                      </Badge>
                    )}
                  </div>
                  <Text className="mt-1 text-sm whitespace-pre-wrap">
                    {comment.text}
                  </Text>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
