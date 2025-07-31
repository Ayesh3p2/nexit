import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  UseGuards,
  ParseUUIDPipe,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { GetCurrentUser } from '../auth/decorators/get-current-user.decorator';
import { User } from '../users/entities/user.entity';
import { ProblemsService } from './problems.service';
import { CreateProblemDto } from './dto/create-problem.dto';
import { UpdateProblemDto } from './dto/update-problem.dto';
import { Problem } from './entities/problem.entity';
import { ProblemStatus } from './enums/problem.enum';

export interface ProblemQueryParams {
  status?: string[];
  priority?: string[];
  impact?: string[];
  assignedToId?: string;
  reportedById?: string;
  page?: number;
  limit?: number;
}

@ApiTags('problems')
@Controller('problems')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProblemsController {
  constructor(private readonly problemsService: ProblemsService) {}

  @Post()
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Report a new problem' })
  @ApiResponse({ status: 201, description: 'Problem reported successfully', type: Problem })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() createProblemDto: CreateProblemDto,
    @GetCurrentUser() user: User,
  ): Promise<Problem> {
    return this.problemsService.create(createProblemDto, user);
  }

  @Get()
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Get all problems (with optional filters)' })
  @ApiResponse({ status: 200, description: 'List of problems', type: [Problem] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query() query: ProblemQueryParams,
    @GetCurrentUser() user: User,
  ) {
    // Regular users can only see their own reported or assigned problems
    if (user.role === UserRole.USER) {
      query.reportedById = user.id;
    }
    
    // Support agents can see all problems but can filter by assignedToId
    if (user.role === UserRole.AGENT && !query.assignedToId) {
      query.assignedToId = user.id;
    }

    return this.problemsService.findAll(
      query.status,
      query.priority,
      query.impact,
      query.assignedToId,
      query.reportedById,
      query.page || 1,
      query.limit || 10,
    );
  }

  @Get(':id')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Get a problem by ID' })
  @ApiResponse({ status: 200, description: 'Problem details', type: Problem })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Problem not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetCurrentUser() user: User,
  ): Promise<Problem> {
    const problem = await this.problemsService.findOne(id);
    
    // Regular users can only view their own reported or assigned problems
    if (
      user.role === UserRole.USER && 
      problem.reportedById !== user.id && 
      problem.assignedToId !== user.id
    ) {
      throw new ForbiddenException('You do not have permission to view this problem');
    }

    return problem;
  }

  @Patch(':id')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Update a problem' })
  @ApiResponse({ status: 200, description: 'Problem updated successfully', type: Problem })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Problem not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProblemDto: UpdateProblemDto,
    @GetCurrentUser() user: User,
  ): Promise<Problem> {
    const problem = await this.problemsService.findOne(id);
    
    // Regular users can only update their own reported problems
    if (user.role === UserRole.USER && problem.reportedById !== user.id) {
      throw new ForbiddenException('You can only update problems you reported');
    }

    // Support agents can only update assigned problems
    if (
      user.role === UserRole.AGENT && 
      problem.assignedToId !== user.id &&
      problem.reportedById !== user.id
    ) {
      throw new ForbiddenException('You can only update problems assigned to you');
    }

    return this.problemsService.update(id, updateProblemDto, user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Delete a problem' })
  @ApiResponse({ status: 200, description: 'Problem deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Problem not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetCurrentUser() user: User,
  ): Promise<void> {
    // Only admins can delete problems
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only administrators can delete problems');
    }

    return this.problemsService.remove(id);
  }

  @Get('assigned-to-me')
  @Roles(UserRole.AGENT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get problems assigned to the current user' })
  @ApiResponse({ status: 200, description: 'List of assigned problems', type: [Problem] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAssignedProblems(
    @GetCurrentUser() user: User,
  ): Promise<Problem[]> {
    return this.problemsService.getProblemsAssignedToUser(user.id);
  }

  @Get('reported-by-me')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Get problems reported by the current user' })
  @ApiResponse({ status: 200, description: 'List of reported problems', type: [Problem] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getReportedProblems(
    @GetCurrentUser() user: User,
  ): Promise<Problem[]> {
    return this.problemsService.getProblemsReportedByUser(user.id);
  }

  @Get('status/:status')
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Get problems by status' })
  @ApiResponse({ status: 200, description: 'List of problems with the specified status', type: [Problem] })
  @ApiResponse({ status: 400, description: 'Invalid status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProblemsByStatus(
    @Param('status') status: string,
    @GetCurrentUser() user: User,
  ): Promise<Problem[]> {
    if (!Object.values(ProblemStatus).includes(status as ProblemStatus)) {
      throw new BadRequestException('Invalid problem status');
    }

    // If user is a regular support agent, only show their assigned problems
    if (user.role === UserRole.AGENT) {
      const problems = await this.problemsService.getProblemsByStatus(status as ProblemStatus);
      return problems.filter(p => p.assignedToId === user.id || p.reportedById === user.id);
    }

    return this.problemsService.getProblemsByStatus(status as ProblemStatus);
  }
}
