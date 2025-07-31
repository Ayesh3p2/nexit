import { ApiProperty } from '@nestjs/swagger';

export interface PaginationMeta {
  @ApiProperty({ description: 'Total number of items', example: 100 })
  total: number;
  
  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number;
  
  @ApiProperty({ description: 'Number of items per page', example: 10 })
  limit: number;
  
  @ApiProperty({ description: 'Total number of pages', example: 10 })
  totalPages: number;
  
  @ApiProperty({ 
    description: 'Whether there is a previous page',
    example: false 
  })
  hasPreviousPage: boolean;
  
  @ApiProperty({ 
    description: 'Whether there is a next page',
    example: true 
  })
  hasNextPage: boolean;
}

export interface PaginatedResult<T> {
  @ApiProperty({ 
    description: 'Array of items for the current page',
    type: [Object],
    isArray: true 
  })
  data: T[];
  
  @ApiProperty({ 
    description: 'Pagination metadata',
    type: Object 
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  
  @ApiProperty({ 
    description: 'Optional links for pagination navigation',
    required: false,
    type: Object 
  })
  links?: {
    first?: string;
    previous?: string;
    next?: string;
    last?: string;
  };
}

// Helper function to create paginated response
export function paginate<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  baseUrl: string,
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;
  
  const result: PaginatedResult<T> = {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    },
  };
  
  // Add navigation links if baseUrl is provided
  if (baseUrl) {
    const url = new URL(baseUrl);
    
    result.links = {
      first: `${url.origin}${url.pathname}?page=1&limit=${limit}`,
      ...(hasPreviousPage && {
        previous: `${url.origin}${url.pathname}?page=${page - 1}&limit=${limit}`,
      }),
      ...(hasNextPage && {
        next: `${url.origin}${url.pathname}?page=${page + 1}&limit=${limit}`,
      }),
      last: `${url.origin}${url.pathname}?page=${totalPages}&limit=${limit}`,
    };
  }
  
  return result;
}
