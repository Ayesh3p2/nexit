import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsEnum, 
  IsUUID, 
  IsArray, 
  ValidateNested, 
  IsObject,
  IsDateString
} from 'class-validator';
import { Type } from 'class-transformer';
import { 
  IncidentPriority, 
  IncidentImpact, 
  IncidentStatus 
} from '../enums/incident.enum';

export class CreateIncidentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(IncidentPriority)
  @IsOptional()
  priority?: IncidentPriority = IncidentPriority.MEDIUM;

  @IsEnum(IncidentImpact)
  @IsOptional()
  impact?: IncidentImpact = IncidentImpact.MEDIUM;

  @IsUUID()
  @IsOptional()
  assignedToId?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[] = [];
}

export class CreateIncidentCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsBoolean()
  @IsOptional()
  isInternal: boolean = false;
}

export class UpdateIncidentStatusDto {
  @IsEnum(IncidentStatus)
  @IsNotEmpty()
  status: IncidentStatus;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsBoolean()
  @IsOptional()
  notifyUser: boolean = true;
}

export class AssignIncidentDto {
  @IsUUID()
  @IsNotEmpty()
  assigneeId: string;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsBoolean()
  @IsOptional()
  notifyUser: boolean = true;
}

export class IncidentFilterDto {
  @IsOptional()
  @IsArray()
  @IsEnum(IncidentStatus, { each: true })
  @Type(() => String)
  status?: IncidentStatus[];

  @IsOptional()
  @IsArray()
  @IsEnum(IncidentPriority, { each: true })
  @Type(() => String)
  priority?: IncidentPriority[];

  @IsOptional()
  @IsArray()
  @IsEnum(IncidentImpact, { each: true })
  @Type(() => String)
  impact?: IncidentImpact[];

  @IsUUID()
  @IsOptional()
  assignedToId?: string;

  @IsUUID()
  @IsOptional()
  reportedById?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  includeClosed: boolean = false;
}
