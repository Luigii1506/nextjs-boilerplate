/**
 * 🔍 ID VALIDATION UTILITIES
 * =========================
 *
 * Utilidades centralizadas para validación de IDs compatible con better-auth
 * Evita repetir regex y lógica de validación en múltiples lugares
 *
 * Created: 2025-01-18 - Solución centralizada UUID/CUID validation
 */

import { z } from "zod";

// 🎯 Regex patterns para diferentes formatos de ID
export const ID_PATTERNS = {
  UUID: /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/,
  CUID: /^c[a-z0-9]{24}$/, // better-auth format
  CUID2: /^[a-z][a-z0-9]*$/, // CUID2 format (newer)
} as const;

/**
 * 🔍 VALIDADOR DE ID UNIVERSAL
 * Función helper para validar IDs en cualquier formato soportado
 */
export function isValidId(id: string): boolean {
  if (!id || typeof id !== "string") {
    return false;
  }

  // Verificar todos los formatos soportados
  return (
    ID_PATTERNS.UUID.test(id) ||
    ID_PATTERNS.CUID.test(id) ||
    ID_PATTERNS.CUID2.test(id)
  );
}

/**
 * 🎯 SCHEMA ZOD PARA USER ID
 * Schema reutilizable para userId compatible con better-auth
 */
export const UserIdSchema = z
  .string()
  .min(1, "User ID is required")
  .refine(isValidId, {
    message: "Invalid user ID format (must be UUID, CUID, or CUID2)",
  });

/**
 * 🎯 SCHEMA ZOD PARA USER ID OPCIONAL
 * Schema reutilizable para userId opcional con transform
 */
export const OptionalUserIdSchema = UserIdSchema.optional()
  .or(z.null())
  .transform((val) => val || undefined);

/**
 * 🔍 VALIDADOR CON THROW ERROR
 * Para uso en validators que necesitan lanzar errores
 */
export function validateUserId(
  id: string,
  fieldName: string = "User ID"
): void {
  if (!isValidId(id)) {
    throw new Error(`${fieldName} debe ser un UUID, CUID, o CUID2 válido`);
  }
}

/**
 * 🎯 DETECTAR TIPO DE ID
 * Útil para logging o debugging
 */
export function detectIdType(
  id: string
): "UUID" | "CUID" | "CUID2" | "UNKNOWN" {
  if (ID_PATTERNS.UUID.test(id)) return "UUID";
  if (ID_PATTERNS.CUID.test(id)) return "CUID";
  if (ID_PATTERNS.CUID2.test(id)) return "CUID2";
  return "UNKNOWN";
}

/**
 * 🎯 NORMALIZAR ID
 * Convierte ID a formato consistente (trim, lowercase si es CUID)
 */
export function normalizeId(id: string): string {
  const trimmed = id.trim();

  // UUIDs deben mantener case original
  if (ID_PATTERNS.UUID.test(trimmed)) {
    return trimmed;
  }

  // CUIDs son case-insensitive, normalizar a lowercase
  return trimmed.toLowerCase();
}

// 🎯 EXPORT DE TYPES
export type IdType = "UUID" | "CUID" | "CUID2";
export type ValidIdString = string & { __brand: "ValidId" };

/**
 * 🎯 TYPE GUARD
 * Para TypeScript type narrowing
 */
export function assertValidId(id: string): asserts id is ValidIdString {
  if (!isValidId(id)) {
    throw new Error(`Invalid ID format: ${id}`);
  }
}
