// Simple interface for pagination metadata
interface IPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// Interface for paginated response
export interface IPaginatedResult<T> {
  data: T[];
  meta: IPaginationMeta;
  links?: {
    first?: string;
    previous?: string | null;
    next?: string | null;
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
): IPaginatedResult<T> {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  const meta: IPaginationMeta = {
    total,
    page,
    limit,
    totalPages,
    hasPreviousPage,
    hasNextPage,
  };

  const links = {
    first: `${baseUrl}?page=1&limit=${limit}`,
    last: `${baseUrl}?page=${totalPages}&limit=${limit}`,
    next: hasNextPage ? `${baseUrl}?page=${page + 1}&limit=${limit}` : null,
    previous: hasPreviousPage ? `${baseUrl}?page=${page - 1}&limit=${limit}` : null,
  };

  return {
    data,
    meta,
    links,
  };
}
