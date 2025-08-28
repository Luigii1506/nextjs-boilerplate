/**
 * 🎯 USE PRODUCTS STATE HOOK
 * =========================
 *
 * Hook centralizado para manejar todo el estado local del ProductsTab.
 * Implementa reducer pattern para mejor performance y predicibilidad.
 *
 * 📍 Nueva ubicación: /hooks/products/ (Fase Futura - Organización por Feature)
 *
 * @version 3.0.0 - Feature-First Architecture
 */

"use client";

import { useReducer, useCallback, useEffect, useRef } from "react";
import { ProductFilters } from "../../ui/components/tabs/products/types";

// 🔷 STATE INTERFACE
export interface ProductsState {
  // 🎨 Animation & Rendering
  isFirstRender: boolean;
  allowAnimations: boolean;

  // 📊 UI State
  isFiltersOpen: boolean;
  viewMode: "grid" | "list";
  sortBy: string;
  itemsPerPage: number;
  currentPage: number;

  // 🔍 Search & Filters
  localSearchTerm: string;
  filters: ProductFilters;
}

// 🎛️ ACTIONS
export type ProductsAction =
  | { type: "SET_FIRST_RENDER"; payload: boolean }
  | { type: "SET_ALLOW_ANIMATIONS"; payload: boolean }
  | { type: "SET_FILTERS_OPEN"; payload: boolean }
  | { type: "SET_VIEW_MODE"; payload: "grid" | "list" }
  | { type: "SET_SORT_BY"; payload: string }
  | { type: "SET_ITEMS_PER_PAGE"; payload: number }
  | { type: "SET_CURRENT_PAGE"; payload: number }
  | { type: "SET_LOCAL_SEARCH_TERM"; payload: string }
  | { type: "SET_FILTERS"; payload: ProductFilters }
  | { type: "RESET_FILTERS" };

// 🎯 DEFAULT VALUES
const DEFAULT_FILTERS: ProductFilters = {
  categories: [],
  priceRange: [0, 100000],
  ratings: [],
  inStock: false,
  onSale: false,
  brands: [],
};

const DEFAULT_PRODUCTS_STATE: ProductsState = {
  isFirstRender: true,
  allowAnimations: false,
  isFiltersOpen: false,
  viewMode: "grid",
  sortBy: "relevance",
  itemsPerPage: 12,
  currentPage: 1,
  localSearchTerm: "",
  filters: DEFAULT_FILTERS,
};

// 🔧 REDUCER FUNCTION
function productsReducer(
  state: ProductsState,
  action: ProductsAction
): ProductsState {
  switch (action.type) {
    case "SET_FIRST_RENDER":
      return { ...state, isFirstRender: action.payload };

    case "SET_ALLOW_ANIMATIONS":
      return { ...state, allowAnimations: action.payload };

    case "SET_FILTERS_OPEN":
      return { ...state, isFiltersOpen: action.payload };

    case "SET_VIEW_MODE":
      return { ...state, viewMode: action.payload };

    case "SET_SORT_BY":
      return { ...state, sortBy: action.payload, currentPage: 1 };

    case "SET_ITEMS_PER_PAGE":
      return { ...state, itemsPerPage: action.payload, currentPage: 1 };

    case "SET_CURRENT_PAGE":
      return { ...state, currentPage: action.payload };

    case "SET_LOCAL_SEARCH_TERM":
      return { ...state, localSearchTerm: action.payload, currentPage: 1 };

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
export function useProductsState() {
  const [state, dispatch] = useReducer(productsReducer, DEFAULT_PRODUCTS_STATE);
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

    setFiltersOpen: useCallback((value: boolean) => {
      dispatch({ type: "SET_FILTERS_OPEN", payload: value });
    }, []),

    setViewMode: useCallback((mode: "grid" | "list") => {
      dispatch({ type: "SET_VIEW_MODE", payload: mode });
    }, []),

    setSortBy: useCallback((sort: string) => {
      dispatch({ type: "SET_SORT_BY", payload: sort });
    }, []),

    setItemsPerPage: useCallback((items: number) => {
      dispatch({ type: "SET_ITEMS_PER_PAGE", payload: items });
    }, []),

    setCurrentPage: useCallback((page: number) => {
      dispatch({ type: "SET_CURRENT_PAGE", payload: page });
    }, []),

    setLocalSearchTerm: useCallback((term: string) => {
      dispatch({ type: "SET_LOCAL_SEARCH_TERM", payload: term });
    }, []),

    setFilters: useCallback((filters: ProductFilters) => {
      dispatch({ type: "SET_FILTERS", payload: filters });
    }, []),

    resetFilters: useCallback(() => {
      dispatch({ type: "RESET_FILTERS" });
    }, []),

    // 🎯 TOGGLE ACTIONS
    toggleFilters: useCallback(() => {
      dispatch({ type: "SET_FILTERS_OPEN", payload: !state.isFiltersOpen });
    }, [state.isFiltersOpen]),
  };

  return {
    state,
    actions,
    // 📊 COMPUTED VALUES
    totalPages: 0, // Will be calculated in parent component
    startIndex: (state.currentPage - 1) * state.itemsPerPage,
  };
}

export default useProductsState;
