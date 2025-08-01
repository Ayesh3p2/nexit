'use client';

import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  Button, 
  TextInput, 
  Textarea, 
  Select, 
  SelectItem, 
  Toggle, 
  ToggleItem,
  Card,
  Title,
  Divider,
  MultiSelect,
  MultiSelectItem
} from '@tremor/react';
import { 
  Problem, 
  ProblemStatus, 
  ProblemPriority, 
  ProblemImpact,
  CreateProblemData
} from '../../types/problem.types';
import { useCreateProblem, useUpdateProblem } from '../../hooks/useProblems';

const problemSchema = yup.object().shape({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  priority: yup.string().oneOf(Object.values(ProblemPriority)).required('Priority is required'),
  impact: yup.string().oneOf(Object.values(ProblemImpact)).required('Impact is required'),
  rootCause: yup.string(),
  workaround: yup.string(),
  relatedIncidentIds: yup.array().of(yup.string())
});

interface ProblemFormProps {
  problem?: Problem;
  onSuccess?: () => void;
}

export function ProblemForm({ problem, onSuccess }: ProblemFormProps) {
  const router = useRouter();
  const isEdit = !!problem;
  
  const { 
    control, 
    handleSubmit, 
    formState: { errors },
    setValue,
    watch
  } = useForm<CreateProblemData>({
    resolver: yupResolver(problemSchema),
    defaultValues: {
      title: problem?.title || '',
      description: problem?.description || '',
      priority: problem?.priority || ProblemPriority.MEDIUM,
      impact: problem?.impact || ProblemImpact.MEDIUM,
      rootCause: problem?.rootCause || '',
      workaround: problem?.workaround || '',
      relatedIncidentIds: problem?.relatedIncidents?.map(i => i.id) || []
    }
  });

  const createProblem = useCreateProblem();
  const updateProblem = useUpdateProblem(problem?.id || '');
  
  const onSubmit = async (data: CreateProblemData) => {
    try {
      if (isEdit) {
        await updateProblem.mutateAsync(data);
      } else {
        await createProblem.mutateAsync(data);
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/problems');
      }
    } catch (error) {
      console.error('Error saving problem:', error);
    }
  };

  // Mock incidents for the multi-select
  const incidents = [
    { id: '1', title: 'Login page not loading' },
    { id: '2', title: 'Dashboard timeout issue' },
    { id: '3', title: 'API 500 error' },
  ];

  return (
    <Card className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Title>{isEdit ? 'Edit Problem' : 'Create New Problem'}</Title>
          <p className="text-sm text-gray-500 mt-1">
            {isEdit 
              ? 'Update the problem details below.'
              : 'Fill in the details below to create a new problem.'}
          </p>
        </div>
        
        <Divider />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextInput
                    id="title"
                    placeholder="Enter a descriptive title"
                    error={!!errors.title}
                    errorMessage={errors.title?.message}
                    {...field}
                  />
                )}
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="description"
                    rows={5}
                    placeholder="Provide a detailed description of the problem"
                    error={!!errors.description}
                    errorMessage={errors.description?.message}
                    {...field}
                  />
                )}
              />
            </div>
            
            <div>
              <label htmlFor="rootCause" className="block text-sm font-medium text-gray-700 mb-1">
                Root Cause (Optional)
              </label>
              <Controller
                name="rootCause"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="rootCause"
                    rows={3}
                    placeholder="If known, describe the root cause of the problem"
                    {...field}
                  />
                )}
              />
            </div>
            
            <div>
              <label htmlFor="workaround" className="block text-sm font-medium text-gray-700 mb-1">
                Workaround (Optional)
              </label>
              <Controller
                name="workaround"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="workaround"
                    rows={3}
                    placeholder="If available, describe any workarounds for this problem"
                    {...field}
                  />
                )}
              />
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                Priority *
              </label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select 
                    id="priority"
                    value={field.value}
                    onValueChange={field.onChange}
                    error={!!errors.priority}
                    errorMessage={errors.priority?.message}
                  >
                    {Object.values(ProblemPriority).map(priority => (
                      <SelectItem key={priority} value={priority}>
                        {priority.charAt(0) + priority.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />
            </div>
            
            <div>
              <label htmlFor="impact" className="block text-sm font-medium text-gray-700 mb-1">
                Impact *
              </label>
              <Controller
                name="impact"
                control={control}
                render={({ field }) => (
                  <Select 
                    id="impact"
                    value={field.value}
                    onValueChange={field.onChange}
                    error={!!errors.impact}
                    errorMessage={errors.impact?.message}
                  >
                    {Object.values(ProblemImpact).map(impact => (
                      <SelectItem key={impact} value={impact}>
                        {impact.charAt(0) + impact.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Related Incidents
              </label>
              <Controller
                name="relatedIncidentIds"
                control={control}
                render={({ field }) => (
                  <MultiSelect
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    {incidents.map((incident) => (
                      <MultiSelectItem key={incident.id} value={incident.id}>
                        {incident.title}
                      </MultiSelectItem>
                    ))}
                  </MultiSelect>
                )}
              />
              <p className="mt-1 text-xs text-gray-500">
                Select incidents that are related to this problem
              </p>
            </div>
            
            {isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      Current Status: 
                      <span className="ml-1 font-medium">
                        {problem.status.split('_').map(word => 
                          word.charAt(0) + word.slice(1).toLowerCase()
                        ).join(' ')}
                      </span>
                    </span>
                    <Button 
                      type="button" 
                      variant="light"
                      size="xs"
                      onClick={() => {}}
                    >
                      Change
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="pt-4">
              <div className="flex justify-end space-x-3">
                <Button 
                  type="button" 
                  variant="light"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  loading={createProblem.isLoading || updateProblem.isLoading}
                >
                  {isEdit ? 'Update Problem' : 'Create Problem'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Card>
  );
}
