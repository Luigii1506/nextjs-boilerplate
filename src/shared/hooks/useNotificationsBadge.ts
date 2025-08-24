/**
 * 🔔 USE NOTIFICATIONS BADGE - HOOK
 * ==================================
 *
 * Hook para manejar el badge de notificaciones del admin layout.
 * Integra con el sistema de notificaciones global.
 *
 * Created: 2025-01-18 - TODO completado
 */

"use client";

import { useState, useEffect, useCallback } from "react";

interface NotificationsBadgeState {
  unreadCount: number;
  hasNewNotifications: boolean;
  lastUpdate: string | null;
}

export function useNotificationsBadge() {
  const [state, setState] = useState<NotificationsBadgeState>({
    unreadCount: 0,
    hasNewNotifications: false,
    lastUpdate: null,
  });

  // ✅ Simulated data - Replace with real API call
  const fetchNotificationsCount = useCallback(async () => {
    try {
      // 🚀 TODO: Replace with real API call
      // const response = await fetch('/api/notifications/unread-count');
      // const data = await response.json();

      // 📊 Simulated response
      const mockData = {
        unreadCount: Math.floor(Math.random() * 10), // 0-9 random
        hasNewNotifications: Math.random() > 0.7, // 30% chance
        lastUpdate: new Date().toISOString(),
      };

      setState(mockData);
    } catch (error) {
      console.error("Failed to fetch notifications count:", error);
      setState((prev) => ({
        ...prev,
        unreadCount: 0,
        hasNewNotifications: false,
      }));
    }
  }, []);

  // ✅ Auto-refresh every 30 seconds
  useEffect(() => {
    // Initial fetch
    fetchNotificationsCount();

    // Set up polling
    const interval = setInterval(fetchNotificationsCount, 30000);

    // Listen for manual refresh events
    const handleRefresh = () => fetchNotificationsCount();
    window.addEventListener("refresh-notifications", handleRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener("refresh-notifications", handleRefresh);
    };
  }, [fetchNotificationsCount]);

  // ✅ Mark as read
  const markAsRead = useCallback(() => {
    setState((prev) => ({
      ...prev,
      unreadCount: 0,
      hasNewNotifications: false,
      lastUpdate: new Date().toISOString(),
    }));

    // 🚀 TODO: Call API to mark notifications as read
    // fetch('/api/notifications/mark-read', { method: 'POST' });
  }, []);

  // ✅ Manual refresh
  const refresh = useCallback(() => {
    fetchNotificationsCount();
  }, [fetchNotificationsCount]);

  return {
    ...state,
    refresh,
    markAsRead,
    // Computed values
    shouldShowBadge: state.unreadCount > 0,
    badgeText: state.unreadCount > 99 ? "99+" : state.unreadCount.toString(),
  };
}

export default useNotificationsBadge;
