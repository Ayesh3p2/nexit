import { 
  Body, 
  Controller, 
  Delete, 
  Get, 
  Param, 
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
  ParseUUIDPipe
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
  ApiCreatedResponse
} from '@nestjs/swagger';
import { Request } from 'express';

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

type UserResponse = Omit<User, 'password' | 'refreshToken'>;

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
  ): Promise<UserResponse> {
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
    type: Object
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Insufficient permissions' 
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filters: UserFilterDto
  ): Promise<IPaginatedResult<UserResponse>> {
    // Set default values if not provided
    const page = paginationDto.page ?? 1;
    const limit = paginationDto.limit ?? 10;
    
    // Convert pagination to skip/take
    const skip = (page - 1) * limit;
    
    // Create a query object that matches what the service expects
    const query = {
      ...filters,
      skip,
      take: limit
    };
    
    // Call service with proper pagination
    const result = await this.usersService.findAll(query);
    
    // Map the result to remove sensitive data
    const data = result.data.map(user => {
      const { password, refreshToken, ...userWithoutSensitiveData } = user;
      return userWithoutSensitiveData as UserResponse;
    });
    
    // Create the response object matching IPaginatedResult interface
    const totalItems = result.meta?.total ?? 0;
    const totalPages = Math.ceil(totalItems / limit);
    
    return {
      data,
      meta: {
        total: totalItems,
        page,
        limit,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages
      },
      links: {
        // These would be generated based on your API routes
        first: `/users?page=1&limit=${limit}`,
        last: `/users?page=${totalPages}&limit=${limit}`,
        next: page < totalPages ? `/users?page=${page + 1}&limit=${limit}` : null,
        previous: page > 1 ? `/users?page=${page - 1}&limit=${limit}` : null
      }
    };
  }

  @Get('me')
  @ApiOperation({ 
    summary: 'Get current user profile',
    description: 'Retrieve the profile of the currently authenticated user.'
  })
  @ApiOkResponse({ 
    description: 'User profile retrieved successfully',
    type: Object 
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
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'User updated successfully.', type: User })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async updateProfile(
    @Req() req: Request & { user: User },
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponse> {
    // Prevent users from updating their own role
    if (updateUserDto.role) {
      delete updateUserDto.role;
    }
    
    return this.usersService.update(req.user.id, updateUserDto);
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
    @GetCurrentUser() currentUser: User,
  ): Promise<UserResponse> {
    return this.usersService.update(id, updateUserDto, currentUser);
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
  @ApiResponse({ status: 200, description: 'User activated successfully.', type: User })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async activateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @GetCurrentUser() currentUser: User,
  ): Promise<UserResponse> {
    return this.usersService.update(id, { isActive: true }, currentUser);
  }

  @Post(':id/deactivate')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate a user account' })
  @ApiResponse({ status: 200, description: 'User deactivated successfully.', type: User })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async deactivateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @GetCurrentUser() currentUser: User,
  ): Promise<UserResponse> {
    return this.usersService.update(id, { isActive: false }, currentUser);
  }

  @Post(':id/roles/:role')
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign a role to a user' })
  @ApiResponse({ status: 200, description: 'Role assigned successfully.', type: User })
  @ApiResponse({ status: 400, description: 'Invalid role.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async assignRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('role') role: UserRole,
    @GetCurrentUser() currentUser: User,
  ): Promise<UserResponse> {
    if (!Object.values(UserRole).includes(role)) {
      throw new BadRequestException('Invalid role');
    }
    return this.usersService.update(id, { role }, currentUser);
  }
}
