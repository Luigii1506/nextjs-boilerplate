/**
 * 📝 AUDIT TRAIL TYPES
 * ====================
 *
 * Tipos consolidados para el sistema de auditoría.
 * Incluye eventos, recursos, diffs y filtros.
 */

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "login"
  | "logout"
  | "view"
  | "export"
  | "import"
  | "bulk_update"
  | "bulk_delete"
  | "toggle"
  | "activate"
  | "deactivate"
  | "role_change"
  | "ban"
  | "unban";

export type AuditResource =
  | "user"
  | "feature_flag"
  | "order"
  | "product"
  | "setting"
  | "role"
  | "permission"
  | "session"
  | "file"
  | "dashboard"
  | "system";

export type AuditSeverity = "low" | "medium" | "high" | "critical";

export interface AuditEvent {
  id: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId: string;
  resourceName?: string;
  userId: string;
  userName?: string;
  userEmail: string;
  userRole: string;
  severity: AuditSeverity;
  description?: string;
  metadata?: Record<string, unknown>;
  changes?: AuditChange[];
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditChange {
  field: string;
  fieldLabel?: string;
  oldValue?: unknown;
  newValue?: unknown;
  type: "added" | "modified" | "removed";
}

export interface AuditFilters {
  action?: AuditAction;
  resource?: AuditResource;
  userId?: string;
  severity?: AuditSeverity;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  resourceId?: string;
  ipAddress?: string;
  page?: number;
  limit?: number;
}

export interface AuditStats {
  total: number;
  byAction: Record<AuditAction, number>;
  byResource: Record<AuditResource, number>;
  bySeverity: Record<AuditSeverity, number>;
  byUser: Array<{
    userId: string;
    userName: string | null;
    userEmail: string;
    eventCount: number;
  }>;
  recentActivity: AuditEvent[];
  topResources: Array<{
    resource: AuditResource;
    count: number;
  }>;
}

export interface AuditTimelineGroup {
  date: string;
  events: AuditEvent[];
  count: number;
}

export interface CreateAuditEventData {
  action: AuditAction;
  resource: AuditResource;
  resourceId: string;
  resourceName?: string;
  description: string;
  severity?: AuditSeverity;
  metadata?: Record<string, unknown>;
  changes?: Omit<AuditChange, "type">[];
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditExportOptions {
  format: "csv" | "json";
  filters?: AuditFilters;
  dateRange: {
    from: Date;
    to: Date;
  };
  includeChanges: boolean;
  includeMetadata: boolean;
}

// UI Component Props
export interface AuditEventCardProps {
  event: AuditEvent;
  showResource?: boolean;
  showUser?: boolean;
  showChanges?: boolean;
  onViewDetails?: (event: AuditEvent) => void;
}

export interface AuditDiffViewerProps {
  changes: AuditChange[];
  title?: string;
  compact?: boolean;
}

export interface AuditFiltersProps {
  filters: AuditFilters;
  onFiltersChange: (filters: AuditFilters) => void;
  onReset: () => void;
  isLoading?: boolean;
}

export interface AuditTimelineProps {
  events: AuditEvent[];
  groupBy?: "day" | "hour";
  showFilters?: boolean;
  onEventClick?: (event: AuditEvent) => void;
}

export interface AuditStatsProps {
  stats: AuditStats;
  isLoading?: boolean;
  onRefresh?: () => void;
}

// Hook Return Types
export interface UseAuditTrailReturn {
  events: AuditEvent[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;
  currentPage: number;
  loadEvents: (
    filters?: AuditFilters,
    page?: number,
    append?: boolean
  ) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  exportEvents: (options: AuditExportOptions) => Promise<void>;
}

export interface UseAuditFiltersReturn {
  filters: AuditFilters;
  setFilters: (filters: AuditFilters) => void;
  updateFilter: <K extends keyof AuditFilters>(
    key: K,
    value: AuditFilters[K]
  ) => void;
  resetFilters: () => void;
  activeFiltersCount: number;
  isFiltered: boolean;
}

export interface UseAuditCaptureReturn {
  captureEvent: (data: CreateAuditEventData) => Promise<void>;
  captureUserAction: (
    action: AuditAction,
    resource: AuditResource,
    resourceId: string,
    description: string,
    changes?: Omit<AuditChange, "type">[]
  ) => Promise<void>;
  isCapturing: boolean;
  error: string | null;
}

export interface UseAuditStatsReturn {
  stats: AuditStats | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// Server Action Results
export interface AuditActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuditEventsResponse {
  events: AuditEvent[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}

export interface AuditEventDetails extends AuditEvent {
  relatedEvents?: AuditEvent[];
  context?: Record<string, unknown>;
}
