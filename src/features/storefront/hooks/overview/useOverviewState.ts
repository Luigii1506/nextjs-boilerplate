/**
 * 🎯 USE OVERVIEW STATE HOOK
 * =========================
 *
 * Hook centralizado para manejar todo el estado local del OverviewTab.
 * Implementa reducer pattern para mejor performance y predicibilidad.
 *
 * 📍 Nueva ubicación: /hooks/overview/ (Fase Futura - Organización por Feature)
 *
 * @version 3.0.0 - Feature-First Architecture
 */

"use client";

import { useReducer, useCallback, useRef, useEffect } from "react";
import {
  OverviewState,
  OverviewAction,
} from "../../ui/components/tabs/overview/types";

// 🎯 DEFAULT VALUES
const HERO_ANIMATION_DELAY = 100; // ms

const DEFAULT_OVERVIEW_STATE: OverviewState = {
  isFirstRender: true,
  allowAnimations: false,
  searchTerm: "",
};

// 🔧 REDUCER FUNCTION
function overviewReducer(
  state: OverviewState,
  action: OverviewAction
): OverviewState {
  switch (action.type) {
    case "SET_FIRST_RENDER":
      return { ...state, isFirstRender: action.payload };

    case "SET_ALLOW_ANIMATIONS":
      return { ...state, allowAnimations: action.payload };

    case "SET_SEARCH_TERM":
      return { ...state, searchTerm: action.payload };

    default:
      return state;
  }
}

// 🎯 MAIN HOOK
export function useOverviewState() {
  const [state, dispatch] = useReducer(overviewReducer, DEFAULT_OVERVIEW_STATE);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 🎨 Anti-flicker Animation Setup (MANDATORY)
  useEffect(() => {
    if (state.isFirstRender) {
      timeoutRef.current = setTimeout(() => {
        dispatch({ type: "SET_ALLOW_ANIMATIONS", payload: true });
        dispatch({ type: "SET_FIRST_RENDER", payload: false });
      }, HERO_ANIMATION_DELAY);
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

    setSearchTerm: useCallback((term: string) => {
      dispatch({ type: "SET_SEARCH_TERM", payload: term });
    }, []),
  };

  return {
    state,
    actions,
  };
}

export default useOverviewState;
