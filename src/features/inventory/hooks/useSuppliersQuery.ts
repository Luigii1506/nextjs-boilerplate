/**
 * 🚛 USE SUPPLIERS QUERY
 * ======================
 *
 * Hook especializado para gestión de proveedores
 *
 * Created: 2025-01-17 - Inventory Management Module
 */

import { useInventoryQuery } from "./useInventoryQuery";
import type {
  SupplierFilters,
  CreateSupplierInput,
  UpdateSupplierInput,
  SupplierWithRelations,
  ActionResult,
} from "../types";

interface UseSuppliersQueryProps {
  filters?: SupplierFilters;
  enabled?: boolean;
}

interface UseSuppliersQueryResult {
  // Data
  suppliers: SupplierWithRelations[];

  // Loading states
  isLoading: boolean;
  isRefetching: boolean;
  isError: boolean;
  error: Error | null;

  // Actions
  createSupplier: (data: CreateSupplierInput) => Promise<ActionResult>;
  updateSupplier: (data: UpdateSupplierInput) => Promise<ActionResult>;
  deleteSupplier: (id: string) => Promise<ActionResult>;

  // Utilities
  refetch: () => void;
}

export function useSuppliersQuery(
  props: UseSuppliersQueryProps = {}
): UseSuppliersQueryResult {
  const { filters, enabled = true } = props;

  const {
    suppliers,
    isLoading,
    isRefetching,
    isError,
    error,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    refetch,
  } = useInventoryQuery({
    supplierFilters: filters,
    enabled,
  });

  return {
    suppliers,
    isLoading,
    isRefetching,
    isError,
    error,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    refetch,
  };
}
