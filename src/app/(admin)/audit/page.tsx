/**
 * ⚡ AUDIT TRAIL PAGE - TANSTACK OPTIMIZED
 * =======================================
 *
 * Página principal del sistema de auditoría súper optimizada.
 * Performance enterprise con TanStack Query.
 *
 * Enterprise: 2025-01-17 - TanStack Query optimization
 */

import { Metadata } from "next";
import { Suspense } from "react";
import { AuditDashboard } from "@/features/audit";

export const metadata: Metadata = {
  title: "Audit Trail | Admin - TanStack Optimized",
  description:
    "Sistema de auditoría y seguimiento de actividades optimizado con TanStack Query",
};

export default function AuditPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          {/* ⚡ Custom Audit Dashboard Skeleton */}

          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="w-48 h-8 bg-slate-300 dark:bg-slate-600 rounded animate-pulse" />
              <div className="w-96 h-4 bg-slate-300 dark:bg-slate-600 rounded animate-pulse" />
              {/* Active filters indicator skeleton */}
              <div className="flex items-center gap-2 mt-2">
                <div className="w-4 h-4 bg-blue-300 rounded animate-pulse" />
                <div className="w-32 h-3 bg-blue-300 rounded animate-pulse" />
                <div className="w-48 h-3 bg-blue-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-24 h-10 bg-slate-300 dark:bg-slate-600 rounded animate-pulse" />
              <div className="w-32 h-10 bg-slate-300 dark:bg-slate-600 rounded animate-pulse" />
            </div>
          </div>

          {/* Tabs skeleton */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-1">
            <div className="flex gap-1">
              <div className="w-24 h-10 bg-slate-300 dark:bg-slate-600 rounded animate-pulse" />
              <div className="w-24 h-10 bg-slate-300 dark:bg-slate-600 rounded animate-pulse" />
            </div>
          </div>

          {/* Stats skeleton grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 bg-slate-300 dark:bg-slate-600 rounded animate-pulse" />
                    <div className="w-16 h-4 bg-slate-300 dark:bg-slate-600 rounded animate-pulse" />
                  </div>
                  <div className="w-20 h-8 bg-slate-300 dark:bg-slate-600 rounded animate-pulse" />
                  <div className="w-24 h-3 bg-slate-300 dark:bg-slate-600 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          {/* Charts skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6"
              >
                <div className="w-32 h-6 bg-slate-300 dark:bg-slate-600 rounded mb-4 animate-pulse" />
                <div className="w-full h-64 bg-slate-300 dark:bg-slate-600 rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Loading indicator with TanStack Query branding */}
          <div className="text-center text-slate-600 dark:text-slate-400">
            <div className="inline-flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="font-medium">
                Cargando audit trail optimizado...
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              ⚡ Powered by TanStack Query • Enterprise Performance
            </p>
          </div>
        </div>
      }
    >
      <AuditDashboard />
    </Suspense>
  );
}
