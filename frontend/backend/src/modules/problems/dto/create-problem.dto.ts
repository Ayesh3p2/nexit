import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsEnum, 
  IsArray,
  IsUUID
} from 'class-validator';
import { 
  ProblemPriority, 
  ProblemImpact, 
  ProblemStatus 
} from '../enums/problem.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProblemDto {
  @ApiProperty({ description: 'Problem title', example: 'Server connectivity issues' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ 
    description: 'Detailed description of the problem', 
    example: 'Users are unable to connect to the main application server.' 
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ 
    description: 'Priority level of the problem', 
    enum: ProblemPriority,
    example: ProblemPriority.HIGH,
    required: false
  })
  @IsEnum(ProblemPriority)
  @IsOptional()
  priority?: ProblemPriority = ProblemPriority.MEDIUM;

  @ApiProperty({ 
    description: 'Impact level of the problem', 
    enum: ProblemImpact,
    example: ProblemImpact.HIGH,
    required: false
  })
  @IsEnum(ProblemImpact)
  @IsOptional()
  impact?: ProblemImpact = ProblemImpact.MEDIUM;

  @ApiProperty({ 
    description: 'Initial status of the problem', 
    enum: ProblemStatus,
    example: ProblemStatus.IDENTIFIED,
    required: false
  })
  @IsEnum(ProblemStatus)
  @IsOptional()
  status?: ProblemStatus = ProblemStatus.IDENTIFIED;

  @ApiProperty({ 
    description: 'ID of the user to assign to this problem', 
    required: false 
  })
  @IsUUID()
  @IsOptional()
  assignedToId?: string;

  @ApiProperty({ 
    description: 'IDs of related incidents', 
    type: [String],
    required: false 
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  relatedIncidentIds?: string[] = [];

  @ApiProperty({ 
    description: 'Initial root cause analysis', 
    required: false 
  })
  @IsString()
  @IsOptional()
  rootCause?: string;
}
