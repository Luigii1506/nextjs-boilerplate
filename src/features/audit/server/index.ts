/**
 * 🏢 AUDIT TRAIL SERVER - BARREL EXPORT
 * =====================================
 *
 * Barrel export para todas las funcionalidades server-side.
 * Incluye actions, queries, services, mappers y validators.
 */

// 🚀 Server Actions (for UI) - Essential actions only
export {
  getAuditEventsAction,
  getAuditEventAction,
  getAuditStatsAction,
  createAuditEventAction,
  exportAuditEventsAction,
} from "./actions";

// 🔍 Database Queries
export {
  getAuditEventsWithPagination,
  getAuditEventsCount,
  getAuditEventById,
  getAuditStatsRaw,
  getEventsByResource,
  getEventsByUser,
  getUserActivityRaw,
  getActivitySummaryRaw,
  searchAuditEventsRaw,
  auditEventExists,
  buildAuditSearchCondition,
} from "./queries";

// 🏢 Business Logic Services
export {
  AuditService,
  createAuditService,
  createAuditServiceWithHeaders,
} from "./service";

// 🔄 Data Mappers
export * from "./mappers";

// ✅ Validators
export * from "./validators";
