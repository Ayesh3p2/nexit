import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Problem } from './entities/problem.entity';
import { CreateProblemDto } from './dto/create-problem.dto';
import { UpdateProblemDto } from './dto/update-problem.dto';
import { User } from '../users/entities/user.entity';
import { ProblemStatus, ProblemActionType } from './enums/problem.enum';

export interface ProblemAction {
  type: ProblemActionType;
  performedBy: User;
  timestamp: Date;
  data?: any;
  comment?: string;
}

@Injectable()
export class ProblemsService {
  constructor(
    @InjectRepository(Problem)
    private readonly problemRepository: Repository<Problem>,
  ) {}

  async create(createProblemDto: CreateProblemDto, reportedBy: User): Promise<Problem> {
    const problem = this.problemRepository.create({
      ...createProblemDto,
      reportedBy,
      status: createProblemDto.status || ProblemStatus.IDENTIFIED,
    });

    return this.problemRepository.save(problem);
  }

  async findAll(
    status?: string[],
    priority?: string[],
    impact?: string[],
    assignedToId?: string,
    reportedById?: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: Problem[]; total: number }> {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status?.length) where.status = In(status);
    if (priority?.length) where.priority = In(priority);
    if (impact?.length) where.impact = In(impact);
    if (assignedToId) where.assignedToId = assignedToId;
    if (reportedById) where.reportedById = reportedById;

    const [data, total] = await this.problemRepository.findAndCount({
      where,
      relations: ['reportedBy', 'assignedTo'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total };
  }

  async findOne(id: string): Promise<Problem> {
    const problem = await this.problemRepository.findOne({
      where: { id },
      relations: ['reportedBy', 'assignedTo'],
    });

    if (!problem) {
      throw new NotFoundException(`Problem with ID ${id} not found`);
    }

    return problem;
  }

  async update(
    id: string,
    updateProblemDto: UpdateProblemDto,
    updatedBy: User,
  ): Promise<Problem> {
    const problem = await this.findOne(id);
    const updates: Partial<Problem> = {};
    const actions: ProblemAction[] = [];

    // Handle status changes
    if (updateProblemDto.status && updateProblemDto.status !== problem.status) {
      actions.push({
        type: ProblemActionType.STATUS_CHANGE,
        performedBy: updatedBy,
        timestamp: new Date(),
        data: {
          from: problem.status,
          to: updateProblemDto.status,
        },
      });
      updates.status = updateProblemDto.status;

      // If status is being set to RESOLVED, set resolvedAt
      if (updateProblemDto.status === ProblemStatus.RESOLVED && !problem.resolvedAt) {
        updates.resolvedAt = new Date();
      }
    }

    // Handle assignment changes
    if (updateProblemDto.assignedToId && updateProblemDto.assignedToId !== problem.assignedToId) {
      actions.push({
        type: ProblemActionType.ASSIGNMENT,
        performedBy: updatedBy,
        timestamp: new Date(),
        data: {
          from: problem.assignedToId,
          to: updateProblemDto.assignedToId,
        },
      });
      updates.assignedToId = updateProblemDto.assignedToId;
    }

    // Handle root cause updates
    if (updateProblemDto.rootCause && updateProblemDto.rootCause !== problem.rootCause) {
      actions.push({
        type: ProblemActionType.ROOT_CAUSE_UPDATE,
        performedBy: updatedBy,
        timestamp: new Date(),
        data: {
          previous: problem.rootCause,
          new: updateProblemDto.rootCause,
        },
      });
      updates.rootCause = updateProblemDto.rootCause;
    }

    // Handle solution updates
    if (updateProblemDto.solution && updateProblemDto.solution !== problem.solution) {
      actions.push({
        type: ProblemActionType.SOLUTION_UPDATE,
        performedBy: updatedBy,
        timestamp: new Date(),
        data: {
          previous: problem.solution,
          new: updateProblemDto.solution,
        },
      });
      updates.solution = updateProblemDto.solution;
    }

    // Handle related incidents
    if (updateProblemDto.addRelatedIncidentIds?.length) {
      const newIncidents = [...new Set([...problem.relatedIncidentIds, ...updateProblemDto.addRelatedIncidentIds])];
      updates.relatedIncidentIds = newIncidents;
      
      actions.push({
        type: ProblemActionType.RELATED_INCIDENT_ADDED,
        performedBy: updatedBy,
        timestamp: new Date(),
        data: {
          addedIncidentIds: updateProblemDto.addRelatedIncidentIds,
        },
      });
    }

    if (updateProblemDto.removeRelatedIncidentIds?.length) {
      const removeIds = updateProblemDto.removeRelatedIncidentIds || [];
      const remainingIncidents = problem.relatedIncidentIds.filter(
        id => !removeIds.includes(id)
      );
      updates.relatedIncidentIds = remainingIncidents;
      
      actions.push({
        type: ProblemActionType.RELATED_INCIDENT_REMOVED,
        performedBy: updatedBy,
        timestamp: new Date(),
        data: {
          removedIncidentIds: removeIds,
        },
      });
    }

    // Apply all updates
    await this.problemRepository.save({
      ...problem,
      ...updates,
    });

    // Here you might want to save the actions to a separate table or log them
    // For example: await this.problemActionRepository.save(actions.map(action => ({ ...action, problemId: id })));

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.problemRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Problem with ID ${id} not found`);
    }
  }

  async getProblemsAssignedToUser(userId: string): Promise<Problem[]> {
    return this.problemRepository.find({
      where: { assignedToId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getProblemsReportedByUser(userId: string): Promise<Problem[]> {
    return this.problemRepository.find({
      where: { reportedById: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getProblemsByStatus(status: ProblemStatus): Promise<Problem[]> {
    return this.problemRepository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }
}
