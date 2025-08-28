/**
 * 🎯 USE WISHLIST STATE HOOK
 * =========================
 *
 * Hook centralizado para manejar todo el estado local del WishlistTab.
 * Implementa reducer pattern para mejor performance y predicibilidad.
 *
 * 📍 Nueva ubicación: /hooks/wishlist/ (Fase Futura - Organización por Feature)
 *
 * @version 3.0.0 - Feature-First Architecture
 */

"use client";

import { useReducer, useCallback, useRef, useEffect } from "react";
import { WishlistFilters } from "../../ui/components/tabs/wishlist/types";

// 🔷 STATE INTERFACE
export interface WishlistState {
  // 🎨 Animation & Rendering
  isFirstRender: boolean;
  allowAnimations: boolean;

  // 📊 UI State
  viewMode: "grid" | "list";
  itemsPerPage: number;
  currentPage: number;

  // 🔍 Search & Filters
  localSearchTerm: string;
  filters: WishlistFilters;

  // 📋 Selection
  selectedItems: Set<string>;
}

// 🎛️ ACTIONS
export type WishlistAction =
  | { type: "SET_FIRST_RENDER"; payload: boolean }
  | { type: "SET_ALLOW_ANIMATIONS"; payload: boolean }
  | { type: "SET_VIEW_MODE"; payload: "grid" | "list" }
  | { type: "SET_ITEMS_PER_PAGE"; payload: number }
  | { type: "SET_CURRENT_PAGE"; payload: number }
  | { type: "SET_LOCAL_SEARCH_TERM"; payload: string }
  | { type: "SET_SELECTED_ITEMS"; payload: Set<string> }
  | { type: "SET_FILTERS"; payload: WishlistFilters }
  | { type: "RESET_FILTERS" };

// 🎯 DEFAULT VALUES
const DEFAULT_FILTERS: WishlistFilters = {
  categories: [],
  priceRange: [0, 1000000],
  onSale: false,
  inStock: false,
  sortBy: "date_added",
};

const DEFAULT_WISHLIST_STATE: WishlistState = {
  isFirstRender: true,
  allowAnimations: false,
  viewMode: "grid",
  itemsPerPage: 12,
  currentPage: 1,
  localSearchTerm: "",
  filters: DEFAULT_FILTERS,
  selectedItems: new Set<string>(),
};

// 🔧 REDUCER FUNCTION
function wishlistReducer(
  state: WishlistState,
  action: WishlistAction
): WishlistState {
  switch (action.type) {
    case "SET_FIRST_RENDER":
      return { ...state, isFirstRender: action.payload };

    case "SET_ALLOW_ANIMATIONS":
      return { ...state, allowAnimations: action.payload };

    case "SET_VIEW_MODE":
      return { ...state, viewMode: action.payload };

    case "SET_ITEMS_PER_PAGE":
      return { ...state, itemsPerPage: action.payload, currentPage: 1 };

    case "SET_CURRENT_PAGE":
      return { ...state, currentPage: action.payload };

    case "SET_LOCAL_SEARCH_TERM":
      return { ...state, localSearchTerm: action.payload, currentPage: 1 };

    case "SET_SELECTED_ITEMS":
      return { ...state, selectedItems: action.payload };

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
export function useWishlistState() {
  const [state, dispatch] = useReducer(wishlistReducer, DEFAULT_WISHLIST_STATE);
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

  // 🔧 ACTION CREATORS
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

    setItemsPerPage: useCallback((items: number) => {
      dispatch({ type: "SET_ITEMS_PER_PAGE", payload: items });
    }, []),

    setCurrentPage: useCallback((page: number) => {
      dispatch({ type: "SET_CURRENT_PAGE", payload: page });
    }, []),

    setLocalSearchTerm: useCallback((term: string) => {
      dispatch({ type: "SET_LOCAL_SEARCH_TERM", payload: term });
    }, []),

    setSelectedItems: useCallback((items: Set<string>) => {
      dispatch({ type: "SET_SELECTED_ITEMS", payload: items });
    }, []),

    setFilters: useCallback((filters: WishlistFilters) => {
      dispatch({ type: "SET_FILTERS", payload: filters });
    }, []),

    resetFilters: useCallback(() => {
      dispatch({ type: "RESET_FILTERS" });
    }, []),

    // 🎯 SELECTION HELPERS
    addToSelected: useCallback(
      (id: string) => {
        const newSelected = new Set(state.selectedItems);
        newSelected.add(id);
        dispatch({ type: "SET_SELECTED_ITEMS", payload: newSelected });
      },
      [state.selectedItems]
    ),

    removeFromSelected: useCallback(
      (id: string) => {
        const newSelected = new Set(state.selectedItems);
        newSelected.delete(id);
        dispatch({ type: "SET_SELECTED_ITEMS", payload: newSelected });
      },
      [state.selectedItems]
    ),

    toggleSelected: useCallback(
      (id: string) => {
        const newSelected = new Set(state.selectedItems);
        if (newSelected.has(id)) {
          newSelected.delete(id);
        } else {
          newSelected.add(id);
        }
        dispatch({ type: "SET_SELECTED_ITEMS", payload: newSelected });
      },
      [state.selectedItems]
    ),

    clearSelection: useCallback(() => {
      dispatch({ type: "SET_SELECTED_ITEMS", payload: new Set<string>() });
    }, []),
  };

  // 📊 COMPUTED VALUES
  const startIndex = (state.currentPage - 1) * state.itemsPerPage;

  return {
    state,
    actions,
    startIndex,
  };
}

export default useWishlistState;
