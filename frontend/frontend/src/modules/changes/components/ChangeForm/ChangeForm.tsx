import { useRouter } from 'next/router';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  Button, 
  TextInput, 
  Textarea, 
  Select, 
  SelectItem, 
  Card,
  Title,
  DatePicker,
  DateRangePicker,
  MultiSelect,
  MultiSelectItem,
  Toggle,
  ToggleItem
} from '@tremor/react';
import { 
  ChangeType, 
  ChangePriority, 
  ChangeImpact,
  CreateChangeData,
  ChangeRequest
} from '../../types/change.types';
import { useCreateChange, useUpdateChange } from '../../hooks/useChanges';
import { format } from 'date-fns';

export const changeSchema = yup.object().shape({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  type: yup.string().oneOf(Object.values(ChangeType)).required('Type is required'),
  priority: yup.string().oneOf(Object.values(ChangePriority)).required('Priority is required'),
  impact: yup.string().oneOf(Object.values(ChangeImpact)).required('Impact is required'),
  reasonForChange: yup.string().required('Reason for change is required'),
  expectedOutcome: yup.string().required('Expected outcome is required'),
  scheduledStart: yup.string().required('Scheduled start is required'),
  scheduledEnd: yup.string()
    .required('Scheduled end is required')
    .test(
      'is-after-start',
      'End date must be after start date',
      function(endDate) {
        return !this.parent.scheduledStart || new Date(endDate) > new Date(this.parent.scheduledStart);
      }
    ),
  changeOwnerId: yup.string().required('Change owner is required'),
  changeAdvisoryBoardIds: yup.array().of(yup.string()),
  riskAssessment: yup.string(),
  implementationPlan: yup.string(),
  backoutPlan: yup.string(),
  relatedChangeIds: yup.array().of(yup.string()),
  relatedIncidentIds: yup.array().of(yup.string()),
  relatedProblemIds: yup.array().of(yup.string()),
});

interface ChangeFormProps {
  change?: ChangeRequest;
  onSuccess?: () => void;
}

export function ChangeForm({ change, onSuccess }: ChangeFormProps) {
  const router = useRouter();
  const isEdit = !!change;
  
  const { 
    control, 
    handleSubmit, 
    formState: { errors },
    watch,
    setValue
  } = useForm<CreateChangeData>({
    resolver: yupResolver(changeSchema),
    defaultValues: {
      title: change?.title || '',
      description: change?.description || '',
      type: change?.type || ChangeType.NORMAL,
      priority: change?.priority || ChangePriority.MEDIUM,
      impact: change?.impact || ChangeImpact.MEDIUM,
      reasonForChange: change?.reasonForChange || '',
      expectedOutcome: change?.expectedOutcome || '',
      scheduledStart: change?.scheduledStart || '',
      scheduledEnd: change?.scheduledEnd || '',
      changeOwnerId: change?.changeOwner?.id || '',
      changeAdvisoryBoardIds: change?.changeAdvisoryBoard?.map(member => member.id) || [],
      riskAssessment: change?.riskAssessment || '',
      implementationPlan: change?.implementationPlan || '',
      backoutPlan: change?.backoutPlan || '',
      relatedChangeIds: change?.relatedChanges?.map(change => change.id) || [],
      relatedIncidentIds: change?.relatedIncidents?.map(incident => incident.id) || [],
      relatedProblemIds: change?.relatedProblems?.map(problem => problem.id) || [],
    }
  });

  const createChange = useCreateChange();
  const updateChange = useUpdateChange(change?.id || '');
  
  const onSubmit = async (data: CreateChangeData) => {
    try {
      if (isEdit) {
        await updateChange.mutateAsync(data);
      } else {
        await createChange.mutateAsync(data);
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/changes');
      }
    } catch (error) {
      console.error('Error saving change:', error);
    }
  };

  // Mock data for dropdowns - in a real app, these would come from your API
  const users = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
  ];

  const changes = [
    { id: '1', title: 'Database Migration' },
    { id: '2', title: 'Server Upgrade' },
  ];

  const incidents = [
    { id: '1', title: 'Login Failure' },
    { id: '2', title: 'API Timeout' },
  ];

  const problems = [
    { id: '1', title: 'Database Performance' },
    { id: '2', title: 'Network Latency' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Title>{isEdit ? 'Edit Change Request' : 'Create New Change Request'}</Title>
        <p className="text-sm text-gray-500 mt-1">
          {isEdit 
            ? 'Update the change request details below.'
            : 'Fill in the details below to create a new change request.'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      placeholder="Enter a descriptive title"
                      error={!!errors.title}
                      errorMessage={errors.title?.message}
                      {...field}
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select 
                      value={field.value}
                      onValueChange={field.onChange}
                      error={!!errors.type}
                      errorMessage={errors.type?.message}
                    >
                      {Object.values(ChangeType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0) + type.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority *
                </label>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Select 
                      value={field.value}
                      onValueChange={field.onChange}
                      error={!!errors.priority}
                      errorMessage={errors.priority?.message}
                    >
                      {Object.values(ChangePriority).map((priority) => (
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
                  Impact *
                </label>
                <Controller
                  name="impact"
                  control={control}
                  render={({ field }) => (
                    <Select 
                      value={field.value}
                      onValueChange={field.onChange}
                      error={!!errors.impact}
                      errorMessage={errors.impact?.message}
                    >
                      {Object.values(ChangeImpact).map((impact) => (
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
                  Change Owner *
                </label>
                <Controller
                  name="changeOwnerId"
                  control={control}
                  render={({ field }) => (
                    <Select 
                      value={field.value}
                      onValueChange={field.onChange}
                      error={!!errors.changeOwnerId}
                      errorMessage={errors.changeOwnerId?.message}
                    >
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Change Advisory Board
                </label>
                <Controller
                  name="changeAdvisoryBoardIds"
                  control={control}
                  render={({ field }) => (
                    <MultiSelect
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      {users.map((user) => (
                        <MultiSelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </MultiSelectItem>
                      ))}
                    </MultiSelect>
                  )}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  rows={4}
                  placeholder="Provide a detailed description of the change"
                  error={!!errors.description}
                  errorMessage={errors.description?.message}
                  {...field}
                />
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Change *
            </label>
            <Controller
              name="reasonForChange"
              control={control}
              render={({ field }) => (
                <Textarea
                  rows={3}
                  placeholder="Why is this change necessary?"
                  error={!!errors.reasonForChange}
                  errorMessage={errors.reasonForChange?.message}
                  {...field}
                />
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Outcome *
            </label>
            <Controller
              name="expectedOutcome"
              control={control}
              render={({ field }) => (
                <Textarea
                  rows={3}
                  placeholder="What do you expect to achieve with this change?"
                  error={!!errors.expectedOutcome}
                  errorMessage={errors.expectedOutcome?.message}
                  {...field}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scheduled Start *
              </label>
              <Controller
                name="scheduledStart"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    value={field.value ? new Date(field.value) : undefined}
                    onValueChange={(date) => field.onChange(date?.toISOString())}
                    enableTime={true}
                    error={!!errors.scheduledStart}
                    errorMessage={errors.scheduledStart?.message}
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scheduled End *
              </label>
              <Controller
                name="scheduledEnd"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    value={field.value ? new Date(field.value) : undefined}
                    onValueChange={(date) => field.onChange(date?.toISOString())}
                    enableTime={true}
                    error={!!errors.scheduledEnd}
                    errorMessage={errors.scheduledEnd?.message}
                  />
                )}
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Additional Information</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Risk Assessment
                </label>
                <Controller
                  name="riskAssessment"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      rows={3}
                      placeholder="Assess the risks associated with this change"
                      {...field}
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Implementation Plan
                </label>
                <Controller
                  name="implementationPlan"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      rows={4}
                      placeholder="Describe the steps to implement this change"
                      {...field}
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Backout Plan
                </label>
                <Controller
                  name="backoutPlan"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      rows={4}
                      placeholder="Describe how to rollback this change if needed"
                      {...field}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Related Items</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Related Changes
                </label>
                <Controller
                  name="relatedChangeIds"
                  control={control}
                  render={({ field }) => (
                    <MultiSelect
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      {changes.map((change) => (
                        <MultiSelectItem key={change.id} value={change.id}>
                          {change.title}
                        </MultiSelectItem>
                      ))}
                    </MultiSelect>
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Related Problems
                </label>
                <Controller
                  name="relatedProblemIds"
                  control={control}
                  render={({ field }) => (
                    <MultiSelect
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      {problems.map((problem) => (
                        <MultiSelectItem key={problem.id} value={problem.id}>
                          {problem.title}
                        </MultiSelectItem>
                      ))}
                    </MultiSelect>
                  )}
                />
              </div>
            </div>
          </div>
        </Card>

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
            loading={createChange.isLoading || updateChange.isLoading}
          >
            {isEdit ? 'Update Change' : 'Create Change'}
          </Button>
        </div>
      </form>
    </div>
  );
}
