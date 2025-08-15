/**
 * 🔔 FILE UPLOAD NOTIFICATIONS HOOK
 * =================================
 *
 * Enterprise-grade notification system for file upload operations
 * Eliminates setTimeout hacky patterns
 *
 * Created: 2025-01-29 - Professional notification management
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface FileNotification {
  type: "success" | "error" | "info" | "warning";
  message: string;
  id?: string;
}

export interface UseFileNotificationsReturn {
  notification: FileNotification | null;
  showNotification: (type: FileNotification["type"], message: string) => void;
  hideNotification: () => void;
}

/**
 * 🎯 ENTERPRISE-GRADE: File notifications with auto-cleanup
 * Replaces hacky setTimeout patterns with proper React patterns
 */
export function useFileNotifications(): UseFileNotificationsReturn {
  const [notification, setNotification] = useState<FileNotification | null>(
    null
  );
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // 🧹 Auto-clear notifications with proper cleanup
  useEffect(() => {
    if (notification) {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout (5 seconds for file operations)
      timeoutRef.current = setTimeout(() => {
        setNotification(null);
      }, 5000);
    }

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [notification]);

  const showNotification = useCallback(
    (type: FileNotification["type"], message: string) => {
      setNotification({
        type,
        message,
        id: `${type}-${Date.now()}`, // Unique ID for each notification
      });
    },
    []
  );

  const hideNotification = useCallback(() => {
    setNotification(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    notification,
    showNotification,
    hideNotification,
  };
}

/**
 * 🔄 ENTERPRISE-GRADE: File refresh with debouncing
 * Eliminates double setTimeout refresh patterns
 */
export function useFileRefresh(refreshFunction: () => void | Promise<void>) {
  const refreshTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isRefreshingRef = useRef(false);

  const refreshFiles = useCallback(async () => {
    // Prevent multiple simultaneous refreshes
    if (isRefreshingRef.current) return;

    isRefreshingRef.current = true;

    try {
      // Clear any pending refresh
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      // Immediate refresh
      await refreshFunction();

      // Debounced secondary refresh for server actions
      refreshTimeoutRef.current = setTimeout(async () => {
        try {
          await refreshFunction();
        } catch (error) {
          console.error("Secondary refresh failed:", error);
        } finally {
          isRefreshingRef.current = false;
        }
      }, 500);
    } catch (error) {
      console.error("Primary refresh failed:", error);
      isRefreshingRef.current = false;
    }
  }, [refreshFunction]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      isRefreshingRef.current = false;
    };
  }, []);

  return refreshFiles;
}
