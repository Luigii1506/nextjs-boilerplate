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

export const useScrollHeader = ({
  threshold = 100,
  debounceDelay = 10,
  scrollDelta = 5,
}: UseScrollHeaderOptions = {}): UseScrollHeaderReturn => {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isPastThreshold, setIsPastThreshold] = useState(false);

  // Referencias para optimización
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 🎯 Función principal de manejo de scroll
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    const scrollDirection = currentScrollY > lastScrollY.current;
    const scrollDistance = Math.abs(currentScrollY - lastScrollY.current);

    // Solo procesar si hay un cambio significativo
    if (scrollDistance < scrollDelta) return;

    setScrollY(currentScrollY);
    setIsPastThreshold(currentScrollY > threshold);
    setIsScrollingDown(scrollDirection);

    // Lógica de visibilidad del header
    if (currentScrollY <= threshold) {
      // Siempre mostrar header cuando estamos cerca del top
      setIsHeaderVisible(true);
    } else if (scrollDirection && currentScrollY > lastScrollY.current) {
      // Scroll hacia abajo - ocultar header
      setIsHeaderVisible(false);
    } else if (!scrollDirection && lastScrollY.current > currentScrollY) {
      // Scroll hacia arriba - mostrar header
      setIsHeaderVisible(true);
    }

    lastScrollY.current = currentScrollY;
    ticking.current = false;
  }, [threshold, scrollDelta]);

  // 🎯 Función optimizada con requestAnimationFrame
  const requestTick = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(handleScroll);
      ticking.current = true;
    }
  }, [handleScroll]);

  // 🎯 Función con debounce para mejor performance
  const debouncedScrollHandler = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      requestTick();
    }, debounceDelay);
  }, [requestTick, debounceDelay]);

  // 🎯 Funciones de control manual
  const showHeader = useCallback(() => {
    setIsHeaderVisible(true);
  }, []);

  const hideHeader = useCallback(() => {
    setIsHeaderVisible(false);
  }, []);

  // 🎯 Effect para agregar/remover event listeners
  useEffect(() => {
    // Configuración inicial
    setScrollY(window.scrollY);
    lastScrollY.current = window.scrollY;

    // Event listeners optimizados
    const scrollHandler = () => {
      debouncedScrollHandler();
    };

    // Eventos adicionales para mejor UX
    const handleResize = () => {
      setScrollY(window.scrollY);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setScrollY(window.scrollY);
        lastScrollY.current = window.scrollY;
      }
    };

    // Agregar listeners
    window.addEventListener('scroll', scrollHandler, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener('scroll', scrollHandler);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [debouncedScrollHandler]);

  // 🎯 Debug logging (solo en desarrollo)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('ScrollHeader State:', {
        isHeaderVisible,
        isScrollingDown,
        scrollY,
        isPastThreshold,
      });
    }
  }, [isHeaderVisible, isScrollingDown, scrollY, isPastThreshold]);

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
    threshold: 120, // Más sensible para tabs
    debounceDelay: 8, // Más responsivo
    scrollDelta: 3, // Más preciso
  });
};
