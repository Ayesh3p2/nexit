import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { IncidentStatus, IncidentPriority, IncidentImpact } from '../enums/incident.enum';
import { Comment } from './comment.entity';

@Entity('incidents')
export class Incident extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ 
    type: 'enum', 
    enum: IncidentStatus, 
    default: IncidentStatus.OPEN 
  })
  status: IncidentStatus;

  @Column({ 
    type: 'enum', 
    enum: IncidentPriority, 
    default: IncidentPriority.MEDIUM 
  })
  priority: IncidentPriority;

  @Column({ 
    type: 'enum', 
    enum: IncidentImpact, 
    default: IncidentImpact.MEDIUM 
  })
  impact: IncidentImpact;

  @Column({ type: 'uuid', name: 'assigned_to_id', nullable: true })
  assignedToId: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_to_id' })
  assignedTo: User;

  @Column({ type: 'uuid', name: 'reported_by_id' })
  reportedById: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reported_by_id' })
  reportedBy: User;

  @Column({ type: 'timestamp', name: 'resolved_at', nullable: true })
  resolvedAt: Date;

  @Column({ type: 'text', name: 'resolution_notes', nullable: true })
  resolutionNotes: string;

  @OneToMany(() => Comment, comment => comment.incident, { cascade: true })
  comments: Comment[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // Helper methods
  isAssigned(): boolean {
    return !!this.assignedToId;
  }

  isResolved(): boolean {
    return this.status === IncidentStatus.RESOLVED || this.status === IncidentStatus.CLOSED;
  }

  canBeModified(): boolean {
    return ![
      IncidentStatus.RESOLVED, 
      IncidentStatus.CLOSED, 
      IncidentStatus.CANCELLED
    ].includes(this.status);
  }
}
