// 👥 USERS TYPES
// ===============
// Interfaces y tipos para la gestión de usuarios - React 19 + Hexagonal Architecture

// 🎯 Core User Interface
export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  role: "user" | "admin" | "super_admin";
  status?: "active" | "banned";
  image: string | null;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  banned: boolean;
  banReason: string | null;
  banExpires: string | null;
}

// 🔍 Search and Filtering
export interface UserSearchParams {
  limit: number;
  offset: number;
  searchValue?: string;
  searchField: "email" | "name";
}

export interface UserAdvancedSearch {
  email?: string;
  name?: string;
  role?: "user" | "admin" | "super_admin";
  banned?: boolean;
  limit?: number;
  offset?: number;
}

// 📊 API Responses
export interface UserListResponse {
  users: User[];
  pagination: {
    total: number;
    hasMore: boolean;
  };
}

export interface UserDetailsResponse {
  user: User;
}

// 🎭 User Operations
export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role: "user" | "admin" | "super_admin";
}

export interface UpdateUserData {
  id: string;
  email?: string;
  name?: string;
  role?: "user" | "admin" | "super_admin";
}

export interface UpdateRoleData {
  userId: string;
  role: "user" | "admin" | "super_admin";
}

export interface BanUserData {
  id: string;
  reason: string;
}

export interface UnbanUserData {
  id: string;
}

export interface BulkUpdateData {
  userIds: string[];
  newRole: "user" | "admin" | "super_admin";
}

// 🎯 Action Results
export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type UserActionResult = ActionResult<User>;
export type UserListActionResult = ActionResult<UserListResponse>;
export type BulkUpdateResult = ActionResult<{ updatedCount: number }>;

// 📊 Dashboard Stats
export interface UserDashboardStats {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  adminUsers: number;
}

// 📊 User Stats for UI
export interface UserStats {
  total: number;
  active: number;
  banned: number;
  admins: number;
}

// 🛡️ Permission Context
export interface UserPermissionContext {
  currentUserId: string;
  currentUserRole: "user" | "admin" | "super_admin";
  targetUserId?: string;
}

// 🎨 UI State Types
export interface UserOptimisticState {
  users: User[];
  totalUsers: number;
  isRefreshing: boolean;
}

export interface UserModalState {
  isOpen: boolean;
  mode: "create" | "edit" | "view";
  user?: User;
}

export interface UserFilters {
  role: "all" | "user" | "admin" | "super_admin";
  status: "all" | "active" | "banned";
  searchValue: string;
  searchField: "email" | "name";
}

// 📝 Form Types
export interface CreateUserForm {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin" | "super_admin";
}

export interface EditUserForm {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "super_admin";
}

export interface BanUserForm {
  id: string;
  reason: string;
}

// 🔄 Server Action Types
export type UserServerAction<T = unknown> = (
  formData: FormData
) => Promise<ActionResult<T>>;

export type GetUsersAction = (
  limit?: number,
  offset?: number,
  searchValue?: string,
  searchField?: "email" | "name"
) => Promise<ActionResult<UserListResponse>>;

export type GetUserDetailsAction = (
  userId: string
) => Promise<ActionResult<User>>;

// 📊 Query Types
export interface UserQueryOptions {
  where?: Record<string, unknown>;
  skip?: number;
  take?: number;
  orderBy?: Record<string, string>;
}

export interface UserCountOptions {
  where?: Record<string, unknown>;
}

// 🎯 Service Types
export interface UserServiceDependencies {
  currentUserId: string;
  currentUserRole: "user" | "admin" | "super_admin";
}

// 📅 Date Range Query
export interface UserDateRangeQuery {
  startDate: Date;
  endDate: Date;
}

// 🏷️ Common Enums as Types
export type UserRole = "user" | "admin" | "super_admin";
export type UserStatus = "active" | "banned";
export type SearchField = "email" | "name";
export type UserAction =
  | "create"
  | "update"
  | "delete"
  | "ban"
  | "unban"
  | "role_change";

// 🔐 Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FieldValidation {
  field: string;
  value: unknown;
  rules: string[];
}

// 📱 Component Props Types
export interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (userId: string) => void;
  onBan?: (userId: string) => void;
  onUnban?: (userId: string) => void;
  onRoleChange?: (userId: string, role: UserRole) => void;
}

export interface UserModalProps {
  isOpen: boolean;
  mode: "create" | "edit" | "view";
  user?: User;
  onClose: () => void;
  onSubmit: (data: CreateUserForm | EditUserForm) => void;
}

export interface UserFiltersProps {
  filters: UserFilters;
  onFiltersChange: (filters: Partial<UserFilters>) => void;
  totalUsers: number;
}

// 🎯 Hook Return Types
export interface UseUsersReturn {
  users: User[];
  totalUsers: number;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  createUser: (data: CreateUserForm) => Promise<void>;
  updateUser: (data: EditUserForm) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  banUser: (data: BanUserForm) => Promise<void>;
  unbanUser: (userId: string) => Promise<void>;
  updateRole: (userId: string, role: UserRole) => Promise<void>;
  bulkUpdate: (data: BulkUpdateData) => Promise<void>;
}

// 🔄 Cache Tags
export type UserCacheTags = "users" | "user-details" | "user-stats";

// 📊 Analytics Types
export interface UserAnalytics {
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  mostActiveRole: UserRole;
  banRate: number;
}
