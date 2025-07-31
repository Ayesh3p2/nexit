import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';
import { Incident } from './entities/incident.entity';
import { Comment } from './entities/comment.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Incident,
      Comment,
      // Add User entity for UserRepository injection
      require('../users/entities/user.entity').User
    ]),
    UsersModule,
  ],
  controllers: [IncidentsController],
  providers: [IncidentsService],
  exports: [IncidentsService],
})
export class IncidentsModule {}
