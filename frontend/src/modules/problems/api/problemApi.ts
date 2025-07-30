import axios from 'axios';
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

export const problemApi = {
  // Get all problems with pagination and filtering
  async getProblems(
    filters: Partial<ProblemFilters> = {},
    page = 1,
    limit = 10
  ): Promise<PaginatedProblems> {
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

    const response = await api.get(`/problems?${params.toString()}`);
    return response.data;
  },

  // Get a single problem by ID
  async getProblemById(id: string): Promise<Problem> {
    const response = await api.get(`/problems/${id}`);
    return response.data;
  },

  // Create a new problem
  async createProblem(data: CreateProblemData): Promise<Problem> {
    const response = await api.post('/problems', data);
    return response.data;
  },

  // Update problem status
  async updateProblemStatus(
    id: string, 
    data: UpdateProblemStatusData
  ): Promise<Problem> {
    const response = await api.patch(`/problems/${id}/status`, data);
    return response.data;
  },

  // Assign problem to a user
  async assignProblem(
    id: string, 
    data: AssignProblemData
  ): Promise<Problem> {
    const response = await api.patch(`/problems/${id}/assign`, data);
    return response.data;
  },

  // Add workaround to a problem
  async addWorkaround(
    id: string,
    data: AddWorkaroundData
  ): Promise<Problem> {
    const response = await api.patch(`/problems/${id}/workaround`, data);
    return response.data;
  },

  // Add solution to a problem
  async addSolution(
    id: string,
    data: AddSolutionData
  ): Promise<Problem> {
    const response = await api.patch(`/problems/${id}/solution`, data);
    return response.data;
  },

  // Add a comment to a problem
  async addComment(
    problemId: string, 
    data: CreateCommentData
  ): Promise<Comment> {
    const response = await api.post(`/problems/${problemId}/comments`, data);
    return response.data;
  },

  // Delete a problem (soft delete)
  async deleteProblem(id: string): Promise<void> {
    await api.delete(`/problems/${id}`);
  },

  // Link incident to problem
  async linkIncident(
    problemId: string,
    incidentId: string
  ): Promise<Problem> {
    const response = await api.post(`/problems/${problemId}/incidents/${incidentId}`);
    return response.data;
  },

  // Unlink incident from problem
  async unlinkIncident(
    problemId: string,
    incidentId: string
  ): Promise<Problem> {
    const response = await api.delete(`/problems/${problemId}/incidents/${incidentId}`);
    return response.data;
  }
};
