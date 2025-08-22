/**
 * 🛠️ AUDIT TRAIL UTILITIES
 * =========================
 *
 * Utilidades para diffs, formateo, transformaciones y helpers.
 */

import type {
  AuditEvent,
  AuditChange,
  AuditFilters,
  AuditTimelineGroup,
} from "./types";
import {
  AUDIT_ACTION_LABELS,
  AUDIT_RESOURCE_LABELS,
  AUDIT_SEVERITY_LABELS,
  AUDIT_CONFIG,
} from "./constants";

// 🔄 Diff Generation
export function generateDiff(
  oldData: Record<string, unknown>,
  newData: Record<string, unknown>,
  fieldLabels?: Record<string, string>
): AuditChange[] {
  const changes: AuditChange[] = [];

  // Get all unique keys from both objects
  const allKeys = new Set([
    ...Object.keys(oldData || {}),
    ...Object.keys(newData || {}),
  ]);

  for (const key of allKeys) {
    const oldValue = oldData?.[key];
    const newValue = newData?.[key];

    // Skip if values are the same
    if (JSON.stringify(oldValue) === JSON.stringify(newValue)) {
      continue;
    }

    let changeType: AuditChange["type"];

    if (oldValue === undefined || oldValue === null) {
      changeType = "added";
    } else if (newValue === undefined || newValue === null) {
      changeType = "removed";
    } else {
      changeType = "modified";
    }

    changes.push({
      field: key,
      fieldLabel: fieldLabels?.[key] || formatFieldName(key),
      oldValue: formatValue(oldValue),
      newValue: formatValue(newValue),
      type: changeType,
    });
  }

  return changes;
}

// 📝 Format Field Name
export function formatFieldName(fieldName: string): string {
  return fieldName
    .replace(/([A-Z])/g, " $1") // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
    .replace(/_/g, " ") // Replace underscores with spaces
    .trim();
}

// 🎨 Format Value for Display
export function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Sí" : "No";
  }

  if (typeof value === "string") {
    // Truncate long strings
    if (
      value.length > AUDIT_CONFIG.MAX_DIFF_LENGTH &&
      AUDIT_CONFIG.TRUNCATE_LONG_VALUES
    ) {
      return value.substring(0, AUDIT_CONFIG.MAX_DIFF_LENGTH) + "...";
    }
    return value;
  }

  if (typeof value === "number") {
    return value.toLocaleString("es-MX");
  }

  if (value instanceof Date) {
    return formatDateTime(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    if (value.length === 1) return `[${formatValue(value[0])}]`;
    return `[${value.length} elementos]`;
  }

  if (typeof value === "object") {
    const keys = Object.keys(value);
    if (keys.length === 0) return "{}";
    if (keys.length === 1)
      return `{${keys[0]}: ${formatValue(value[keys[0]])}}`;
    return `{${keys.length} propiedades}`;
  }

  return String(value);
}

// 📅 Date/Time Formatting
export function formatDateTime(date: Date | string): string {
  // Ensure we have a valid Date object
  const dateObj = date instanceof Date ? date : new Date(date);

  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return "Fecha inválida";
  }

  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(dateObj);
}

export function formatDate(date: Date | string): string {
  // Ensure we have a valid Date object
  const dateObj = date instanceof Date ? date : new Date(date);

  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return "Fecha inválida";
  }

  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(dateObj);
}

export function formatTime(date: Date | string): string {
  // Ensure we have a valid Date object
  const dateObj = date instanceof Date ? date : new Date(date);

  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return "Hora inválida";
  }

  return new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(dateObj);
}

export function formatRelativeTime(date: Date | string): string {
  // Ensure we have a valid Date object
  const dateObj = date instanceof Date ? date : new Date(date);

  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return "Fecha inválida";
  }

  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "Hace un momento";
  if (diffMinutes < 60)
    return `Hace ${diffMinutes} minuto${diffMinutes > 1 ? "s" : ""}`;
  if (diffHours < 24)
    return `Hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? "s" : ""}`;

  return formatDate(date);
}

// 🏷️ Label Formatting
export function formatActionLabel(action: string): string {
  return (
    AUDIT_ACTION_LABELS[action as keyof typeof AUDIT_ACTION_LABELS] || action
  );
}

export function formatResourceLabel(resource: string): string {
  return (
    AUDIT_RESOURCE_LABELS[resource as keyof typeof AUDIT_RESOURCE_LABELS] ||
    resource
  );
}

export function formatSeverityLabel(severity: string): string {
  return (
    AUDIT_SEVERITY_LABELS[severity as keyof typeof AUDIT_SEVERITY_LABELS] ||
    severity
  );
}

// 📊 Timeline Grouping
export function groupEventsByDate(
  events: AuditEvent[],
  groupBy: "day" | "hour" = "day"
): AuditTimelineGroup[] {
  const groups = new Map<string, AuditEvent[]>();

  events.forEach((event) => {
    const date = new Date(event.createdAt);
    let key: string;

    if (groupBy === "day") {
      key = date.toISOString().split("T")[0]; // YYYY-MM-DD
    } else {
      key = date.toISOString().substring(0, 13); // YYYY-MM-DDTHH
    }

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(event);
  });

  return Array.from(groups.entries())
    .map(([date, events]) => ({
      date,
      events: events.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
      count: events.length,
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

// 🔍 Search Utilities
export function searchEvents(
  events: AuditEvent[],
  query: string,
  fields?: string[]
): AuditEvent[] {
  if (!query || query.length < AUDIT_CONFIG.MIN_SEARCH_LENGTH) {
    return events;
  }

  const searchQuery = query.toLowerCase();
  const searchFields = fields || [
    "description",
    "resourceName",
    "userName",
    "userEmail",
  ];

  return events.filter((event) => {
    return searchFields.some((field) => {
      const value = event[field as keyof AuditEvent];
      return value && String(value).toLowerCase().includes(searchQuery);
    });
  });
}

// 🎯 Filter Utilities
export function applyFilters(
  events: AuditEvent[],
  filters: AuditFilters
): AuditEvent[] {
  return events.filter((event) => {
    // Action filter
    if (filters.action && event.action !== filters.action) {
      return false;
    }

    // Resource filter
    if (filters.resource && event.resource !== filters.resource) {
      return false;
    }

    // User filter
    if (filters.userId && event.userId !== filters.userId) {
      return false;
    }

    // Severity filter
    if (filters.severity && event.severity !== filters.severity) {
      return false;
    }

    // Resource ID filter
    if (filters.resourceId && event.resourceId !== filters.resourceId) {
      return false;
    }

    // IP Address filter
    if (filters.ipAddress && event.ipAddress !== filters.ipAddress) {
      return false;
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      const eventDate = new Date(event.createdAt);

      if (filters.dateFrom && eventDate < filters.dateFrom) {
        return false;
      }

      if (filters.dateTo && eventDate > filters.dateTo) {
        return false;
      }
    }

    // Search filter
    if (filters.search) {
      const searchResult = searchEvents([event], filters.search);
      return searchResult.length > 0;
    }

    return true;
  });
}

// 📈 Statistics Utilities
export function calculateStats(events: AuditEvent[]) {
  const stats = {
    total: events.length,
    byAction: {} as Record<string, number>,
    byResource: {} as Record<string, number>,
    bySeverity: {} as Record<string, number>,
    byUser: {} as Record<string, number>,
  };

  events.forEach((event) => {
    // Count by action
    stats.byAction[event.action] = (stats.byAction[event.action] || 0) + 1;

    // Count by resource
    stats.byResource[event.resource] =
      (stats.byResource[event.resource] || 0) + 1;

    // Count by severity
    stats.bySeverity[event.severity] =
      (stats.bySeverity[event.severity] || 0) + 1;

    // Count by user
    const userKey = `${event.userId}:${event.userName}`;
    stats.byUser[userKey] = (stats.byUser[userKey] || 0) + 1;
  });

  return stats;
}

// 🎨 Color Utilities
export function getActionColor(action: string): string {
  const colors: Record<string, string> = {
    create: "text-green-600 bg-green-50",
    update: "text-blue-600 bg-blue-50",
    delete: "text-red-600 bg-red-50",
    login: "text-purple-600 bg-purple-50",
    logout: "text-gray-600 bg-gray-50",
    view: "text-slate-600 bg-slate-50",
    export: "text-indigo-600 bg-indigo-50",
    import: "text-cyan-600 bg-cyan-50",
    bulk_update: "text-orange-600 bg-orange-50",
    bulk_delete: "text-red-600 bg-red-50",
    toggle: "text-yellow-600 bg-yellow-50",
    activate: "text-green-600 bg-green-50",
    deactivate: "text-gray-600 bg-gray-50",
  };

  return colors[action] || "text-gray-600 bg-gray-50";
}

export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    low: "text-gray-600 bg-gray-50",
    medium: "text-yellow-600 bg-yellow-50",
    high: "text-orange-600 bg-orange-50",
    critical: "text-red-600 bg-red-50",
  };

  return colors[severity] || "text-gray-600 bg-gray-50";
}

// 📄 Export Utilities
export function formatForExport(
  events: AuditEvent[],
  format: "csv" | "json"
): string {
  if (format === "json") {
    return JSON.stringify(events, null, 2);
  }

  // CSV format
  const headers = [
    "ID",
    "Fecha",
    "Acción",
    "Recurso",
    "ID Recurso",
    "Nombre Recurso",
    "Usuario",
    "Email Usuario",
    "Rol Usuario",
    "Severidad",
    "Descripción",
    "IP",
    "User Agent",
  ];

  const rows = events.map((event) => [
    event.id,
    formatDateTime(event.createdAt),
    formatActionLabel(event.action),
    formatResourceLabel(event.resource),
    event.resourceId,
    event.resourceName || "",
    event.userName,
    event.userEmail,
    event.userRole,
    formatSeverityLabel(event.severity),
    event.description,
    event.ipAddress || "",
    event.userAgent || "",
  ]);

  return [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");
}

// 🔗 URL Utilities
export function buildAuditUrl(baseUrl: string, filters?: AuditFilters): string {
  if (!filters) return baseUrl;

  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (value instanceof Date) {
        params.set(key, value.toISOString());
      } else {
        params.set(key, String(value));
      }
    }
  });

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

// 🎭 Icon Utilities
export function getActionIcon(action: string): string {
  const icons: Record<string, string> = {
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
  };

  return icons[action] || "Activity";
}
