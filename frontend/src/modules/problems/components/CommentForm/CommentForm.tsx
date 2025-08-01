'use client';

import { useState } from 'react';
import { Button, TextArea, Label, Toggle, ToggleItem } from '@tremor/react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

interface CommentFormData {
  content: string;
  isInternal: boolean;
}

const commentSchema = yup.object().shape({
  content: yup.string().required('Comment is required').defined(),
  isInternal: yup.boolean().default(false).defined(),
});

interface CommentFormProps {
  onSubmit: (data: CommentFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export function CommentForm({ onSubmit, isSubmitting = false }: CommentFormProps) {
  const [isInternal, setIsInternal] = useState(false);
  const { 
    register, 
    handleSubmit, 
    reset,
    formState: { errors } 
  } = useForm<CommentFormData>({
    resolver: yupResolver(commentSchema),
    defaultValues: {
      content: '',
      isInternal: false,
    },
  });

  const handleFormSubmit = async (formData: CommentFormData) => {
    await onSubmit({ ...formData, isInternal });
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 mt-6">
      <div>
        <Label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          Add a {isInternal ? 'private' : 'public'} comment
        </Label>
        <TextArea
          id="content"
          rows={3}
          placeholder={`Write your ${isInternal ? 'internal' : 'public'} comment here...`}
          error={!!errors.content}
          errorMessage={errors.content?.message}
          {...register('content')}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Visibility:</span>
          <Toggle 
            color="blue" 
            defaultValue="public"
            onValueChange={(value) => setIsInternal(value === 'internal')}
          >
            <ToggleItem value="public" text="Public" />
            <ToggleItem value="internal" text="Internal" />
          </Toggle>
        </div>
        
        <Button 
          type="submit" 
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          Post Comment
        </Button>
      </div>
    </form>
  );
}
