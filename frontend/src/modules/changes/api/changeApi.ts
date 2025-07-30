import axios from 'axios';
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

export const changeApi = {
  // Get all changes with pagination and filtering
  async getChanges(
    filters: Partial<ChangeFilters> = {},
    page = 1,
    limit = 10
  ): Promise<PaginatedChanges> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.entries(filters).reduce((acc, [key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => acc.append(key, v));
        } else if (value !== undefined && value !== null) {
          if (typeof value === 'object') {
            Object.entries(value).forEach(([k, v]) => {
              acc.append(`${key}.${k}`, v);
            });
          } else {
            acc.append(key, value);
          }
        }
        return acc;
      }, new URLSearchParams())
    });

    const response = await api.get(`/changes?${params.toString()}`);
    return response.data;
  },

  // Get a single change by ID
  async getChangeById(id: string): Promise<ChangeRequest> {
    const response = await api.get(`/changes/${id}`);
    return response.data;
  },

  // Create a new change
  async createChange(data: CreateChangeData): Promise<ChangeRequest> {
    const response = await api.post('/changes', data);
    return response.data;
  },

  // Update a change
  async updateChange(id: string, data: Partial<CreateChangeData>): Promise<ChangeRequest> {
    const response = await api.patch(`/changes/${id}`, data);
    return response.data;
  },

  // Update change status
  async updateChangeStatus(
    id: string, 
    data: UpdateChangeStatusData
  ): Promise<ChangeRequest> {
    const response = await api.patch(`/changes/${id}/status`, data);
    return response.data;
  },

  // Submit change for approval
  async submitForApproval(
    id: string,
    data: SubmitForApprovalData
  ): Promise<ChangeRequest> {
    const response = await api.post(`/changes/${id}/submit`, data);
    return response.data;
  },

  // Approve/Reject a change
  async approveChange(
    id: string,
    data: ApproveChangeData
  ): Promise<ChangeRequest> {
    const response = await api.post(`/changes/${id}/approve`, data);
    return response.data;
  },

  // Add a task to a change
  async addTask(
    changeId: string,
    data: AddTaskData
  ): Promise<ChangeRequest> {
    const response = await api.post(`/changes/${changeId}/tasks`, data);
    return response.data;
  },

  // Update a task
  async updateTask(
    changeId: string,
    taskId: string,
    data: UpdateTaskData
  ): Promise<ChangeRequest> {
    const response = await api.patch(`/changes/${changeId}/tasks/${taskId}`, data);
    return response.data;
  },

  // Delete a task
  async deleteTask(
    changeId: string,
    taskId: string
  ): Promise<ChangeRequest> {
    const response = await api.delete(`/changes/${changeId}/tasks/${taskId}`);
    return response.data;
  },

  // Add a comment to a change
  async addComment(
    changeId: string, 
    data: CreateCommentData
  ): Promise<Comment> {
    const response = await api.post(`/changes/${changeId}/comments`, data);
    return response.data;
  },

  // Get change metrics
  async getMetrics(): Promise<ChangeMetrics> {
    const response = await api.get('/changes/metrics');
    return response.data;
  },

  // Get changes requiring my approval
  async getMyApprovals(
    page = 1,
    limit = 10
  ): Promise<PaginatedChanges> {
    const response = await api.get(`/changes/approvals?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get changes I own
  async getMyChanges(
    filters: Partial<ChangeFilters> = {},
    page = 1,
    limit = 10
  ): Promise<PaginatedChanges> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.entries(filters).reduce((acc, [key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => acc.append(key, v));
        } else if (value !== undefined && value !== null) {
          acc.append(key, value);
        }
        return acc;
      }, new URLSearchParams())
    });

    const response = await api.get(`/changes/me?${params.toString()}`);
    return response.data;
  },

  // Get changes I'm involved in (CAB, assignee, etc.)
  async getInvolvedChanges(
    filters: Partial<ChangeFilters> = {},
    page = 1,
    limit = 10
  ): Promise<PaginatedChanges> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.entries(filters).reduce((acc, [key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => acc.append(key, v));
        } else if (value !== undefined && value !== null) {
          acc.append(key, value);
        }
        return acc;
      }, new URLSearchParams())
    });

    const response = await api.get(`/changes/involved?${params.toString()}`);
    return response.data;
  },

  // Delete a change (soft delete)
  async deleteChange(id: string): Promise<void> {
    await api.delete(`/changes/${id}`);
  },

  // Export changes to CSV
  async exportChanges(filters: Partial<ChangeFilters> = {}): Promise<Blob> {
    const response = await api.get('/changes/export', {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  }
};
