/**
 * 💀 SKELETON LOADER COMPONENT
 * ============================
 *
 * Componente reutilizable para mostrar placeholders durante carga
 * sin causar parpadeos. Reemplaza spinners que hacen desaparecer contenido.
 *
 * UX: 2025-01-17 - Anti-flicker loading states
 */

"use client";

import React from "react";
import { cn } from "@/shared/utils";

// 🎯 Skeleton base props
interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: "none" | "sm" | "md" | "lg" | "full";
  variant?: "light" | "dark" | "pulse";
}

// 💀 Base Skeleton
export function Skeleton({
  className,
  width,
  height,
  rounded = "md",
  variant = "light",
}: SkeletonProps) {
  const roundedClasses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  const variantClasses = {
    light: "bg-slate-200 dark:bg-slate-700",
    dark: "bg-slate-300 dark:bg-slate-600",
    pulse: "bg-slate-200 dark:bg-slate-700 animate-pulse",
  };

  return (
    <div
      className={cn(
        "animate-pulse",
        variantClasses[variant],
        roundedClasses[rounded],
        className
      )}
      style={{ width, height }}
    />
  );
}

// 📝 Text line skeleton
export function SkeletonText({
  lines = 1,
  className,
  variant = "pulse",
}: {
  lines?: number;
  className?: string;
  variant?: SkeletonProps["variant"];
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="1rem"
          width={i === lines - 1 ? "75%" : "100%"}
          variant={variant}
        />
      ))}
    </div>
  );
}

// 🃏 Card skeleton
export function SkeletonCard({
  className,
  showAvatar = false,
  lines = 3,
}: {
  className?: string;
  showAvatar?: boolean;
  lines?: number;
}) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4",
        className
      )}
    >
      <div className="flex items-start gap-4">
        {showAvatar && <Skeleton width="3rem" height="3rem" rounded="full" />}
        <div className="flex-1">
          <Skeleton height="1.25rem" width="60%" className="mb-2" />
          <SkeletonText lines={lines} />
        </div>
      </div>
    </div>
  );
}

// 📊 Stats card skeleton
export function SkeletonStatsCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Skeleton width="2.5rem" height="2.5rem" rounded="lg" />
        <div className="flex-1">
          <Skeleton height="0.875rem" width="50%" className="mb-1" />
          <Skeleton height="2rem" width="40%" />
        </div>
      </div>
    </div>
  );
}

// 📋 List skeleton
export function SkeletonList({
  items = 3,
  showAvatar = false,
  className,
}: {
  items?: number;
  showAvatar?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonCard key={i} showAvatar={showAvatar} lines={2} />
      ))}
    </div>
  );
}

// 📱 Feature flag card skeleton
export function SkeletonFeatureFlagCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg border-2 border-slate-200 transition-all duration-200",
        className
      )}
    >
      {/* Header */}
      <div className="p-4 bg-slate-50 rounded-t-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Skeleton width="2rem" height="2rem" rounded="lg" />
            <div>
              <Skeleton height="1.25rem" width="8rem" className="mb-1" />
              <Skeleton height="0.75rem" width="6rem" />
            </div>
          </div>
          <Skeleton width="2.75rem" height="1.5rem" rounded="full" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <SkeletonText lines={2} className="mb-4" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton width="4rem" height="1.5rem" rounded="full" />
            <Skeleton width="3rem" height="1.5rem" rounded="full" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton width="0.75rem" height="0.75rem" />
            <Skeleton width="2rem" height="0.75rem" />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100">
          <Skeleton height="0.75rem" width="8rem" />
        </div>
      </div>
    </div>
  );
}

// 🏗️ Page skeleton
export function SkeletonPage({
  showStats = true,
  showFilters = true,
  gridItems = 6,
  className,
}: {
  showStats?: boolean;
  showFilters?: boolean;
  gridItems?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton height="2rem" width="12rem" className="mb-2" />
          <Skeleton height="1rem" width="20rem" />
        </div>
        <Skeleton width="8rem" height="2.5rem" rounded="lg" />
      </div>

      {/* Stats */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonStatsCard key={i} />
          ))}
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex gap-4">
            <Skeleton height="2.5rem" className="flex-1" />
            <Skeleton height="2.5rem" width="12rem" />
            <Skeleton height="2.5rem" width="10rem" />
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: gridItems }).map((_, i) => (
          <SkeletonCard key={i} showAvatar={true} />
        ))}
      </div>
    </div>
  );
}

