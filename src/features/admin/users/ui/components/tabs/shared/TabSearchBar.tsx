/**
 * 🔍 TAB SEARCH BAR COMPONENT
 * ============================
 *
 * Barra de búsqueda estandarizada para tabs
 * Con diseño consistente y responsive
 *
 * Created: 2025-01-27 - Tab Search Bar Component
 */

"use client";

import React from "react";
import { Search } from "lucide-react";
import { cn } from "@/shared/utils";

export interface TabSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  /**
   * Ancho máximo del input
   * @default "max-w-md"
   */
  maxWidth?: string;
}

/**
 * TabSearchBar - Barra de búsqueda estándar para tabs
 *
 * @example
 * ```tsx
 * <TabSearchBar
 *   value={searchTerm}
 *   onChange={setSearchTerm}
 *   placeholder="Buscar usuarios..."
 * />
 * ```
 */
export const TabSearchBar: React.FC<TabSearchBarProps> = ({
  value,
  onChange,
  placeholder = "Buscar...",
  className,
  maxWidth = "max-w-md",
}) => {
  return (
    <div className={cn("relative flex-1", maxWidth, className)}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      />
    </div>
  );
};

export default TabSearchBar;
