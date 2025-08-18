/**
 * 🛡️ FILE-UPLOAD VALIDATORS
 * ========================
 *
 * Validadores centralizados para autenticación, autorización y reglas de negocio
 * Siguiendo el patrón enterprise del módulo users
 *
 * Updated: 2025-01-18 - Enterprise patterns refactor
 */

import { headers } from "next/headers";
import { auth } from "@/core/auth/server/auth";
import { fileUploadSecurityLogger } from "../../utils/logger";

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
    fileUploadSecurityLogger.security("UNAUTHORIZED_ACCESS_ATTEMPT", {
      timestamp: new Date().toISOString(),
      headers: Object.fromEntries(await headers()),
    });
    throw new Error("No autorizado - sesión requerida");
  }

  // Validar que el usuario tenga los campos requeridos
  if (!session.user.id || !session.user.email) {
    fileUploadSecurityLogger.security("INVALID_SESSION_DATA", {
      userId: session.user.id,
      hasEmail: !!session.user.email,
    });
    throw new Error("Sesión inválida - datos incompletos");
  }

  return session as ValidatedSession;
}

/**
 * 🎯 VALIDACIÓN DE ACCESO A ARCHIVOS
 * Verifica si el usuario puede acceder a funcionalidades de archivos
 */
export function validateFileAccess(userRole: string): void {
  const allowedRoles = ["user", "admin", "super_admin"];

  if (!allowedRoles.includes(userRole)) {
    fileUploadSecurityLogger.security("INVALID_ROLE_FILE_ACCESS", {
      userRole,
      allowedRoles,
    });
    throw new Error(`Rol '${userRole}' no tiene acceso a archivos`);
  }
}

/**
 * 🛡️ VALIDACIÓN DE PERMISOS DE ADMINISTRACIÓN
 * Verifica si el usuario puede realizar operaciones administrativas
 */
export function validateAdminAccess(userRole: string): void {
  const adminRoles = ["admin", "super_admin"];

  if (!adminRoles.includes(userRole)) {
    fileUploadSecurityLogger.security("UNAUTHORIZED_ADMIN_ACCESS", {
      userRole,
      requiredRoles: adminRoles,
    });
    throw new Error("Permisos de administrador requeridos");
  }
}

/**
 * 📊 VALIDACIÓN DE ESTADÍSTICAS CROSS-USER
 * Verifica si el usuario puede ver estadísticas de otros usuarios
 */
export function validateStatsAccess(
  currentUserId: string,
  targetUserId: string,
  userRole: string
): void {
  // Si es el mismo usuario, siempre permitir
  if (currentUserId === targetUserId) {
    return;
  }

  // Solo admins pueden ver stats de otros usuarios
  const adminRoles = ["admin", "super_admin"];
  if (!adminRoles.includes(userRole)) {
    fileUploadSecurityLogger.security("UNAUTHORIZED_CROSS_USER_STATS", {
      currentUserId,
      targetUserId,
      userRole,
    });
    throw new Error(
      "No tienes permisos para ver estadísticas de otros usuarios"
    );
  }
}

/**
 * 🔍 VALIDACIÓN DE UUID
 * Verifica que un ID tenga formato UUID válido
 */
export function validateUUID(id: string, fieldName: string = "ID"): void {
  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

  if (!id || !uuidRegex.test(id)) {
    throw new Error(`${fieldName} debe ser un UUID válido`);
  }
}

/**
 * 📂 VALIDACIÓN DE CATEGORÍAS
 * Verifica que una categoría sea válida (si se proporciona)
 */
export function validateCategory(categoryId: string | null): void {
  if (categoryId === null || categoryId === undefined) {
    return; // Categorías opcionales
  }

  validateUUID(categoryId, "ID de categoría");
}

/**
 * 🔐 VALIDACIÓN DE PROVEEDOR
 * Verifica que el proveedor de almacenamiento sea válido
 */
export function validateProvider(provider: string): void {
  const validProviders = ["local", "s3", "cloudinary"];

  if (!validProviders.includes(provider)) {
    throw new Error(
      `Proveedor '${provider}' no es válido. Opciones: ${validProviders.join(
        ", "
      )}`
    );
  }
}

/**
 * 📏 VALIDACIÓN DE LÍMITES DE ARCHIVOS
 * Verifica tamaños y cantidades de archivos
 */
export function validateFileLimits(
  files: File[],
  maxFiles: number = 10,
  maxSize: number = 50 * 1024 * 1024
): void {
  if (files.length === 0) {
    throw new Error("Al menos un archivo es requerido");
  }

  if (files.length > maxFiles) {
    throw new Error(
      `Máximo ${maxFiles} archivos permitidos. Recibidos: ${files.length}`
    );
  }

  for (const file of files) {
    if (file.size > maxSize) {
      throw new Error(
        `Archivo '${file.name}' excede el límite de ${Math.round(
          maxSize / (1024 * 1024)
        )}MB`
      );
    }
  }
}
