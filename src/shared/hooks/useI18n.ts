/**
 * 🌍 USE I18N HOOK
 * ================
 *
 * Custom hook to manage internationalization (i18n) state.
 * Integrates with feature flags, local storage, and cross-tab synchronization.
 *
 * Features:
 * - Feature flag integration (only works when i18n feature is enabled)
 * - Local storage persistence
 * - Cross-tab synchronization via BroadcastChannel
 * - Spanish as default language
 * - Automatic cleanup when feature is disabled
 *
 * Created: 2025-01-17 - I18n feature implementation
 */

import { useState, useEffect, useCallback } from "react";
import { useFeatureFlags } from "@/core/feature-flags/hooks";
import {
  Language,
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  LANGUAGE_BROADCAST_CHANNEL,
  SUPPORTED_LANGUAGES,
  translations,
  type Translations,
} from "@/shared/i18n/translations";

// 🎯 Hook return type
export interface I18nState {
  // 🌍 Current state
  language: Language;
  isFeatureEnabled: boolean;
  isInitialized: boolean;

  // 📝 Available languages
  supportedLanguages: typeof SUPPORTED_LANGUAGES;

  // 🔄 Actions
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;

  // 📖 Translation function
  t: Translations;

  // 🎯 Helper functions
  getLanguageName: (lang: Language) => string;
  isLanguageSupported: (lang: string) => lang is Language;
}

/**
 * 🌍 useI18n Hook
 *
 * Manages language state with feature flag integration and persistence.
 * Only works when the i18n feature flag is enabled.
 *
 * @returns I18nState object with language state and controls
 */
export function useI18n(): I18nState {
  const { isEnabled } = useFeatureFlags();
  const isFeatureEnabled = isEnabled("i18n");

  // 🎯 Helper functions (definir primero)
  const isLanguageSupported = useCallback((lang: string): lang is Language => {
    return lang in SUPPORTED_LANGUAGES;
  }, []);

  const getLanguageName = useCallback((lang: Language): string => {
    return SUPPORTED_LANGUAGES[lang];
  }, []);

  // 🏗️ State
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [broadcastChannel, setBroadcastChannel] =
    useState<BroadcastChannel | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // 🚀 Initialize language state
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Create broadcast channel
    const channel = new BroadcastChannel(LANGUAGE_BROADCAST_CHANNEL);
    setBroadcastChannel(channel);

    // Get stored language preference
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    let initialLanguage = DEFAULT_LANGUAGE;

    if (isFeatureEnabled) {
      if (stored && isLanguageSupported(stored)) {
        initialLanguage = stored;
      } else {
        // Use default language (Spanish)
        initialLanguage = DEFAULT_LANGUAGE;
      }
    } else {
      // Feature disabled = always use default language
      initialLanguage = DEFAULT_LANGUAGE;
    }

    setLanguageState(initialLanguage);
    setIsInitialized(true);

    // 📡 Listen for broadcast messages
    const handleBroadcast = (event: MessageEvent) => {
      if (event.data?.type === "LANGUAGE_CHANGE") {
        const newLanguage = event.data.language;
        if (isLanguageSupported(newLanguage)) {
          setLanguageState(newLanguage);
        }
      }
    };

    channel.addEventListener("message", handleBroadcast);

    // 🧹 Cleanup
    return () => {
      channel.removeEventListener("message", handleBroadcast);
      channel.close();
    };
  }, [isFeatureEnabled, isLanguageSupported]);

  // 🔄 Reset language when feature is disabled
  useEffect(() => {
    if (!isFeatureEnabled && language !== DEFAULT_LANGUAGE && isInitialized) {
      setLanguageState(DEFAULT_LANGUAGE);
      localStorage.removeItem(LANGUAGE_STORAGE_KEY);
    }
  }, [isFeatureEnabled, language, isInitialized]);

  // 🎯 Set language function
  const setLanguage = useCallback(
    (newLanguage: Language) => {
      if (!isFeatureEnabled) {
        console.warn("I18n feature is disabled. Cannot change language.");
        return;
      }

      if (!isLanguageSupported(newLanguage)) {
        console.warn(`Language "${newLanguage}" is not supported.`);
        return;
      }

      // Update state
      setLanguageState(newLanguage);

      // Persist to localStorage
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);

      // Broadcast to other tabs
      if (broadcastChannel) {
        broadcastChannel.postMessage({
          type: "LANGUAGE_CHANGE",
          language: newLanguage,
          timestamp: Date.now(),
        });
      }
    },
    [isFeatureEnabled, broadcastChannel, isLanguageSupported]
  );

  // 🔄 Toggle language function
  const toggleLanguage = useCallback(() => {
    if (!isFeatureEnabled) return;

    const newLanguage = language === "es" ? "en" : "es";
    setLanguage(newLanguage);
  }, [language, setLanguage, isFeatureEnabled]);

  // 📖 Get current translations
  const currentTranslations = translations[language];

  return {
    // 🌍 Current state
    language,
    isFeatureEnabled,
    isInitialized,

    // 📝 Available languages
    supportedLanguages: SUPPORTED_LANGUAGES,

    // 🔄 Actions
    setLanguage,
    toggleLanguage,

    // 📖 Translation function
    t: currentTranslations,

    // 🎯 Helper functions
    getLanguageName,
    isLanguageSupported,
  };
}

// 🎯 Export for convenience
export default useI18n;
