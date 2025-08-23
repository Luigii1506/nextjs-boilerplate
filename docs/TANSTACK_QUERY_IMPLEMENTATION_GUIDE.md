# 🛠️ **TANSTACK QUERY IMPLEMENTATION GUIDE**

## Guías Paso a Paso y Mejores Prácticas

---

## 📝 **GUÍAS PASO A PASO**

### 🏢 **Guía: Módulo Grande (Ej: Products, Orders)**

#### Paso 1: Estructura Base

```bash
# Crear estructura de directorio
mkdir -p src/features/products/{hooks,server,ui/{components,routes},types,schemas,constants}
```

#### Paso 2: Definir Types y Constants

```typescript
// 📄 src/features/products/types.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductForm {
  name: string;
  price: number;
  category: string;
  stock: number;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}
```

```typescript
// 📄 src/features/products/constants.ts
export const PRODUCTS_CONFIG = {
  STALE_TIME: 30 * 1000,
  CACHE_TIME: 5 * 60 * 1000,
  DEFAULT_PAGE_SIZE: 20,
  SEARCH_DEBOUNCE_MS: 300,
} as const;

export const PRODUCTS_QUERY_KEYS = {
  all: () => ["products"] as const,
  lists: () => [...PRODUCTS_QUERY_KEYS.all(), "list"] as const,
  list: (filters: ProductFilters) =>
    [...PRODUCTS_QUERY_KEYS.lists(), filters] as const,
  details: () => [...PRODUCTS_QUERY_KEYS.all(), "details"] as const,
  detail: (id: string) => [...PRODUCTS_QUERY_KEYS.details(), id] as const,
  searches: () => [...PRODUCTS_QUERY_KEYS.all(), "search"] as const,
  search: (term: string) => [...PRODUCTS_QUERY_KEYS.searches(), term] as const,
} as const;
```

#### Paso 3: Server Actions

```typescript
// 📄 src/features/products/server/actions.ts
"use server";

import { revalidateTag } from "next/cache";

export async function getAllProductsAction() {
  try {
    const response = await fetch(`${process.env.API_URL}/products`, {
      next: { tags: ["products"] },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    const products = await response.json();
    return { success: true, data: products };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function createProductAction(formData: FormData) {
  try {
    const productData = {
      name: formData.get("name") as string,
      price: Number(formData.get("price")),
      category: formData.get("category") as string,
      stock: Number(formData.get("stock")),
    };

    const response = await fetch(`${process.env.API_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      throw new Error("Failed to create product");
    }

    const product = await response.json();
    revalidateTag("products");

    return { success: true, data: product };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create product",
    };
  }
}
```

#### Paso 4: Hook Principal TanStack Query

```typescript
// 📄 src/features/products/hooks/useProductsQuery.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { PRODUCTS_QUERY_KEYS, PRODUCTS_CONFIG } from "../constants";
import {
  getAllProductsAction,
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from "../server/actions";
import type { Product, CreateProductForm, ProductFilters } from "../types";

export const useProductsQuery = (filters: ProductFilters = {}) => {
  const queryClient = useQueryClient();
  const { notify } = useNotifications();

  // 📊 Main query
  const {
    data: products = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: PRODUCTS_QUERY_KEYS.list(filters),
    queryFn: async () => {
      const result = await getAllProductsAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    staleTime: PRODUCTS_CONFIG.STALE_TIME,
    gcTime: PRODUCTS_CONFIG.CACHE_TIME,
  });

  // ✨ Create mutation
  const createProductMutation = useMutation({
    mutationFn: async (productData: CreateProductForm) => {
      const formData = new FormData();
      Object.entries(productData).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      const result = await createProductAction(formData);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onMutate: async (newProduct) => {
      await queryClient.cancelQueries({
        queryKey: PRODUCTS_QUERY_KEYS.lists(),
      });

      const previousProducts = queryClient.getQueryData<Product[]>(
        PRODUCTS_QUERY_KEYS.list(filters)
      );

      // Optimistic update
      queryClient.setQueryData<Product[]>(
        PRODUCTS_QUERY_KEYS.list(filters),
        (old) =>
          old
            ? [...old, { ...newProduct, id: `temp_${Date.now()}` } as Product]
            : []
      );

      return { previousProducts };
    },
    onError: (err, variables, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(
          PRODUCTS_QUERY_KEYS.list(filters),
          context.previousProducts
        );
      }
      notify(err.message, "error");
    },
    onSuccess: () => {
      notify("Producto creado exitosamente", "success");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEYS.lists() });
    },
  });

  // 🔄 Update mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: { id: string } & Partial<CreateProductForm>) => {
      const formData = new FormData();
      formData.append("id", id);
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      const result = await updateProductAction(formData);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({
        queryKey: PRODUCTS_QUERY_KEYS.lists(),
      });

      const previousProducts = queryClient.getQueryData<Product[]>(
        PRODUCTS_QUERY_KEYS.list(filters)
      );

      // Optimistic update
      queryClient.setQueryData<Product[]>(
        PRODUCTS_QUERY_KEYS.list(filters),
        (old) =>
          old?.map((product) =>
            product.id === id ? { ...product, ...updates } : product
          ) || []
      );

      return { previousProducts };
    },
    onError: (err, variables, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(
          PRODUCTS_QUERY_KEYS.list(filters),
          context.previousProducts
        );
      }
      notify(err.message, "error");
    },
    onSuccess: () => {
      notify("Producto actualizado exitosamente", "success");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEYS.lists() });
    },
  });

  // 🗑️ Delete mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const formData = new FormData();
      formData.append("id", id);

      const result = await deleteProductAction(formData);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: PRODUCTS_QUERY_KEYS.lists(),
      });

      const previousProducts = queryClient.getQueryData<Product[]>(
        PRODUCTS_QUERY_KEYS.list(filters)
      );

      // Optimistic update
      queryClient.setQueryData<Product[]>(
        PRODUCTS_QUERY_KEYS.list(filters),
        (old) => old?.filter((product) => product.id !== id) || []
      );

      return { previousProducts };
    },
    onError: (err, variables, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(
          PRODUCTS_QUERY_KEYS.list(filters),
          context.previousProducts
        );
      }
      notify(err.message, "error");
    },
    onSuccess: () => {
      notify("Producto eliminado exitosamente", "success");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEYS.lists() });
    },
  });

  // 📊 Computed values
  const stats = useMemo(
    () => ({
      total: products.length,
      inStock: products.filter((p) => p.stock > 0).length,
      outOfStock: products.filter((p) => p.stock === 0).length,
      totalValue: products.reduce((sum, p) => sum + p.price * p.stock, 0),
    }),
    [products]
  );

  // 🔍 Filter functions
  const filterProducts = useCallback(
    (categoryFilter?: string) => {
      if (!categoryFilter || categoryFilter === "all") return products;
      return products.filter((product) => product.category === categoryFilter);
    },
    [products]
  );

  const searchProducts = useCallback(
    (searchTerm: string) => {
      if (!searchTerm.trim()) return products;
      const term = searchTerm.toLowerCase();
      return products.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.category.toLowerCase().includes(term)
      );
    },
    [products]
  );

  return {
    // Data
    products,
    stats,

    // States
    isLoading,
    error,
    isCreating: createProductMutation.isPending,
    isUpdating: updateProductMutation.isPending,
    isDeleting: deleteProductMutation.isPending,

    // Actions
    createProduct: createProductMutation.mutateAsync,
    updateProduct: updateProductMutation.mutateAsync,
    deleteProduct: deleteProductMutation.mutateAsync,

    // Utilities
    filterProducts,
    searchProducts,
    refresh: refetch,
  };
};
```

#### Paso 5: Hook Especializado para Búsqueda

```typescript
// 📄 src/features/products/hooks/useProductsSearch.ts
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { PRODUCTS_QUERY_KEYS, PRODUCTS_CONFIG } from "../constants";

export const useProductsSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState<"name" | "category" | "all">(
    "all"
  );
  const debouncedTerm = useDebounce(
    searchTerm,
    PRODUCTS_CONFIG.SEARCH_DEBOUNCE_MS
  );

  const {
    data: searchResults = [],
    isLoading: isSearching,
    error,
  } = useQuery({
    queryKey: PRODUCTS_QUERY_KEYS.search({
      term: debouncedTerm,
      field: searchField,
    }),
    queryFn: async () => {
      if (!debouncedTerm.trim()) return [];

      const result = await searchProductsAction({
        term: debouncedTerm,
        field: searchField,
      });

      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: debouncedTerm.length >= 2, // Mínimo 2 caracteres
    keepPreviousData: true, // Mantener datos anteriores mientras carga
    staleTime: 60 * 1000, // 1 minuto
  });

  // Search suggestions
  const suggestions = useMemo(() => {
    if (!searchTerm.trim() || searchTerm.length < 2) return [];

    return searchResults
      .slice(0, 5) // Top 5 suggestions
      .map((product) => ({
        id: product.id,
        text: product.name,
        category: product.category,
      }));
  }, [searchResults, searchTerm]);

  const clearSearch = () => {
    setSearchTerm("");
  };

  const applySearch = (term: string) => {
    setSearchTerm(term);
  };

  return {
    searchTerm,
    setSearchTerm,
    searchField,
    setSearchField,
    debouncedTerm,
    searchResults,
    suggestions,
    isSearching,
    error,
    clearSearch,
    applySearch,
    hasResults: searchResults.length > 0,
    hasSearched: debouncedTerm.length >= 2,
  };
};
```

#### Paso 6: Hook para Modal

```typescript
// 📄 src/features/products/hooks/useProductModal.ts
import { useState } from "react";
import { useProductsQuery } from "./useProductsQuery";
import type { Product, CreateProductForm } from "../types";

export const useProductModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState<CreateProductForm>({
    name: "",
    price: 0,
    category: "",
    stock: 0,
  });

  const { createProduct, updateProduct, isCreating, isUpdating } =
    useProductsQuery();

  const openCreateModal = () => {
    setMode("create");
    setEditingProduct(null);
    setFormData({ name: "", price: 0, category: "", stock: 0 });
    setIsOpen(true);
  };

  const openEditModal = (product: Product) => {
    setMode("edit");
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      stock: product.stock,
    });
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditingProduct(null);
    setFormData({ name: "", price: 0, category: "", stock: 0 });
  };

  const handleSubmit = async () => {
    try {
      if (mode === "create") {
        await createProduct(formData);
      } else if (editingProduct) {
        await updateProduct({ id: editingProduct.id, ...formData });
      }

      closeModal();
    } catch (error) {
      // Error handling is done in the mutation
      console.error("Submit error:", error);
    }
  };

  const updateFormField = <K extends keyof CreateProductForm>(
    field: K,
    value: CreateProductForm[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return {
    // Modal state
    isOpen,
    mode,
    editingProduct,

    // Form data
    formData,
    updateFormField,

    // Actions
    openCreateModal,
    openEditModal,
    closeModal,
    handleSubmit,

    // Loading states
    isSubmitting: isCreating || isUpdating,

    // Computed
    title: mode === "create" ? "Crear Producto" : "Editar Producto",
    submitText: mode === "create" ? "Crear" : "Actualizar",
  };
};
```

#### Paso 7: Componente Principal

```typescript
// 📄 src/features/products/ui/routes/ProductsScreen.tsx
"use client";

import React from "react";
import { useProductsQuery } from "../../hooks/useProductsQuery";
import { useProductModal } from "../../hooks/useProductModal";
import { useProductsSearch } from "../../hooks/useProductsSearch";
import { Button } from "@/shared/ui/components/Button";
import { ProductCard } from "../components/ProductCard";
import { ProductModal } from "../components/ProductModal";
import { SearchBar } from "../components/SearchBar";
import { StatsCards } from "../components/StatsCards";
import { Plus, Search } from "lucide-react";

export default function ProductsScreen() {
  const { products, stats, isLoading, deleteProduct, isDeleting } =
    useProductsQuery();

  const modal = useProductModal();
  const search = useProductsSearch();

  // Use search results if searching, otherwise use all products
  const displayProducts = search.hasSearched ? search.searchResults : products;

  const handleDeleteProduct = async (productId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      await deleteProduct(productId);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Productos ({stats.total})
        </h1>
        <Button
          onClick={modal.openCreateModal}
          className="inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Producto
        </Button>
      </div>

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Search */}
      <div className="mb-6">
        <SearchBar
          value={search.searchTerm}
          onChange={search.setSearchTerm}
          onClear={search.clearSearch}
          isLoading={search.isSearching}
          suggestions={search.suggestions}
          placeholder="Buscar productos..."
        />
      </div>

      {/* Loading overlay during operations */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Eliminando producto...</p>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {displayProducts.length === 0 ? (
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {search.hasSearched
              ? "No se encontraron productos"
              : "No hay productos"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {search.hasSearched
              ? "Intenta con otros términos de búsqueda"
              : "Comienza creando tu primer producto"}
          </p>
          {!search.hasSearched && (
            <div className="mt-6">
              <Button onClick={modal.openCreateModal}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Producto
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={() => modal.openEditModal(product)}
              onDelete={() => handleDeleteProduct(product.id)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <ProductModal {...modal} />
    </div>
  );
}
```

#### Paso 8: Exports del Módulo

```typescript
// 📄 src/features/products/hooks/index.ts
export { useProductsQuery } from "./useProductsQuery";
export { useProductsSearch } from "./useProductsSearch";
export { useProductModal } from "./useProductModal";
export { useProductDetails } from "./useProductDetails";
export { useProductsInfinite } from "./useProductsInfinite";
export { useProductsBulk } from "./useProductsBulk";
export { useProductsCacheManager } from "./useProductsCacheManager";

// Export query keys for external use
export { PRODUCTS_QUERY_KEYS } from "../constants";
```

```typescript
// 📄 src/features/products/index.ts
// Core hooks
export * from "./hooks";

// Types
export * from "./types";

// Constants
export * from "./constants";

// Server actions
export * from "./server/actions";

// UI components
export { default as ProductsScreen } from "./ui/routes/ProductsScreen";
export { ProductCard } from "./ui/components/ProductCard";
export { ProductModal } from "./ui/components/ProductModal";
```

---

### 🏠 **Guía: Módulo Pequeño (Ej: Dashboard, Settings)**

#### Paso 1: Estructura Simplificada

```bash
# Crear estructura básica para módulo pequeño
mkdir -p src/features/dashboard/{hooks,server,ui/routes}
```

#### Paso 2: Hook Simple para Dashboard

```typescript
// 📄 src/features/dashboard/hooks/useDashboardQuery.ts
import { useQuery } from "@tanstack/react-query";
import { getDashboardDataAction } from "../server/actions";

interface DashboardData {
  totalUsers: number;
  totalRevenue: number;
  totalOrders: number;
  growthRate: number;
  recentActivity: Array<{
    id: string;
    type: string;
    message: string;
    createdAt: string;
  }>;
}

export const useDashboardQuery = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async (): Promise<DashboardData> => {
      const result = await getDashboardDataAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - dashboard data updates less frequently
    gcTime: 10 * 60 * 1000, // 10 minutes in cache
    refetchOnWindowFocus: false, // Don't auto-refetch dashboard on focus
  });

  // Computed stats
  const stats = useMemo(
    () => ({
      totalUsers: data?.totalUsers || 0,
      totalRevenue: data?.totalRevenue || 0,
      totalOrders: data?.totalOrders || 0,
      growthRate: data?.growthRate || 0,
      // Format revenue for display
      formattedRevenue: new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
      }).format(data?.totalRevenue || 0),
      // Growth indicator
      growthIndicator: data?.growthRate
        ? data.growthRate > 0
          ? "up"
          : data.growthRate < 0
          ? "down"
          : "neutral"
        : "neutral",
    }),
    [data]
  );

  return {
    data,
    stats,
    recentActivity: data?.recentActivity || [],
    isLoading,
    error,
    refresh: refetch,
  };
};
```

#### Paso 3: Hook para Stats Específicas

```typescript
// 📄 src/features/dashboard/hooks/useDashboardStats.ts
import { useQuery } from "@tanstack/react-query";
import { getDashboardStatsAction } from "../server/actions";

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      const result = await getDashboardStatsAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - stats change less frequently
    gcTime: 15 * 60 * 1000, // 15 minutes in cache
  });
};
```

#### Paso 4: Componente Dashboard Simple

```typescript
// 📄 src/features/dashboard/ui/routes/DashboardScreen.tsx
"use client";

import React from "react";
import { useDashboardQuery } from "../../hooks/useDashboardQuery";
import { Card } from "@/shared/ui/components/Card";
import { Button } from "@/shared/ui/components/Button";
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
} from "lucide-react";

export default function DashboardScreen() {
  const { stats, recentActivity, isLoading, error, refresh } =
    useDashboardQuery();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">
            Error loading dashboard: {error.message}
          </p>
          <Button onClick={() => refresh()} className="mt-2">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Button
          variant="outline"
          onClick={() => refresh()}
          className="inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Usuarios
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalUsers}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ingresos</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.formattedRevenue}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pedidos</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalOrders}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            {stats.growthIndicator === "up" ? (
              <TrendingUp className="h-8 w-8 text-green-600" />
            ) : stats.growthIndicator === "down" ? (
              <TrendingDown className="h-8 w-8 text-red-600" />
            ) : (
              <div className="h-8 w-8 bg-gray-300 rounded"></div>
            )}
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Crecimiento</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.growthRate > 0 ? "+" : ""}
                {stats.growthRate}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium">Actividad Reciente</h2>
        </div>
        <div className="p-4">
          {recentActivity.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No hay actividad reciente
            </p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
```

#### Paso 5: Exports del Módulo Pequeño

```typescript
// 📄 src/features/dashboard/hooks/index.ts
export { useDashboardQuery } from "./useDashboardQuery";
export { useDashboardStats } from "./useDashboardStats";
```

```typescript
// 📄 src/features/dashboard/index.ts
export * from "./hooks";
export { default as DashboardScreen } from "./ui/routes/DashboardScreen";
```

---

## 🎯 **MEJORES PRÁCTICAS**

### ✅ **Do's (Hacer)**

#### 1. **Query Keys Consistentes**

```typescript
// ✅ Usar factory pattern para query keys
export const USERS_QUERY_KEYS = {
  all: () => ["users"] as const,
  lists: () => [...USERS_QUERY_KEYS.all(), "list"] as const,
  list: (filters: UserFilters) =>
    [...USERS_QUERY_KEYS.lists(), filters] as const,
  details: () => [...USERS_QUERY_KEYS.all(), "details"] as const,
  detail: (id: string) => [...USERS_QUERY_KEYS.details(), id] as const,
} as const;
```

#### 2. **Optimistic Updates para Mejor UX**

```typescript
// ✅ Siempre implementar optimistic updates
const createUserMutation = useMutation({
  mutationFn: createUser,
  onMutate: async (newUser) => {
    // Cancel queries
    await queryClient.cancelQueries({ queryKey: USERS_QUERY_KEYS.lists() });

    // Snapshot
    const previousUsers = queryClient.getQueryData(USERS_QUERY_KEYS.lists());

    // Optimistic update
    queryClient.setQueryData(USERS_QUERY_KEYS.lists(), (old) => [
      ...old,
      newUser,
    ]);

    return { previousUsers };
  },
  onError: (err, variables, context) => {
    // Rollback
    if (context?.previousUsers) {
      queryClient.setQueryData(USERS_QUERY_KEYS.lists(), context.previousUsers);
    }
  },
  onSettled: () => {
    // Refetch
    queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });
  },
});
```

#### 3. **Error Handling Centralizado**

```typescript
// ✅ Usar notifications para errores
const { notify } = useNotifications();

const mutation = useMutation({
  mutationFn: createUser,
  onError: (error) => {
    notify(error.message, "error");
  },
  onSuccess: () => {
    notify("Usuario creado exitosamente", "success");
  },
});
```

#### 4. **Debounce en Búsquedas**

```typescript
// ✅ Siempre usar debounce en search
const useSearch = (searchTerm: string) => {
  const debouncedTerm = useDebounce(searchTerm, 300);

  return useQuery({
    queryKey: ["search", debouncedTerm],
    queryFn: () => search(debouncedTerm),
    enabled: debouncedTerm.length >= 2,
    keepPreviousData: true,
  });
};
```

#### 5. **Loading States Granulares**

```typescript
// ✅ Estados de loading específicos
const useUsers = () => {
  const query = useQuery(/* ... */);
  const createMutation = useMutation(/* ... */);
  const deleteMutation = useMutation(/* ... */);

  return {
    ...query,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
    // No usar isLoading genérico para todo
  };
};
```

### ❌ **Don'ts (No Hacer)**

#### 1. **No usar setState con TanStack Query**

```typescript
// ❌ NO hacer esto
const [users, setUsers] = useState([]);
const { data } = useQuery(/* ... */);

useEffect(() => {
  setUsers(data); // Redundante y problemático
}, [data]);

// ✅ Hacer esto
const { data: users } = useQuery(/* ... */);
```

#### 2. **No duplicar lógica de fetching**

```typescript
// ❌ NO hacer esto
const fetchUsersInComponent = async () => {
  const response = await fetch("/api/users");
  return response.json();
};

// ✅ Usar TanStack Query
const { data: users } = useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
});
```

#### 3. **No usar query keys inconsistentes**

```typescript
// ❌ NO hacer esto - keys inconsistentes
useQuery({ queryKey: ["users"] /* ... */ });
useQuery({ queryKey: ["user-list"] /* ... */ });
useQuery({ queryKey: ["users", "all"] /* ... */ });

// ✅ Hacer esto - factory pattern
useQuery({ queryKey: USERS_QUERY_KEYS.lists() /* ... */ });
useQuery({ queryKey: USERS_QUERY_KEYS.list(filters) /* ... */ });
```

#### 4. **No ignorar invalidaciones**

```typescript
// ❌ NO hacer esto - no invalidar cache
const createUser = useMutation({
  mutationFn: createUserAction,
  onSuccess: () => {
    // Falta invalidación - datos stale
  },
});

// ✅ Hacer esto - invalidar siempre
const createUser = useMutation({
  mutationFn: createUserAction,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });
  },
});
```

#### 5. **No usar enabled incorrectamente**

```typescript
// ❌ NO hacer esto
const { data } = useQuery({
  queryKey: ["user", userId],
  queryFn: () => fetchUser(userId),
  // Falta enabled - se ejecuta con userId undefined
});

// ✅ Hacer esto
const { data } = useQuery({
  queryKey: ["user", userId],
  queryFn: () => fetchUser(userId),
  enabled: !!userId, // Solo ejecutar si hay userId
});
```

---

## 🚨 **TROUBLESHOOTING COMÚN**

### Problema 1: "Query ejecutándose infinitamente"

```typescript
// ❌ Problema: Query key cambiando constantemente
const { data } = useQuery({
  queryKey: ["users", { filters }], // Object recreado cada render
  queryFn: fetchUsers,
});

// ✅ Solución: Estabilizar query key
const { data } = useQuery({
  queryKey: ["users", JSON.stringify(filters)], // Serialize object
  queryFn: fetchUsers,
});

// ✅ Mejor solución: Query key factory
const { data } = useQuery({
  queryKey: USERS_QUERY_KEYS.list(filters),
  queryFn: fetchUsers,
});
```

### Problema 2: "Datos no se actualizan después de mutación"

```typescript
// ❌ Problema: No invalidar cache
const mutation = useMutation({
  mutationFn: createUser,
  // Falta onSuccess con invalidation
});

// ✅ Solución: Invalidar cache
const mutation = useMutation({
  mutationFn: createUser,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });
  },
});
```

### Problema 3: "Loading flickering"

```typescript
// ❌ Problema: No usar keepPreviousData
const { data, isLoading } = useQuery({
  queryKey: ["search", searchTerm],
  queryFn: () => search(searchTerm),
});

// ✅ Solución: Mantener datos anteriores
const { data, isLoading, isFetching } = useQuery({
  queryKey: ["search", searchTerm],
  queryFn: () => search(searchTerm),
  keepPreviousData: true, // Mantener datos mientras carga nuevos
});

// Usar isFetching para loading indicator en lugar de isLoading
```

### Problema 4: "Memory leaks en componentes unmounted"

```typescript
// ❌ Problema: Mutations ejecutándose después de unmount
const mutation = useMutation({
  mutationFn: createUser,
  onSuccess: () => {
    // Component podría estar unmounted aquí
    setSuccess(true);
  },
});

// ✅ Solución: Usar React Query notifications
const { notify } = useNotifications();

const mutation = useMutation({
  mutationFn: createUser,
  onSuccess: () => {
    notify("User created successfully", "success");
  },
});
```

### Problema 5: "Query no se ejecuta cuando debería"

```typescript
// ❌ Problema: enabled condition incorrecta
const { data } = useQuery({
  queryKey: ["user", userId],
  queryFn: () => fetchUser(userId),
  enabled: userId, // Problema: 0 es falsy
});

// ✅ Solución: Condition más específica
const { data } = useQuery({
  queryKey: ["user", userId],
  queryFn: () => fetchUser(userId),
  enabled: userId != null, // Explícito con null/undefined check
});
```

---

_Esta documentación completa te permitirá implementar TanStack Query de manera consistente y profesional en todos tus módulos. ¡Consérvala como tu guía de referencia!_
