/**
 * ✅ AUDIT TRAIL SCHEMAS
 * ======================
 *
 * Schemas de validación con Zod para audit trail.
 * Incluye validaciones para eventos, filtros y exportación.
 */

import { z } from "zod";
import {
  AUDIT_ACTIONS,
  AUDIT_RESOURCES,
  AUDIT_SEVERITIES,
  AUDIT_CONFIG,
} from "./constants";

// 🎯 Base Schemas
export const auditActionSchema = z.enum([
  "create",
  "update",
  "delete",
  "login",
  "logout",
  "view",
  "export",
  "import",
  "bulk_update",
  "bulk_delete",
  "toggle",
  "activate",
  "deactivate",
]);

export const auditResourceSchema = z.enum([
  "user",
  "feature_flag",
  "order",
  "product",
  "setting",
  "role",
  "permission",
  "session",
  "file",
  "dashboard",
  "system",
]);

export const auditSeveritySchema = z.enum([
  "low",
  "medium",
  "high",
  "critical",
]);

// 🔄 Audit Change Schema
export const auditChangeSchema = z.object({
  field: z.string().min(1, "El campo es requerido"),
  fieldLabel: z.string().optional(),
  oldValue: z.any(),
  newValue: z.any(),
  type: z.enum(["added", "modified", "removed"]),
});

// 📝 Create Audit Event Schema
export const createAuditEventSchema = z.object({
  action: auditActionSchema,
  resource: auditResourceSchema,
  resourceId: z.string().min(1, "El ID del recurso es requerido"),
  resourceName: z.string().optional(),
  description: z
    .string()
    .min(1, "La descripción es requerida")
    .max(500, "La descripción es muy larga"),
  severity: auditSeveritySchema.default("medium"),
  metadata: z.record(z.string(), z.unknown()).optional(),
  changes: z.array(auditChangeSchema).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().max(500).optional(),
});

// 🔍 Audit Filters Schema
export const auditFiltersSchema = z
  .object({
    action: auditActionSchema.optional(),
    resource: auditResourceSchema.optional(),
    userId: z.string().uuid().optional(),
    severity: auditSeveritySchema.optional(),
    dateFrom: z.date().optional(),
    dateTo: z.date().optional(),
    search: z
      .string()
      .min(3, "La búsqueda debe tener al menos 3 caracteres")
      .optional()
      .or(z.literal("")),
    resourceId: z.string().optional(),
    ipAddress: z.string().optional(),
    page: z.number().int().min(1).default(1),
    limit: z
      .number()
      .int()
      .min(1)
      .max(AUDIT_CONFIG.MAX_PAGE_SIZE)
      .default(AUDIT_CONFIG.DEFAULT_PAGE_SIZE),
  })
  .refine(
    (data) => {
      // Validar que dateFrom sea anterior a dateTo
      if (data.dateFrom && data.dateTo) {
        return data.dateFrom <= data.dateTo;
      }
      return true;
    },
    {
      message: "La fecha de inicio debe ser anterior a la fecha de fin",
      path: ["dateFrom"],
    }
  );

// 📊 Export Options Schema
export const auditExportOptionsSchema = z
  .object({
    format: z.enum(["csv", "json", "pdf"]),
    filters: auditFiltersSchema.optional(),
    dateRange: z
      .object({
        from: z.date(),
        to: z.date(),
      })
      .refine((data) => data.from <= data.to, {
        message: "La fecha de inicio debe ser anterior a la fecha de fin",
        path: ["from"],
      }),
    includeChanges: z.boolean().default(true),
    includeMetadata: z.boolean().default(false),
  })
  .refine(
    (data) => {
      // Validar que el rango de fechas no sea mayor a 90 días para exports
      const diffTime = Math.abs(
        data.dateRange.to.getTime() - data.dateRange.from.getTime()
      );
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 90;
    },
    {
      message:
        "El rango de fechas para exportación no puede ser mayor a 90 días",
      path: ["dateRange"],
    }
  );

// 🎯 Bulk Operations Schema
export const bulkAuditActionSchema = z.object({
  eventIds: z
    .array(z.string().uuid())
    .min(1, "Debe seleccionar al menos un evento"),
  action: z.enum(["delete", "export", "archive"]),
  reason: z
    .string()
    .min(10, "Debe proporcionar una razón de al menos 10 caracteres")
    .optional(),
});

// 📅 Date Range Preset Schema
export const dateRangePresetSchema = z
  .object({
    preset: z.enum(["1h", "24h", "7d", "30d", "90d", "custom"]),
    customRange: z
      .object({
        from: z.date(),
        to: z.date(),
      })
      .optional(),
  })
  .refine(
    (data) => {
      if (data.preset === "custom") {
        return data.customRange && data.customRange.from <= data.customRange.to;
      }
      return true;
    },
    {
      message: "Para rango personalizado, debe proporcionar fechas válidas",
      path: ["customRange"],
    }
  );

// 🔍 Search Schema
export const auditSearchSchema = z.object({
  query: z
    .string()
    .min(3, "La búsqueda debe tener al menos 3 caracteres")
    .max(100, "La búsqueda es muy larga"),
  fields: z
    .array(
      z.enum([
        "description",
        "resourceName",
        "userName",
        "userEmail",
        "ipAddress",
      ])
    )
    .optional(),
  exact: z.boolean().default(false),
});

// 📊 Stats Request Schema
export const auditStatsRequestSchema = z.object({
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  groupBy: z
    .enum(["action", "resource", "severity", "user", "day", "hour"])
    .optional(),
  limit: z.number().int().min(1).max(100).default(10),
});

// 🎭 Timeline Request Schema
export const auditTimelineRequestSchema = z.object({
  filters: auditFiltersSchema.optional(),
  groupBy: z.enum(["day", "hour"]).default("day"),
  limit: z.number().int().min(1).max(1000).default(100),
});

// 🔄 Update Event Schema (for admin corrections)
export const updateAuditEventSchema = z.object({
  description: z
    .string()
    .min(1, "La descripción es requerida")
    .max(500, "La descripción es muy larga")
    .optional(),
  severity: auditSeveritySchema.optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  adminNote: z.string().max(1000, "La nota del admin es muy larga").optional(),
});

// 📋 Validation Helpers
export const validateAuditFilters = (filters: unknown) => {
  return auditFiltersSchema.safeParse(filters);
};

export const validateCreateAuditEvent = (data: unknown) => {
  return createAuditEventSchema.safeParse(data);
};

export const validateExportOptions = (options: unknown) => {
  return auditExportOptionsSchema.safeParse(options);
};

// 🎯 Type Inference
export type AuditFiltersInput = z.infer<typeof auditFiltersSchema>;
export type CreateAuditEventInput = z.infer<typeof createAuditEventSchema>;
export type AuditExportOptionsInput = z.infer<typeof auditExportOptionsSchema>;
export type BulkAuditActionInput = z.infer<typeof bulkAuditActionSchema>;
export type AuditSearchInput = z.infer<typeof auditSearchSchema>;
export type AuditStatsRequestInput = z.infer<typeof auditStatsRequestSchema>;
export type UpdateAuditEventInput = z.infer<typeof updateAuditEventSchema>;
