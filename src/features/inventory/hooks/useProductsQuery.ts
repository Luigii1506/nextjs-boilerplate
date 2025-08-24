/**
 * 📦 USE PRODUCTS QUERY
 * ====================
 *
 * Hook especializado para gestión de productos
 * Versión simplificada del hook principal con foco en productos
 *
 * Created: 2025-01-17 - Inventory Management Module
 */

import { useInventoryQuery } from "./useInventoryQuery";
import type {
  ProductFilters,
  PaginationParams,
  CreateProductInput,
  UpdateProductInput,
  ProductWithRelations,
  ActionResult,
} from "../types";

interface UseProductsQueryProps {
  filters?: ProductFilters;
  pagination?: PaginationParams;
  enabled?: boolean;
}

interface UseProductsQueryResult {
  // Data
  products: ProductWithRelations[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };

  // Loading states
  isLoading: boolean;
  isRefetching: boolean;
  isError: boolean;
  error: Error | null;

  // Actions
  createProduct: (data: CreateProductInput) => Promise<ActionResult>;
  updateProduct: (data: UpdateProductInput) => Promise<ActionResult>;
  deleteProduct: (id: string) => Promise<ActionResult>;

  // Utilities
  refetch: () => void;
}

export function useProductsQuery(
  props: UseProductsQueryProps = {}
): UseProductsQueryResult {
  const { filters, pagination, enabled = true } = props;

  const {
    products,
    pagination: paginationData,
    isLoading,
    isRefetching,
    isError,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch,
  } = useInventoryQuery({
    productFilters: filters,
    productsPagination: pagination,
    enabled,
  });

  return {
    products,
    pagination: paginationData,
    isLoading,
    isRefetching,
    isError,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch,
  };
}
