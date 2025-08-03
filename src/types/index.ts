// 📝 TYPES INDEX
// ==============
// Exportaciones centralizadas de todos los tipos del sistema

// 🌍 Global Base Types
export * from "./global";

// 🌐 API Contract Types
export * from "./api";

// 🗃️ Database & Prisma Types
export * from "./database";

// 🔄 Re-exports for convenience
export type {
  // From global
  BaseEntity,
  PaginationParams,
  PaginatedResponse,
  SearchParams,
  LoadingState,
  ActionState,
  AuthUser,
  BaseStats,
} from "./global";

export type {
  // From api
  ApiResponse,
  ApiError,
  ApiResult,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UploadRequest,
  UploadResponse,
  SearchRequest,
  SearchResponse,
} from "./api";

export type {
  // From database
  QueryOptions,
  AuditLog,
  SoftDeletable,
  WithMetadata,
} from "./database";

// 🎯 Type Guards Utilities
import type { ApiResponse, ApiError } from "./api";

export function isApiSuccess<T>(
  response: ApiResponse<T>
): response is ApiResponse<T> & { success: true } {
  return response.success === true;
}

export function isApiError(response: ApiResponse): response is ApiError {
  return response.success === false;
}
