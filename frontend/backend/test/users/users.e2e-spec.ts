import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppModule } from '../../src/app.module';
import { User } from '../../src/modules/users/entities/user.entity';
import { UserRole } from '../../src/modules/users/enums/user-role.enum';
import { UsersModule } from '../../src/modules/users/users.module';
import { AuthModule } from '../../src/modules/auth/auth.module';
import { JwtAuthGuard } from '../../src/modules/auth/guards/jwt-auth.guard';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let authToken: string;
  let adminUser: User;
  let testUser: User;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get('DB_HOST', 'localhost'),
            port: +configService.get<number>('DB_PORT', 5432),
            username: configService.get('DB_USERNAME', 'postgres'),
            password: configService.get('DB_PASSWORD', 'postgres'),
            database: configService.get('DB_NAME', 'nexit_itsm_test'),
            entities: [User],
            synchronize: true,
            dropSchema: true, // WARNING: This will drop the schema and all data
          }),
          inject: [ConfigService],
        }),
        UsersModule,
        AuthModule,
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET', 'test-secret'),
            signOptions: {
              expiresIn: '1h',
            },
          }),
          inject: [ConfigService],
        }),
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true }) // Mock JWT guard for testing
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    
    // Create test admin user
    adminUser = await userRepository.save({
      email: 'admin@example.com',
      password: 'hashed-password', // In a real test, this should be properly hashed
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      isEmailVerified: true,
      isActive: true,
    });

    // Create test regular user
    testUser = await userRepository.save({
      email: 'test@example.com',
      password: 'hashed-password',
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.USER,
      isEmailVerified: true,
      isActive: true,
    });

    // Get auth token for testing
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password', // This should match the test user's password
      });
    
    authToken = response.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /users', () => {
    it('should return an array of users', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2); // At least admin and test user
    });

    it('should filter users by role', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .query({ role: UserRole.USER })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.data.every((user: User) => user.role === UserRole.USER)).toBe(true);
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${testUser.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('id', testUser.id);
      expect(response.body).toHaveProperty('email', testUser.email);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer())
        .get('/users/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const newUser = {
        email: 'new.user@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        role: UserRole.USER,
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newUser)
        .expect(201);
      
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', newUser.email);
      expect(response.body).not.toHaveProperty('password'); // Password should not be in response
    });

    it('should return 400 for invalid user data', async () => {
      const invalidUser = {
        email: 'invalid-email',
        password: '123', // Too short
      };

      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidUser)
        .expect(400);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update a user', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const response = await request(app.getHttpServer())
        .patch(`/users/${testUser.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body).toHaveProperty('firstName', updateData.firstName);
      expect(response.body).toHaveProperty('lastName', updateData.lastName);
    });

    it('should prevent non-admin from updating role', async () => {
      // Login as regular user
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password',
        });
      
      const userToken = loginResponse.body.accessToken;
      
      await request(app.getHttpServer())
        .patch(`/users/${testUser.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ role: UserRole.ADMIN })
        .expect(403); // Forbidden
    });
  });

  describe('DELETE /users/:id', () => {
    it('should soft delete a user', async () => {
      const userToDelete = await userRepository.save({
        email: 'delete.me@example.com',
        password: 'hashed-password',
        firstName: 'Delete',
        lastName: 'Me',
        role: UserRole.USER,
        isEmailVerified: true,
        isActive: true,
      });

      await request(app.getHttpServer())
        .delete(`/users/${userToDelete.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      const deletedUser = await userRepository.findOne({
        where: { id: userToDelete.id },
        withDeleted: true,
      });
      
      expect(deletedUser).toBeDefined();
      expect(deletedUser.isDeleted).toBe(true);
    });
  });
});
