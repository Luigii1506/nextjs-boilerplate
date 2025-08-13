// 👥 Users Types
// ==============
// Tipos específicos para la feature de usuarios (complementarios a shared/types/user)

export interface UserListQuery {
  limit: number;
  offset: number;
  searchValue?: string;
  searchField?: "email" | "name";
  searchOperator?: "contains" | "equals";
}

export interface UserListResponse {
  users: Array<Record<string, unknown>>; // Usar tipo de usuario de shared/types
  total: number;
  timestamp: string;
}

export interface UserCreateRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface UserUpdateRequest {
  name?: string;
  email?: string;
  role?: string;
}
