import { UserRole } from '../../../types';

export enum IncidentStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

export enum IncidentPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum IncidentImpact {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
}

export interface Comment {
  id: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
  user: Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'avatar'>;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  impact: IncidentImpact;
  reportedBy: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
  assignedTo?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'> | null;
  comments?: Comment[];
  resolutionNotes?: string;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface IncidentFilters {
  status?: IncidentStatus[];
  priority?: IncidentPriority[];
  impact?: IncidentImpact[];
  assignedTo?: string[];
  reportedBy?: string[];
  search?: string;
}

export interface PaginatedIncidents {
  items: Incident[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateIncidentData {
  title: string;
  description: string;
  priority: IncidentPriority;
  impact: IncidentImpact;
  assignedToId?: string;
}

export interface UpdateIncidentStatusData {
  status: IncidentStatus;
  comment?: string;
}

export interface AssignIncidentData {
  assigneeId: string;
  comment?: string;
}

export interface CreateCommentData {
  content: string;
  isInternal: boolean;
}
