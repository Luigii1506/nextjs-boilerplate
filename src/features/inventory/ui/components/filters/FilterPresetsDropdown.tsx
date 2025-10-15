/**
 * 💾 FILTER PRESETS DROPDOWN COMPONENT
 * =====================================
 *
 * Dropdown para seleccionar, editar y eliminar presets de filtros
 * Muestra lista de presets guardados con opciones de gestión
 *
 * Created: 2025-01-17 - Filter Presets Feature
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bookmark,
  Star,
  Edit3,
  Trash2,
  Copy,
  ChevronDown,
  Filter,
  MoreVertical,
} from "lucide-react";
import { cn } from "@/shared/utils";
import type { FilterPreset } from "../../../types";

interface FilterPresetsDropdownProps {
  presets: FilterPreset[];
  onSelectPreset: (preset: FilterPreset) => void;
  onEditPreset: (preset: FilterPreset) => void;
  onDeletePreset: (presetId: string) => void;
  onDuplicatePreset: (presetId: string) => void;
  onSetDefault: (presetId: string) => void;
  currentPresetId?: string;
}

const COLOR_CLASSES: Record<string, string> = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  red: "bg-red-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
  indigo: "bg-indigo-500",
  orange: "bg-orange-500",
  gray: "bg-gray-500",
};

export const FilterPresetsDropdown: React.FC<FilterPresetsDropdownProps> = ({
  presets,
  onSelectPreset,
  onEditPreset,
  onDeletePreset,
  onDuplicatePreset,
  onSetDefault,
  currentPresetId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentPreset = presets.find((p) => p.id === currentPresetId);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveMenuId(null);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleSelectPreset = (preset: FilterPreset) => {
    onSelectPreset(preset);
    setIsOpen(false);
    setActiveMenuId(null);
  };

  const handleMenuAction = (
    e: React.MouseEvent,
    action: () => void
  ) => {
    e.stopPropagation();
    action();
    setActiveMenuId(null);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all",
          "hover:border-blue-400 dark:hover:border-blue-600",
          isOpen
            ? "border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
        )}
      >
        <Bookmark
          className={cn(
            "w-4 h-4",
            isOpen
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-500 dark:text-gray-400"
          )}
        />
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {currentPreset ? currentPreset.name : "Presets"}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-gray-400 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-slideInUp">
          {/* Header */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
              <Filter className="w-4 h-4" />
              Filtros Guardados
            </div>
          </div>

          {/* Presets List */}
          <div className="max-h-96 overflow-y-auto overscroll-contain">
            {presets.length === 0 ? (
              <div className="p-8 text-center">
                <Bookmark className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No hay presets guardados
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Guarda tus filtros favoritos para acceso rápido
                </p>
              </div>
            ) : (
              presets.map((preset) => (
                <div
                  key={preset.id}
                  className={cn(
                    "relative group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors",
                    currentPresetId === preset.id &&
                      "bg-blue-50 dark:bg-blue-900/20"
                  )}
                >
                  {/* Preset Item */}
                  <button
                    onClick={() => handleSelectPreset(preset)}
                    className="w-full text-left p-3 pr-12"
                  >
                    <div className="flex items-start gap-3">
                      {/* Color Badge */}
                      <div
                        className={cn(
                          "w-3 h-3 rounded-full flex-shrink-0 mt-1",
                          COLOR_CLASSES[preset.color || "blue"]
                        )}
                      />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {preset.name}
                          </p>
                          {preset.isDefault && (
                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                          )}
                        </div>
                        {preset.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                            {preset.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {Object.keys(preset.filters).length} filtros
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Actions Menu */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(
                          activeMenuId === preset.id ? null : preset.id
                        );
                      }}
                      className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Actions Submenu */}
                    {activeMenuId === preset.id && (
                      <div
                        ref={menuRef}
                        className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
                      >
                        {!preset.isDefault && (
                          <button
                            onClick={(e) =>
                              handleMenuAction(e, () => onSetDefault(preset.id))
                            }
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Star className="w-4 h-4" />
                            Marcar como predeterminado
                          </button>
                        )}
                        <button
                          onClick={(e) =>
                            handleMenuAction(e, () => onEditPreset(preset))
                          }
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                          Editar
                        </button>
                        <button
                          onClick={(e) =>
                            handleMenuAction(e, () =>
                              onDuplicatePreset(preset.id)
                            )
                          }
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                          Duplicar
                        </button>
                        <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                        <button
                          onClick={(e) =>
                            handleMenuAction(e, () => {
                              if (
                                window.confirm(
                                  `¿Eliminar el preset "${preset.name}"?`
                                )
                              ) {
                                onDeletePreset(preset.id);
                              }
                            })
                          }
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPresetsDropdown;
