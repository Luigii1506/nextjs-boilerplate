/**
 * 🔄 VIEW MODE TOGGLE COMPONENT
 * ==============================
 *
 * Reusable toggle for switching between grid and list view modes
 * Used across inventory and admin tabs
 *
 * Created: 2025-01-27 - Shared View Mode Toggle
 */

"use client";

import React from "react";
import { Grid3X3, List } from "lucide-react";
import { cn } from "@/shared/utils";

export type ViewMode = "grid" | "list";

export interface ViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  className?: string;
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  viewMode,
  onViewModeChange,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1",
        className
      )}
    >
      <button
        onClick={() => onViewModeChange("grid")}
        className={cn(
          "p-2 rounded-md transition-colors duration-200 flex items-center justify-center",
          viewMode === "grid"
            ? "bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-blue-400"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        )}
        title="Vista en cuadrícula"
        aria-label="Vista en cuadrícula"
      >
        <Grid3X3 className="w-4 h-4" />
      </button>
      <button
        onClick={() => onViewModeChange("list")}
        className={cn(
          "p-2 rounded-md transition-colors duration-200 flex items-center justify-center",
          viewMode === "list"
            ? "bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-blue-400"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        )}
        title="Vista en lista"
        aria-label="Vista en lista"
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
};
