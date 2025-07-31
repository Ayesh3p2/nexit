import axios from 'axios';
import { 
  Incident, 
  PaginatedIncidents, 
  IncidentFilters, 
  CreateIncidentData, 
  UpdateIncidentStatusData, 
  AssignIncidentData, 
  CreateCommentData 
} from '../types/incident.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const incidentApi = {
  // Get all incidents with pagination and filtering
  async getIncidents(
    filters: Partial<IncidentFilters> = {},
    page = 1,
    limit = 10
  ): Promise<PaginatedIncidents> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.entries(filters).reduce((acc, [key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => acc.append(key, v));
        } else if (value !== undefined) {
          acc.append(key, value);
        }
        return acc;
      }, new URLSearchParams())
    });

    const response = await api.get(`/incidents?${params.toString()}`);
    return response.data;
  },

  // Get a single incident by ID
  async getIncidentById(id: string): Promise<Incident> {
    const response = await api.get(`/incidents/${id}`);
    return response.data;
  },

  // Create a new incident
  async createIncident(data: CreateIncidentData): Promise<Incident> {
    const response = await api.post('/incidents', data);
    return response.data;
  },

  // Update incident status
  async updateIncidentStatus(
    id: string, 
    data: UpdateIncidentStatusData
  ): Promise<Incident> {
    const response = await api.patch(`/incidents/${id}/status`, data);
    return response.data;
  },

  // Assign incident to a user
  async assignIncident(
    id: string, 
    data: AssignIncidentData
  ): Promise<Incident> {
    const response = await api.patch(`/incidents/${id}/assign`, data);
    return response.data;
  },

  // Add a comment to an incident
  async addComment(
    incidentId: string, 
    data: CreateCommentData
  ): Promise<Comment> {
    const response = await api.post(`/incidents/${incidentId}/comments`, data);
    return response.data;
  },

  // Delete an incident (soft delete)
  async deleteIncident(id: string): Promise<void> {
    await api.delete(`/incidents/${id}`);
  },

  // Get incident statistics
  async getIncidentStats() {
    const response = await api.get('/incidents/stats');
    return response.data;
  }
};

export default incidentApi;
