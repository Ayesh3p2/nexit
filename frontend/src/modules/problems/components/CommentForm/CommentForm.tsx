'use client';

import { useState } from 'react';
import { Button } from '@tremor/react';
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
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          Add a {isInternal ? 'private' : 'public'} comment
        </label>
        <textarea
          id="content"
          rows={3}
          placeholder={`Write your ${isInternal ? 'internal' : 'public'} comment here...`}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            errors.content ? 'border-red-500' : ''
          }`}
          {...register('content')}
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Visibility:</span>
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                !isInternal 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setIsInternal(false)}
            >
              Public
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                isInternal 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setIsInternal(true)}
            >
              Internal
            </button>
          </div>
        </div>
        
        <Button 
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </Button>
      </div>
    </form>
  );
}
