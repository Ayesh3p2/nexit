import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import * as bcrypt from 'bcrypt';

// Entities
import { Incident } from '../../src/modules/incidents/entities/incident.entity';
import { Comment } from '../../src/modules/incidents/entities/comment.entity';
import { User } from '../../src/modules/users/entities/user.entity';

// Services
import { IncidentsService } from '../../src/modules/incidents/incidents.service';
import { UsersService } from '../../src/modules/users/users.service';

// Modules
import { IncidentsModule } from '../../src/modules/incidents/incidents.module';
import { UsersModule } from '../../src/modules/users/users.module';
import { AuthModule } from '../../src/modules/auth/auth.module';

// DTOs
import { CreateIncidentDto } from '../../src/modules/incidents/dto/create-incident.dto';
import { UserRole } from '../../src/modules/users/enums/user-role.enum';

export const createTestingModule = async () => {
  const module: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: ['.env.test'],
      }),
      TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          type: 'sqlite',
          database: ':memory:',
          entities: [Incident, Comment, User],
          synchronize: true,
          logging: false,
        }),
        inject: [ConfigService],
      }),
      TypeOrmModule.forFeature([Incident, Comment, User]),
      IncidentsModule,
      UsersModule,
      AuthModule,
    ],
    providers: [IncidentsService, UsersService],
  }).compile();

  return module;
};

export const createTestUser = async (
  usersService: UsersService,
  userData: Partial<User> = {},
): Promise<User> => {
  const defaultUser = {
    email: userData.email || 'test@example.com',
    password: await bcrypt.hash('password123', 10),
    firstName: userData.firstName || 'Test',
    lastName: userData.lastName || 'User',
    role: userData.role || UserRole.USER,
    isActive: userData.isActive !== undefined ? userData.isActive : true,
  };

  return usersService.create({
    ...defaultUser,
    ...userData,
  });
};

export const createTestIncident = async (
  incidentsService: IncidentsService,
  reporter: User,
  incidentData: Partial<CreateIncidentDto> = {},
): Promise<Incident> => {
  const defaultData: CreateIncidentDto = {
    title: 'Test Incident',
    description: 'This is a test incident',
    priority: 'medium',
    impact: 'medium',
    ...incidentData,
  };

  return incidentsService.create(defaultData, reporter);
};

export const clearDatabase = async (module: TestingModule) => {
  const incidentRepo = module.get<Repository<Incident>>(
    getRepositoryToken(Incident),
  );
  const commentRepo = module.get<Repository<Comment>>(getRepositoryToken(Comment));
  const userRepo = module.get<Repository<User>>(getRepositoryToken(User));

  await commentRepo.clear();
  await incidentRepo.clear();
  await userRepo.clear();
};
