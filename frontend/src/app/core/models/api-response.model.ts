/**
 * API Response Models - Modelos genéricos para respuestas de API
 */

/**
 * Respuesta estándar para listados paginados
 */
export interface ApiPaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Respuesta estándar para datos individuales
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

/**
 * Respuesta de error
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  error: string;
  statusCode: number;
  details?: Record<string, string[]>;
}

/**
 * Envoltorio para todas las respuestas HTTP
 */
export type ApiResult<T> = ApiResponse<T> | ApiErrorResponse;

/**
 * Estado de una operación async
 */
export interface AsyncState<T> {
  loading: boolean;
  error: string | null;
  data: T | null;
}

/**
 * Opciones de paginación para requests
 */
export interface PaginationOptions {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}
