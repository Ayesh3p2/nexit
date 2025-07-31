import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  ForbiddenException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not, FindOptionsWhere } from 'typeorm';
import { UserRole } from '../users/enums/user-role.enum';
import { Incident } from './entities/incident.entity';
import { Comment } from './entities/comment.entity';
import { User } from '../users/entities/user.entity';
import { 
  CreateIncidentDto, 
  UpdateIncidentStatusDto, 
  AssignIncidentDto, 
  IncidentFilterDto,
  CreateIncidentCommentDto
} from './dto/create-incident.dto';
import { 
  IncidentStatus, 
  isValidStatusTransition 
} from './enums/incident.enum';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { IPaginatedResult } from '../../common/interfaces/paginated-result.interface';

@Injectable()
export class IncidentsService {
  constructor(
    @InjectRepository(Incident)
    private readonly incidentRepository: Repository<Incident>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createIncidentDto: CreateIncidentDto, reportedBy: User): Promise<Incident> {
    const incident = this.incidentRepository.create({
      ...createIncidentDto,
      reportedBy,
      status: IncidentStatus.OPEN,
    });

    // If assignedToId is provided, validate the assignee exists
    if (createIncidentDto.assignedToId) {
      const assignee = await this.userRepository.findOne({
        where: { id: createIncidentDto.assignedToId },
      });
      
      if (!assignee) {
        throw new BadRequestException('Assignee not found');
      }
      
      incident.assignedTo = assignee;
    }

    return this.incidentRepository.save(incident);
  }

  async findAll(
    filter: IncidentFilterDto,
    pagination: PaginationDto,
    _currentUser: User // Prefix with underscore to indicate it's intentionally unused
  ): Promise<IPaginatedResult<Incident>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;
    const skip = (page - 1) * limit;
    
    const where: FindOptionsWhere<Incident> = {};
    
    // Apply filters
    if (filter.status?.length) {
      where.status = In(filter.status);
    } else if (!filter.includeClosed) {
      where.status = Not(In([IncidentStatus.CLOSED, IncidentStatus.CANCELLED]));
    }
    
    if (filter.priority?.length) {
      where.priority = In(filter.priority);
    }
    
    if (filter.impact?.length) {
      where.impact = In(filter.impact);
    }
    
    if (filter.assignedToId) {
      where.assignedTo = { id: filter.assignedToId };
    }
    
    if (filter.reportedById) {
      where.reportedBy = { id: filter.reportedById };
    }
    
    if (filter.startDate || filter.endDate) {
      where.createdAt = {} as any;
      if (filter.startDate) where.createdAt = { ...where.createdAt, $gte: new Date(filter.startDate) } as any;
      if (filter.endDate) where.createdAt = { ...where.createdAt, $lte: new Date(filter.endDate) } as any;
    }
    
    if (filter.search) {
      where.title = { $like: `%${filter.search}%` } as any;
    }
    
    if (filter.tags?.length) {
      where.metadata = { tags: { $contains: filter.tags } } as any;
    }
    
    const [items, total] = await this.incidentRepository.findAndCount({
      where,
      relations: ['reportedBy', 'assignedTo'],
      order: { [sortBy]: sortOrder },
      skip,
      take: limit,
    });
    
    // Return data in IPaginatedResult format with proper pagination metadata
    const totalPages = Math.ceil(total / limit);
    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
      },
      links: {
        first: `?page=1&limit=${limit}`,
        previous: page > 1 ? `?page=${page - 1}&limit=${limit}` : null,
        next: page < totalPages ? `?page=${page + 1}&limit=${limit}` : null,
        last: `?page=${totalPages}&limit=${limit}`,
      }
    };
  }

  async findOne(id: string, currentUser: User): Promise<Incident> {
    const incident = await this.incidentRepository.findOne({
      where: { id },
      relations: ['reportedBy', 'assignedTo', 'comments', 'comments.user'],
    });
    
    if (!incident) {
      throw new NotFoundException(`Incident with ID ${id} not found`);
    }
    
    // Check if user has permission to view this incident
    this.checkIncidentAccess(incident, currentUser);
    
    return incident;
  }
  
  private checkIncidentAccess(incident: Incident, user: User): void {
    // Admins can access all incidents
    if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) return;
    
    // Users can access their own reported or assigned incidents
    const isOwner = incident.reportedBy.id === user.id;
    const isAssigned = incident.assignedTo?.id === user.id;
    
    if (!isOwner && !isAssigned) {
      throw new ForbiddenException('You do not have permission to access this incident');
    }
  }

  async updateStatus(
    id: string, 
    updateStatusDto: UpdateIncidentStatusDto, 
    currentUser: User
  ): Promise<Incident> {
    const incident = await this.incidentRepository.findOne({
      where: { id },
      relations: ['reportedBy', 'assignedTo'],
    });

    if (!incident) {
      throw new NotFoundException(`Incident with ID ${id} not found`);
    }

    // Check permissions
    if (incident.assignedTo?.id !== currentUser.id && 
        incident.reportedBy.id !== currentUser.id && 
        currentUser.role !== UserRole.ADMIN && 
        currentUser.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('You do not have permission to update this incident');
    }

    // Validate status transition
    if (!isValidStatusTransition(incident.status, updateStatusDto.status)) {
      throw new BadRequestException(
        `Invalid status transition from ${incident.status} to ${updateStatusDto.status}`
      );
    }

    // Handle resolution
    if (updateStatusDto.status === IncidentStatus.RESOLVED && !incident.resolvedAt) {
      incident.resolvedAt = new Date();
      if (updateStatusDto.comment) {
        incident.resolutionNotes = updateStatusDto.comment;
      }
    }

    incident.status = updateStatusDto.status;
    
    // Add status change comment if provided
    if (updateStatusDto.comment) {
      const comment = this.commentRepository.create({
        content: updateStatusDto.comment,
        isInternal: true,
        user: currentUser,
        incident,
      });
      await this.commentRepository.save(comment);
    }

    return this.incidentRepository.save(incident);
  }

  async assignIncident(
    id: string, 
    assignDto: AssignIncidentDto, 
    currentUser: User
  ): Promise<Incident> {
    const [incident, assignee] = await Promise.all([
      this.incidentRepository.findOne({
        where: { id },
        relations: ['reportedBy', 'assignedTo'],
      }),
      this.userRepository.findOne({
        where: { id: assignDto.assigneeId },
      }),
    ]);

    if (!incident) {
      throw new NotFoundException(`Incident with ID ${id} not found`);
    }

    if (!assignee) {
      throw new BadRequestException('Assignee not found');
    }

    // Check permissions - only admins or current assignee can reassign
    const isAdmin = currentUser.role === UserRole.ADMIN;
    const isCurrentAssignee = incident.assignedTo?.id === currentUser.id;
    
    if (!isAdmin && !isCurrentAssignee) {
      throw new ForbiddenException('You do not have permission to assign this incident');
    }

    // Add assignment comment if provided
    if (assignDto.comment && incident) {
      const comment = this.commentRepository.create({
        content: assignDto.comment,
        isInternal: true,
        userId: currentUser.id,
        user: currentUser,
        incidentId: incident.id,
        incident,
      });
      await this.commentRepository.save(comment);
    }

    // Update assignee
    incident.assignedTo = assignee;
    
    // If incident was unassigned before, update status to in progress
    if (incident.assignedTo && incident.status === IncidentStatus.OPEN) {
      incident.status = IncidentStatus.IN_PROGRESS;
    }

    return this.incidentRepository.save(incident);
  }

  async addComment(
    id: string, 
    createCommentDto: CreateIncidentCommentDto, 
    currentUser: User
  ): Promise<Comment> {
    const incident = await this.incidentRepository.findOne({
      where: { id },
      relations: ['reportedBy', 'assignedTo'],
    });

    if (!incident) {
      throw new NotFoundException(`Incident with ID ${id} not found`);
    }

    // Check permissions
    this.checkIncidentAccess(incident, currentUser);

    const comment = this.commentRepository.create({
      ...createCommentDto,
      user: currentUser,
      incident,
    });

    return this.commentRepository.save(comment);
  }

  async remove(id: string, currentUser: User): Promise<void> {
    const incident = await this.incidentRepository.findOne({
      where: { id },
      relations: ['reportedBy'],
    });

    if (!incident) {
      throw new NotFoundException(`Incident with ID ${id} not found`);
    }

    // Only admins or the reporter can delete
    if (incident.reportedBy.id !== currentUser.id && currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You do not have permission to delete this incident');
    }
    await this.incidentRepository.softRemove(incident);
  }

  async getIncidentStats(): Promise<{
    open: number;
    inProgress: number;
    onHold: number;
    resolved: number;
    closed: number;
    cancelled: number;
    total: number;
  }> {
    const stats = await this.incidentRepository
      .createQueryBuilder('incident')
      .select('incident.status', 'status')
      .addSelect('COUNT(incident.id)', 'count')
      .groupBy('incident.status')
      .getRawMany();

    const result = {
      open: 0,
      inProgress: 0,
      onHold: 0,
      resolved: 0,
      closed: 0,
      cancelled: 0,
      total: 0,
    };

    stats.forEach(stat => {
      const status = stat.status.toLowerCase() as keyof typeof result;
      if (status in result) {
        const count = parseInt(stat.count, 10);
        result[status] = count;
        result.total += count;
      }
    });

    return result;
  }
}
