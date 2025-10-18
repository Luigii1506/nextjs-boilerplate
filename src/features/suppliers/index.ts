/**
 * 🚛 SUPPLIERS FEATURE MODULE - PUBLIC API
 * =========================================
 *
 * Shared supplier management feature
 * Used by: inventory, pos, services, seller-portal
 *
 * Created: 2025-01-17 - Refactored from inventory
 */

// 🎯 Server-side Services
export { SupplierService } from "./server/service";
export * from "./server/queries";
export * from "./server/validators";
export * from "./server/mappers";

// 🎣 Client-side Hooks
export { useCreateSupplier } from "./hooks/useCreateSupplier";
export { useSuppliersQuery } from "./hooks/useSuppliersQuery";

// 📊 Types (re-export from shared)
export type {
  Supplier,
  SupplierWithRelations,
  CreateSupplierInput,
  UpdateSupplierInput,
  SupplierFilters,
  SupplierStats,
} from "@/shared/types/supplier";

// 🎨 Constants
export * from "./constants";

// 🎨 UI Components & Screens
export * from "./ui/screens";

// 🎯 Context
export * from "./context";
