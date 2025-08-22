/**
 * 📋 AUDIT TRAIL CONSTANTS
 * ========================
 *
 * Constantes para actions, resources, severities y configuración.
 */

import type { AuditAction, AuditResource, AuditSeverity } from "./types";

// 🎯 Audit Actions
export const AUDIT_ACTIONS: Record<string, AuditAction> = {
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
  LOGIN: "login",
  LOGOUT: "logout",
  VIEW: "view",
  EXPORT: "export",
  IMPORT: "import",
  BULK_UPDATE: "bulk_update",
  BULK_DELETE: "bulk_delete",
  TOGGLE: "toggle",
  ACTIVATE: "activate",
  DEACTIVATE: "deactivate",
  ROLE_CHANGE: "role_change",
  BAN: "ban",
  UNBAN: "unban",
} as const;

// 🏷️ Action Labels
export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  create: "Crear",
  update: "Actualizar",
  delete: "Eliminar",
  login: "Iniciar Sesión",
  logout: "Cerrar Sesión",
  view: "Ver",
  export: "Exportar",
  import: "Importar",
  bulk_update: "Actualización Masiva",
  bulk_delete: "Eliminación Masiva",
  toggle: "Alternar",
  activate: "Activar",
  deactivate: "Desactivar",
  role_change: "Cambio de Rol",
  ban: "Banear",
  unban: "Desbanear",
};

// 🎨 Action Colors
export const AUDIT_ACTION_COLORS: Record<AuditAction, string> = {
  create: "green",
  update: "blue",
  delete: "red",
  login: "purple",
  logout: "gray",
  view: "slate",
  export: "indigo",
  import: "cyan",
  bulk_update: "orange",
  bulk_delete: "red",
  toggle: "yellow",
  activate: "green",
  deactivate: "gray",
  role_change: "red",
  ban: "red",
  unban: "green",
};

// 📦 Audit Resources
export const AUDIT_RESOURCES: Record<string, AuditResource> = {
  USER: "user",
  FEATURE_FLAG: "feature_flag",
  ORDER: "order",
  PRODUCT: "product",
  SETTING: "setting",
  ROLE: "role",
  PERMISSION: "permission",
  SESSION: "session",
  FILE: "file",
  DASHBOARD: "dashboard",
  SYSTEM: "system",
} as const;

// 🏷️ Resource Labels
export const AUDIT_RESOURCE_LABELS: Record<AuditResource, string> = {
  user: "Usuario",
  feature_flag: "Feature Flag",
  order: "Orden",
  product: "Producto",
  setting: "Configuración",
  role: "Rol",
  permission: "Permiso",
  session: "Sesión",
  file: "Archivo",
  dashboard: "Dashboard",
  system: "Sistema",
};

// 🎨 Resource Colors
export const AUDIT_RESOURCE_COLORS: Record<AuditResource, string> = {
  user: "blue",
  feature_flag: "purple",
  order: "green",
  product: "orange",
  setting: "gray",
  role: "indigo",
  permission: "cyan",
  session: "yellow",
  file: "pink",
  dashboard: "teal",
  system: "red",
};

// 🚨 Audit Severities
export const AUDIT_SEVERITIES: Record<string, AuditSeverity> = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const;

// 🏷️ Severity Labels
export const AUDIT_SEVERITY_LABELS: Record<AuditSeverity, string> = {
  low: "Bajo",
  medium: "Medio",
  high: "Alto",
  critical: "Crítico",
};

// 🎨 Severity Colors
export const AUDIT_SEVERITY_COLORS: Record<AuditSeverity, string> = {
  low: "gray",
  medium: "yellow",
  high: "orange",
  critical: "red",
};

// ⚙️ Configuration
export const AUDIT_CONFIG = {
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // Retention
  DEFAULT_RETENTION_DAYS: 90,
  MAX_RETENTION_DAYS: 365,

  // Export
  MAX_EXPORT_RECORDS: 10000,
  EXPORT_FORMATS: ["csv", "json", "pdf"] as const,

  // Timeline
  TIMELINE_GROUP_OPTIONS: ["day", "hour"] as const,

  // Search
  MIN_SEARCH_LENGTH: 3,
  SEARCH_DEBOUNCE_MS: 300,

  // Auto-refresh
  AUTO_REFRESH_INTERVAL_MS: 30000, // 30 seconds

  // Diff viewer
  MAX_DIFF_LENGTH: 1000,
  TRUNCATE_LONG_VALUES: true,
} as const;

// 🎯 Default Filters
export const DEFAULT_AUDIT_FILTERS = {
  page: 1,
  limit: AUDIT_CONFIG.DEFAULT_PAGE_SIZE,
} as const;

// 📊 Chart Colors
export const CHART_COLORS = [
  "#3B82F6", // blue
  "#10B981", // green
  "#F59E0B", // yellow
  "#EF4444", // red
  "#8B5CF6", // purple
  "#06B6D4", // cyan
  "#F97316", // orange
  "#84CC16", // lime
  "#EC4899", // pink
  "#6B7280", // gray
] as const;

// 🔍 Search Fields
export const SEARCHABLE_FIELDS = [
  "description",
  "resourceName",
  "userName",
  "userEmail",
  "ipAddress",
] as const;

// 📅 Date Range Presets
export const DATE_RANGE_PRESETS = [
  { label: "Última hora", hours: 1 },
  { label: "Últimas 24 horas", hours: 24 },
  { label: "Últimos 7 días", days: 7 },
  { label: "Últimos 30 días", days: 30 },
  { label: "Últimos 90 días", days: 90 },
] as const;

// 🎭 Icons mapping
export const AUDIT_ACTION_ICONS: Record<AuditAction, string> = {
  create: "Plus",
  update: "Edit",
  delete: "Trash2",
  login: "LogIn",
  logout: "LogOut",
  view: "Eye",
  export: "Download",
  import: "Upload",
  bulk_update: "Edit3",
  bulk_delete: "Trash",
  toggle: "ToggleLeft",
  activate: "Power",
  deactivate: "PowerOff",
  role_change: "UserCog",
  ban: "UserX",
  unban: "UserCheck",
};

export const AUDIT_RESOURCE_ICONS: Record<AuditResource, string> = {
  user: "User",
  feature_flag: "Flag",
  order: "ShoppingCart",
  product: "Package",
  setting: "Settings",
  role: "Shield",
  permission: "Key",
  session: "Clock",
  file: "File",
  dashboard: "BarChart3",
  system: "Server",
};
