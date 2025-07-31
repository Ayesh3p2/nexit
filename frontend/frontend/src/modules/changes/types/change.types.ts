import { UserRole } from '../../../types';

export enum ChangeStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  IN_REVIEW = 'in_review',
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  IMPLEMENTED = 'implemented',
  REJECTED = 'rejected',
  CLOSED = 'closed',
  FAILED = 'failed',
  ROLLED_BACK = 'rolled_back'
}

export enum ChangeType {
  STANDARD = 'standard',
  NORMAL = 'normal',
  EMERGENCY = 'emergency',
  MAJOR = 'major'
}

export enum ChangePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ChangeImpact {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  ENTERPRISE = 'enterprise'
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  NOT_REQUIRED = 'not_required'
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  EXTREME = 'extreme'
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

export interface Approval {
  id: string;
  approver: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
  status: ApprovalStatus;
  comments: string;
  approvedAt?: string;
  required: boolean;
  order: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignee?: Pick<User, 'id' | 'firstName' | 'lastName'>;
  dueDate?: string;
  completedAt?: string;
  order: number;
}

export interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  status: ChangeStatus;
  type: ChangeType;
  priority: ChangePriority;
  impact: ChangeImpact;
  riskLevel: RiskLevel;
  riskAssessment: string;
  implementationPlan: string;
  backoutPlan: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  reasonForChange: string;
  expectedOutcome: string;
  actualOutcome?: string;
  createdBy: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
  changeOwner: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
  changeAdvisoryBoard?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>[];
  approvals: Approval[];
  tasks: Task[];
  relatedChanges: Pick<ChangeRequest, 'id' | 'title' | 'status'>[];
  relatedIncidents: { id: string; title: string }[];
  relatedProblems: { id: string; title: string }[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

export interface ChangeFilters {
  status?: ChangeStatus[];
  type?: ChangeType[];
  priority?: ChangePriority[];
  impact?: ChangeImpact[];
  createdBy?: string[];
  changeOwner?: string[];
  search?: string;
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface PaginatedChanges {
  items: ChangeRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateChangeData {
  title: string;
  description: string;
  type: ChangeType;
  priority: ChangePriority;
  impact: ChangeImpact;
  reasonForChange: string;
  expectedOutcome: string;
  scheduledStart: string;
  scheduledEnd: string;
  changeOwnerId: string;
  changeAdvisoryBoardIds?: string[];
  riskAssessment?: string;
  implementationPlan?: string;
  backoutPlan?: string;
  relatedChangeIds?: string[];
  relatedIncidentIds?: string[];
  relatedProblemIds?: string[];
}

export interface UpdateChangeStatusData {
  status: ChangeStatus;
  comment?: string;
}

export interface SubmitForApprovalData {
  approvers: Array<{
    userId: string;
    required: boolean;
    order: number;
  }>;
  comment?: string;
}

export interface ApproveChangeData {
  approvalId: string;
  approved: boolean;
  comment?: string;
}

export interface AddTaskData {
  title: string;
  description: string;
  assigneeId?: string;
  dueDate?: string;
}

export interface UpdateTaskData {
  status?: 'pending' | 'in_progress' | 'completed' | 'failed';
  assigneeId?: string | null;
  dueDate?: string;
  completedAt?: string | null;
}

export interface CreateCommentData {
  content: string;
  isInternal: boolean;
}

export interface ChangeMetrics {
  total: number;
  byStatus: Record<ChangeStatus, number>;
  byType: Record<ChangeType, number>;
  byPriority: Record<ChangePriority, number>;
  byImpact: Record<ChangeImpact, number>;
  successRate: number;
  averageImplementationTime: number;
  rollbackRate: number;
}
