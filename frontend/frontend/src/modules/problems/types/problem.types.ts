import { UserRole } from '../../../types';
import { Incident } from '../../incidents';

export enum ProblemStatus {
  IDENTIFIED = 'identified',
  IN_ANALYSIS = 'in_analysis',
  KNOWN_ERROR = 'known_error',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum ProblemPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ProblemImpact {
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

export interface ProblemEvent {
  id: string;
  type: ProblemStatus | 'comment' | 'assignment' | 'workaround' | 'solution';
  description?: string;
  comment?: string;
  isWorkaround?: boolean;
  user: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
  timestamp: string;
  previousStatus?: ProblemStatus;
  newStatus?: ProblemStatus;
  metadata?: Record<string, unknown>;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  status: ProblemStatus;
  priority: ProblemPriority;
  impact: ProblemImpact;
  rootCause?: string;
  workaround?: string;
  solution?: string;
  relatedIncidents: Pick<Incident, 'id' | 'title' | 'status'>[];
  assignedTo?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'> | null;
  reportedBy: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
  comments?: Comment[];
  events?: ProblemEvent[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  closedAt?: string | null;
}

export interface ProblemFilters {
  status?: ProblemStatus[];
  priority?: ProblemPriority[];
  impact?: ProblemImpact[];
  assignedTo?: string[];
  reportedBy?: string[];
  search?: string;
}

export interface PaginatedProblems {
  items: Problem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateProblemData {
  title: string;
  description: string;
  priority: ProblemPriority;
  impact: ProblemImpact;
  rootCause?: string;
  workaround?: string;
  relatedIncidentIds?: string[];
  assignedToId?: string;
}

export interface UpdateProblemStatusData {
  status: ProblemStatus;
  comment?: string;
  isWorkaround?: boolean;
}

export interface AssignProblemData {
  assigneeId: string;
  comment?: string;
}

export interface AddWorkaroundData {
  workaround: string;
  comment?: string;
}

export interface AddSolutionData {
  solution: string;
  comment?: string;
}

export interface CreateCommentData {
  content: string;
  isInternal: boolean;
}
