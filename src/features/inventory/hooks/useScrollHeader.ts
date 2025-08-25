/**
 * 🎯 SCROLL HEADER HOOK
 * =====================
 *
 * Custom hook para gestionar la ocultación/aparición del header
 * basado en la dirección del scroll con animaciones smooth
 *
 * Created: 2025-01-17 - Smart Scroll Header System
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseScrollHeaderOptions {
  /** Umbral de scroll para activar la ocultación (px) */
  threshold?: number;
  /** Debounce delay para optimizar performance (ms) */
  debounceDelay?: number;
  /** Distancia mínima para detectar cambio de dirección */
  scrollDelta?: number;
}

interface UseScrollHeaderReturn {
  /** Si el header está visible */
  isHeaderVisible: boolean;
  /** Si se está haciendo scroll hacia abajo */
  isScrollingDown: boolean;
  /** Posición actual del scroll */
  scrollY: number;
  /** Si se pasó el threshold */
  isPastThreshold: boolean;
  /** Función para forzar mostrar header */
  showHeader: () => void;
  /** Función para forzar ocultar header */
  hideHeader: () => void;
}

export const useScrollHeader = (
  options: UseScrollHeaderOptions = {}
): UseScrollHeaderReturn => {
  const { threshold = 100 } = options;
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isPastThreshold, setIsPastThreshold] = useState(false);

  // Referencias para optimización
  const lastScrollY = useRef(0);

  // 🎯 Función SIMPLIFICADA de manejo de scroll
  const handleScroll = useCallback(() => {
    const currentScrollY =
      window.scrollY ||
      window.pageYOffset ||
      document.documentElement.scrollTop;

    console.log("🔍 Scroll detected:", currentScrollY); // Debug

    setScrollY(currentScrollY);
    setIsPastThreshold(currentScrollY > threshold);

    const scrollDirection = currentScrollY > lastScrollY.current;
    setIsScrollingDown(scrollDirection);

    // Lógica de visibilidad del header
    if (currentScrollY <= threshold) {
      setIsHeaderVisible(true);
    } else if (currentScrollY > lastScrollY.current) {
      // Scroll hacia abajo - ocultar header
      setIsHeaderVisible(false);
    } else if (currentScrollY < lastScrollY.current) {
      // Scroll hacia arriba - mostrar header
      setIsHeaderVisible(true);
    }

    lastScrollY.current = currentScrollY;
  }, [threshold]);

  // 🎯 Funciones de control manual
  const showHeader = useCallback(() => {
    setIsHeaderVisible(true);
  }, []);

  const hideHeader = useCallback(() => {
    setIsHeaderVisible(false);
  }, []);

  // 🎯 Effect SIMPLIFICADO para event listeners
  useEffect(() => {
    // Configuración inicial
    const initialScrollY =
      window.scrollY ||
      window.pageYOffset ||
      document.documentElement.scrollTop;
    setScrollY(initialScrollY);
    lastScrollY.current = initialScrollY;

    console.log("🚀 Hook initialized with scrollY:", initialScrollY);

    // Agregar listener directo SIN debounce
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  // 🎯 Debug logging (solo en desarrollo) - Comentado para evitar spam
  // useEffect(() => {
  //   if (process.env.NODE_ENV === 'development') {
  //     console.log('ScrollHeader State:', {
  //       isHeaderVisible,
  //       isScrollingDown,
  //       scrollY,
  //       isPastThreshold,
  //     });
  //   }
  // }, [isHeaderVisible, isScrollingDown, scrollY, isPastThreshold]);

  return {
    isHeaderVisible,
    isScrollingDown,
    scrollY,
    isPastThreshold,
    showHeader,
    hideHeader,
  };
};

// 🎯 Hook especializado para header de tabs
export const useTabScrollHeader = () => {
  return useScrollHeader({
    threshold: 50, // Mucho más sensible
    debounceDelay: 0, // Sin delay
    scrollDelta: 1, // Más preciso
  });
};
