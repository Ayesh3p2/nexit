import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import type { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { 
  Incident, 
  PaginatedIncidents, 
  IncidentFilters, 
  CreateIncidentData, 
  UpdateIncidentStatusData, 
  AssignIncidentData, 
  CreateCommentData 
} from '../types/incident.types';
import { incidentApi } from '../api/incidentApi';

export const INCIDENTS_QUERY_KEY = 'incidents';

interface UseIncidentsOptions {
  filters?: Partial<IncidentFilters>;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export const useIncidents = ({
  filters = {},
  page = 1,
  limit = 10,
  enabled = true,
}: UseIncidentsOptions = {}) => {
  return useQuery<PaginatedIncidents, Error>({
    queryKey: [INCIDENTS_QUERY_KEY, { ...filters, page, limit }],
    queryFn: () => incidentApi.getIncidents(filters, page, limit),
    placeholderData: (previousData) => previousData,
    enabled,
    onError: (error: Error) => {
      toast.error('Failed to load incidents');
      console.error('Error fetching incidents:', error);
    },
  } as UseQueryOptions<PaginatedIncidents, Error>);
};

export const useIncident = (id: string, options: Omit<UseQueryOptions<Incident, Error>, 'queryKey' | 'queryFn'> = {}) => {
  return useQuery<Incident, Error>({
    queryKey: [INCIDENTS_QUERY_KEY, id],
    queryFn: () => incidentApi.getIncidentById(id),
    enabled: !!id,
    ...options,
    onError: (error: Error) => {
      toast.error('Failed to load incident details');
      console.error('Error fetching incident:', error);
    },
  } as UseQueryOptions<Incident, Error>);
};

export const useUpdateIncident = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<Incident, Error, Partial<CreateIncidentData>>({
    mutationFn: (data) => incidentApi.updateIncident(id, data),
    onSuccess: (updatedIncident) => {
      // Update the incident in the incidents list cache
      queryClient.setQueryData([INCIDENTS_QUERY_KEY, id], updatedIncident);
      // Invalidate the paginated query to refetch the updated list
      queryClient.invalidateQueries({ queryKey: [INCIDENTS_QUERY_KEY] });
      toast.success('Incident updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update incident');
    },
  } as UseMutationOptions<Incident, Error, Partial<CreateIncidentData>>);
};

export const useUpdateIncidentStatus = (incidentId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation<Incident, Error, UpdateIncidentStatusData>({
    mutationFn: (data) => incidentApi.updateIncidentStatus(incidentId, data),
    onSuccess: (updatedIncident) => {
      // Update the incident in the cache
      queryClient.setQueryData([INCIDENTS_QUERY_KEY, incidentId], updatedIncident);
      // Invalidate the incidents list to refetch with the updated status
      queryClient.invalidateQueries({ queryKey: [INCIDENTS_QUERY_KEY] });
      toast.success('Incident status updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update incident status');
    },
  } as UseMutationOptions<Incident, Error, UpdateIncidentStatusData>);
};

export const useAssignIncident = (incidentId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation<Incident, Error, AssignIncidentData>({
    mutationFn: (data) => incidentApi.assignIncident(incidentId, data),
    onSuccess: (updatedIncident) => {
      // Update the incident in the cache
      queryClient.setQueryData([INCIDENTS_QUERY_KEY, incidentId], updatedIncident);
      // Invalidate the incidents list to refetch with the updated assignment
      queryClient.invalidateQueries({ queryKey: [INCIDENTS_QUERY_KEY] });
      toast.success('Incident assigned successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to assign incident');
    },
  } as UseMutationOptions<Incident, Error, AssignIncidentData>);
};

export const useAddComment = (incidentId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation<Comment, Error, CreateCommentData>({
    mutationFn: (data) => incidentApi.addComment(incidentId, data),
    onSuccess: () => {
      // Invalidate the incident query to refetch with the new comment
      queryClient.invalidateQueries({ queryKey: [INCIDENTS_QUERY_KEY, incidentId] });
      toast.success('Comment added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add comment');
    },
  } as UseMutationOptions<Comment, Error, CreateCommentData>);
};

export const useDeleteIncident = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  return useMutation<void, Error, string>({
    mutationFn: (id) => incidentApi.deleteIncident(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [INCIDENTS_QUERY_KEY] });
      queryClient.removeQueries({ queryKey: [INCIDENTS_QUERY_KEY, id] });
      toast.success('Incident deleted successfully');
      router.push('/incidents');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete incident');
      console.error('Error deleting incident:', error);
    },
  } as UseMutationOptions<void, Error, string>);
};

export const useCreateIncident = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  return useMutation<Incident, Error, CreateIncidentData>({
    mutationFn: (data) => incidentApi.createIncident(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [INCIDENTS_QUERY_KEY] });
      toast.success('Incident created successfully');
      router.push(`/incidents/${data.id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create incident');
      console.error('Error creating incident:', error);
    },
  } as UseMutationOptions<Incident, Error, CreateIncidentData>);
};
