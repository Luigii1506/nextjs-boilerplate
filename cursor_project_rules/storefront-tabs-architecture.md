# 📋 ARQUITECTURA DE TABS - STOREFRONT

**Guía Oficial de Estructura Modular v3.0.0 - Feature-First Hooks**

---

## 🎯 **INTRODUCCIÓN**

Esta documentación define la **arquitectura oficial** para la implementación de tabs en el **Storefront Module**. Basada en **Clean Architecture**, **Modular Design** y **Feature-First Organization**, esta estructura garantiza código mantenible, escalable y profesional.

## 🚀 **NUEVA ESTRUCTURA v3.0.0**

**Fase Futura - Hooks organizados por Feature:**

- ✅ Hooks consolidados por responsabilidad
- ✅ Separación clara: State, Logic, Actions
- ✅ Shared hooks para lógica común
- ✅ Mejor escalabilidad y mantenimiento

---

## 🏗️ **ESTRUCTURA DE CARPETAS**

### **📁 Estructura Base por Tab:**

```
src/features/storefront/ui/components/tabs/
├── [tab-name]/                          # 📂 Tab principal
│   ├── index.ts                         # 📄 Barrel export
│   ├── [TabName]Tab.tsx                 # 🎯 Componente coordinador principal
│   ├── types/                           # 📋 Definiciones de tipos
│   │   └── index.ts                     # 🔷 Types, interfaces, constants
│   ├── hooks/ -> **VER NUEVA ESTRUCTURA HOOKS ABAJO** ⬇️
│   └── components/                      # 🧩 Sub-componentes
│       ├── [Component1].tsx             # 🎨 Componente específico 1
│       ├── [Component2].tsx             # 🎨 Componente específico 2
│       ├── [Component3].tsx             # 🎨 Componente específico 3
│       └── index.ts                     # 📤 Barrel export components
└── index.ts                            # 📤 Barrel export de todos los tabs
```

### **🔍 Ejemplo Implementado - ProductsTab:**

```
src/features/storefront/ui/components/tabs/products/
├── index.ts                             # export { default } from './ProductsTab'
├── ProductsTab.tsx                      # 🎯 Coordinador principal
├── types/
│   └── index.ts                         # ProductsState, ProductsAction, ProductFilters, etc.
├── hooks/
│   ├── useProductsState.ts              # 🔄 Estado local + reducer + animations
│   ├── useProductsFilters.ts            # 🔍 Filtros + búsqueda + sorting
│   ├── useProductsActions.ts            # ⚡ onAddToCart, onAddToWishlist, onQuickView
│   └── index.ts                         # Barrel export
└── components/
    ├── ProductsHeader.tsx               # 🎨 Header con search + stats
    ├── ProductsResults.tsx              # 🎨 Resultados de búsqueda
    ├── ProductsGrid.tsx                 # 🎨 Grid/List de productos
    ├── ProductsFilters.tsx              # 🎨 Sidebar de filtros
    ├── ProductsPagination.tsx           # 🎨 Controles de paginación
    └── index.ts                         # Barrel export
```

---

## 🎯 **COMPONENTE COORDINADOR PRINCIPAL**

### **📋 Template Base - `[TabName]Tab.tsx`:**

```typescript
/**
 * 🎯 [TAB_NAME] TAB COMPONENT
 * ===========================
 *
 * Componente principal del [TabName]Tab completamente refactorizado:
 * - Separación de responsabilidades
 * - Hooks especializados para estado y acciones
 * - Componentes modulares reutilizables
 * - Types centralizados
 *
 * @version 2.0.0 - Clean Architecture
 * @date 2025-01-XX
 */

"use client";

import React from "react";
import { useStorefrontContext } from "@/features/storefront/context";
import { StorefrontPageSkeleton } from "@/features/storefront/ui/components/shared/ProductSkeleton";

// 🎯 Import specialized hooks
import {
  use[TabName]State,
  use[TabName]Filters,
  use[TabName]Actions,
} from "./hooks";

// 🎯 Import modular components
import {
  [Component1],
  [Component2],
  [Component3],
} from "./components";

/**
 * 🎯 MAIN [TAB_NAME] TAB COMPONENT
 * ================================
 *
 * Componente coordinador que orquesta:
 * - Estado local (animaciones, UI state)
 * - Filtros y búsqueda
 * - Acciones de negocio
 * - Renderizado de sub-componentes
 */
function [TabName]Tab() {
  // 🌐 GLOBAL CONTEXT
  const { [contextData], isLoading, error } = useStorefrontContext();

  // 🔧 LOCAL STATE MANAGEMENT
  const { state, actions } = use[TabName]State();

  // 🔍 FILTERS & SEARCH LOGIC
  const {
    filters,
    processed[Data],
    handleFilterChange,
    clearAllFilters,
  } = use[TabName]Filters([contextData], state);

  // ⚡ BUSINESS ACTIONS
  const {
    onAddToCart,
    onAddToWishlist,
    onQuickView,
  } = use[TabName]Actions();

  // 🚨 ERROR STATE
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Error: {error.message}</p>
      </div>
    );
  }

  // ⏳ LOADING STATE (First render skeleton)
  if (state.isFirstRender) {
    return <StorefrontPageSkeleton />;
  }

  // ✅ MAIN RENDER
  return (
    <div className="space-y-6">
      {/* 🎨 HEADER SECTION */}
      <[Component1]
        searchTerm={state.localSearchTerm}
        onSearchChange={actions.setLocalSearchTerm}
        [...otherProps]
      />

      {/* 🎨 CONTENT SECTION */}
      <div className="flex gap-6">
        {/* 🎨 FILTERS SIDEBAR */}
        <[Component2]
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearAll={clearAllFilters}
          [...]
        />

        {/* 🎨 MAIN CONTENT */}
        <[Component3]
          items={processed[Data]}
          viewMode={state.viewMode}
          onAddToCart={onAddToCart}
          onAddToWishlist={onAddToWishlist}
          onQuickView={onQuickView}
          [...]
        />
      </div>
    </div>
  );
}

export default [TabName]Tab;
```

---

## 🏗️ **NUEVA ESTRUCTURA DE HOOKS v3.0.0**

### **📁 Organización Feature-First:**

```
src/features/storefront/hooks/
├── products/                            # 📦 PRODUCTOS Feature
│   ├── useProductsState.ts              # 🔄 Estado local + reducer + animations
│   ├── useProductsLogic.ts               # 🧠 Filtros + búsqueda + sorting
│   ├── useProductsActions.ts             # ⚡ Acciones de negocio
│   └── index.ts                          # 📤 Barrel export
├── wishlist/                            # ❤️ WISHLIST Feature
│   ├── useWishlistState.ts               # 🔄 Estado local + reducer + animations
│   ├── useWishlistLogic.ts               # 🧠 Conversión + filtros + procesamiento
│   ├── useWishlistActions.ts             # ⚡ Bulk actions + wishlist management
│   └── index.ts                          # 📤 Barrel export
├── overview/                            # 🏠 OVERVIEW Feature
│   ├── useOverviewState.ts               # 🔄 Estado local + animations
│   ├── useOverviewLogic.ts               # 🧠 Stats + featured products + insights
│   ├── useOverviewActions.ts             # ⚡ Navigation + search + tab switching
│   └── index.ts                          # 📤 Barrel export
├── shared/                              # 🔧 LÓGICA COMPARTIDA
│   ├── useSharedFiltering.ts             # 🔍 Filtros comunes entre features
│   └── index.ts                          # 📤 Barrel export
├── index.ts                             # 📤 Main barrel export
├── useStorefrontQuery.ts                # 🌐 Mantener compatibilidad
└── useWishlistActions.ts                # 🌐 Mantener compatibilidad
```

### **🎯 FILOSOFÍA DE LA NUEVA ESTRUCTURA:**

#### **🔄 [Feature]State.ts - Estado Puro:**

- ✅ **Reducer pattern** exclusivamente
- ✅ **Anti-flicker animations** setup
- ✅ **Local UI state** management
- ❌ NO business logic
- ❌ NO side effects externos

#### **🧠 [Feature]Logic.ts - Lógica de Negocio:**

- ✅ **Data processing** y transformaciones
- ✅ **Filtros** y algoritmos de búsqueda
- ✅ **Sorting** y computaciones complejas
- ✅ **useMemo** para performance
- ❌ NO acciones que muten estado global

#### **⚡ [Feature]Actions.ts - Acciones de Negocio:**

- ✅ **StorefrontContext** integration
- ✅ **Async operations** y server calls
- ✅ **Navigation** y tab switching
- ✅ **useCallback** para estabilidad
- ❌ NO local state management

#### **🔧 Shared/ - Lógica Reutilizable:**

- ✅ **Common filters** entre features
- ✅ **Shared algorithms** y utilities
- ✅ **Cross-feature** functionality
- ❌ NO feature-specific logic

---

## 🎯 **IMPLEMENTACIÓN DE NUEVOS HOOKS v3.0.0**

### **📋 Template de Coordinador con Nueva Estructura:**

```typescript
/**
 * 🎯 [TAB_NAME] TAB COMPONENT v3.0.0
 * ===================================
 *
 * Componente coordinador usando la nueva estructura Feature-First.
 * Importa hooks especializados desde /hooks/[feature]/
 *
 * @version 3.0.0 - Feature-First Hooks
 */

"use client";

import React from "react";
import { useStorefrontContext } from "@/features/storefront/context";
import { StorefrontPageSkeleton } from "@/features/storefront/ui/components/shared/ProductSkeleton";

// 🚀 NUEVOS IMPORTS - Feature-First Hooks
import {
  use[Feature]State,
  use[Feature]Logic,
  use[Feature]Actions,
} from "@/features/storefront/hooks/[feature]";

// 🎯 Import sub-componentes
import {
  [Component1],
  [Component2],
  [Component3],
} from "./components";

/**
 * 🎯 MAIN [TAB_NAME] TAB COMPONENT
 */
function [TabName]Tab() {
  // 🌐 GLOBAL CONTEXT
  const { [contextData], isLoading, error } = useStorefrontContext();

  // 🔄 ESTADO LOCAL (State Hook)
  const { state, actions: stateActions } = use[Feature]State();

  // 🧠 LÓGICA DE NEGOCIO (Logic Hook)
  const {
    processed[Data],
    analytics,
    availableFilters,
  } = use[Feature]Logic({
    [contextData]: [contextData],
    searchTerm: state.localSearchTerm,
    filters: state.filters,
  });

  // ⚡ ACCIONES DE NEGOCIO (Actions Hook)
  const {
    onAddToCart,
    onAddToWishlist,
    onQuickView,
    onNavigate,
  } = use[Feature]Actions();

  // ⚠️ ERROR STATE
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Error: {error.message}</p>
      </div>
    );
  }

  // ⏳ LOADING STATE (First render skeleton)
  if (state.isFirstRender) {
    return <StorefrontPageSkeleton />;
  }

  // ✅ MAIN RENDER
  return (
    <div className="space-y-6">
      {/* 🎨 HEADER */}
      <[Component1]
        searchTerm={state.localSearchTerm}
        onSearchChange={stateActions.setLocalSearchTerm}
        analytics={analytics}
        onAction={onNavigate}
      />

      <div className="flex gap-6">
        {/* 🎨 FILTERS SIDEBAR */}
        <[Component2]
          filters={state.filters}
          availableFilters={availableFilters}
          onFilterChange={stateActions.setFilters}
          onClearAll={stateActions.resetFilters}
        />

        {/* 🎨 MAIN CONTENT */}
        <[Component3]
          items={processed[Data]}
          viewMode={state.viewMode}
          onAddToCart={onAddToCart}
          onAddToWishlist={onAddToWishlist}
          onQuickView={onQuickView}
          onViewModeChange={stateActions.setViewMode}
        />
      </div>
    </div>
  );
}

export default [TabName]Tab;
```

### **🔧 Patrón de Imports Nueva Estructura:**

```typescript
// ❌ ANTERIOR (v2.0.0)
import {
  useProductsState,
  useProductsFilters,
  useProductsActions,
} from "./hooks";

// ✅ NUEVA (v3.0.0)
import {
  useProductsState,
  useProductsLogic, // ← Rename: Filters → Logic
  useProductsActions,
} from "@/features/storefront/hooks/products";

// 🔧 Para lógica compartida
import { useSharedFiltering } from "@/features/storefront/hooks/shared";
```

### **📊 Ventajas de la Nueva Estructura:**

| Aspecto           | v2.0.0 (Tab-Based)           | v3.0.0 (Feature-First)         |
| ----------------- | ---------------------------- | ------------------------------ |
| **Organización**  | Por tab individual           | Por feature/responsabilidad    |
| **Reutilización** | Duplicación de lógica        | Shared hooks para lógica común |
| **Escalabilidad** | Limitada por tab             | Escalable por feature          |
| **Mantenimiento** | Múltiples archivos similares | Lógica centralizada por tipo   |
| **Performance**   | Buena                        | Optimizada con shared logic    |
| **Testing**       | Tests por tab                | Tests por responsabilidad      |

---

## 🔄 **HOOKS ESPECIALIZADOS (LEGACY - v2.0.0)**

> **⚠️ DEPRECATED**: Esta sección se mantiene para referencia histórica.
> **🚀 USAR**: Nueva estructura Feature-First arriba.

### **1️⃣ `use[TabName]State.ts` - Estado Local + Reducer**

```typescript
/**
 * 🎯 USE [TAB_NAME] STATE HOOK
 * ============================
 *
 * Hook centralizado para manejar todo el estado local del [TabName]Tab.
 * Implementa reducer pattern para mejor performance y predicibilidad.
 *
 * @version 2.0.0 - Clean Architecture
 */

import { useReducer, useCallback, useRef, useEffect } from "react";
import {
  [TabName]State,
  [TabName]Action,
  DEFAULT_[TAB_NAME]_STATE,
  DEFAULT_FILTERS,
} from "../types";

// 🔧 REDUCER FUNCTION
function [tabName]Reducer(
  state: [TabName]State,
  action: [TabName]Action
): [TabName]State {
  switch (action.type) {
    case "SET_FIRST_RENDER":
      return { ...state, isFirstRender: action.payload };

    case "SET_ALLOW_ANIMATIONS":
      return { ...state, allowAnimations: action.payload };

    case "SET_VIEW_MODE":
      return { ...state, viewMode: action.payload };

    case "SET_CURRENT_PAGE":
      return { ...state, currentPage: action.payload };

    case "SET_FILTERS":
      return { ...state, filters: action.payload, currentPage: 1 };

    case "RESET_FILTERS":
      return {
        ...state,
        filters: DEFAULT_FILTERS,
        localSearchTerm: "",
        currentPage: 1,
      };

    default:
      return state;
  }
}

// 🎯 MAIN HOOK
export function use[TabName]State() {
  const [state, dispatch] = useReducer([tabName]Reducer, DEFAULT_[TAB_NAME]_STATE);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 🎨 Anti-flicker Animation Setup (MANDATORY)
  useEffect(() => {
    if (state.isFirstRender) {
      timeoutRef.current = setTimeout(() => {
        dispatch({ type: "SET_ALLOW_ANIMATIONS", payload: true });
        dispatch({ type: "SET_FIRST_RENDER", payload: false });
      }, 100);
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [state.isFirstRender]);

  // 🎛️ ACTION CREATORS
  const actions = {
    setFirstRender: useCallback((value: boolean) => {
      dispatch({ type: "SET_FIRST_RENDER", payload: value });
    }, []),

    setAllowAnimations: useCallback((value: boolean) => {
      dispatch({ type: "SET_ALLOW_ANIMATIONS", payload: value });
    }, []),

    setViewMode: useCallback((mode: "grid" | "list") => {
      dispatch({ type: "SET_VIEW_MODE", payload: mode });
    }, []),

    setCurrentPage: useCallback((page: number) => {
      dispatch({ type: "SET_CURRENT_PAGE", payload: page });
    }, []),

    setFilters: useCallback((filters: [TabName]Filters) => {
      dispatch({ type: "SET_FILTERS", payload: filters });
    }, []),

    resetFilters: useCallback(() => {
      dispatch({ type: "RESET_FILTERS" });
    }, []),
  };

  return {
    state,
    actions,
    // 📊 COMPUTED VALUES
    startIndex: (state.currentPage - 1) * state.itemsPerPage,
  };
}

export default use[TabName]State;
```

### **2️⃣ `use[TabName]Filters.ts` - Lógica de Filtros**

```typescript
/**
 * 🔍 USE [TAB_NAME] FILTERS HOOK
 * ==============================
 *
 * Hook especializado para manejar toda la lógica de filtros,
 * búsqueda, sorting y procesamiento de datos.
 *
 * @version 2.0.0 - Clean Architecture
 */

import { useMemo, useCallback } from "react";
import { [DataType] } from "@/features/storefront/types";
import { [TabName]State } from "../types";

// 🎯 MAIN HOOK
export function use[TabName]Filters(
  rawData: [DataType][] | undefined,
  state: [TabName]State
) {
  // 🔍 PROCESSED DATA with filters applied
  const processed[Data] = useMemo(() => {
    if (!rawData?.length) return [];

    let filtered = rawData;

    // 🔎 SEARCH FILTER
    if (state.localSearchTerm?.trim()) {
      const searchTerm = state.localSearchTerm.toLowerCase();
      filtered = filtered.filter((item) =>
        item.name?.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm)
      );
    }

    // 🏷️ CATEGORY FILTER
    if (state.filters.selectedCategories?.length > 0) {
      filtered = filtered.filter((item) =>
        state.filters.selectedCategories.includes(item.categoryId)
      );
    }

    // 💰 PRICE RANGE FILTER
    const [minPrice, maxPrice] = state.filters.priceRange;
    filtered = filtered.filter((item) => {
      const price = item.currentPrice || 0;
      return price >= minPrice && price <= maxPrice;
    });

    // ⭐ RATING FILTER
    if (state.filters.minRating > 0) {
      filtered = filtered.filter((item) =>
        (item.averageRating || 0) >= state.filters.minRating
      );
    }

    // 📦 STOCK FILTER
    if (state.filters.inStock) {
      filtered = filtered.filter((item) => item.stock > 0);
    }

    // 🔄 SORTING
    filtered = filtered.sort((a, b) => {
      switch (state.sortBy) {
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        case "price-asc":
          return (a.currentPrice || 0) - (b.currentPrice || 0);
        case "price-desc":
          return (b.currentPrice || 0) - (a.currentPrice || 0);
        case "rating":
          return (b.averageRating || 0) - (a.averageRating || 0);
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [rawData, state.localSearchTerm, state.filters, state.sortBy]);

  // 🎛️ FILTER HANDLERS
  const handleCategoryFilter = useCallback((categories: string[]) => {
    // Implementation...
  }, []);

  const handlePriceRangeFilter = useCallback((range: [number, number]) => {
    // Implementation...
  }, []);

  const clearAllFilters = useCallback(() => {
    // Implementation...
  }, []);

  return {
    processed[Data],
    filters: state.filters,
    handleCategoryFilter,
    handlePriceRangeFilter,
    clearAllFilters,
  };
}

export default use[TabName]Filters;
```

### **3️⃣ `use[TabName]Actions.ts` - Acciones de Negocio**

```typescript
/**
 * ⚡ USE [TAB_NAME] ACTIONS HOOK
 * =============================
 *
 * Hook especializado para manejar todas las acciones de negocio
 * del [TabName]Tab usando el StorefrontContext.
 *
 * @version 2.0.0 - Clean Architecture
 */

import { useCallback } from "react";
import { useStorefrontContext } from "@/features/storefront/context";
import { [DataType] } from "@/features/storefront/types";

// 🎯 MAIN HOOK
export function use[TabName]Actions() {
  const {
    addToCart,
    toggleWishlist,
    openProductQuickView,
    showNotification,
  } = useStorefrontContext();

  // 🛒 ADD TO CART ACTION
  const onAddToCart = useCallback(
    async ([item]: [DataType]) => {
      try {
        await addToCart([item].id, 1);
        showNotification({
          type: "success",
          message: `${[item].name} agregado al carrito`,
        });
      } catch (error) {
        console.error(`❌ [${[TabName]Tab}] Error adding to cart:`, error);
        showNotification({
          type: "error",
          message: "Error al agregar al carrito",
        });
      }
    },
    [addToCart, showNotification]
  );

  // ❤️ ADD TO WISHLIST ACTION
  const onAddToWishlist = useCallback(
    async ([item]: [DataType]): Promise<{ success: boolean; message: string }> => {
      try {
        const result = await toggleWishlist([item]);
        return result;
      } catch (error) {
        console.error(`❌ [${[TabName]Tab}] Error toggling wishlist:`, error);
        return {
          success: false,
          message: "Error al actualizar wishlist",
        };
      }
    },
    [toggleWishlist]
  );

  // 👁️ QUICK VIEW ACTION
  const onQuickView = useCallback(
    ([item]: [DataType]) => {
      openProductQuickView([item]);
    },
    [openProductQuickView]
  );

  return {
    onAddToCart,
    onAddToWishlist,
    onQuickView,
  };
}

export default use[TabName]Actions;
```

---

## 📋 **DEFINICIÓN DE TIPOS**

### **📄 `types/index.ts` - Template Base:**

```typescript
/**
 * 🔷 [TAB_NAME] TAB TYPES
 * =======================
 *
 * Definiciones de tipos, interfaces y constantes
 * específicas del [TabName]Tab.
 *
 * @version 2.0.0 - Clean Architecture
 */

import { [DataType], CategoryForCustomer } from "@/features/storefront/types";

// 🔧 LOCAL STATE INTERFACE
export interface [TabName]State {
  // 🎨 Animation & Rendering
  isFirstRender: boolean;
  allowAnimations: boolean;

  // 📊 UI State
  viewMode: "grid" | "list";
  itemsPerPage: number;
  currentPage: number;

  // 🔍 Search & Filters
  localSearchTerm: string;
  filters: [TabName]Filters;

  // 📋 Selection (if applicable)
  selectedItems: Set<string>;
}

// 🔍 FILTERS INTERFACE
export interface [TabName]Filters {
  selectedCategories: string[];
  priceRange: [number, number];
  minRating: number;
  inStock: boolean;
  brands: string[];
  tags: string[];
}

// 🎛️ REDUCER ACTIONS
export type [TabName]Action =
  | { type: "SET_FIRST_RENDER"; payload: boolean }
  | { type: "SET_ALLOW_ANIMATIONS"; payload: boolean }
  | { type: "SET_VIEW_MODE"; payload: "grid" | "list" }
  | { type: "SET_CURRENT_PAGE"; payload: number }
  | { type: "SET_LOCAL_SEARCH_TERM"; payload: string }
  | { type: "SET_FILTERS"; payload: [TabName]Filters }
  | { type: "SET_SELECTED_ITEMS"; payload: Set<string> }
  | { type: "RESET_FILTERS" };

// 🎯 DEFAULT STATES & CONSTANTS
export const DEFAULT_FILTERS: [TabName]Filters = {
  selectedCategories: [],
  priceRange: [0, 100000],
  minRating: 0,
  inStock: false,
  brands: [],
  tags: [],
};

export const DEFAULT_[TAB_NAME]_STATE: [TabName]State = {
  isFirstRender: true,
  allowAnimations: false,
  viewMode: "grid",
  itemsPerPage: 12,
  currentPage: 1,
  localSearchTerm: "",
  filters: DEFAULT_FILTERS,
  selectedItems: new Set<string>(),
};

// 📊 CONSTANTS
export const ITEMS_PER_PAGE_OPTIONS = [6, 12, 24, 48] as const;
export const SORT_OPTIONS = [
  { value: "newest", label: "Más recientes" },
  { value: "name", label: "Nombre A-Z" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
  { value: "rating", label: "Mejor valorados" },
] as const;
```

---

## 🧩 **COMPONENTES MODULARES**

### **🎨 Template Base de Componente:**

```typescript
/**
 * 🎨 [COMPONENT_NAME] COMPONENT
 * =============================
 *
 * Componente especializado para [funcionalidad específica].
 * Parte de la arquitectura modular del [TabName]Tab.
 *
 * @version 2.0.0 - Clean Architecture
 */

"use client";

import React from "react";

// 🔷 COMPONENT PROPS INTERFACE
interface [Component]Props {
  // Props específicas del componente
  data: any[];
  onAction: (item: any) => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * 🎯 MAIN [COMPONENT] COMPONENT
 */
function [Component]({
  data,
  onAction,
  isLoading = false,
  className = "",
}: [Component]Props) {
  // 🚨 EARLY RETURNS
  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  if (!data?.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay datos disponibles
      </div>
    );
  }

  // ✅ MAIN RENDER
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Component content */}
    </div>
  );
}

export default [Component];
```

---

## 📤 **BARREL EXPORTS**

### **🔗 Estructura de Exports:**

```typescript
// 📄 src/features/storefront/ui/components/tabs/[tab-name]/index.ts
export { default } from "./[TabName]Tab";

// 📄 src/features/storefront/ui/components/tabs/[tab-name]/hooks/index.ts
export { default as use[TabName]State } from "./use[TabName]State";
export { default as use[TabName]Filters } from "./use[TabName]Filters";
export { default as use[TabName]Actions } from "./use[TabName]Actions";

// 📄 src/features/storefront/ui/components/tabs/[tab-name]/components/index.ts
export { default as [Component1] } from "./[Component1]";
export { default as [Component2] } from "./[Component2]";
export { default as [Component3] } from "./[Component3]";

// 📄 src/features/storefront/ui/components/tabs/index.ts
export { default as OverviewTab } from "./overview/OverviewTab";
export { default as ProductsTab } from "./products/ProductsTab";
export { default as CategoriesTab } from "./CategoriesTab";
export { default as WishlistTab } from "./wishlist/WishlistTab";
export { default as AccountTab } from "./AccountTab";
export { default as SupportTab } from "./SupportTab";
```

---

## 🎯 **MEJORES PRÁCTICAS**

### **✅ DO's (Obligatorio seguir):**

#### **🏗️ Arquitectura:**

- ✅ **Separar responsabilidades** en hooks especializados
- ✅ **Usar reducer pattern** para estado complejo
- ✅ **Implementar anti-flicker animations** en `useEffect([isFirstRender])`
- ✅ **Mantener components puros** sin lógica de negocio
- ✅ **Usar absolute imports** (`@/features/...`)

#### **🔄 Estado:**

- ✅ **Centralizar estado local** en `use[Tab]State`
- ✅ **Memoizar data processing** con `useMemo`
- ✅ **Usar useCallback** para handlers estables
- ✅ **Implementar loading states** con skeleton

#### **🎨 UI/UX:**

- ✅ **Skeleton loaders** para first render (`isFirstRender`)
- ✅ **Animaciones suaves** con CSS transitions
- ✅ **Responsive design** mobile-first
- ✅ **Error boundaries** y error states

#### **📋 Types:**

- ✅ **Definir interfaces específicas** para cada tab
- ✅ **Usar TypeScript strict** (no `any`)
- ✅ **Exportar types** desde barrel exports
- ✅ **Documentar interfaces** con JSDoc

### **❌ DON'Ts (Prohibido hacer):**

#### **🚫 Anti-patterns:**

- ❌ **NO usar `any` types** - usar interfaces específicas
- ❌ **NO poner lógica de negocio** en components
- ❌ **NO hacer fetch directo** en components
- ❌ **NO usar `useState` excesivo** - preferir reducer

#### **🚫 Performance:**

- ❌ **NO crear objects inline** en renders
- ❌ **NO usar efectos innecesarios**
- ❌ **NO re-renderizar** sin memoization
- ❌ **NO hacer computaciones costosas** sin `useMemo`

#### **🚫 Estructura:**

- ❌ **NO mezclar concerns** en un solo archivo
- ❌ **NO usar relative imports** largos
- ❌ **NO crear components monolíticos**
- ❌ **NO duplicar lógica** entre tabs

---

## 🔧 **DEBUGGING & PERFORMANCE**

### **🐛 Console Logging Patterns:**

```typescript
// 🎯 Tab Level Logging
console.log(`🎯 [${TabName}Tab] Component mounted`);
console.log(`📊 [${TabName}Tab] Data processed:`, { count: data.length });
console.log(`🔍 [${TabName}Tab] Filters applied:`, filters);

// ⚡ Action Level Logging
console.log(`⚡ [${TabName}Tab] ${action} triggered:`, { itemId, result });
console.log(`❌ [${TabName}Tab] ${action} failed:`, error);

// 🎨 State Level Logging
console.log(`🎨 [${TabName}Tab] Animation state:`, {
  isFirstRender,
  allowAnimations,
});
```

### **📊 Performance Monitoring:**

```typescript
// 🕒 Performance markers
const startTime = performance.now();
// ... processing ...
const endTime = performance.now();
console.log(`⏱️ [${TabName}Tab] Processing time: ${endTime - startTime}ms`);
```

---

## 🚀 **IMPLEMENTACIÓN PASO A PASO**

### **1️⃣ Crear Estructura Base:**

```bash
mkdir -p src/features/storefront/ui/components/tabs/[tab-name]/{types,hooks,components}
touch src/features/storefront/ui/components/tabs/[tab-name]/index.ts
touch src/features/storefront/ui/components/tabs/[tab-name]/[TabName]Tab.tsx
touch src/features/storefront/ui/components/tabs/[tab-name]/types/index.ts
touch src/features/storefront/ui/components/tabs/[tab-name]/hooks/{use[TabName]State,use[TabName]Filters,use[TabName]Actions,index}.ts
touch src/features/storefront/ui/components/tabs/[tab-name]/components/{Component1,Component2,Component3,index}.tsx
```

### **2️⃣ Implementar en Orden:**

1. **📋 Definir types** (`types/index.ts`)
2. **🔄 Implementar estado** (`use[Tab]State.ts`)
3. **🔍 Implementar filtros** (`use[Tab]Filters.ts`)
4. **⚡ Implementar acciones** (`use[Tab]Actions.ts`)
5. **🧩 Crear components** (uno por uno)
6. **🎯 Ensamblar coordinador** (`[Tab]Tab.tsx`)
7. **📤 Crear barrel exports**
8. **✅ Probar & refinar**

### **3️⃣ Testing Checklist:**

- ✅ **Animations** funcionan sin flicker
- ✅ **Filters** se aplican correctamente
- ✅ **Actions** ejecutan sin errores
- ✅ **Loading states** se muestran apropiadamente
- ✅ **Error handling** funciona
- ✅ **Mobile responsive**
- ✅ **TypeScript** compila sin errores
- ✅ **Linting** pasa sin warnings

---

## 📚 **REFERENCIAS IMPLEMENTADAS**

### **✅ Tabs Completamente Refactorizados:**

1. **📊 ProductsTab** - `/products/` ✅
2. **❤️ WishlistTab** - `/wishlist/` ✅
3. **🏠 OverviewTab** - `/overview/` ✅

### **📋 Por Refactorizar (Pendientes):**

1. **🏷️ CategoriesTab** - Monolítico ❌
2. **👤 AccountTab** - Monolítico ❌
3. **🆘 SupportTab** - Monolítico ❌

---

## ✅ **IMPLEMENTACIÓN COMPLETADA - FEATURE-FIRST v3.0.0**

### **🎯 ESTADO ACTUAL (100% IMPLEMENTADO):**

```bash
src/features/storefront/
├── hooks/                               # ✅ COMPLETADO - Hooks centralizados
│   ├── products/                        # ✅ useProductsState, Logic, Actions
│   ├── wishlist/                        # ✅ useWishlistState, Logic, Actions
│   ├── overview/                        # ✅ useOverviewState, Logic, Actions
│   ├── shared/                          # ✅ useSharedFiltering
│   └── index.ts                         # ✅ Main barrel export
└── ui/components/                       # ✅ COMPLETADO - Components centralizados
    ├── products/                        # ✅ ProductsTab + components movidos
    ├── wishlist/                        # ✅ WishlistTab + components movidos
    ├── overview/                        # ✅ OverviewTab + components movidos
    ├── shared/                          # ✅ QuickViewModal, etc.
    └── tabs/index.ts                    # ✅ Solo barrel exports
```

### **🚀 IMPORTS SIMPLIFICADOS:**

```typescript
// ✅ IMPLEMENTADO - Feature-First imports
import {
  useProductsState,
  useProductsLogic, // ← Rename de useProductsFilters
  useProductsActions,
} from "@/features/storefront/hooks/products";

import { ProductsTab } from "@/features/storefront/ui/components/products";
```

### **📊 RESULTADOS OBTENIDOS:**

| Métrica          | Antes (v2.0.0)     | **Después (v3.0.0)**     |
| ---------------- | ------------------ | ------------------------ |
| **Consistencia** | Hooks ≠ Components | ✅ 100% consistente      |
| **Colocation**   | Separado por tipo  | ✅ Perfecto por feature  |
| **Duplication**  | Alta en filtros    | ✅ Eliminada con shared/ |
| **Imports**      | Paths largos       | ✅ Paths cortos          |
| **Build Status** | ⚠️ Warnings        | ✅ Compilación exitosa   |

## 🎯 **CONCLUSIÓN**

Esta arquitectura **Feature-First Completa** garantiza:

- ✅ **Mantenibilidad**: Código organizado y predecible por feature
- ✅ **Escalabilidad**: Fácil agregar nuevas funcionalidades
- ✅ **Performance**: Optimizaciones automáticas + shared logic
- ✅ **Developer Experience**: Estructura clara y consistente
- ✅ **Type Safety**: TypeScript profesional al 100%
- ✅ **Clean Architecture**: Separación de responsabilidades
- ✅ **Consistency**: Hooks Y componentes organizados igual
- ✅ **Reusability**: Shared hooks eliminan duplicación

**¡Esta es la arquitectura oficial Feature-First implementada al 100%!** 🚀

---

**📅 Versión:** 3.0.0 - Feature-First Hooks  
**📝 Última actualización:** 2025-01-27  
**👨‍💻 Autor:** Storefront Architecture Team  
**🚀 Refactor:** Hooks organizados por Feature para mejor escalabilidad
