import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { ProblemStatus, ProblemPriority, ProblemImpact } from '../enums/problem.enum';

@Entity('problems')
export class Problem extends BaseEntity {
  @ApiProperty({ description: 'Problem title', example: 'Server connectivity issues' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Detailed description of the problem', example: 'Users are unable to connect to the main application server.' })
  @Column('text')
  description: string;

  @ApiProperty({ 
    description: 'Current status of the problem', 
    enum: ProblemStatus,
    example: ProblemStatus.IDENTIFIED 
  })
  @Column({
    type: 'enum',
    enum: ProblemStatus,
    default: ProblemStatus.IDENTIFIED
  })
  status: ProblemStatus;

  @ApiProperty({ 
    description: 'Priority level of the problem', 
    enum: ProblemPriority,
    example: ProblemPriority.HIGH 
  })
  @Column({
    type: 'enum',
    enum: ProblemPriority,
    default: ProblemPriority.MEDIUM
  })
  priority: ProblemPriority;

  @ApiProperty({ 
    description: 'Impact level of the problem', 
    enum: ProblemImpact,
    example: ProblemImpact.HIGH 
  })
  @Column({
    type: 'enum',
    enum: ProblemImpact,
    default: ProblemImpact.MEDIUM
  })
  impact: ProblemImpact;

  @ApiProperty({ description: 'ID of the user who reported the problem' })
  @Column({ name: 'reported_by_id' })
  reportedById: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reported_by_id' })
  reportedBy: User;

  @ApiProperty({ description: 'ID of the user assigned to the problem', required: false })
  @Column({ name: 'assigned_to_id', nullable: true })
  assignedToId?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'assigned_to_id' })
  assignedTo?: User;

  @ApiProperty({ description: 'Root cause analysis', required: false })
  @Column({ type: 'text', nullable: true })
  rootCause?: string;

  @ApiProperty({ description: 'Solution or workaround', required: false })
  @Column({ type: 'text', nullable: true })
  solution?: string;

  @ApiProperty({ description: 'Date when the problem was resolved', required: false })
  @Column({ type: 'timestamp', nullable: true })
  resolvedAt?: Date;

  @ApiProperty({ description: 'Related incident IDs', type: [String], required: false })
  @Column('text', { array: true, default: [] })
  relatedIncidentIds: string[];

  // Additional fields can be added as needed
}
