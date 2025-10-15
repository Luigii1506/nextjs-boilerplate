/**
 * 🎯 BULK SELECTION BAR COMPONENT
 * ===============================
 *
 * Sticky bar that appears when products are selected
 * Shows count and provides quick actions
 * Beautiful animations and dark mode support
 *
 * Created: 2025-01-19 - Bulk Operations
 */

"use client";

import React from "react";
import {
  X,
  CheckSquare,
  Trash2,
  Tag,
  Package,
  DollarSign,
  Power,
  PowerOff,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/shared/utils";

interface BulkSelectionBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDelete: () => void;
  onUpdateCategory: () => void;
  onUpdateSupplier: () => void;
  onUpdatePrice: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onMoreActions: () => void;
  className?: string;
}

export const BulkSelectionBar: React.FC<BulkSelectionBarProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onDelete,
  onUpdateCategory,
  onUpdateSupplier,
  onUpdatePrice,
  onActivate,
  onDeactivate,
  onMoreActions,
  className,
}) => {
  const allSelected = selectedCount === totalCount && totalCount > 0;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800",
        "dark:from-blue-700 dark:via-blue-800 dark:to-blue-900",
        "border-t-4 border-blue-400 dark:border-blue-500",
        "shadow-2xl backdrop-blur-lg",
        "transform transition-all duration-300 ease-in-out",
        selectedCount > 0
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0 pointer-events-none",
        className
      )}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: Selection Info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-white">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="text-lg font-bold">
                  {selectedCount} producto{selectedCount !== 1 ? "s" : ""}{" "}
                  seleccionado{selectedCount !== 1 ? "s" : ""}
                </p>
                <p className="text-sm text-blue-100">
                  {allSelected ? (
                    <span className="font-medium">Todos seleccionados</span>
                  ) : (
                    <button
                      onClick={onSelectAll}
                      className="hover:text-white transition-colors underline"
                    >
                      Seleccionar todos ({totalCount})
                    </button>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Center: Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <button
              onClick={onUpdateCategory}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "bg-white/10 hover:bg-white/20 text-white",
                "transition-all duration-200 hover:scale-105",
                "backdrop-blur border border-white/20"
              )}
              title="Cambiar categoría"
            >
              <Tag className="w-4 h-4" />
              <span className="hidden sm:inline">Categoría</span>
            </button>

            <button
              onClick={onUpdateSupplier}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "bg-white/10 hover:bg-white/20 text-white",
                "transition-all duration-200 hover:scale-105",
                "backdrop-blur border border-white/20"
              )}
              title="Cambiar proveedor"
            >
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Proveedor</span>
            </button>

            <button
              onClick={onUpdatePrice}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "bg-white/10 hover:bg-white/20 text-white",
                "transition-all duration-200 hover:scale-105",
                "backdrop-blur border border-white/20"
              )}
              title="Ajustar precios"
            >
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Precio</span>
            </button>

            <button
              onClick={onActivate}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "bg-green-500/20 hover:bg-green-500/30 text-white",
                "transition-all duration-200 hover:scale-105",
                "backdrop-blur border border-green-400/30"
              )}
              title="Activar productos"
            >
              <Power className="w-4 h-4" />
              <span className="hidden sm:inline">Activar</span>
            </button>

            <button
              onClick={onDeactivate}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "bg-orange-500/20 hover:bg-orange-500/30 text-white",
                "transition-all duration-200 hover:scale-105",
                "backdrop-blur border border-orange-400/30"
              )}
              title="Desactivar productos"
            >
              <PowerOff className="w-4 h-4" />
              <span className="hidden sm:inline">Desactivar</span>
            </button>

            <button
              onClick={onMoreActions}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "bg-white/10 hover:bg-white/20 text-white",
                "transition-all duration-200 hover:scale-105",
                "backdrop-blur border border-white/20"
              )}
              title="Más acciones"
            >
              <MoreHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Más</span>
            </button>

            <button
              onClick={onDelete}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "bg-red-500/20 hover:bg-red-500/30 text-white",
                "transition-all duration-200 hover:scale-105",
                "backdrop-blur border border-red-400/30"
              )}
              title="Eliminar seleccionados"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Eliminar</span>
            </button>
          </div>

          {/* Right: Clear Selection */}
          <div className="flex items-center gap-2">
            <button
              onClick={onDeselectAll}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "bg-white/10 hover:bg-white/20 text-white",
                "transition-all duration-200 hover:scale-105",
                "backdrop-blur border border-white/20"
              )}
            >
              <X className="w-4 h-4" />
              <span>Limpiar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress indicator animation */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-400 to-blue-300 transition-all duration-500"
          style={{
            width: `${(selectedCount / totalCount) * 100}%`,
          }}
        />
      </div>
    </div>
  );
};

export default BulkSelectionBar;
