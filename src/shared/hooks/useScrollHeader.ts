/**
 * 🎯 REUSABLE SCROLL HEADER HOOK
 * =============================
 *
 * Hook reutilizable para detectar scroll y animar headers
 * Funciona tanto con scroll nativo como wheel simulation
 * Completamente configurable y sin efectos secundarios
 *
 * Created: 2025-01-17 - Reusable Scroll Detection
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// 🔧 Hook Configuration Options
export interface UseScrollHeaderOptions {
  /** Threshold in pixels to hide/show header (default: 50) */
  threshold?: number;
  /** Wheel sensitivity for wheel-based simulation (default: 0.5) */
  wheelSensitivity?: number;
  /** Debounce delay in ms for scroll events (default: 0) */
  debounceDelay?: number;
  /** Use wheel simulation as fallback if native scroll fails (default: true) */
  useWheelFallback?: boolean;
  /** Enable debug logging (default: false) */
  debug?: boolean;
}

// 🎯 Hook Return Type
export interface UseScrollHeaderReturn {
  /** Current scroll Y position */
  scrollY: number;
  /** Whether header should be visible based on threshold */
  isHeaderVisible: boolean;
  /** Whether scroll position is past threshold */
  isPastThreshold: boolean;
  /** Whether native scroll is working */
  isNativeScrollWorking: boolean;
  /** Whether wheel simulation is active */
  isWheelSimulationActive: boolean;
  /** Manually set scroll position (for testing) */
  setScrollPosition: (y: number) => void;
}

export const useScrollHeader = (
  options: UseScrollHeaderOptions = {}
): UseScrollHeaderReturn => {
  const {
    threshold = 50,
    wheelSensitivity = 0.5,
    debounceDelay = 0,
    useWheelFallback = true,
    debug = false,
  } = options;

  // 🏗️ State Management
  const [scrollY, setScrollY] = useState(0);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isNativeScrollWorking, setIsNativeScrollWorking] = useState(true);
  const [isWheelSimulationActive, setIsWheelSimulationActive] = useState(false);

  // 🎯 Refs for performance
  const scrollYRef = useRef(0);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 🔄 Update scroll position and visibility
  const updateScrollState = useCallback(
    (newScrollY: number) => {
      scrollYRef.current = newScrollY;
      setScrollY(newScrollY);
      setIsHeaderVisible(newScrollY < threshold);

      if (debug) {
        console.log(
          `📊 Scroll Update: ${newScrollY}px, Header: ${
            newScrollY < threshold ? "VISIBLE" : "HIDDEN"
          }`
        );
      }
    },
    [threshold, debug]
  );

  // 🎯 Debounced scroll handler
  const handleScroll = useCallback(() => {
    if (debounceDelay > 0) {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        const currentY = window.scrollY;
        updateScrollState(currentY);
      }, debounceDelay);
    } else {
      const currentY = window.scrollY;
      updateScrollState(currentY);
    }
  }, [updateScrollState, debounceDelay]);

  // 🎡 Wheel-based scroll simulation
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!isWheelSimulationActive) return;

      const deltaY = e.deltaY * wheelSensitivity;
      const currentScrollY = scrollYRef.current;
      const newScrollY = Math.max(0, currentScrollY + deltaY);

      updateScrollState(newScrollY);

      if (debug) {
        console.log(
          `🎡 Wheel Simulation: ${currentScrollY}px → ${newScrollY}px`
        );
      }
    },
    [wheelSensitivity, updateScrollState, isWheelSimulationActive, debug]
  );

  // 🔍 Test if native scroll is working
  const testNativeScroll = useCallback(() => {
    const initialScrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;
    const isScrollable = docHeight > windowHeight;

    if (debug) {
      console.log(
        `🔍 Scroll Test - Scrollable: ${isScrollable}, Initial: ${initialScrollY}px`
      );
    }

    // Test scroll after a short delay
    setTimeout(() => {
      const testScrollY = window.scrollY;
      const scrollWorking =
        isScrollable && (testScrollY > 0 || initialScrollY > 0);

      setIsNativeScrollWorking(scrollWorking);

      if (!scrollWorking && useWheelFallback) {
        setIsWheelSimulationActive(true);
        if (debug) {
          console.log("🎡 Enabling wheel simulation fallback");
        }
      }

      // Initialize scroll state
      updateScrollState(testScrollY);
    }, 100);
  }, [useWheelFallback, updateScrollState, debug]);

  // 🎯 Manual scroll position setter
  const setScrollPosition = useCallback(
    (y: number) => {
      updateScrollState(y);

      // Try to update native scroll if working
      if (isNativeScrollWorking) {
        window.scrollTo({ top: y, behavior: "smooth" });
      }

      if (debug) {
        console.log(`📍 Manual scroll set to: ${y}px`);
      }
    },
    [updateScrollState, isNativeScrollWorking, debug]
  );

  // 🚀 Setup Effect
  useEffect(() => {
    if (debug) {
      console.log("🚀 useScrollHeader: Setting up scroll detection");
    }

    // Test initial scroll state
    testNativeScroll();

    // Native scroll listeners
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Wheel listener (always add, but only active if simulation is enabled)
    window.addEventListener("wheel", handleWheel, { passive: true });

    // Cleanup function
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleWheel);

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }

      if (debug) {
        console.log("🧹 useScrollHeader: Cleaned up listeners");
      }
    };
  }, [handleScroll, handleWheel, testNativeScroll, debug]);

  // 🎯 Computed values
  const isPastThreshold = scrollY > threshold;

  return {
    scrollY,
    isHeaderVisible,
    isPastThreshold,
    isNativeScrollWorking,
    isWheelSimulationActive,
    setScrollPosition,
  };
};
