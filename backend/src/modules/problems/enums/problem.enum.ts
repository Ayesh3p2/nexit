export enum ProblemStatus {
  IDENTIFIED = 'identified',
  ANALYZING = 'analyzing',
  ROOT_CAUSE_IDENTIFIED = 'root_cause_identified',
  WORKAROUND_AVAILABLE = 'workaround_available',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  REOPENED = 'reopened',
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

export enum ProblemActionType {
  STATUS_CHANGE = 'status_change',
  ASSIGNMENT = 'assignment',
  COMMENT = 'comment',
  ROOT_CAUSE_UPDATE = 'root_cause_update',
  SOLUTION_UPDATE = 'solution_update',
  RELATED_INCIDENT_ADDED = 'related_incident_added',
  RELATED_INCIDENT_REMOVED = 'related_incident_removed',
}
