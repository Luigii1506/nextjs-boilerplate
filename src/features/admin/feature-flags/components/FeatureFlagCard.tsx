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
} from "@/core/feature-flags";

// 🎨 Category icons and colors
const CATEGORY_CONFIG = {
  core: {
    icon: Shield,
    colors: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
      badge: "bg-blue-100 text-blue-800",
    },
  },
  module: {
    icon: Package,
    colors: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
      badge: "bg-green-100 text-green-800",
    },
  },
  experimental: {
    icon: Beaker,
    colors: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-700",
      badge: "bg-yellow-100 text-yellow-800",
    },
  },
  admin: {
    icon: Settings,
    colors: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-700",
      badge: "bg-purple-100 text-purple-800",
    },
  },
} as const;

export default function FeatureFlagCard({
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
      bg-white rounded-lg border-2 transition-all duration-200 hover:shadow-md
      ${flag.enabled ? colors.border : "border-slate-200"}
      ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
    `}
    >
      {/* 📊 Header */}
      <div
        className={`p-4 rounded-t-lg ${
          flag.enabled ? colors.bg : "bg-slate-50"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                flag.enabled ? colors.badge : "bg-slate-200"
              }`}
            >
              <CategoryIcon
                className={`w-4 h-4 ${
                  flag.enabled ? colors.text : "text-slate-600"
                }`}
              />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{flag.name}</h3>
              <p className="text-xs text-slate-500 font-mono">{flag.key}</p>
            </div>
          </div>

          {/* 🔄 Toggle Switch */}
          <button
            onClick={handleToggle}
            disabled={disabled || isLoading}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${flag.enabled ? "bg-blue-600" : "bg-slate-300"}
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
        <p className="text-sm text-slate-600 mb-4">{flag.description}</p>

        {/* 🏷️ Status and Category */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`
              inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
              ${
                flag.enabled
                  ? "bg-green-100 text-green-800"
                  : "bg-slate-100 text-slate-800"
              }
            `}
            >
              <div
                className={`w-2 h-2 rounded-full mr-1 ${
                  flag.enabled ? "bg-green-500" : "bg-slate-500"
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
          <div className="flex items-center gap-1 text-xs text-slate-500">
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
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Actualizado: {formatDate(flag.updatedAt)}</span>
            </div>
            {isLoading && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span>Actualizando...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 🕒 Date formatter
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}
