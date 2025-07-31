import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ChangeRequest, 
  PaginatedChanges, 
  ChangeFilters, 
  CreateChangeData, 
  UpdateChangeStatusData,
  SubmitForApprovalData,
  ApproveChangeData,
  AddTaskData,
  UpdateTaskData,
  CreateCommentData,
  ChangeMetrics
} from '../types/change.types';
import { changeApi } from '../api/changeApi';

// Query keys
const changeKeys = {
  all: ['changes'] as const,
  lists: () => [...changeKeys.all, 'list'] as const,
  list: (filters: Partial<ChangeFilters> = {}, page = 1, limit = 10) => 
    [...changeKeys.lists(), { filters, page, limit }] as const,
  details: () => [...changeKeys.all, 'detail'] as const,
  detail: (id: string) => [...changeKeys.details(), id] as const,
  metrics: () => [...changeKeys.all, 'metrics'] as const,
  myApprovals: (page = 1, limit = 10) => 
    [...changeKeys.all, 'my-approvals', { page, limit }] as const,
  myChanges: (filters: Partial<ChangeFilters> = {}, page = 1, limit = 10) =>
    [...changeKeys.all, 'my-changes', { filters, page, limit }] as const,
  involved: (filters: Partial<ChangeFilters> = {}, page = 1, limit = 10) =>
    [...changeKeys.all, 'involved', { filters, page, limit }] as const,
};

// Base query config
const queryConfig = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  keepPreviousData: true,
};

// Hook to get paginated changes
export const useChanges = (filters: Partial<ChangeFilters> = {}, page = 1, limit = 10) => {
  return useQuery<PaginatedChanges, Error>(
    changeKeys.list(filters, page, limit),
    () => changeApi.getChanges(filters, page, limit),
    queryConfig
  );
};

// Hook to get a single change by ID
export const useChange = (id: string) => {
  return useQuery<ChangeRequest, Error>(
    changeKeys.detail(id),
    () => changeApi.getChangeById(id),
    { enabled: !!id, ...queryConfig }
  );
};

// Hook to get change metrics
export const useChangeMetrics = () => {
  return useQuery<ChangeMetrics, Error>(
    changeKeys.metrics(),
    () => changeApi.getMetrics(),
    queryConfig
  );
};

// Hook to get changes requiring approval
export const useMyApprovals = (page = 1, limit = 10) => {
  return useQuery<PaginatedChanges, Error>(
    changeKeys.myApprovals(page, limit),
    () => changeApi.getMyApprovals(page, limit),
    queryConfig
  );
};

// Hook to get changes I own
export const useMyChanges = (filters: Partial<ChangeFilters> = {}, page = 1, limit = 10) => {
  return useQuery<PaginatedChanges, Error>(
    changeKeys.myChanges(filters, page, limit),
    () => changeApi.getMyChanges(filters, page, limit),
    queryConfig
  );
};

// Hook to create a new change
export const useCreateChange = () => {
  const queryClient = useQueryClient();
  return useMutation<ChangeRequest, Error, CreateChangeData>(
    (data) => changeApi.createChange(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(changeKeys.lists());
      },
    }
  );
};

// Hook to update a change
export const useUpdateChange = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<ChangeRequest, Error, Partial<CreateChangeData>>(
    (data) => changeApi.updateChange(id, data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(changeKeys.lists());
        queryClient.setQueryData(changeKeys.detail(id), data);
      },
    }
  );
};

// Hook to update change status
export const useUpdateChangeStatus = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<ChangeRequest, Error, UpdateChangeStatusData>(
    (data) => changeApi.updateChangeStatus(id, data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(changeKeys.lists());
        queryClient.setQueryData(changeKeys.detail(id), data);
      },
    }
  );
};

// Hook to submit for approval
export const useSubmitForApproval = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<ChangeRequest, Error, SubmitForApprovalData>(
    (data) => changeApi.submitForApproval(id, data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(changeKeys.lists());
        queryClient.setQueryData(changeKeys.detail(id), data);
      },
    }
  );
};

// Hook to approve/reject a change
export const useApproveChange = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<ChangeRequest, Error, ApproveChangeData>(
    (data) => changeApi.approveChange(id, data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(changeKeys.lists());
        queryClient.setQueryData(changeKeys.detail(id), data);
      },
    }
  );
};

// Hook to add a task
export const useAddTask = (changeId: string) => {
  const queryClient = useQueryClient();
  return useMutation<ChangeRequest, Error, AddTaskData>(
    (data) => changeApi.addTask(changeId, data),
    {
      onSuccess: (data) => {
        queryClient.setQueryData(changeKeys.detail(changeId), data);
      },
    }
  );
};

// Hook to update a task
export const useUpdateTask = (changeId: string, taskId: string) => {
  const queryClient = useQueryClient();
  return useMutation<ChangeRequest, Error, UpdateTaskData>(
    (data) => changeApi.updateTask(changeId, taskId, data),
    {
      onSuccess: (data) => {
        queryClient.setQueryData(changeKeys.detail(changeId), data);
      },
    }
  );
};

// Hook to delete a task
export const useDeleteTask = (changeId: string) => {
  const queryClient = useQueryClient();
  return useMutation<ChangeRequest, Error, string>(
    (taskId) => changeApi.deleteTask(changeId, taskId),
    {
      onSuccess: (data) => {
        queryClient.setQueryData(changeKeys.detail(changeId), data);
      },
    }
  );
};

// Hook to add a comment
export const useAddComment = (changeId: string) => {
  const queryClient = useQueryClient();
  return useMutation<Comment, Error, CreateCommentData>(
    (data) => changeApi.addComment(changeId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(changeKeys.detail(changeId));
      },
    }
  );
};

// Hook to delete a change
export const useDeleteChange = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>(
    (id) => changeApi.deleteChange(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(changeKeys.lists());
      },
    }
  );
};
