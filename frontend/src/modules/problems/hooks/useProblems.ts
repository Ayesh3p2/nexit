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
  CreateCommentData
} from '../types/problem.types';
import { problemApi } from '../api/problemApi';
import { useToast } from '@/components/ui/use-toast';

export const useProblems = (
  filters: Partial<ProblemFilters> = {},
  page = 1,
  limit = 10
) => {
  return useQuery<PaginatedProblems, Error>(
    ['problems', { ...filters, page, limit }],
    () => problemApi.getProblems(filters, page, limit),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
};

export const useProblem = (id: string) => {
  return useQuery<Problem, Error>(
    ['problem', id],
    () => problemApi.getProblemById(id),
    {
      enabled: !!id,
    }
  );
};

export const useCreateProblem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<Problem, Error, CreateProblemData>(
    (data) => problemApi.createProblem(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['problems']);
        toast({
          title: 'Success',
          description: 'Problem created successfully',
          variant: 'default',
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to create problem',
          variant: 'destructive',
        });
      },
    }
  );
};

export const useUpdateProblemStatus = (id: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    Problem,
    Error,
    UpdateProblemStatusData & { isWorkaround?: boolean }
  >(
    (data) => problemApi.updateProblemStatus(id, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['problem', id]);
        queryClient.invalidateQueries(['problems']);
        
        let message = 'Problem status updated successfully';
        if (variables.isWorkaround) {
          message = 'Workaround added successfully';
        }
        
        toast({
          title: 'Success',
          description: message,
          variant: 'default',
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to update problem status',
          variant: 'destructive',
        });
      },
    }
  );
};

export const useAssignProblem = (id: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<Problem, Error, AssignProblemData>(
    (data) => problemApi.assignProblem(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['problem', id]);
        queryClient.invalidateQueries(['problems']);
        toast({
          title: 'Success',
          description: 'Problem assigned successfully',
          variant: 'default',
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to assign problem',
          variant: 'destructive',
        });
      },
    }
  );
};

export const useAddWorkaround = (id: string) => {
  const updateStatus = useUpdateProblemStatus(id);
  
  return useMutation<Problem, Error, AddWorkaroundData>(
    async (data) => {
      return updateStatus.mutateAsync({
        status: 'known_error',
        comment: data.comment,
        workaround: data.workaround,
        isWorkaround: true,
      });
    },
    {
      onError: (error) => {
        // Error handling is done in the updateStatus mutation
        console.error('Failed to add workaround:', error);
      },
    }
  );
};

export const useAddSolution = (id: string) => {
  const updateStatus = useUpdateProblemStatus(id);
  
  return useMutation<Problem, Error, AddSolutionData>(
    async (data) => {
      return updateStatus.mutateAsync({
        status: 'resolved',
        comment: data.comment,
        solution: data.solution,
      });
    },
    {
      onError: (error) => {
        console.error('Failed to add solution:', error);
      },
    }
  );
};

export const useAddComment = (problemId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<Comment, Error, CreateCommentData>(
    (data) => problemApi.addComment(problemId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['problem', problemId]);
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to add comment',
          variant: 'destructive',
        });
      },
    }
  );
};

export const useLinkIncident = (problemId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<Problem, Error, string>(
    (incidentId) => problemApi.linkIncident(problemId, incidentId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['problem', problemId]);
        toast({
          title: 'Success',
          description: 'Incident linked successfully',
          variant: 'default',
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to link incident',
          variant: 'destructive',
        });
      },
    }
  );
};

export const useUnlinkIncident = (problemId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<Problem, Error, string>(
    (incidentId) => problemApi.unlinkIncident(problemId, incidentId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['problem', problemId]);
        toast({
          title: 'Success',
          description: 'Incident unlinked successfully',
          variant: 'default',
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to unlink incident',
          variant: 'destructive',
        });
      },
    }
  );
};

export const useDeleteProblem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, string>(
    (id) => problemApi.deleteProblem(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['problems']);
        toast({
          title: 'Success',
          description: 'Problem deleted successfully',
          variant: 'default',
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete problem',
          variant: 'destructive',
        });
      },
    }
  );
};
