/**
 * 🏢 FEATURE FLAGS SERVER COMPONENTS
 * ==================================
 *
 * React Server Components para feature flags.
 * Separado del archivo de helpers para evitar problemas de parsing de TypeScript.
 *
 * Created: 2025-01-29
 */

import React from "react";
import {
  isFeatureEnabled,
  getFeatureFlags,
} from "./feature-flags-server-helpers";
import type { FeatureFlag } from "./feature-flags";

/**
 * 🛡️ FEATURE FLAG BOUNDARY COMPONENT
 * Server Component wrapper for conditional rendering
 */
interface FeatureBoundaryProps {
  flag: FeatureFlag;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export async function FeatureBoundary({
  flag,
  children,
  fallback = null,
}: FeatureBoundaryProps) {
  const isEnabled = await isFeatureEnabled(flag);

  if (!isEnabled) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * 📱 CONDITIONAL NAVIGATION ITEM (Server Component)
 * Perfect for navigation items that depend on feature flags
 */
interface ConditionalNavItemProps {
  flag: FeatureFlag;
  children: React.ReactNode;
  href?: string;
  className?: string;
}

export async function ConditionalNavItem({
  flag,
  children,
  href,
  className,
}: ConditionalNavItemProps) {
  const isEnabled = await isFeatureEnabled(flag);

  if (!isEnabled) {
    return null;
  }

  if (href) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  return <div className={className}>{children}</div>;
}

/**
 * 🎛️ FEATURE FLAGS DEBUG INFO (Server Component)
 * Development helper to see all flags
 */
export async function FeatureFlagsDebugInfo() {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const flags = await getFeatureFlags();
  const flagEntries = Object.entries(flags);

  return (
    <details className="mt-4 p-4 bg-gray-100 rounded border">
      <summary className="cursor-pointer font-medium text-sm text-gray-700">
        🎛️ Feature Flags Debug ({flagEntries.length} flags)
      </summary>
      <div className="mt-2 space-y-1">
        {flagEntries.map(([key, enabled]) => (
          <div key={key} className="flex items-center gap-2 text-xs">
            <span className={enabled ? "text-green-600" : "text-red-600"}>
              {enabled ? "✅" : "❌"}
            </span>
            <code className="bg-gray-200 px-1 rounded">{key}</code>
            <span className="text-gray-500">
              {enabled ? "enabled" : "disabled"}
            </span>
          </div>
        ))}
      </div>
    </details>
  );
}

/**
 * 🧮 FEATURE FLAGS METRICS (Server Component)
 * Shows stats about feature flag usage
 */
export async function FeatureFlagsMetrics() {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const flags = await getFeatureFlags();
  const total = Object.keys(flags).length;
  const enabled = Object.values(flags).filter(Boolean).length;
  const disabled = total - enabled;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
      <span>📊</span>
      <span>
        {enabled}/{total} flags enabled
      </span>
      {disabled > 0 && (
        <span className="text-blue-500">({disabled} disabled)</span>
      )}
    </div>
  );
}
