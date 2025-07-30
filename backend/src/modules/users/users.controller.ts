import { 
  Body, 
  Controller, 
  Delete, 
  Get, 
  Param, 
  ParseUUIDPipe, 
  Patch, 
  Post, 
  Query, 
  UseGuards, 
  UseInterceptors, 
  ClassSerializerInterceptor,
  HttpCode,
  HttpStatus,
  Req,
  BadRequestException,
  ForbiddenException
} from '@nestjs/common';
import { 
  ApiBearerAuth, 
  ApiOperation, 
  ApiResponse, 
  ApiTags, 
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiHeader,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse
} from '@nestjs/swagger';
import { Request, Response } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetCurrentUser } from '../auth/decorators/get-current-user.decorator';
import { UserRole } from './enums/user-role.enum';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { User } from './entities/user.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { IPaginatedResult } from '../../common/interfaces/paginated-result.interface';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth()
@ApiTags('users')
@ApiHeader({
  name: 'Authorization',
  description: 'Bearer token for authentication',
  required: true,
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new user',
    description: 'Create a new user account. Requires admin privileges.'
  })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({ 
    description: 'User successfully created.', 
    type: User 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid input data' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Insufficient permissions' 
  })
  @ApiResponse({ 
    status: HttpStatus.CONFLICT, 
    description: 'Email already in use' 
  })
  async create(
    @Body() createUserDto: CreateUserDto,
    @GetCurrentUser() currentUser: User
  ): Promise<User> {
    return this.usersService.create(createUserDto, currentUser);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  @ApiOperation({ 
    summary: 'Get all users',
    description: 'Retrieve a paginated list of users with optional filtering.'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (1-based)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term for name or email' })
  @ApiQuery({ 
    name: 'role', 
    required: false, 
    enum: UserRole, 
    description: 'Filter by user role' 
  })
  @ApiQuery({ 
    name: 'isActive', 
    required: false, 
    type: Boolean, 
    description: 'Filter by active status' 
  })
  @ApiOkResponse({ 
    description: 'List of users retrieved successfully',
    type: IPaginatedResult<User>
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Insufficient permissions' 
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filters: UserFilterDto,
    @GetCurrentUser() currentUser: User
  ): Promise<IPaginatedResult<User>> {
    // Merge pagination and filters into a single object
    const queryOptions = {
      ...paginationDto,
      ...filters,
      currentUser
    };
    
    return this.usersService.findAll(queryOptions);
  }

  @Get('me')
  @ApiOperation({ 
    summary: 'Get current user profile',
    description: 'Retrieve the profile of the currently authenticated user.'
  })
  @ApiOkResponse({ 
    description: 'User profile retrieved successfully',
    type: User 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'User not found' 
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Unauthorized' 
  })
  async getProfile(@Req() req: Request & { user: User }): Promise<User> {
    return this.usersService.findOne(req.user.id, { withSensitiveData: true });
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  @ApiOperation({ 
    summary: 'Get user by ID',
    description: 'Retrieve a user by their unique identifier.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'User ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiOkResponse({ 
    description: 'User retrieved successfully',
    type: User 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'User not found' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Insufficient permissions' 
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetCurrentUser() currentUser: User
  ): Promise<User> {
    // Regular users can only view their own profile
    if (currentUser.role === UserRole.USER && currentUser.id !== id) {
      throw new ForbiddenException('You can only view your own profile');
    }
    
    // Managers can view users in their department
    if (currentUser.role === UserRole.MANAGER && currentUser.id !== id) {
      const user = await this.usersService.findOne(id);
      if (user.department !== currentUser.department) {
        throw new ForbiddenException('You can only view users in your department');
      }
    }
    
    return this.usersService.findOne(id, { withSensitiveData: currentUser.role === UserRole.ADMIN });
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'User updated successfully.', type: User })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async updateProfile(
    @Req() req: Request,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    // Prevent users from updating their own role
    if (updateUserDto.role) {
      delete updateUserDto.role;
    }
    
    return this.usersService.update((req.user as User).id, updateUserDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully.', type: User })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiResponse({ status: 204, description: 'User deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.usersService.remove(id);
  }

  @Post(':id/activate')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate a user account' })
  @ApiResponse({ status: 200, description: 'User activated successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async activateUser(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.usersService.update(id, { isActive: true });
  }

  @Post(':id/deactivate')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate a user account' })
  @ApiResponse({ status: 200, description: 'User deactivated successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async deactivateUser(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.usersService.update(id, { isActive: false });
  }

  @Post(':id/roles/:role')
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign a role to a user' })
  @ApiResponse({ status: 200, description: 'Role assigned successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid role.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async assignRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('role') role: UserRole,
  ): Promise<User> {
    if (!Object.values(UserRole).includes(role)) {
      throw new BadRequestException('Invalid role');
    }
    return this.usersService.update(id, { role });
  }
}
