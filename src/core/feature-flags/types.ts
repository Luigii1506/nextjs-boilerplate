/**
 * 🎯 FEATURE FLAGS TYPES
 * ======================
 *
 * Shared types between client and server.
 * TypeScript safety for feature flags system.
 *
 * Simple: 2025-01-17 - Unified types
 */

import { FEATURE_FLAGS, FEATURE_CATEGORIES } from "./config";

// 🎯 Core types
export type FeatureFlag = keyof typeof FEATURE_FLAGS;
export type FeatureCategory = keyof typeof FEATURE_CATEGORIES;

// 📊 Feature flag data structure
export interface FeatureFlagData {
  key: FeatureFlag;
  name: string;
  description: string;
  enabled: boolean;
  category: FeatureCategory;
  isStatic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 🎨 UI component props
export interface FeatureFlagCardProps {
  flag: FeatureFlagData;
  onToggle: (flagKey: string) => Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
}

// 📊 Server action result types
export interface FeatureFlagActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: string;
}

// 🔄 Batch update types
export interface FeatureFlagBatchUpdate {
  key: string;
  enabled: boolean;
}

export interface FeatureFlagBatchResult {
  updated: number;
  total: number;
  errors?: string[];
}

// 📡 Broadcast message types
export interface FeatureFlagBroadcastData {
  flagKey: string;
  enabled?: boolean;
  timestamp?: number;
}

// 🎯 Context types
export interface FeatureFlagsContextType {
  flags: FeatureFlagData[];
  flagsMap: Record<string, boolean>;
  isEnabled: (flag: FeatureFlag) => boolean;
  toggleFlag: (flagKey: string) => Promise<void>;
  refreshFlags: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// 🔍 Filter types for UI
export interface FeatureFlagFilters {
  search: string;
  category: FeatureCategory | "all";
  status: "enabled" | "disabled" | "all";
}

