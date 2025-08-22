/**
 * 🏢 AUDIT TRAIL SERVICE
 * ======================
 *
 * Lógica de negocio para audit trail - Orquesta queries y validaciones
 * Siguiendo el patrón de users module
 */

import { headers } from "next/headers";
import { revalidateTag } from "next/cache";
import { prisma } from "@/core/database/prisma";
import * as auditQueries from "./queries";
import * as auditValidators from "./validators";
import * as auditMappers from "./mappers";
import { generateDiff } from "../utils";
import { createAuditEventSchema } from "../schemas";
import { getUserById } from "@/features/admin/users/server/queries";
import type {
  AuditEvent,
  AuditFilters,
  AuditStats,
  AuditEventsResponse,
  CreateAuditEventData,
  AuditAction,
  AuditResource,
  AuditSeverity,
  AuditChange,
} from "../types";

export interface AuditServiceOptions {
  currentUserId: string;
  currentUserRole: "user" | "admin" | "super_admin";
}

export class AuditService {
  constructor(private options: AuditServiceOptions) {}

  // 📊 Get audit events with business logic
  async getAuditEvents(
    filters: AuditFilters = {}
  ): Promise<AuditEventsResponse> {
    const { page = 1, limit = 20 } = filters;

    // Validate permissions
    auditValidators.validateAuditAccess(this.options.currentUserRole);

    // Validate filters
    auditValidators.validateAuditFilters(filters);

    // Build search condition
    const searchCondition = auditQueries.buildAuditSearchCondition(filters);

    // Calculate offset
    const offset = (page - 1) * limit;

    // Execute queries in parallel
    const [events, totalCount] = await Promise.all([
      auditQueries.getAuditEventsWithPagination({
        where: searchCondition,
        skip: offset,
        take: limit,
      }),
      auditQueries.getAuditEventsCount(searchCondition),
    ]);

    // Transform data to domain model using mapper
    const transformedEvents =
      auditMappers.prismaAuditEventsToAuditEvents(events);

    return auditMappers.auditEventsToAuditEventsResponse(
      transformedEvents,
      totalCount,
      page,
      limit
    );
  }

  // 🔍 Get single audit event with permission check
  async getAuditEvent(eventId: string): Promise<AuditEvent> {
    // Validate permissions
    auditValidators.validateAuditAccess(this.options.currentUserRole);

    const event = await auditQueries.getAuditEventById(eventId);
    if (!event) {
      throw new Error("Evento no encontrado");
    }

    return auditMappers.prismaAuditEventToAuditEvent(event);
  }

  // 📊 Get audit statistics with business logic
  async getAuditStats(dateFrom?: Date, dateTo?: Date): Promise<AuditStats> {
    // Validate permissions
    auditValidators.validateAuditAccess(this.options.currentUserRole);

    const rawStats = await auditQueries.getAuditStatsRaw(dateFrom, dateTo);

    return auditMappers.rawStatsToAuditStats(rawStats);
  }

  // 📝 Create audit event with business logic
  async createAuditEvent(
    data: CreateAuditEventData,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<AuditEvent> {
    // Validate input data
    const validatedData = createAuditEventSchema.parse(data);

    // Additional business validation
    await auditValidators.validateCreateAuditEvent(validatedData);

    // Get user info from database
    const user = await getUserById(this.options.currentUserId);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Use provided request info or fallback to data or defaults
    const ipAddress = requestInfo?.ipAddress || data.ipAddress || "unknown";
    const userAgent = requestInfo?.userAgent || data.userAgent || "unknown";

    // Prepare changes with type determination
    const processedChanges = validatedData.changes?.map((change) => ({
      ...change,
      type: this.determineChangeType(change.oldValue, change.newValue),
    }));

    // 🏢 SERVICE: Create audit event directly (escritura)
    const auditEvent = await prisma.auditEvent.create({
      data: {
        action: validatedData.action,
        resource: validatedData.resource,
        resourceId: validatedData.resourceId,
        resourceName: validatedData.resourceName,
        userId: this.options.currentUserId,
        userName: user.name || null,
        userEmail: user.email,
        userRole: this.options.currentUserRole,
        severity: validatedData.severity || "medium",
        description:
          validatedData.description ||
          `${validatedData.action} ${validatedData.resource}`,
        metadata: validatedData.metadata
          ? JSON.parse(JSON.stringify(validatedData.metadata))
          : null,
        ipAddress,
        userAgent: userAgent?.substring(0, 500),
        changes: processedChanges
          ? {
              create: processedChanges.map((change) => ({
                field: change.field,
                fieldLabel: change.fieldLabel || null,
                oldValue:
                  typeof change.oldValue === "string"
                    ? change.oldValue
                    : JSON.stringify(change.oldValue),
                newValue:
                  typeof change.newValue === "string"
                    ? change.newValue
                    : JSON.stringify(change.newValue),
                type: change.type,
              })),
            }
          : undefined,
      },
      include: {
        changes: true,
      },
    });

    // Invalidate cache
    revalidateTag("audit-events");
    revalidateTag("audit-stats");

    return auditMappers.prismaAuditEventToAuditEvent(auditEvent);
  }

  // 🔍 Search audit events with business logic
  async searchAuditEvents(
    query: string,
    filters: AuditFilters = {}
  ): Promise<AuditEvent[]> {
    // Validate permissions
    auditValidators.validateAuditAccess(this.options.currentUserRole);

    // Validate search parameters
    auditValidators.validateSearchParameters({ query, filters });

    const events = await auditQueries.searchAuditEventsRaw(query, filters);

    return auditMappers.prismaAuditEventsToAuditEvents(events);
  }

  // 📤 Export audit events with business logic
  async exportAuditEvents(
    filters: AuditFilters,
    format: "csv" | "json"
  ): Promise<AuditEvent[]> {
    // Validate permissions
    auditValidators.validateExportPermissions(this.options.currentUserRole);

    const searchCondition = auditQueries.buildAuditSearchCondition(filters);

    const events = await auditQueries.getAuditEventsWithPagination({
      where: searchCondition,
      take: 10000, // Max export limit
    });

    return auditMappers.prismaAuditEventsToAuditEvents(events);
  }

  // 📊 Get user activity with business logic
  async getUserActivity(
    userId: string,
    days: number = 30
  ): Promise<{
    totalEvents: number;
    eventsByAction: Record<string, number>;
    recentEvents: AuditEvent[];
  }> {
    // Validate permissions
    auditValidators.validateAuditAccess(this.options.currentUserRole);

    const rawActivity = await auditQueries.getUserActivityRaw(userId, days);

    return auditMappers.rawUserActivityToUserActivity(rawActivity);
  }

  // 🗑️ Bulk delete events with business logic
  async bulkDeleteEvents(
    eventIds: string[]
  ): Promise<{ deletedCount: number }> {
    // Validate permissions
    auditValidators.validateDeletePermissions(this.options.currentUserRole);

    // Validate bulk operation
    auditValidators.validateBulkOperation(eventIds);

    // 🏢 SERVICE: Bulk delete events directly (escritura)
    const result = await prisma.auditEvent.deleteMany({
      where: {
        id: { in: eventIds },
      },
    });

    // Invalidate cache
    revalidateTag("audit-events");
    revalidateTag("audit-stats");

    return auditMappers.bulkDeleteResultToResponse(result);
  }

  // 🧹 Cleanup old events with business logic
  async cleanupOldEvents(retentionDays: number = 90): Promise<{
    deletedCount: number;
    cutoffDate: Date;
  }> {
    // Validate permissions
    auditValidators.validateCleanupPermissions(this.options.currentUserRole);

    // Validate cleanup parameters
    auditValidators.validateCleanup(retentionDays);

    const cutoffDate = new Date(
      Date.now() - retentionDays * 24 * 60 * 60 * 1000
    );

    // 🏢 SERVICE: Cleanup old events directly (escritura)
    const result = await prisma.auditEvent.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    });

    // Invalidate cache
    revalidateTag("audit-events");
    revalidateTag("audit-stats");

    return auditMappers.cleanupResultToResponse(result, cutoffDate);
  }

  // 🎯 Quick Event Creation Methods
  async logUserAction(
    action: AuditAction,
    resource: AuditResource,
    resourceId: string,
    resourceName: string,
    description?: string,
    severity: AuditSeverity = "medium"
  ): Promise<AuditEvent> {
    return this.createAuditEvent({
      action,
      resource,
      resourceId,
      resourceName,
      description: description || `${action} ${resource}: ${resourceName}`,
      severity,
    });
  }

  async logCreate(
    resource: AuditResource,
    resourceId: string,
    resourceName: string,
    metadata?: Record<string, unknown>
  ): Promise<AuditEvent> {
    return this.createAuditEvent({
      action: "create",
      resource,
      resourceId,
      resourceName,
      description: `Creó ${resource}: ${resourceName}`,
      severity: "medium",
      metadata,
    });
  }

  async logUpdate(
    resource: AuditResource,
    resourceId: string,
    resourceName: string,
    oldData: Record<string, unknown>,
    newData: Record<string, unknown>,
    fieldLabels?: Record<string, string>
  ): Promise<AuditEvent> {
    const changes = generateDiff(oldData, newData, fieldLabels);

    return this.createAuditEvent({
      action: "update",
      resource,
      resourceId,
      resourceName,
      description: `Actualizó ${resource}: ${resourceName}`,
      severity: "medium",
      changes,
      metadata: {
        hasChanges: changes.length > 0,
        changeCount: changes.length,
      },
    });
  }

  async logDelete(
    resource: AuditResource,
    resourceId: string,
    resourceName: string,
    metadata?: Record<string, unknown>
  ): Promise<AuditEvent> {
    return this.createAuditEvent({
      action: "delete",
      resource,
      resourceId,
      resourceName,
      description: `Eliminó ${resource}: ${resourceName}`,
      severity: "high",
      metadata,
    });
  }

  async logBulkAction(
    action: "bulk_update" | "bulk_delete",
    resource: AuditResource,
    resourceIds: string[],
    description?: string
  ): Promise<AuditEvent> {
    return this.createAuditEvent({
      action,
      resource,
      resourceId: "bulk-operation",
      resourceName: `${resourceIds.length} ${resource}s`,
      description:
        description || `${action} en ${resourceIds.length} ${resource}s`,
      severity: "high",
      metadata: {
        resourceIds,
        count: resourceIds.length,
      },
    });
  }

  // 🔍 Helper Methods
  private determineChangeType(
    oldValue: unknown,
    newValue: unknown
  ): AuditChange["type"] {
    if (oldValue === undefined || oldValue === null) {
      return "added";
    }
    if (newValue === undefined || newValue === null) {
      return "removed";
    }
    return "modified";
  }
}

// 🏭 Factory function to create AuditService with session (for read operations - cacheable)
export const createAuditService = async (sessionData?: {
  userId: string;
  userRole: "user" | "admin" | "super_admin";
}): Promise<AuditService> => {
  // If session data is provided (from cached context), use it directly
  if (sessionData) {
    return new AuditService({
      currentUserId: sessionData.userId,
      currentUserRole: sessionData.userRole,
    });
  }

  // Otherwise, get session normally (for non-cached operations)
  const session = await auditValidators.getValidatedSession();

  return new AuditService({
    currentUserId: session.user.id,
    currentUserRole: session.user.role,
  });
};

// 🏭 Factory function to create AuditService with session and request info (for write operations)
export const createAuditServiceWithHeaders = async (): Promise<{
  service: AuditService;
  requestInfo: { ipAddress: string; userAgent: string };
}> => {
  // Use the same session validation logic as validators
  const session = await auditValidators.getValidatedSession();

  // Get request info
  const headersList = await headers();
  const ipAddress =
    headersList.get("x-forwarded-for") ||
    headersList.get("x-real-ip") ||
    "unknown";
  const userAgent = headersList.get("user-agent") || "unknown";

  const service = new AuditService({
    currentUserId: session.user.id,
    currentUserRole: session.user.role,
  });

  return {
    service,
    requestInfo: { ipAddress, userAgent },
  };
};
