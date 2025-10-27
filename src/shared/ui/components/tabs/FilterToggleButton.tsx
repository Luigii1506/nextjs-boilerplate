/**
 * 🔍 FILTER TOGGLE BUTTON COMPONENT
 * ==================================
 *
 * Reusable button for toggling filter panels
 * Shows active filter count with badge
 *
 * Created: 2025-01-27 - Shared Filter Toggle
 */

"use client";

import React from "react";
import { Filter } from "lucide-react";
import { cn } from "@/shared/utils";

export interface FilterToggleButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  activeCount?: number;
  className?: string;
  label?: string;
  showLabel?: boolean;
}

export const FilterToggleButton: React.FC<FilterToggleButtonProps> = ({
  isOpen,
  onToggle,
  activeCount = 0,
  className,
  label = "Filtros",
  showLabel = true,
}) => {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors",
        isOpen || activeCount > 0
          ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300"
          : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300",
        className
      )}
      aria-label={isOpen ? "Cerrar filtros" : "Abrir filtros"}
      aria-expanded={isOpen}
    >
      <Filter className="w-4 h-4" />
      {showLabel && <span className="hidden sm:inline">{label}</span>}
      {activeCount > 0 && (
        <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
          {activeCount}
        </span>
      )}
    </button>
  );
};
