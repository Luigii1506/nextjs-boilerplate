/**
 * 🛡️ AUDIT TRAIL VALIDATORS
 * =========================
 *
 * Validaciones de reglas de negocio específicas para audit trail
 * Siguiendo el patrón de users module
 */

import { getServerSession } from "@/core/auth/server";
import type {
  AuditAction,
  AuditResource,
  AuditSeverity,
  AuditFilters,
} from "../types";
import {
  AUDIT_CONFIG,
  AUDIT_ACTIONS,
  AUDIT_RESOURCES,
  AUDIT_SEVERITIES,
} from "../constants";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

// 🔐 Auth validation
export const validateUserAuthentication = (
  userId?: string | null,
  userRole?: string | null
) => {
  if (!userId) {
    throw new ValidationError("No autorizado");
  }

  if (!userRole) {
    throw new ValidationError("Rol de usuario no válido");
  }
};

// 👥 Admin permissions validation
export const validateAdminPermissions = (userRole: string) => {
  if (!["admin", "super_admin"].includes(userRole)) {
    throw new ValidationError("Permisos insuficientes");
  }
};

// 👑 Super admin permissions validation
export const validateSuperAdminPermissions = (userRole: string) => {
  if (userRole !== "super_admin") {
    throw new ValidationError(
      "Solo super administradores pueden realizar esta acción"
    );
  }
};

// 🔍 Audit access validation
export const validateAuditAccess = (userRole: string) => {
  if (!["admin", "super_admin"].includes(userRole)) {
    throw new ValidationError("No autorizado para ver eventos de auditoría");
  }
};

// 📤 Export permissions validation
export const validateExportPermissions = (userRole: string) => {
  if (!["admin", "super_admin"].includes(userRole)) {
    throw new ValidationError("No autorizado para exportar eventos");
  }
};

// 🗑️ Delete permissions validation
export const validateDeletePermissions = (userRole: string) => {
  if (userRole !== "super_admin") {
    throw new ValidationError(
      "Solo super administradores pueden eliminar eventos"
    );
  }
};

// 🧹 Cleanup permissions validation
export const validateCleanupPermissions = (userRole: string) => {
  if (userRole !== "super_admin") {
    throw new ValidationError(
      "Solo super administradores pueden limpiar eventos antiguos"
    );
  }
};

// 📝 Create audit event validation
export const validateCreateAuditEvent = async (data: {
  action: string;
  resource: string;
  resourceId: string;
  description: string;
  severity?: string;
}) => {
  // Validate required fields
  if (
    !data.action ||
    !Object.values(AUDIT_ACTIONS).includes(data.action as AuditAction)
  ) {
    throw new ValidationError("Acción inválida");
  }

  if (
    !data.resource ||
    !Object.values(AUDIT_RESOURCES).includes(data.resource as AuditResource)
  ) {
    throw new ValidationError("Recurso inválido");
  }

  if (
    !data.resourceId ||
    typeof data.resourceId !== "string" ||
    data.resourceId.trim().length === 0
  ) {
    throw new ValidationError("El ID del recurso es requerido");
  }

  if (
    !data.description ||
    typeof data.description !== "string" ||
    data.description.trim().length === 0
  ) {
    throw new ValidationError("La descripción es requerida");
  } else if (data.description.length > 500) {
    throw new ValidationError("La descripción no puede exceder 500 caracteres");
  }

  // Validate optional fields
  if (
    data.severity &&
    !Object.values(AUDIT_SEVERITIES).includes(data.severity as AuditSeverity)
  ) {
    throw new ValidationError("Severidad inválida");
  }
};

// 🔍 Search parameters validation
export const validateSearchParameters = (params: {
  query?: string;
  limit?: number;
  filters?: AuditFilters;
}) => {
  const { query, limit = 50, filters } = params;

  if (query && query.length < 3) {
    throw new ValidationError("La búsqueda debe tener al menos 3 caracteres");
  }

  if (limit < 1 || limit > AUDIT_CONFIG.MAX_PAGE_SIZE) {
    throw new ValidationError(
      `El límite debe estar entre 1 y ${AUDIT_CONFIG.MAX_PAGE_SIZE}`
    );
  }

  // Validate filters if provided
  if (filters) {
    validateAuditFilters(filters);
  }
};

// 🔍 Audit filters validation
export const validateAuditFilters = (filters: AuditFilters) => {
  // Validate action
  if (
    filters.action &&
    !Object.values(AUDIT_ACTIONS).includes(filters.action)
  ) {
    throw new ValidationError("Acción de filtro inválida");
  }

  // Validate resource
  if (
    filters.resource &&
    !Object.values(AUDIT_RESOURCES).includes(filters.resource)
  ) {
    throw new ValidationError("Recurso de filtro inválido");
  }

  // Validate severity
  if (
    filters.severity &&
    !Object.values(AUDIT_SEVERITIES).includes(filters.severity)
  ) {
    throw new ValidationError("Severidad de filtro inválida");
  }

  // Validate userId (should be UUID)
  if (filters.userId && !isValidUuid(filters.userId)) {
    throw new ValidationError("ID de usuario inválido");
  }

  // Validate dates
  if (filters.dateFrom && isNaN(filters.dateFrom.getTime())) {
    throw new ValidationError("Fecha de inicio inválida");
  }

  if (filters.dateTo && isNaN(filters.dateTo.getTime())) {
    throw new ValidationError("Fecha de fin inválida");
  }

  if (filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo) {
    throw new ValidationError(
      "La fecha de inicio debe ser anterior a la fecha de fin"
    );
  }

  // Validate search
  if (filters.search && typeof filters.search !== "string") {
    throw new ValidationError("El término de búsqueda debe ser una cadena");
  } else if (filters.search && filters.search.length < 3) {
    throw new ValidationError(
      "El término de búsqueda debe tener al menos 3 caracteres"
    );
  }

  // Validate pagination
  if (filters.page && (!Number.isInteger(filters.page) || filters.page < 1)) {
    throw new ValidationError(
      "El número de página debe ser un entero positivo"
    );
  }

  if (filters.limit) {
    if (!Number.isInteger(filters.limit) || filters.limit < 1) {
      throw new ValidationError("El límite debe ser un entero positivo");
    } else if (filters.limit > AUDIT_CONFIG.MAX_PAGE_SIZE) {
      throw new ValidationError(
        `El límite no puede exceder ${AUDIT_CONFIG.MAX_PAGE_SIZE}`
      );
    }
  }

  // Validate IP address
  if (filters.ipAddress && !isValidIpAddress(filters.ipAddress)) {
    throw new ValidationError("Dirección IP de filtro inválida");
  }
};

// 📤 Export options validation
export const validateExportOptions = (options: {
  format: string;
  dateRange: { from: Date; to: Date };
  filters?: AuditFilters;
}) => {
  // Validate format
  if (!["csv", "json", "pdf"].includes(options.format)) {
    throw new ValidationError("Formato de exportación inválido");
  }

  // Validate date range
  if (!options.dateRange.from || !options.dateRange.to) {
    throw new ValidationError("Las fechas de inicio y fin son requeridas");
  }

  if (
    isNaN(options.dateRange.from.getTime()) ||
    isNaN(options.dateRange.to.getTime())
  ) {
    throw new ValidationError("Fechas inválidas en el rango");
  }

  if (options.dateRange.from > options.dateRange.to) {
    throw new ValidationError(
      "La fecha de inicio debe ser anterior a la fecha de fin"
    );
  }

  // Validate date range is not too large (max 90 days)
  const diffTime = Math.abs(
    options.dateRange.to.getTime() - options.dateRange.from.getTime()
  );
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays > 90) {
    throw new ValidationError(
      "El rango de fechas para exportación no puede ser mayor a 90 días"
    );
  }

  // Validate filters if provided
  if (options.filters) {
    validateAuditFilters(options.filters);
  }
};

// 🔄 Bulk operations validation
export const validateBulkOperation = (
  eventIds: string[],
  maxBulkSize: number = 100
) => {
  if (!Array.isArray(eventIds)) {
    throw new ValidationError("Los IDs de eventos deben ser un array");
  }

  if (eventIds.length === 0) {
    throw new ValidationError("Debe seleccionar al menos un evento");
  }

  if (eventIds.length > maxBulkSize) {
    throw new ValidationError(
      `No se pueden procesar más de ${maxBulkSize} eventos a la vez`
    );
  }

  // Validate each ID is a valid UUID
  eventIds.forEach((id, index) => {
    if (!isValidUuid(id)) {
      throw new ValidationError(
        `ID de evento inválido en posición ${index + 1}`
      );
    }
  });
};

// 🗑️ Cleanup validation
export const validateCleanup = (retentionDays: number) => {
  if (retentionDays < 30) {
    throw new ValidationError("El período de retención mínimo es de 30 días");
  }

  if (retentionDays > AUDIT_CONFIG.MAX_RETENTION_DAYS) {
    throw new ValidationError(
      `El período de retención máximo es de ${AUDIT_CONFIG.MAX_RETENTION_DAYS} días`
    );
  }
};

// 🔒 Resource access validation
export const validateResourceAccess = (
  userRole: string,
  resource: AuditResource,
  action: AuditAction
): boolean => {
  // Super admin can access everything
  if (userRole === "super_admin") {
    return true;
  }

  // Admin can access most resources
  if (userRole === "admin") {
    // Restrict access to system-level operations
    if (resource === "system" && ["delete", "bulk_delete"].includes(action)) {
      return false;
    }
    return true;
  }

  // Regular users can only create audit events for their own actions
  if (userRole === "user") {
    return (
      action === "create" &&
      !["system", "role", "permission"].includes(resource)
    );
  }

  return false;
};

// 🛠️ Helper Methods
const isValidUuid = (uuid: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

const isValidIpAddress = (ip: string): boolean => {
  // IPv4 regex
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  // IPv6 regex (simplified)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};

// 🔒 HELPER: Validate and get authenticated session
export const getValidatedSession = async () => {
  const session = await getServerSession();
  validateUserAuthentication(session?.user?.id, session?.user?.role);

  // TypeScript assertion after validation - we know user exists after validation
  if (!session?.user?.id || !session?.user?.role) {
    throw new ValidationError("Invalid session state after validation");
  }

  return {
    user: {
      id: session.user.id,
      role: session.user.role as "user" | "admin" | "super_admin",
    },
  };
};
