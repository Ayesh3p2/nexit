'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, TextInput, Textarea, Select, SelectItem, Card, Title } from '@tremor/react';
import { useIncident, useCreateIncident, useUpdateIncident } from '../../hooks/useIncidents';
import { Incident, CreateIncidentData, IncidentStatus, IncidentPriority, IncidentImpact } from '../../types/incident.types';

const schema = yup.object().shape({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  priority: yup.string().oneOf(Object.values(IncidentPriority)).required('Priority is required'),
  impact: yup.string().oneOf(Object.values(IncidentImpact)).required('Impact is required'),
  status: yup.string().oneOf(Object.values(IncidentStatus)),
  assignedToId: yup.string().nullable(),
  resolutionNotes: yup.string().when('status', {
    is: IncidentStatus.RESOLVED,
    then: (schema) => schema.required('Resolution notes are required when status is Resolved'),
    otherwise: (schema) => schema.nullable(),
  }),
});

interface IncidentFormProps {
  incidentId?: string;
  onSuccess?: () => void;
}

export function IncidentForm({ incidentId, onSuccess }: IncidentFormProps) {
  const router = useRouter();
  const isEditMode = !!incidentId;
  const { data: existingIncident } = useIncident(incidentId || '');
  
  const { control, handleSubmit, formState: { errors }, reset, watch } = useForm<CreateIncidentData & { status?: IncidentStatus }>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      priority: IncidentPriority.MEDIUM,
      impact: IncidentImpact.MEDIUM,
      status: IncidentStatus.OPEN,
    },
  });

  const createMutation = useCreateIncident();
  const updateMutation = useUpdateIncident(incidentId || '');
  const status = watch('status');

  useEffect(() => {
    if (isEditMode && existingIncident) {
      reset({
        title: existingIncident.title,
        description: existingIncident.description,
        priority: existingIncident.priority,
        impact: existingIncident.impact,
        status: existingIncident.status,
        assignedToId: existingIncident.assignedTo?.id,
        resolutionNotes: existingIncident.resolutionNotes || '',
      });
    }
  }, [existingIncident, isEditMode, reset]);

  const onSubmit = async (data: CreateIncidentData & { status?: IncidentStatus }) => {
    try {
      if (isEditMode && incidentId) {
        await updateMutation.mutateAsync(data);
      } else {
        await createMutation.mutateAsync(data);
      }
      onSuccess ? onSuccess() : router.push('/incidents');
    } catch (error) {
      console.error('Error saving incident:', error);
    }
  };

  const isLoading = createMutation.isLoading || updateMutation.isLoading;

  return (
    <Card className="max-w-3xl mx-auto">
      <Title className="mb-6">
        {isEditMode ? 'Edit Incident' : 'Create New Incident'}
      </Title>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                placeholder="Enter incident title"
                error={!!errors.title}
                errorMessage={errors.title?.message}
                disabled={isLoading}
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                rows={4}
                placeholder="Describe the incident in detail..."
                error={!!errors.description}
                errorMessage={errors.description?.message}
                disabled={isLoading}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority <span className="text-red-500">*</span>
            </label>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <Select 
                  value={field.value} 
                  onValueChange={field.onChange}
                  disabled={isLoading}
                >
                  {Object.values(IncidentPriority).map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority.charAt(0) + priority.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </Select>
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Impact <span className="text-red-500">*</span>
            </label>
            <Controller
              name="impact"
              control={control}
              render={({ field }) => (
                <Select 
                  value={field.value} 
                  onValueChange={field.onChange}
                  disabled={isLoading}
                >
                  {Object.values(IncidentImpact).map((impact) => (
                    <SelectItem key={impact} value={impact}>
                      {impact.charAt(0) + impact.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </Select>
              )}
            />
          </div>
        </div>

        {isEditMode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select 
                    value={field.value} 
                    onValueChange={field.onChange}
                    disabled={isLoading}
                  >
                    {Object.values(IncidentStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.split('_').map(word => 
                          word.charAt(0) + word.slice(1).toLowerCase()
                        ).join(' ')}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign To
              </label>
              <Controller
                name="assignedToId"
                control={control}
                render={({ field }) => (
                  <Select 
                    value={field.value || ''} 
                    onValueChange={field.onChange}
                    disabled={isLoading}
                  >
                    <SelectItem value="">Unassigned</SelectItem>
                    {/* TODO: Replace with actual users list */}
                    <SelectItem value="user1">John Doe</SelectItem>
                    <SelectItem value="user2">Jane Smith</SelectItem>
                  </Select>
                )}
              />
            </div>
          </div>
        )}

        {status === IncidentStatus.RESOLVED && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resolution Notes <span className="text-red-500">*</span>
            </label>
            <Controller
              name="resolutionNotes"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  rows={3}
                  placeholder="Describe how the incident was resolved..."
                  error={!!errors.resolutionNotes}
                  errorMessage={errors.resolutionNotes?.message}
                  disabled={isLoading}
                />
              )}
            />
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button 
            type="button" 
            variant="light" 
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            loading={isLoading}
            disabled={isLoading}
          >
            {isEditMode ? 'Update Incident' : 'Create Incident'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
