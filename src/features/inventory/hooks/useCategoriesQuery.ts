/**
 * 🏷️ USE CATEGORIES QUERY
 * =======================
 *
 * Hook especializado para gestión de categorías
 *
 * Created: 2025-01-17 - Inventory Management Module
 */

import { useInventoryQuery } from "./useInventoryQuery";
import type {
  CategoryFilters,
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryWithRelations,
  ActionResult,
} from "../types";

interface UseCategoriesQueryProps {
  filters?: CategoryFilters;
  enabled?: boolean;
}

interface UseCategoriesQueryResult {
  // Data
  categories: CategoryWithRelations[];

  // Loading states
  isLoading: boolean;
  isRefetching: boolean;
  isError: boolean;
  error: Error | null;

  // Actions
  createCategory: (data: CreateCategoryInput) => Promise<ActionResult>;
  updateCategory: (data: UpdateCategoryInput) => Promise<ActionResult>;
  deleteCategory: (id: string) => Promise<ActionResult>;

  // Utilities
  refetch: () => void;
}

export function useCategoriesQuery(
  props: UseCategoriesQueryProps = {}
): UseCategoriesQueryResult {
  const { filters, enabled = true } = props;

  const {
    categories,
    isLoading,
    isRefetching,
    isError,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch,
  } = useInventoryQuery({
    categoryFilters: filters,
    enabled,
  });

  return {
    categories,
    isLoading,
    isRefetching,
    isError,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch,
  };
}
