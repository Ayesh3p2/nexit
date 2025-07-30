import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Delete,
  Patch,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { IncidentsService } from './incidents.service';
import { 
  CreateIncidentDto, 
  UpdateIncidentStatusDto, 
  AssignIncidentDto, 
  IncidentFilterDto,
  CreateIncidentCommentDto
} from './dto/create-incident.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { GetCurrentUser } from '../auth/decorators/get-current-user.decorator';
import { User } from '../users/entities/user.entity';
import { Incident } from './entities/incident.entity';
import { Comment } from './entities/comment.entity';
import { IPaginatedResult } from '../../common/interfaces/paginated-result.interface';

@ApiTags('incidents')
@Controller('incidents')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  @ApiOperation({ summary: 'Create a new incident' })
  @ApiResponse({ status: 201, description: 'The incident has been successfully created.', type: Incident })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async create(
    @Body() createIncidentDto: CreateIncidentDto,
    @GetCurrentUser() user: User,
  ): Promise<Incident> {
    return this.incidentsService.create(createIncidentDto, user);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  @ApiOperation({ summary: 'Get all incidents with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Return all incidents.', type: [Incident] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  async findAll(
    @Query() filter: IncidentFilterDto,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
    @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy = 'createdAt',
    @Query('sortOrder', new DefaultValuePipe('DESC')) sortOrder: 'ASC' | 'DESC' = 'DESC',
    @GetCurrentUser() user: User,
  ): Promise<IPaginatedResult<Incident>> {
    return this.incidentsService.findAll(
      filter,
      { page, limit, sortBy, sortOrder },
      user,
    );
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get incident statistics' })
  @ApiResponse({ status: 200, description: 'Return incident statistics.' })
  async getStats() {
    return this.incidentsService.getIncidentStats();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  @ApiOperation({ summary: 'Get an incident by ID' })
  @ApiResponse({ status: 200, description: 'Return the incident.', type: Incident })
  @ApiResponse({ status: 404, description: 'Incident not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetCurrentUser() user: User,
  ): Promise<Incident> {
    return this.incidentsService.findOne(id, user);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update incident status' })
  @ApiResponse({ status: 200, description: 'The incident status has been updated.', type: Incident })
  @ApiResponse({ status: 400, description: 'Invalid status transition.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Incident not found.' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateIncidentStatusDto,
    @GetCurrentUser() user: User,
  ): Promise<Incident> {
    return this.incidentsService.updateStatus(id, updateStatusDto, user);
  }

  @Patch(':id/assign')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign an incident to a user' })
  @ApiResponse({ status: 200, description: 'The incident has been assigned.', type: Incident })
  @ApiResponse({ status: 400, description: 'Invalid assignee.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Incident not found.' })
  async assign(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignDto: AssignIncidentDto,
    @GetCurrentUser() user: User,
  ): Promise<Incident> {
    return this.incidentsService.assignIncident(id, assignDto, user);
  }

  @Post(':id/comments')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  @ApiOperation({ summary: 'Add a comment to an incident' })
  @ApiResponse({ status: 201, description: 'The comment has been added.', type: Comment })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Incident not found.' })
  async addComment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createCommentDto: CreateIncidentCommentDto,
    @GetCurrentUser() user: User,
  ): Promise<Comment> {
    return this.incidentsService.addComment(id, createCommentDto, user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an incident' })
  @ApiResponse({ status: 204, description: 'The incident has been deleted.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Incident not found.' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetCurrentUser() user: User,
  ): Promise<void> {
    return this.incidentsService.remove(id, user);
  }
}
