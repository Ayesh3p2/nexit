import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Problem } from './entities/problem.entity';
import { ProblemsService } from './problems.service';
import { ProblemsController } from './problems.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Problem])],
  controllers: [ProblemsController],
  providers: [ProblemsService],
  exports: [ProblemsService],
})
export class ProblemsModule {}
