/**
 * 🌙 DARK MODE HOOK
 * =================
 *
 * Hook personalizado para manejar el estado de dark mode con:
 * - ✅ Feature flag integration
 * - ✅ LocalStorage persistence
 * - ✅ System preference detection
 * - ✅ Broadcast para sincronización cross-tab
 * - ✅ Automatic cleanup
 *
 * Created: 2025-01-17 - Dark mode implementation
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useFeatureFlags } from "@/core/feature-flags";

// 🎯 Constants
const STORAGE_KEY = "darkMode";
const BROADCAST_CHANNEL = "darkMode-sync";

// 🎯 Types
interface DarkModeState {
  isDarkMode: boolean;
  isEnabled: boolean;
  isSystemDark: boolean;
  toggle: () => void;
  setDarkMode: (enabled: boolean) => void;
}

/**
 * 🌙 useDarkMode Hook
 *
 * Maneja el estado de dark mode con feature flag integration
 */
export function useDarkMode(): DarkModeState {
  // 🎛️ Feature flag check
  const { isEnabled } = useFeatureFlags();
  const isFeatureEnabled = isEnabled("darkMode");

  // 🌙 State
  const [isSystemDark, setIsSystemDark] = useState(false);
  const [isDarkMode, setIsDarkModeState] = useState(false);
  const [broadcastChannel, setBroadcastChannel] =
    useState<BroadcastChannel | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // 🔍 Detect system preference (runs first)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsSystemDark(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsSystemDark(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // 💾 Initialize dark mode state (runs after system preference is detected)
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Setup broadcast channel
    const channel = new BroadcastChannel(BROADCAST_CHANNEL);
    setBroadcastChannel(channel);

    // Initialize dark mode state
    const stored = localStorage.getItem(STORAGE_KEY);
    let initialDarkMode = false;

    if (isFeatureEnabled) {
      if (stored !== null) {
        // Use stored preference only if feature is enabled
        initialDarkMode = stored === "true";
      } else {
        // NO auto-activation based on system preference
        // User must manually activate dark mode
        initialDarkMode = false;
      }
    } else {
      // Feature disabled = always light mode
      initialDarkMode = false;
    }

    // Debug: Uncomment to see initialization values
    // console.log("🌙 Initializing dark mode:", {
    //   isFeatureEnabled,
    //   stored,
    //   isSystemDark,
    //   initialDarkMode
    // });

    setIsDarkModeState(initialDarkMode);
    setIsInitialized(true);

    // Listen for broadcast messages
    const handleBroadcast = (event: MessageEvent) => {
      if (event.data?.type === "darkMode-changed") {
        setIsDarkModeState(event.data.isDarkMode);
      }
    };

    channel.addEventListener("message", handleBroadcast);

    return () => {
      channel.removeEventListener("message", handleBroadcast);
      channel.close();
    };
  }, [isSystemDark, isFeatureEnabled]); // Depends on both system preference and feature flag

  // 🎨 Apply dark mode to document (only after initialization)
  useEffect(() => {
    if (typeof window === "undefined" || !isInitialized) return;

    // Debug: Uncomment to see dark mode application
    // console.log("🌙 Applying dark mode:", { isFeatureEnabled, isDarkMode });

    if (isFeatureEnabled && isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode, isFeatureEnabled, isInitialized]);

  // 🔄 Toggle function
  const toggle = useCallback(() => {
    if (!isFeatureEnabled) return;

    const newValue = !isDarkMode;
    // Debug: Uncomment to see toggle actions
    // console.log("🌙 Toggling dark mode:", { from: isDarkMode, to: newValue });

    setIsDarkModeState(newValue);

    // Persist to localStorage
    localStorage.setItem(STORAGE_KEY, String(newValue));

    // Broadcast to other tabs
    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: "darkMode-changed",
        isDarkMode: newValue,
        timestamp: Date.now(),
      });
    }
  }, [isDarkMode, isFeatureEnabled, broadcastChannel]);

  // 🎯 Set dark mode directly
  const setDarkMode = useCallback(
    (enabled: boolean) => {
      if (!isFeatureEnabled) return;

      // Debug: Uncomment to see direct set actions
      // console.log("🌙 Setting dark mode directly:", enabled);

      setIsDarkModeState(enabled);
      localStorage.setItem(STORAGE_KEY, String(enabled));

      if (broadcastChannel) {
        broadcastChannel.postMessage({
          type: "darkMode-changed",
          isDarkMode: enabled,
          timestamp: Date.now(),
        });
      }
    },
    [isFeatureEnabled, broadcastChannel]
  );

  // 🚨 Reset dark mode when feature is disabled
  useEffect(() => {
    if (!isFeatureEnabled && isDarkMode && isInitialized) {
      // Debug: Uncomment to see feature disable actions
      // console.log("🌙 Feature disabled, resetting dark mode");
      setIsDarkModeState(false);
      document.documentElement.classList.remove("dark");
      localStorage.removeItem(STORAGE_KEY); // Clear stored preference
    }
  }, [isFeatureEnabled, isDarkMode, isInitialized]);

  return {
    isDarkMode: isFeatureEnabled ? isDarkMode : false,
    isEnabled: isFeatureEnabled,
    isSystemDark,
    toggle,
    setDarkMode,
  };
}

export default useDarkMode;
