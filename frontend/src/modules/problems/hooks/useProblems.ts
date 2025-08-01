import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Problem, 
  PaginatedProblems, 
  ProblemFilters, 
  CreateProblemData, 
  UpdateProblemStatusData,
  AssignProblemData,
  AddWorkaroundData,
  AddSolutionData,
  CreateCommentData,
  ProblemStatus
} from '../types/problem.types';
import { problemApi } from '../api/problemApi';
import { toast } from 'sonner';

interface UseProblemsOptions {
  filters?: Partial<ProblemFilters>;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export const useProblems = ({
  filters = {},
  page = 1,
  limit = 10,
  enabled = true,
}: UseProblemsOptions = {}) => {
  return useQuery<PaginatedProblems, Error>({
    queryKey: ['problems', { ...filters, page, limit }],
    queryFn: () => problemApi.getProblems(filters, page, limit),
    placeholderData: (previousData) => previousData,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProblem = (id: string, options: Omit<Parameters<typeof useQuery<Problem, Error>>[0], 'queryKey' | 'queryFn'> = {}) => {
  return useQuery<Problem, Error>({
    queryKey: ['problem', id],
    queryFn: () => problemApi.getProblemById(id),
    enabled: !!id,
    ...options,
  });
};

export const useUpdateProblem = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation<Problem, Error, Partial<CreateProblemData>>({
    mutationFn: (data) => problemApi.updateProblem(id, data),
    onSuccess: (updatedProblem) => {
      // Update the problem in the cache
      queryClient.setQueryData(['problem', id], updatedProblem);
      // Invalidate the problems list to refetch the updated list
      queryClient.invalidateQueries({ queryKey: ['problems'] });
      
      toast.success('Problem updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update problem');
    },
  });
};

export const useCreateProblem = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Problem, Error, CreateProblemData>({
    mutationFn: (data) => problemApi.createProblem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problems'] });
      toast.success('Problem created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create problem');
    },
  });
};

export const useUpdateProblemStatus = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProblemStatusData & { isWorkaround?: boolean }) => 
      problemApi.updateProblemStatus(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['problem', id] });
      queryClient.invalidateQueries({ queryKey: ['problems'] });
      
      const message = variables.isWorkaround 
        ? 'Workaround added successfully'
        : 'Problem status updated successfully';
      
      toast.success(message);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update problem status');
    },
  });
};

export const useAssignProblem = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: AssignProblemData) => problemApi.assignProblem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problem', id] });
      queryClient.invalidateQueries({ queryKey: ['problems'] });
      toast.success('Problem assigned successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to assign problem');
    },
  });
};

export const useAddWorkaround = (id: string) => {
  const queryClient = useQueryClient();
  const updateStatus = useUpdateProblemStatus(id);
  
  return useMutation<Problem, Error, AddWorkaroundData>({
    mutationFn: async (data) => {
      // First add the workaround
      const problem = await problemApi.addWorkaround(id, data);
      
      // Then update the status to known_error if it's not already
      if (problem.status !== ProblemStatus.KNOWN_ERROR) {
        await updateStatus.mutateAsync({
          status: ProblemStatus.KNOWN_ERROR,
          comment: data.comment,
          isWorkaround: true,
        });
      }
      
      return problem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problem', id] });
      queryClient.invalidateQueries({ queryKey: ['problems'] });
      toast.success('Workaround added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add workaround');
    },
  });
};

export const useAddSolution = (id: string) => {
  const queryClient = useQueryClient();
  const updateStatus = useUpdateProblemStatus(id);
  
  return useMutation<Problem, Error, AddSolutionData>({
    mutationFn: async (data) => {
      // First add the solution
      const problem = await problemApi.addSolution(id, data);
      
      // Then update the status to resolved if it's not already
      if (problem.status !== ProblemStatus.RESOLVED) {
        await updateStatus.mutateAsync({
          status: ProblemStatus.RESOLVED,
          comment: data.comment,
        });
      }
      
      return problem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problem', id] });
      queryClient.invalidateQueries({ queryKey: ['problems'] });
      toast.success('Solution added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add solution');
    },
  });
};

export const useLinkIncident = (problemId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (incidentId: string) => problemApi.linkIncident(problemId, incidentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problem', problemId] });
      toast.success('Incident linked successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to link incident');
    },
  });
};

export const useUnlinkIncident = (problemId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (incidentId: string) => problemApi.unlinkIncident(problemId, incidentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problem', problemId] });
      toast.success('Incident unlinked successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to unlink incident');
    },
  });
};

export const useDeleteProblem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => problemApi.deleteProblem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problems'] });
      toast.success('Problem deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete problem');
    },
  });
};
