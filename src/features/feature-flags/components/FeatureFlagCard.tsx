/**
 * 🎛️ FEATURE FLAG CARD COMPONENT
 * ==============================
 *
 * Simple card component for displaying and toggling feature flags.
 * Clean design with category colors and status indicators.
 *
 * Simple: 2025-01-17 - Card component
 */

"use client";

import React from "react";
import {
  Clock,
  Database,
  Code,
  Shield,
  Package,
  Beaker,
  Settings,
} from "lucide-react";
import {
  FEATURE_CATEGORIES,
  type FeatureFlagCardProps,
} from "@/features/feature-flags";
import { formatDate } from "@/shared/utils";

// 🎨 Category icons and colors (Dark Mode Compatible)
const CATEGORY_CONFIG = {
  core: {
    icon: Shield,
    colors: {
      bg: "bg-blue-50 dark:bg-blue-950/50",
      border: "border-blue-200 dark:border-blue-800",
      text: "text-blue-700 dark:text-blue-300",
      badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
    },
  },
  module: {
    icon: Package,
    colors: {
      bg: "bg-green-50 dark:bg-green-950/50",
      border: "border-green-200 dark:border-green-800",
      text: "text-green-700 dark:text-green-300",
      badge:
        "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    },
  },
  experimental: {
    icon: Beaker,
    colors: {
      bg: "bg-yellow-50 dark:bg-yellow-950/50",
      border: "border-yellow-200 dark:border-yellow-800",
      text: "text-yellow-700 dark:text-yellow-300",
      badge:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
    },
  },
  admin: {
    icon: Settings,
    colors: {
      bg: "bg-purple-50 dark:bg-purple-950/50",
      border: "border-purple-200 dark:border-purple-800",
      text: "text-purple-700 dark:text-purple-300",
      badge:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",
    },
  },
  ui: {
    icon: Code,
    colors: {
      bg: "bg-indigo-50 dark:bg-indigo-950/50",
      border: "border-indigo-200 dark:border-indigo-800",
      text: "text-indigo-700 dark:text-indigo-300",
      badge:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300",
    },
  },
} as const;

const FeatureFlagCard = React.memo(function FeatureFlagCard({
  flag,
  onToggle,
  isLoading = false,
  disabled = false,
}: FeatureFlagCardProps) {
  const categoryConfig = CATEGORY_CONFIG[flag.category] || CATEGORY_CONFIG.core;
  const CategoryIcon = categoryConfig.icon;
  const colors = categoryConfig.colors;

  const handleToggle = async () => {
    if (disabled || isLoading) return;
    await onToggle(flag.key);
  };

  return (
    <div
      className={`
      bg-white dark:bg-gray-800 rounded-lg border-2 transition-all duration-200 hover:shadow-md dark:hover:shadow-xl
      ${flag.enabled ? colors.border : "border-slate-200 dark:border-gray-700"}
      ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
    `}
    >
      {/* 📊 Header */}
      <div
        className={`p-4 rounded-t-lg ${
          flag.enabled ? colors.bg : "bg-slate-50 dark:bg-gray-700/50"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                flag.enabled ? colors.badge : "bg-slate-200 dark:bg-gray-600"
              }`}
            >
              <CategoryIcon
                className={`w-4 h-4 ${
                  flag.enabled
                    ? colors.text
                    : "text-slate-600 dark:text-gray-300"
                }`}
              />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {flag.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 font-mono">
                {flag.key}
              </p>
            </div>
          </div>

          {/* 🔄 Toggle Switch */}
          <button
            onClick={handleToggle}
            disabled={disabled || isLoading}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
              ${
                flag.enabled
                  ? "bg-blue-600 dark:bg-blue-500"
                  : "bg-slate-300 dark:bg-gray-600"
              }
              ${
                disabled || isLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${flag.enabled ? "translate-x-6" : "translate-x-1"}
              `}
            />
          </button>
        </div>
      </div>

      {/* 📝 Content */}
      <div className="p-4">
        <p className="text-sm text-slate-600 dark:text-gray-300 mb-4">
          {flag.description}
        </p>

        {/* 🏷️ Status and Category */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`
              inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
              ${
                flag.enabled
                  ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                  : "bg-slate-100 text-slate-800 dark:bg-gray-700 dark:text-gray-300"
              }
            `}
            >
              <div
                className={`w-2 h-2 rounded-full mr-1 ${
                  flag.enabled
                    ? "bg-green-500 dark:bg-green-400"
                    : "bg-slate-500 dark:bg-gray-400"
                }`}
              />
              {flag.enabled ? "Activo" : "Inactivo"}
            </span>

            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors.badge}`}
            >
              {FEATURE_CATEGORIES[flag.category]?.name || flag.category}
            </span>
          </div>

          {/* 🗄️ Source indicator */}
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-gray-400">
            {flag.isStatic ? (
              <>
                <Code className="w-3 h-3" />
                <span>Static</span>
              </>
            ) : (
              <>
                <Database className="w-3 h-3" />
                <span>DB</span>
              </>
            )}
          </div>
        </div>

        {/* 🕒 Timestamps */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Actualizado: {formatDate(flag.updatedAt)}</span>
            </div>
            {isLoading && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
                <span>Actualizando...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default FeatureFlagCard;
