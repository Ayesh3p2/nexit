import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, VersionColumn } from 'typeorm';

export abstract class BaseEntity {
  @ApiProperty({ description: 'Unique identifier', example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Creation timestamp', example: '2023-01-01T00:00:00.000Z' })
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp', example: '2023-01-02T00:00:00.000Z' })
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ApiProperty({ description: 'Entity version number for optimistic locking', example: 1 })
  @VersionColumn({ default: 1 })
  @Exclude({ toPlainOnly: true })
  version: number;

  @ApiProperty({ description: 'Soft delete flag', default: false })
  @Column({ name: 'is_deleted', default: false, select: false })
  @Exclude({ toPlainOnly: true })
  isDeleted: boolean;

  @ApiProperty({ description: 'Timestamp of soft deletion', nullable: true, required: false })
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true, select: false })
  @Exclude({ toPlainOnly: true })
  deletedAt?: Date;

  @ApiProperty({ description: 'User ID who created the record', nullable: true, example: '123e4567-e89b-12d3-a456-426614174000' })
  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @ApiProperty({ description: 'User ID who last updated the record', nullable: true, example: '123e4567-e89b-12d3-a456-426614174000' })
  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy?: string;
}
