// =====================================================
// Repository Types
// =====================================================
// Common types used across all repositories

/**
 * Standard repository result type
 * All repository functions should return this format
 */
export type RepositoryResult<T> = {
  data: T | null;
  error: string | null;
};

/**
 * Repository result with pagination
 */
export type PaginatedRepositoryResult<T> = RepositoryResult<T> & {
  total?: number;
};

/**
 * Repository error type
 */
export type RepositoryError = {
  message: string;
  code?: string;
};

