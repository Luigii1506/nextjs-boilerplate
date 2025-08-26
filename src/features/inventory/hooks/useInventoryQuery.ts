/**
 * 📦 USE INVENTORY QUERY
 * =====================
 *
 * Hook principal para el módulo de inventory management
 * TanStack Query + optimistic updates + cache management
 *
 * Created: 2025-01-17 - Inventory Management Module
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { useNotifications } from "@/shared/providers/NotificationProvider";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { INVENTORY_DEFAULTS } from "../constants";
import {
  getProductsAction,
  createProductAction,
  updateProductAction,
  deleteProductAction,
  getCategoriesAction,
  createCategoryAction,
  getSuppliersAction,
  addStockMovementAction,
  getInventoryStatsAction,
  getLowStockAlertsAction,
} from "../actions";
import type {
  ProductWithRelations,
  CategoryWithRelations,
  SupplierWithRelations,
  StockMovement,
  InventoryStats,
  StockAlert,
  CreateProductInput,
  UpdateProductInput,
  CreateCategoryInput,
  CreateStockMovementInput,
  ProductFilters,
  CategoryFilters,
  SupplierFilters,
  PaginationParams,
  PaginatedResponse,
  ActionResult,
  UseInventoryQueryResult,
  Product,
} from "../types";
import { useMemo, useCallback } from "react";

// 🗂️ QUERY KEYS
export const INVENTORY_QUERY_KEYS = {
  all: ["inventory"] as const,
  products: () => ["inventory", "products"] as const,
  productsList: (filters?: ProductFilters, pagination?: PaginationParams) =>
    ["inventory", "products", "list", filters, pagination] as const,
  product: (id: string) => ["inventory", "products", id] as const,
  categories: () => ["inventory", "categories"] as const,
  categoriesList: (filters?: CategoryFilters) =>
    ["inventory", "categories", "list", filters] as const,
  category: (id: string) => ["inventory", "categories", id] as const,
  suppliers: () => ["inventory", "suppliers"] as const,
  suppliersList: (filters?: SupplierFilters) =>
    ["inventory", "suppliers", "list", filters] as const,
  supplier: (id: string) => ["inventory", "suppliers", id] as const,
  stats: () => ["inventory", "stats"] as const,
  alerts: () => ["inventory", "alerts"] as const,
} as const;

export const PRODUCTS_QUERY_KEYS = {
  all: () => ["inventory", "products"] as const,
  lists: () => ["inventory", "products", "list"] as const,
  list: (filters?: ProductFilters) =>
    ["inventory", "products", "list", filters] as const,
  details: () => ["inventory", "products", "detail"] as const,
  detail: (id: string) => ["inventory", "products", "detail", id] as const,
} as const;

export const CATEGORIES_QUERY_KEYS = {
  all: () => ["inventory", "categories"] as const,
  lists: () => ["inventory", "categories", "list"] as const,
  list: (filters?: CategoryFilters) =>
    ["inventory", "categories", "list", filters] as const,
  detail: (id: string) => ["inventory", "categories", "detail", id] as const,
} as const;

export const SUPPLIERS_QUERY_KEYS = {
  all: () => ["inventory", "suppliers"] as const,
  lists: () => ["inventory", "suppliers", "list"] as const,
  list: (filters?: SupplierFilters) =>
    ["inventory", "suppliers", "list", filters] as const,
  detail: (id: string) => ["inventory", "suppliers", "detail", id] as const,
} as const;

export const STOCK_MOVEMENTS_QUERY_KEYS = {
  all: () => ["inventory", "stock-movements"] as const,
  lists: () => ["inventory", "stock-movements", "list"] as const,
  list: (productId?: string) =>
    ["inventory", "stock-movements", "list", productId] as const,
} as const;

// 🗄️ DATA FETCHERS
async function fetchProducts(
  filters?: ProductFilters,
  pagination?: PaginationParams
): Promise<PaginatedResponse<ProductWithRelations>> {
  const result = await getProductsAction(filters, pagination);
  if (!result.success || !result.data) {
    throw new Error(result.error || "Error fetching products");
  }
  return result.data;
}

async function fetchCategories(
  filters?: CategoryFilters
): Promise<CategoryWithRelations[]> {
  const result = await getCategoriesAction(filters);
  if (!result.success || !result.data) {
    throw new Error(result.error || "Error fetching categories");
  }
  return result.data;
}

async function fetchSuppliers(
  filters?: SupplierFilters
): Promise<SupplierWithRelations[]> {
  const result = await getSuppliersAction(filters);
  if (!result.success || !result.data) {
    throw new Error(result.error || "Error fetching suppliers");
  }
  return result.data;
}

async function fetchInventoryStats(): Promise<InventoryStats> {
  const result = await getInventoryStatsAction();
  if (!result.success || !result.data) {
    throw new Error(result.error || "Error fetching stats");
  }
  return result.data;
}

async function fetchLowStockAlerts(): Promise<StockAlert[]> {
  const result = await getLowStockAlertsAction();
  if (!result.success || !result.data) {
    throw new Error(result.error || "Error fetching alerts");
  }
  return result.data;
}

// 🎯 MUTATION FUNCTIONS
async function createProduct(data: CreateProductInput): Promise<ActionResult> {
  return await createProductAction(data);
}

async function updateProduct({
  id,
  data,
}: {
  id: string;
  data: UpdateProductInput;
}): Promise<ActionResult> {
  return await updateProductAction(id, data);
}

async function deleteProduct(id: string): Promise<ActionResult> {
  return await deleteProductAction(id);
}

async function createCategory(
  data: CreateCategoryInput
): Promise<ActionResult> {
  return await createCategoryAction(data);
}

async function addStockMovement(
  data: CreateStockMovementInput
): Promise<ActionResult> {
  return await addStockMovementAction(data);
}

// 📊 MAIN HOOK
interface UseInventoryQueryProps {
  // Products
  productFilters?: ProductFilters;
  productsPagination?: PaginationParams;

  // Categories
  categoryFilters?: CategoryFilters;

  // Suppliers
  supplierFilters?: SupplierFilters;

  // Options
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
}

export function useInventoryQuery(
  props: UseInventoryQueryProps = {}
): UseInventoryQueryResult {
  const { success, error: notifyError } = useNotifications();
  const queryClient = useQueryClient();

  const {
    productFilters,
    productsPagination,
    categoryFilters,
    supplierFilters,
    enabled = true,
    refetchOnWindowFocus = true,
  } = props;

  // 📦 PRODUCTS QUERY
  const {
    data: productsResponse,
    isLoading: isLoadingProducts,
    isFetching: isFetchingProducts,
    error: productsError,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: INVENTORY_QUERY_KEYS.productsList(
      productFilters,
      productsPagination
    ),
    queryFn: () => fetchProducts(productFilters, productsPagination),
    staleTime: INVENTORY_DEFAULTS.QUERY_STALE_TIME,
    gcTime: INVENTORY_DEFAULTS.QUERY_GC_TIME,
    enabled,
    refetchOnWindowFocus,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  });

  // 🏷️ CATEGORIES QUERY
  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    isFetching: isFetchingCategories,
    error: categoriesError,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: CATEGORIES_QUERY_KEYS.list(categoryFilters),
    queryFn: () => fetchCategories(categoryFilters),
    staleTime: INVENTORY_DEFAULTS.QUERY_STALE_TIME,
    gcTime: INVENTORY_DEFAULTS.QUERY_GC_TIME,
    enabled,
    refetchOnWindowFocus,
  });

  // 🚛 SUPPLIERS QUERY
  const {
    data: suppliers = [],
    isLoading: isLoadingSuppliers,
    isFetching: isFetchingSuppliers,
    error: suppliersError,
    refetch: refetchSuppliers,
  } = useQuery({
    queryKey: SUPPLIERS_QUERY_KEYS.list(supplierFilters),
    queryFn: () => fetchSuppliers(supplierFilters),
    staleTime: INVENTORY_DEFAULTS.QUERY_STALE_TIME,
    gcTime: INVENTORY_DEFAULTS.QUERY_GC_TIME,
    enabled,
    refetchOnWindowFocus,
  });

  // 📊 STATS QUERY
  const {
    data: stats = null,
    isLoading: isLoadingStats,
    isFetching: isFetchingStats,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: INVENTORY_QUERY_KEYS.stats(),
    queryFn: fetchInventoryStats,
    staleTime: INVENTORY_DEFAULTS.STATS_STALE_TIME,
    gcTime: INVENTORY_DEFAULTS.QUERY_GC_TIME,
    enabled,
    refetchOnWindowFocus,
  });

  // 🚨 ALERTS QUERY
  const {
    data: alerts = [],
    isLoading: isLoadingAlerts,
    isFetching: isFetchingAlerts,
    error: alertsError,
    refetch: refetchAlerts,
  } = useQuery({
    queryKey: INVENTORY_QUERY_KEYS.alerts(),
    queryFn: fetchLowStockAlerts,
    staleTime: INVENTORY_DEFAULTS.STATS_STALE_TIME,
    gcTime: INVENTORY_DEFAULTS.QUERY_GC_TIME,
    enabled,
    refetchOnWindowFocus,
  });

  // 🔄 MUTATIONS
  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: INVENTORY_QUERY_KEYS.products(),
        });
        queryClient.invalidateQueries({
          queryKey: INVENTORY_QUERY_KEYS.stats(),
        });
        success("El producto se ha creado exitosamente", {
          duration: 5000,
        });
      } else {
        notifyError(result.error || "Ocurrió un error inesperado", {
          duration: 8000,
        });
      }
    },
    onError: (error) => {
      notifyError(error.message || "Ocurrió un error inesperado", {
        duration: 8000,
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: updateProduct,
    onMutate: async (variables) => {
      // Optimistic update
      await queryClient.cancelQueries({
        queryKey: INVENTORY_QUERY_KEYS.products(),
      });

      const previousProducts = queryClient.getQueryData(
        INVENTORY_QUERY_KEYS.productsList(productFilters, productsPagination)
      );

      // Update cache optimistically
      queryClient.setQueryData(
        INVENTORY_QUERY_KEYS.productsList(productFilters, productsPagination),
        (old: PaginatedResponse<ProductWithRelations> | undefined) => {
          if (!old) return old;

          return {
            ...old,
            data: old.data.map((product) =>
              product.id === variables.id
                ? { ...product, ...variables, updatedAt: new Date() }
                : product
            ),
          };
        }
      );

      return { previousProducts };
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: INVENTORY_QUERY_KEYS.products(),
        });
        queryClient.invalidateQueries({
          queryKey: INVENTORY_QUERY_KEYS.stats(),
        });
        success("Los cambios se han guardado exitosamente", {
          duration: 5000,
        });
      } else {
        notifyError(result.error || "Ocurrió un error inesperado", {
          duration: 8000,
        });
      }
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousProducts) {
        queryClient.setQueryData(
          INVENTORY_QUERY_KEYS.productsList(productFilters, productsPagination),
          context.previousProducts
        );
      }

      notifyError(error.message || "Ocurrió un error inesperado", {
        duration: 8000,
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: (result, productId) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: INVENTORY_QUERY_KEYS.products(),
        });
        queryClient.invalidateQueries({
          queryKey: INVENTORY_QUERY_KEYS.stats(),
        });
        queryClient.removeQueries({
          queryKey: INVENTORY_QUERY_KEYS.product(productId),
        });

        success("El producto se ha eliminado exitosamente", {
          duration: 5000,
        });
      } else {
        notifyError(result.error || "Ocurrió un error inesperado", {
          duration: 8000,
        });
      }
    },
    onError: (error) => {
      notifyError(error.message || "Ocurrió un error inesperado", {
        duration: 8000,
      });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: CATEGORIES_QUERY_KEYS.all(),
        });
        success("La categoría se ha creado exitosamente", {
          duration: 5000,
        });
      } else {
        notifyError(result.error || "Ocurrió un error inesperado", {
          duration: 8000,
        });
      }
    },
  });

  const addStockMovementMutation = useMutation({
    mutationFn: addStockMovement,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: INVENTORY_QUERY_KEYS.products(),
        });
        queryClient.invalidateQueries({
          queryKey: INVENTORY_QUERY_KEYS.stats(),
        });
        queryClient.invalidateQueries({
          queryKey: INVENTORY_QUERY_KEYS.alerts(),
        });
        queryClient.invalidateQueries({
          queryKey: STOCK_MOVEMENTS_QUERY_KEYS.all(),
        });

        success("El movimiento de stock se ha registrado exitosamente", {
          duration: 5000,
        });
      } else {
        notifyError(result.error || "Ocurrió un error inesperado", {
          duration: 8000,
        });
      }
    },
  });

  // 🧮 COMPUTED VALUES
  const products = useMemo(
    () => productsResponse?.data || [],
    [productsResponse]
  );
  const pagination = useMemo(
    () => productsResponse?.pagination,
    [productsResponse]
  );

  const isLoading =
    isLoadingProducts ||
    isLoadingCategories ||
    isLoadingSuppliers ||
    isLoadingStats ||
    isLoadingAlerts;
  const isRefetching =
    isFetchingProducts ||
    isFetchingCategories ||
    isFetchingSuppliers ||
    isFetchingStats ||
    isFetchingAlerts;
  const error =
    productsError ||
    categoriesError ||
    suppliersError ||
    statsError ||
    alertsError;

  // 🔧 UTILITIES
  const refetchAll = useCallback(() => {
    refetchProducts();
    refetchCategories();
    refetchSuppliers();
    refetchStats();
    refetchAlerts();
  }, [
    refetchProducts,
    refetchCategories,
    refetchSuppliers,
    refetchStats,
    refetchAlerts,
  ]);

  const invalidateCache = useCallback(
    (tags: string[] = []) => {
      if (tags.length === 0) {
        queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.all });
      } else {
        tags.forEach((tag) => {
          queryClient.invalidateQueries({ queryKey: [tag] });
        });
      }
    },
    [queryClient]
  );

  // 🎯 RETURN HOOK RESULT
  return {
    // Data
    products,
    categories,
    suppliers,
    stockMovements: [], // TODO: Implement when needed
    stats,
    alerts,
    pagination,

    // Loading states
    isLoading,
    isRefetching,
    isError: !!error,
    error: error as Error | null,

    // Product actions
    createProduct: async (data: CreateProductInput) => {
      return (await createProductMutation.mutateAsync(
        data
      )) as ActionResult<ProductWithRelations>;
    },
    // AQUI
    updateProduct: async (id: string, data: UpdateProductInput) => {
      return (await updateProductMutation.mutateAsync({
        id,
        data,
      })) as ActionResult<Product>;
    },
    deleteProduct: async (id: string) => {
      return (await deleteProductMutation.mutateAsync(
        id
      )) as ActionResult<void>;
    },

    // Category actions
    createCategory: async (data: CreateCategoryInput) => {
      return (await createCategoryMutation.mutateAsync(
        data
      )) as ActionResult<CategoryWithRelations>;
    },
    updateCategory: async () => ({ success: false, error: "Not implemented" }), // TODO
    deleteCategory: async () => ({ success: false, error: "Not implemented" }), // TODO

    // Supplier actions
    createSupplier: async () => ({ success: false, error: "Not implemented" }), // TODO
    updateSupplier: async () => ({ success: false, error: "Not implemented" }), // TODO
    deleteSupplier: async () => ({ success: false, error: "Not implemented" }), // TODO

    // Stock movement actions
    addStockMovement: async (data: CreateStockMovementInput) => {
      return (await addStockMovementMutation.mutateAsync(
        data
      )) as ActionResult<StockMovement>;
    },

    // Utilities
    refetch: refetchAll,
    invalidateCache,
  };
}

// 🎯 INDIVIDUAL QUERY HOOKS

/**
 * Hook for categories only
 */
export function useCategoriesQuery(
  filters?: CategoryFilters,
  options: {
    enabled?: boolean;
    staleTime?: number;
    refetchOnWindowFocus?: boolean;
  } = {}
) {
  const {
    enabled = true,
    staleTime = 30000,
    refetchOnWindowFocus = false,
  } = options;

  const query = useQuery({
    queryKey: CATEGORIES_QUERY_KEYS.list(filters),
    queryFn: () => getCategoriesAction(filters),
    enabled,
    staleTime,
    refetchOnWindowFocus,
    select: (response) => {
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || "Error fetching categories");
    },
  });

  return {
    data: query.data || [],
    categories: query.data || [],
    isLoading: query.isLoading,
    error: query.error || null,
    refetch: query.refetch,
  };
}

/**
 * Hook for suppliers only
 */
export function useSuppliersQuery(
  filters?: SupplierFilters,
  options: {
    enabled?: boolean;
    staleTime?: number;
    refetchOnWindowFocus?: boolean;
  } = {}
) {
  const {
    enabled = true,
    staleTime = 30000,
    refetchOnWindowFocus = false,
  } = options;

  const query = useQuery({
    queryKey: SUPPLIERS_QUERY_KEYS.list(filters),
    queryFn: () => getSuppliersAction(filters),
    enabled,
    staleTime,
    refetchOnWindowFocus,
    select: (response) => {
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || "Error fetching suppliers");
    },
  });

  return {
    data: query.data || [],
    suppliers: query.data || [],
    isLoading: query.isLoading,
    error: query.error || null,
    refetch: query.refetch,
  };
}
