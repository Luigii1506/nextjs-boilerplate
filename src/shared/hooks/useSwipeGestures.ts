/**
 * 🎯 SWIPE GESTURES HOOK
 * ======================
 *
 * Custom hook para manejar gestos de deslizamiento en móviles.
 * Optimizado para AdminLayout sidebar interactions.
 *
 * Features:
 * - ✅ Touch events handling
 * - ✅ Configurable thresholds
 * - ✅ Velocity calculations
 * - ✅ Direction detection
 * - ✅ TypeScript strict typing
 * - ✅ Performance optimized
 *
 * Created: 2025-01-18 - Mobile UX enhancement
 */

"use client";

import { useCallback, useRef, useEffect } from "react";

// 🎯 Types
interface SwipeGestureConfig {
  minSwipeDistance?: number;
  maxSwipeTime?: number;
  touchSlop?: number;
  velocityThreshold?: number;
}

interface SwipeGestureCallbacks {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface TouchInfo {
  startX: number;
  startY: number;
  startTime: number;
  lastX: number;
  lastY: number;
  lastTime: number;
}

interface SwipeGestureHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

interface SwipeGestureState {
  isSwipingHorizontal: boolean;
  isSwipingVertical: boolean;
}

interface SwipeGestureReturn {
  handlers: SwipeGestureHandlers;
  state: SwipeGestureState;
}

// 🎯 Default configuration
const DEFAULT_CONFIG: Required<SwipeGestureConfig> = {
  minSwipeDistance: 50, // Minimum distance to register as swipe
  maxSwipeTime: 300, // Maximum time for swipe gesture
  touchSlop: 10, // Minimum movement to start gesture
  velocityThreshold: 0.3, // Minimum velocity for swipe
};

/**
 * 🎯 useSwipeGestures Hook
 *
 * @param callbacks - Swipe direction callbacks
 * @param config - Gesture configuration options
 * @returns Touch event handlers and gesture state
 */
export function useSwipeGestures(
  callbacks: SwipeGestureCallbacks,
  config: SwipeGestureConfig = {}
): SwipeGestureReturn {
  const configRef = useRef({ ...DEFAULT_CONFIG, ...config });
  const touchInfoRef = useRef<TouchInfo | null>(null);
  const isSwipingHorizontalRef = useRef(false);
  const isSwipingVerticalRef = useRef(false);

  // Update config if it changes
  useEffect(() => {
    configRef.current = { ...DEFAULT_CONFIG, ...config };
  }, [config]);

  // 🎯 Touch start handler
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;

    touchInfoRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      lastX: touch.clientX,
      lastY: touch.clientY,
      lastTime: Date.now(),
    };

    isSwipingHorizontalRef.current = false;
    isSwipingVerticalRef.current = false;
  }, []);

  // 🎯 Touch move handler
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const touchInfo = touchInfoRef.current;
    const touch = e.touches[0];

    if (!touchInfo || !touch) return;

    const currentX = touch.clientX;
    const currentY = touch.clientY;
    const currentTime = Date.now();

    const deltaX = Math.abs(currentX - touchInfo.startX);
    const deltaY = Math.abs(currentY - touchInfo.startY);

    // Determine swipe direction once we cross the touch slop
    if (!isSwipingHorizontalRef.current && !isSwipingVerticalRef.current) {
      if (
        deltaX > configRef.current.touchSlop ||
        deltaY > configRef.current.touchSlop
      ) {
        if (deltaX > deltaY) {
          isSwipingHorizontalRef.current = true;
        } else {
          isSwipingVerticalRef.current = true;
        }
      }
    }

    // Prevent scroll if we're swiping horizontally
    if (isSwipingHorizontalRef.current) {
      e.preventDefault();
    }

    // Update touch info
    touchInfoRef.current = {
      ...touchInfo,
      lastX: currentX,
      lastY: currentY,
      lastTime: currentTime,
    };
  }, []);

  // 🎯 Touch end handler
  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const touchInfo = touchInfoRef.current;

      if (!touchInfo) return;

      const touch = e.changedTouches[0];
      if (!touch) return;

      const endX = touch.clientX;
      const endY = touch.clientY;
      const endTime = Date.now();

      const deltaX = endX - touchInfo.startX;
      const deltaY = endY - touchInfo.startY;
      const totalTime = endTime - touchInfo.startTime;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Check if this qualifies as a swipe
      const isValidSwipe =
        distance >= configRef.current.minSwipeDistance &&
        totalTime <= configRef.current.maxSwipeTime;

      if (!isValidSwipe) {
        touchInfoRef.current = null;
        isSwipingHorizontalRef.current = false;
        isSwipingVerticalRef.current = false;
        return;
      }

      // Calculate velocity
      const velocity = distance / totalTime;

      if (velocity < configRef.current.velocityThreshold) {
        touchInfoRef.current = null;
        isSwipingHorizontalRef.current = false;
        isSwipingVerticalRef.current = false;
        return;
      }

      // Determine swipe direction and call appropriate callback
      if (isSwipingHorizontalRef.current) {
        if (deltaX > 0) {
          callbacks.onSwipeRight?.();
        } else {
          callbacks.onSwipeLeft?.();
        }
      } else if (isSwipingVerticalRef.current) {
        if (deltaY > 0) {
          callbacks.onSwipeDown?.();
        } else {
          callbacks.onSwipeUp?.();
        }
      }

      // Reset state
      touchInfoRef.current = null;
      isSwipingHorizontalRef.current = false;
      isSwipingVerticalRef.current = false;
    },
    [callbacks]
  );

  return {
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
    state: {
      isSwipingHorizontal: isSwipingHorizontalRef.current,
      isSwipingVertical: isSwipingVerticalRef.current,
    },
  };
}

export default useSwipeGestures;
