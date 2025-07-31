import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Textarea, Card, Toggle, ToggleItem } from '@tremor/react';
import { CreateCommentData } from '../../../types/incident.types';

const schema = yup.object().shape({
  content: yup.string().required('Comment is required'),
  isInternal: yup.boolean().default(false),
});

interface CommentFormProps {
  onSubmit: (data: CreateCommentData) => Promise<void>;
  isSubmitting?: boolean;
}

export function CommentForm({ onSubmit, isSubmitting = false }: CommentFormProps) {
  const [isInternal, setIsInternal] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    reset,
    formState: { errors } 
  } = useForm<CreateCommentData>({
    resolver: yupResolver(schema),
    defaultValues: {
      content: '',
      isInternal: false,
    },
  });

  const handleFormSubmit = async (data: CreateCommentData) => {
    try {
      await onSubmit({ ...data, isInternal });
      reset();
    } catch (error) {
      // Error is handled by the parent component
      throw error;
    }
  };

  return (
    <Card className="mt-6">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <Textarea
            {...register('content')}
            placeholder={isInternal ? 'Add an internal note...' : 'Add a comment...'}
            rows={3}
            error={!!errors.content}
            errorMessage={errors.content?.message}
            disabled={isSubmitting}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Visibility:</span>
            <Toggle 
              color="blue" 
              defaultValue="public"
              onValueChange={(value) => setIsInternal(value === 'internal')}
              disabled={isSubmitting}
            >
              <ToggleItem value="public" text="Public" />
              <ToggleItem value="internal" text="Internal" />
            </Toggle>
            {isInternal && (
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                Only visible to team members
              </span>
            )}
          </div>
          
          <Button 
            type="submit" 
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isInternal ? 'Add Note' : 'Add Comment'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
