// Common utilities and classes
export type Nullable<T> = T | null;
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
