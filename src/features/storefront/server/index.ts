/**
 * 🛒 STOREFRONT SERVER - BARREL EXPORTS
 * =====================================
 *
 * Exportaciones centralizadas del servidor storefront
 * Clean Architecture: Infrastructure Layer (Exports)
 *
 * Created: 2025-01-17 - Storefront Customer Module
 */

// 🚀 Server Actions (Thin Layer)
export * from "./actions";

// 🏢 Services (Thick Layer - Business Logic)
export * as storefrontService from "./service";

// 🔍 Queries (Database Layer)
export * as storefrontQueries from "./queries";

// 🛡️ Validators (Validation Layer)
export * as storefrontValidators from "./validators";

// 🔄 Mappers (Data Transformation Layer)
export * as storefrontMappers from "./mappers";

// 📊 Logging Utilities
export { storefrontLogger, generateRequestId } from "../utils/logger";

// 📋 Types for Server Layer
export type {
  RawProductQueryResult,
  RawCategoryQueryResult,
  RawWishlistQueryResult,
  RawCartQueryResult,
} from "./queries";

export type {
  StorefrontValidationError,
  StorefrontAuthError,
  StorefrontPermissionError,
} from "./validators";
