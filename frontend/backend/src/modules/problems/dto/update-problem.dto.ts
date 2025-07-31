import { PartialType } from '@nestjs/swagger';
import { CreateProblemDto } from './create-problem.dto';
import { 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsArray,
  IsDateString
} from 'class-validator';
import { 
  ProblemPriority, 
  ProblemImpact, 
  ProblemStatus 
} from '../enums/problem.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProblemDto extends PartialType(CreateProblemDto) {
  @ApiProperty({ 
    description: 'Updated status of the problem', 
    enum: ProblemStatus,
    required: false
  })
  @IsEnum(ProblemStatus)
  @IsOptional()
  status?: ProblemStatus;

  @ApiProperty({ 
    description: 'Updated priority level', 
    enum: ProblemPriority,
    required: false
  })
  @IsEnum(ProblemPriority)
  @IsOptional()
  priority?: ProblemPriority;

  @ApiProperty({ 
    description: 'Updated impact level', 
    enum: ProblemImpact,
    required: false
  })
  @IsEnum(ProblemImpact)
  @IsOptional()
  impact?: ProblemImpact;

  @ApiProperty({ 
    description: 'Updated root cause analysis', 
    required: false 
  })
  @IsString()
  @IsOptional()
  rootCause?: string;

  @ApiProperty({ 
    description: 'Solution or workaround', 
    required: false 
  })
  @IsString()
  @IsOptional()
  solution?: string;

  @ApiProperty({ 
    description: 'Date when the problem was resolved', 
    required: false 
  })
  @IsDateString()
  @IsOptional()
  resolvedAt?: Date;

  @ApiProperty({ 
    description: 'IDs of related incidents to add', 
    type: [String],
    required: false 
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  addRelatedIncidentIds?: string[];

  @ApiProperty({ 
    description: 'IDs of related incidents to remove', 
    type: [String],
    required: false 
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  removeRelatedIncidentIds?: string[];
}
