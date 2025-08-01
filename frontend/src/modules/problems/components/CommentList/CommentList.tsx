'use client';

import { Comment } from '../../types/problem.types';
import { Card, Title, Text } from '@tremor/react';

interface CommentListProps {
  comments: Comment[];
  isInternal?: boolean;
}

export function CommentList({ comments, isInternal = false }: CommentListProps) {
  const filteredComments = isInternal 
    ? comments.filter(comment => comment.isInternal)
    : comments.filter(comment => !comment.isInternal);

  if (filteredComments.length === 0) {
    return (
      <div className="mt-4">
        <Text>No {isInternal ? 'internal' : 'public'} comments yet.</Text>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {filteredComments.map((comment) => (
        <Card key={comment.id} className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <Text className="font-medium">
                  {comment.user.firstName} {comment.user.lastName}
                </Text>
                {comment.isInternal && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Internal
                  </span>
                )}
              </div>
              <Text className="text-sm text-gray-500">
                {new Date(comment.createdAt).toLocaleString()}
              </Text>
            </div>
          </div>
          <div className="mt-2">
            <Text>{comment.content}</Text>
          </div>
        </Card>
      ))}
    </div>
  );
}
