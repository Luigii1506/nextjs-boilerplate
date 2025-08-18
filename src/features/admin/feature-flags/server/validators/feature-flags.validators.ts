/**
 * 🛡️ FEATURE-FLAGS ENTERPRISE VALIDATORS
 * ======================================
 *
 * Validadores centralizados para autenticación, autorización y reglas de negocio
 * Siguiendo el patrón enterprise V2.0
 *
 * Updated: 2025-01-18 - Enterprise patterns V2.0
 */

import { headers } from "next/headers";
import { auth } from "@/core/auth/server/auth";
import { validateUserId } from "@/shared/utils/idValidation";
import { FF_PERMISSIONS } from "../../constants";

// 🎯 Logger import
import { featureFlagsSecurityLogger } from "../../utils/logger";

// 🎯 Tipos para session validada
export interface ValidatedSession {
  user: {
    id: string;
    email: string;
    role: "user" | "admin" | "super_admin";
  };
}

/**
 * 🛡️ VALIDACIÓN DE SESIÓN (Centralizada)
 * Obtiene y valida la sesión del usuario
 */
export async function getValidatedSession(): Promise<ValidatedSession> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    featureFlagsSecurityLogger.security("UNAUTHORIZED_ACCESS_ATTEMPT", {
      timestamp: new Date().toISOString(),
      headers: Object.fromEntries(await headers()),
    });
    throw new Error("No autorizado - sesión requerida");
  }

  // Validar que el usuario tenga los campos requeridos
  if (!session.user.id || !session.user.email) {
    featureFlagsSecurityLogger.security("INVALID_SESSION_DATA", {
      userId: session.user.id,
      hasEmail: !!session.user.email,
    });
    throw new Error("Sesión inválida - datos incompletos");
  }

  return session as ValidatedSession;
}

/**
 * 🛡️ VALIDACIÓN DE PERMISOS DE ADMINISTRACIÓN
 * Verifica si el usuario puede realizar operaciones con feature flags
 */
export function validateAdminAccess(userRole: string): void {
  const adminRoles = ["admin", "super_admin"];

  if (!adminRoles.includes(userRole)) {
    featureFlagsSecurityLogger.security("UNAUTHORIZED_ADMIN_ACCESS", {
      userRole,
      requiredRoles: adminRoles,
      permission: FF_PERMISSIONS.ADMIN,
    });
    throw new Error("Permisos de administrador requeridos para feature flags");
  }
}

/**
 * 🔐 VALIDACIÓN DE PERMISOS ESPECÍFICOS
 * Verifica permisos específicos para operaciones de feature flags
 */
export function validateFeatureFlagPermission(
  userRole: string,
  permission: string
): void {
  const permissionMap = {
    [FF_PERMISSIONS.READ]: ["user", "admin", "super_admin"],
    [FF_PERMISSIONS.WRITE]: ["admin", "super_admin"],
    [FF_PERMISSIONS.DELETE]: ["admin", "super_admin"],
    [FF_PERMISSIONS.ADMIN]: ["admin", "super_admin"],
    [FF_PERMISSIONS.SCHEMA]: ["super_admin"], // Solo super_admin para schema
  };

  const allowedRoles = permissionMap[permission as keyof typeof permissionMap];

  if (!allowedRoles || !allowedRoles.includes(userRole)) {
    featureFlagsSecurityLogger.security("INSUFFICIENT_PERMISSIONS", {
      userRole,
      requestedPermission: permission,
      allowedRoles,
    });
    throw new Error(`Permisos insuficientes para ${permission}`);
  }
}

/**
 * 📝 VALIDACIÓN DE FLAG KEY
 * Verifica que el flag key sea válido
 */
export function validateFlagKey(
  flagKey: string,
  fieldName: string = "Flag key"
): void {
  if (!flagKey || typeof flagKey !== "string") {
    throw new Error(`${fieldName} es requerido`);
  }

  // Validar formato de flag key (alfanumérico, empieza con letra)
  const flagKeyRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/;
  if (!flagKeyRegex.test(flagKey)) {
    throw new Error(
      `${fieldName} debe ser alfanumérico y empezar con una letra`
    );
  }

  // Validar longitud
  if (flagKey.length < 2 || flagKey.length > 50) {
    throw new Error(`${fieldName} debe tener entre 2 y 50 caracteres`);
  }
}

/**
 * 🔍 VALIDACIÓN DE USER ID (para audit trails)
 * Verifica que un userId sea válido si se proporciona
 */
export function validateAuditUserId(userId: string | undefined): void {
  if (userId) {
    validateUserId(userId, "User ID para auditoría");
  }
}

/**
 * 📊 VALIDACIÓN DE ROLLOUT PERCENTAGE
 * Verifica que el porcentaje de rollout sea válido
 */
export function validateRolloutPercentage(percentage: number): void {
  if (percentage < 0 || percentage > 100) {
    throw new Error("Rollout percentage debe estar entre 0 y 100");
  }

  if (!Number.isInteger(percentage)) {
    throw new Error("Rollout percentage debe ser un número entero");
  }
}

/**
 * 🔗 VALIDACIÓN DE DEPENDENCIAS
 * Verifica que las dependencias sean válidas
 */
export function validateDependencies(dependencies: string[]): void {
  if (!Array.isArray(dependencies)) {
    throw new Error("Dependencies debe ser un array");
  }

  for (const dep of dependencies) {
    validateFlagKey(dep, "Dependency key");
  }

  // Evitar dependencias duplicadas
  const uniqueDeps = new Set(dependencies);
  if (uniqueDeps.size !== dependencies.length) {
    throw new Error("Dependencies no pueden estar duplicadas");
  }
}

/**
 * ⚔️ VALIDACIÓN DE CONFLICTOS
 * Verifica que los conflictos sean válidos
 */
export function validateConflicts(conflicts: string[]): void {
  if (!Array.isArray(conflicts)) {
    throw new Error("Conflicts debe ser un array");
  }

  for (const conflict of conflicts) {
    validateFlagKey(conflict, "Conflict key");
  }

  // Evitar conflictos duplicados
  const uniqueConflicts = new Set(conflicts);
  if (uniqueConflicts.size !== conflicts.length) {
    throw new Error("Conflicts no pueden estar duplicados");
  }
}

/**
 * 🎯 VALIDACIÓN DE CATEGORÍA
 * Verifica que la categoría sea válida
 */
export function validateCategory(category: string): void {
  const validCategories = ["core", "module", "ui", "experimental", "admin"];

  if (!validCategories.includes(category)) {
    throw new Error(
      `Categoría inválida. Opciones válidas: ${validCategories.join(", ")}`
    );
  }
}

/**
 * 🚦 VALIDACIÓN DE OPERACIÓN EN LOTE
 * Verifica que las operaciones en lote sean válidas
 */
export function validateBatchOperation(
  operations: unknown[],
  maxSize: number = 50
): void {
  if (!Array.isArray(operations)) {
    throw new Error("Batch operations debe ser un array");
  }

  if (operations.length === 0) {
    throw new Error("Batch operations no puede estar vacío");
  }

  if (operations.length > maxSize) {
    throw new Error(`Máximo ${maxSize} operaciones por lote permitidas`);
  }
}

/**
 * 🔄 VALIDACIÓN DE ESTADO DE FLAG
 * Verifica que se pueda cambiar el estado de una flag considerando dependencias
 */
export function validateFlagStateChange(
  flagKey: string,
  newState: boolean,
  dependencies: string[],
  conflicts: string[],
  currentFlags: { key: string; enabled: boolean }[]
): void {
  if (newState) {
    // Validar que todas las dependencias estén habilitadas
    const enabledFlags = currentFlags
      .filter((f) => f.enabled)
      .map((f) => f.key);
    const missingDependencies = dependencies.filter(
      (dep) => !enabledFlags.includes(dep)
    );

    if (missingDependencies.length > 0) {
      throw new Error(
        `No se puede habilitar ${flagKey}. Dependencias faltantes: ${missingDependencies.join(
          ", "
        )}`
      );
    }

    // Validar que no haya conflictos activos
    const activeConflicts = conflicts.filter((conflict) =>
      enabledFlags.includes(conflict)
    );

    if (activeConflicts.length > 0) {
      throw new Error(
        `No se puede habilitar ${flagKey}. Conflictos activos: ${activeConflicts.join(
          ", "
        )}`
      );
    }
  } else {
    // Validar que ninguna flag habilitada dependa de esta
    // TODO: Esta validación se debe implementar en el service layer
    // que tiene acceso a las dependencias de cada flag
    const enabledDependentFlags = currentFlags.filter(
      (flag) => flag.enabled && flag.key !== flagKey
    );

    // Por ahora permitimos deshabilitar cualquier flag
    // La validación real de dependencias se maneja en el service layer
    if (enabledDependentFlags.length > 0) {
      // Validation logic would go here but requires service layer data
    }
  }
}
