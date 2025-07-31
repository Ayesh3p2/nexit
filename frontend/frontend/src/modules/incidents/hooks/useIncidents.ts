import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
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

export const useIncidents = (
  filters: Partial<IncidentFilters> = {},
  page = 1,
  limit = 10
) => {
  return useQuery<PaginatedIncidents, Error>(
    [INCIDENTS_QUERY_KEY, { ...filters, page, limit }],
    () => incidentApi.getIncidents(filters, page, limit),
    {
      keepPreviousData: true,
      onError: (error) => {
        toast.error('Failed to load incidents');
        console.error('Error fetching incidents:', error);
      },
    }
  );
};

export const useIncident = (id: string) => {
  return useQuery<Incident, Error>(
    [INCIDENTS_QUERY_KEY, id],
    () => incidentApi.getIncidentById(id),
    {
      enabled: !!id,
      onError: (error) => {
        toast.error('Failed to load incident details');
        console.error('Error fetching incident:', error);
      },
    }
  );
};

export const useCreateIncident = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  return useMutation<Incident, Error, CreateIncidentData>(
    (data) => incidentApi.createIncident(data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries([INCIDENTS_QUERY_KEY]);
        toast.success('Incident created successfully');
        router.push(`/incidents/${data.id}`);
      },
      onError: (error) => {
        toast.error('Failed to create incident');
        console.error('Error creating incident:', error);
      },
    }
  );
};

export const useUpdateIncidentStatus = (incidentId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation<Incident, Error, UpdateIncidentStatusData>(
    (data) => incidentApi.updateIncidentStatus(incidentId, data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries([INCIDENTS_QUERY_KEY]);
        queryClient.invalidateQueries([INCIDENTS_QUERY_KEY, incidentId]);
        toast.success('Incident status updated');
      },
      onError: (error) => {
        toast.error('Failed to update incident status');
        console.error('Error updating incident status:', error);
      },
    }
  );
};

export const useAssignIncident = (incidentId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation<Incident, Error, AssignIncidentData>(
    (data) => incidentApi.assignIncident(incidentId, data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries([INCIDENTS_QUERY_KEY]);
        queryClient.invalidateQueries([INCIDENTS_QUERY_KEY, incidentId]);
        toast.success('Incident assigned successfully');
      },
      onError: (error) => {
        toast.error('Failed to assign incident');
        console.error('Error assigning incident:', error);
      },
    }
  );
};

export const useAddComment = (incidentId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation<Comment, Error, CreateCommentData>(
    (data) => incidentApi.addComment(incidentId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([INCIDENTS_QUERY_KEY, incidentId]);
      },
      onError: (error) => {
        toast.error('Failed to add comment');
        console.error('Error adding comment:', error);
      },
    }
  );
};

export const useDeleteIncident = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  return useMutation<void, Error, string>(
    (id) => incidentApi.deleteIncident(id),
    {
      onSuccess: (_, id) => {
        queryClient.invalidateQueries([INCIDENTS_QUERY_KEY]);
        queryClient.removeQueries([INCIDENTS_QUERY_KEY, id]);
        toast.success('Incident deleted successfully');
        router.push('/incidents');
      },
      onError: (error) => {
        toast.error('Failed to delete incident');
        console.error('Error deleting incident:', error);
      },
    }
  );
};
