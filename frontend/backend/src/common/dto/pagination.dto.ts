import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @ApiProperty({
    description: 'Page number (1-based)',
    minimum: 1,
    default: 1,
    required: false,
  })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
    default: 10,
    required: false,
  })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;

  @ApiProperty({
    description: 'Search query string',
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    description: 'Sort field',
    required: false,
  })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiProperty({
    description: 'Sort direction (asc or desc)',
    enum: ['asc', 'desc'],
    default: 'desc',
    required: false,
  })
  @IsString()
  @IsIn(['asc', 'desc'])
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';

  get skip(): number {
    // Ensure we have valid page and limit values before calculation
    const page = this.page ?? 1;
    const limit = this.limit ?? 10;
    return (page - 1) * limit;
  }

  get take(): number {
    // Ensure we have a valid limit value before returning
    return this.limit ?? 10;
  }
}
