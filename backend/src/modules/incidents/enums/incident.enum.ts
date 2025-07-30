/**
 * Incident status lifecycle:
 * OPEN -> IN_PROGRESS -> [RESOLVED -> CLOSED] | [CANCELLED]
 *        \-> ON_HOLD -> ...
 */
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

// Helper functions for incident workflow
export const IncidentStatusTransitions: Record<IncidentStatus, IncidentStatus[]> = {
  [IncidentStatus.OPEN]: [
    IncidentStatus.IN_PROGRESS,
    IncidentStatus.ON_HOLD,
    IncidentStatus.RESOLVED,
    IncidentStatus.CANCELLED,
  ],
  [IncidentStatus.IN_PROGRESS]: [
    IncidentStatus.ON_HOLD,
    IncidentStatus.RESOLVED,
    IncidentStatus.CANCELLED,
  ],
  [IncidentStatus.ON_HOLD]: [
    IncidentStatus.IN_PROGRESS,
    IncidentStatus.RESOLVED,
    IncidentStatus.CANCELLED,
  ],
  [IncidentStatus.RESOLVED]: [
    IncidentStatus.CLOSED,
    IncidentStatus.IN_PROGRESS,
  ],
  [IncidentStatus.CLOSED]: [],
  [IncidentStatus.CANCELLED]: [],
};

export function isValidStatusTransition(
  currentStatus: IncidentStatus,
  newStatus: IncidentStatus,
): boolean {
  return IncidentStatusTransitions[currentStatus].includes(newStatus);
}
