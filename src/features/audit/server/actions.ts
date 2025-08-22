/**
 * 🚀 AUDIT TRAIL SERVER ACTIONS
 * ==============================
 *
 * Next.js Server Actions para audit trail - API layer para el cliente
 * Siguiendo el patrón de users module
 */

"use server";

import { unstable_cache } from "next/cache";
import { createAuditService, createAuditServiceWithHeaders } from "./service";
import { formatForExport } from "../utils";
import * as auditValidators from "./validators";
import type {
  AuditEvent,
  AuditFilters,
  AuditStats,
  AuditEventsResponse,
  CreateAuditEventData,
} from "../types";
import type { ActionResult } from "@/shared/types";

// 📊 Get audit events with caching
const _getAuditEventsActionCached = unstable_cache(
  async (
    filters: AuditFilters = {},
    sessionData: {
      userId: string;
      userRole: "user" | "admin" | "super_admin";
    }
  ): Promise<ActionResult<AuditEventsResponse>> => {
    try {
      const auditService = await createAuditService(sessionData);
      const result = await auditService.getAuditEvents(filters);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error("❌ Error getting audit events:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  },
  ["audit-events"],
  {
    tags: ["audit-events"],
    revalidate: 300, // 5 minutes
  }
);

export const getAuditEventsAction = async (
  filters: AuditFilters = {}
): Promise<ActionResult<AuditEventsResponse>> => {
  // Get session outside of cache
  const session = await auditValidators.getValidatedSession();

  return _getAuditEventsActionCached(filters, {
    userId: session.user.id,
    userRole: session.user.role,
  });
};

// 🔍 Get single audit event
export const getAuditEventAction = async (
  eventId: string
): Promise<ActionResult<AuditEvent>> => {
  try {
    const auditService = await createAuditService();
    const event = await auditService.getAuditEvent(eventId);

    return {
      success: true,
      data: event,
    };
  } catch (error) {
    console.error("❌ Error getting audit event:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
};

// 📊 Get audit statistics with caching
const _getAuditStatsActionCached = unstable_cache(
  async (
    dateFrom: Date | undefined,
    dateTo: Date | undefined,
    sessionData: {
      userId: string;
      userRole: "user" | "admin" | "super_admin";
    }
  ): Promise<ActionResult<AuditStats>> => {
    try {
      const auditService = await createAuditService(sessionData);
      const stats = await auditService.getAuditStats(dateFrom, dateTo);

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error("❌ Error getting audit stats:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  },
  ["audit-stats"],
  {
    tags: ["audit-stats"],
    revalidate: 600, // 10 minutes
  }
);

export const getAuditStatsAction = async (
  dateFrom?: Date,
  dateTo?: Date
): Promise<ActionResult<AuditStats>> => {
  // Get session outside of cache
  const session = await auditValidators.getValidatedSession();

  return _getAuditStatsActionCached(dateFrom, dateTo, {
    userId: session.user.id,
    userRole: session.user.role,
  });
};

// 📝 Create audit event
export const createAuditEventAction = async (
  data: CreateAuditEventData
): Promise<ActionResult<AuditEvent>> => {
  try {
    const { service, requestInfo } = await createAuditServiceWithHeaders();
    const event = await service.createAuditEvent(data, requestInfo);

    return {
      success: true,
      data: event,
    };
  } catch (error) {
    console.error("❌ Error creating audit event:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
};

// 🔍 Search audit events (integrated in getAuditEventsAction with filters)
// Removed - use getAuditEventsAction with search filters instead

// 📤 Export audit events
export const exportAuditEventsAction = async (
  filters: AuditFilters,
  format: "csv" | "json"
): Promise<ActionResult<string>> => {
  try {
    const auditService = await createAuditService();
    const events = await auditService.exportAuditEvents(filters, format);
    const exportData = formatForExport(events, format);

    return {
      success: true,
      data: exportData,
    };
  } catch (error) {
    console.error("❌ Error exporting audit events:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
};

// 📊 Get user activity (use getAuditEventsAction with userId filter)
// Removed - use getAuditEventsAction with userId filter instead

// 🗑️ Bulk delete events (admin-only, rarely used)
// Removed - implement only if specifically needed for compliance

// 🧹 Cleanup old events (use cron job or database maintenance instead)
// Removed - better handled by automated database maintenance

// 🔄 Refresh audit cache (handled automatically by Next.js)
// Removed - cache invalidation is handled automatically

// 🎯 Quick Event Creation Actions
// Removed - audit events should be created directly in business logic (services)
// Use createAuditServiceWithHeaders() directly in your services instead
