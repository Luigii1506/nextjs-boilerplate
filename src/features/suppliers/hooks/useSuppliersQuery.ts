/**
 * 🚛 USE SUPPLIERS QUERY HOOK
 * ============================
 *
 * Hook para consultar la lista de proveedores con TanStack Query
 * SHARED module - can be used by inventory, pos, services, etc.
 *
 * Created: 2025-01-17 - Refactored from inventory to shared module
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { getSuppliersAction } from "../actions";
import { SUPPLIER_QUERY_KEYS } from "../constants";
import type {
  SupplierFilters,
  SupplierWithRelations,
} from "@/shared/types/supplier";

interface UseSuppliersQueryOptions {
  filters?: SupplierFilters;
  enabled?: boolean;
  refetchInterval?: number;
}

interface UseSuppliersQueryReturn {
  suppliers: SupplierWithRelations<unknown>[];
  data: SupplierWithRelations<unknown>[]; // Alias for consistency
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch suppliers list with optional filters
 */
export function useSuppliersQuery(
  options: UseSuppliersQueryOptions = {}
): UseSuppliersQueryReturn {
  const { filters, enabled = true, refetchInterval } = options;

  const filterKey = filters ? JSON.stringify(filters) : "all";

  const query = useQuery({
    queryKey: SUPPLIER_QUERY_KEYS.LIST(filterKey),
    queryFn: async () => {
      const result = await getSuppliersAction(filters);

      if (!result.success) {
        throw new Error(result.error || "Error al cargar proveedores");
      }

      return result.data || [];
    },
    enabled,
    refetchInterval,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const suppliers = (query.data || []) as SupplierWithRelations<unknown>[];

  return {
    suppliers,
    data: suppliers, // Alias for consistency
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
