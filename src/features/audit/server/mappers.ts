/**
 * 🔄 AUDIT TRAIL MAPPERS
 * ======================
 *
 * Transformaciones de datos entre capas (Prisma <-> Domain <-> API)
 * Siguiendo el patrón de users module
 */

import type {
  AuditEvent,
  AuditChange,
  AuditStats,
  AuditEventsResponse,
  AuditAction,
  AuditResource,
  AuditSeverity,
} from "../types";
import {
  formatDateTime,
  formatActionLabel,
  formatResourceLabel,
  formatSeverityLabel,
} from "../utils";

// 📊 Prisma AuditEvent to Domain AuditEvent
export const prismaAuditEventToAuditEvent = (prismaEvent: {
  id: string;
  action: string;
  resource: string;
  resourceId: string;
  resourceName: string | null;
  userId: string;
  userName: string | null;
  userEmail: string;
  userRole: string;
  severity: string;
  description: string | null;
  metadata: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  updatedAt: Date;
  changes?: Array<{
    field: string;
    fieldLabel: string | null;
    oldValue: unknown;
    newValue: unknown;
    type: string;
  }>;
}): AuditEvent => {
  return {
    id: prismaEvent.id,
    action: prismaEvent.action as AuditAction,
    resource: prismaEvent.resource as AuditResource,
    resourceId: prismaEvent.resourceId,
    resourceName: prismaEvent.resourceName || undefined,
    userId: prismaEvent.userId,
    userName: prismaEvent.userName || undefined,
    userEmail: prismaEvent.userEmail,
    userRole: prismaEvent.userRole,
    severity: prismaEvent.severity as AuditSeverity,
    description: prismaEvent.description || undefined,
    metadata: (prismaEvent.metadata as Record<string, unknown>) || {},
    changes: prismaEvent.changes?.map(prismaAuditChangeToAuditChange) || [],
    ipAddress: prismaEvent.ipAddress || undefined,
    userAgent: prismaEvent.userAgent || undefined,
    createdAt: prismaEvent.createdAt,
    updatedAt: prismaEvent.updatedAt,
  };
};

// 🔄 Prisma AuditChange to Domain AuditChange
export const prismaAuditChangeToAuditChange = (prismaChange: {
  field: string;
  fieldLabel: string | null;
  oldValue: unknown;
  newValue: unknown;
  type: string;
}): AuditChange => {
  return {
    field: prismaChange.field,
    fieldLabel: prismaChange.fieldLabel || undefined,
    oldValue: prismaChange.oldValue,
    newValue: prismaChange.newValue,
    type: prismaChange.type as AuditChange["type"],
  };
};

// 📋 Array of Prisma AuditEvents to Domain AuditEvents
export const prismaAuditEventsToAuditEvents = (
  prismaEvents: Array<{
    id: string;
    action: string;
    resource: string;
    resourceId: string;
    resourceName: string | null;
    userId: string;
    userName: string | null;
    userEmail: string;
    userRole: string;
    severity: string;
    description: string | null;
    metadata: unknown;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
    updatedAt: Date;
    changes?: Array<{
      field: string;
      fieldLabel: string | null;
      oldValue: unknown;
      newValue: unknown;
      type: string;
    }>;
  }>
): AuditEvent[] => {
  return prismaEvents.map(prismaAuditEventToAuditEvent);
};

// 📊 Raw stats to Domain AuditStats
export const rawStatsToAuditStats = (rawStats: {
  totalCount: number;
  actionStats: Array<{ action: string; _count: { action: number } }>;
  resourceStats: Array<{ resource: string; _count: { resource: number } }>;
  severityStats: Array<{ severity: string; _count: { severity: number } }>;
  userStats: Array<{
    userId: string;
    userName: string | null;
    userEmail?: string;
    _count: { userId: number };
  }>;
  recentEvents: Array<{
    id: string;
    action: string;
    resource: string;
    createdAt: Date;
  }>;
}): AuditStats => {
  // Transform stats to the expected format
  const byAction: Record<string, number> = {};
  rawStats.actionStats.forEach((stat) => {
    byAction[stat.action] = stat._count.action;
  });

  const byResource: Record<string, number> = {};
  rawStats.resourceStats.forEach((stat) => {
    byResource[stat.resource] = stat._count.resource;
  });

  const bySeverity: Record<string, number> = {};
  rawStats.severityStats.forEach((stat) => {
    bySeverity[stat.severity] = stat._count.severity;
  });

  const byUser = rawStats.userStats.map((stat) => ({
    userId: stat.userId,
    userName: stat.userName,
    userEmail: stat.userEmail || "",
    eventCount: stat._count.userId,
  }));

  // Get top resources
  const topResources = Object.entries(byResource)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([resource, count]) => ({
      resource: resource as AuditResource,
      count,
    }));

  return {
    total: rawStats.totalCount,
    byAction: byAction as Record<string, number>,
    byResource: byResource as Record<string, number>,
    bySeverity: bySeverity as Record<string, number>,
    byUser,
    recentActivity: rawStats.recentEvents.map((event) => ({
      id: event.id,
      action: event.action as AuditAction,
      resource: event.resource as AuditResource,
      resourceId: "",
      userId: "",
      userEmail: "",
      userRole: "",
      severity: "medium" as AuditSeverity,
      createdAt: event.createdAt,
      updatedAt: event.createdAt,
    })),
    topResources,
  };
};

// 📊 Events with Pagination to API Response
export const auditEventsToAuditEventsResponse = (
  events: AuditEvent[],
  totalCount: number,
  currentPage: number,
  limit: number
): AuditEventsResponse => {
  const totalPages = Math.ceil(totalCount / limit);
  const hasMore = currentPage < totalPages;

  return {
    events,
    totalCount,
    hasMore,
    currentPage,
    totalPages,
  };
};

// 📊 Raw activity summary to formatted summary
export const rawActivitySummaryToActivitySummary = (rawSummary: {
  totalEvents: number;
  uniqueUsers: number;
  topActions: Array<{ action: string; _count: { action: number } }>;
  topResources: Array<{ resource: string; _count: { resource: number } }>;
}) => {
  return {
    totalEvents: rawSummary.totalEvents,
    uniqueUsers: rawSummary.uniqueUsers,
    topActions: rawSummary.topActions.map((item) => ({
      action: item.action,
      count: item._count.action,
    })),
    topResources: rawSummary.topResources.map((item) => ({
      resource: item.resource,
      count: item._count.resource,
    })),
  };
};

// 📊 Raw user activity to formatted user activity
export const rawUserActivityToUserActivity = (rawActivity: {
  totalEvents: number;
  eventsByAction: Array<{ action: string; _count: { action: number } }>;
  recentEvents: Array<{
    id: string;
    action: string;
    resource: string;
    createdAt: Date;
  }>;
}) => {
  const actionCounts: Record<string, number> = {};
  rawActivity.eventsByAction.forEach((item) => {
    actionCounts[item.action] = item._count.action;
  });

  return {
    totalEvents: rawActivity.totalEvents,
    eventsByAction: actionCounts,
    recentEvents: rawActivity.recentEvents.map((event) => ({
      id: event.id,
      action: event.action as AuditAction,
      resource: event.resource as AuditResource,
      resourceId: "",
      userId: "",
      userEmail: "",
      userRole: "",
      severity: "medium" as AuditSeverity,
      createdAt: event.createdAt,
      updatedAt: event.createdAt,
    })),
  };
};

// 📤 Events to Export Format
export const auditEventsToExportFormat = (
  events: AuditEvent[],
  includeChanges: boolean = true
) => {
  return events.map((event) => {
    const baseData = {
      id: event.id,
      fecha: formatDateTime(event.createdAt),
      accion: formatActionLabel(event.action),
      recurso: formatResourceLabel(event.resource),
      idRecurso: event.resourceId,
      nombreRecurso: event.resourceName || "",
      usuario: event.userName,
      emailUsuario: event.userEmail,
      rolUsuario: event.userRole,
      severidad: formatSeverityLabel(event.severity),
      descripcion: event.description,
      ip: event.ipAddress || "",
      userAgent: event.userAgent || "",
    };

    if (includeChanges && event.changes && event.changes.length > 0) {
      return {
        ...baseData,
        cambios: event.changes.map((change) => ({
          campo: change.fieldLabel || change.field,
          valorAnterior: change.oldValue,
          valorNuevo: change.newValue,
          tipo: change.type,
        })),
      };
    }

    return baseData;
  });
};

// 🔄 Bulk operation result mapper
export const bulkDeleteResultToResponse = (deleteResult: {
  count: number;
}): { deletedCount: number } => {
  return {
    deletedCount: deleteResult.count,
  };
};

// 🗑️ Cleanup result mapper
export const cleanupResultToResponse = (
  cleanupResult: {
    count: number;
  },
  cutoffDate: Date
): {
  deletedCount: number;
  cutoffDate: Date;
} => {
  return {
    deletedCount: cleanupResult.count,
    cutoffDate,
  };
};
