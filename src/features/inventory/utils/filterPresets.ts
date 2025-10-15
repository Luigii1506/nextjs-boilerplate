/**
 * 💾 FILTER PRESETS UTILITIES
 * ===========================
 *
 * Utilidades para guardar y cargar presets de filtros en localStorage
 * Permite a los usuarios guardar sus combinaciones de filtros favoritas
 *
 * Created: 2025-01-17 - Filter Presets Feature
 */

import type { FilterPreset, SavePresetInput, ProductFilters } from "../types";

const STORAGE_KEY = "inventory_filter_presets";

/**
 * Obtiene todos los presets guardados
 */
export function getFilterPresets(): FilterPreset[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultPresets();

    const presets = JSON.parse(stored) as FilterPreset[];
    return presets.length > 0 ? presets : getDefaultPresets();
  } catch (error) {
    console.error("Error loading filter presets:", error);
    return getDefaultPresets();
  }
}

/**
 * Guarda un nuevo preset
 */
export function saveFilterPreset(input: SavePresetInput): FilterPreset {
  const preset: FilterPreset = {
    id: generatePresetId(),
    name: input.name,
    description: input.description,
    filters: input.filters,
    color: input.color || "blue",
    icon: input.icon,
    isDefault: input.isDefault || false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const presets = getFilterPresets();

  // Si es default, quitar el flag de otros presets
  if (preset.isDefault) {
    presets.forEach((p) => (p.isDefault = false));
  }

  presets.push(preset);
  savePresets(presets);

  return preset;
}

/**
 * Actualiza un preset existente
 */
export function updateFilterPreset(
  id: string,
  updates: Partial<SavePresetInput>
): FilterPreset | null {
  const presets = getFilterPresets();
  const index = presets.findIndex((p) => p.id === id);

  if (index === -1) return null;

  const updatedPreset: FilterPreset = {
    ...presets[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  // Si se marca como default, quitar el flag de otros
  if (updates.isDefault) {
    presets.forEach((p) => (p.isDefault = false));
  }

  presets[index] = updatedPreset;
  savePresets(presets);

  return updatedPreset;
}

/**
 * Elimina un preset
 */
export function deleteFilterPreset(id: string): boolean {
  const presets = getFilterPresets();
  const filtered = presets.filter((p) => p.id !== id);

  if (filtered.length === presets.length) return false;

  savePresets(filtered);
  return true;
}

/**
 * Obtiene un preset por ID
 */
export function getFilterPreset(id: string): FilterPreset | null {
  const presets = getFilterPresets();
  return presets.find((p) => p.id === id) || null;
}

/**
 * Obtiene el preset por defecto
 */
export function getDefaultPreset(): FilterPreset | null {
  const presets = getFilterPresets();
  return presets.find((p) => p.isDefault) || null;
}

/**
 * Marca un preset como default
 */
export function setDefaultPreset(id: string): boolean {
  const presets = getFilterPresets();
  const preset = presets.find((p) => p.id === id);

  if (!preset) return false;

  // Quitar default de todos
  presets.forEach((p) => (p.isDefault = false));
  // Marcar el seleccionado como default
  preset.isDefault = true;
  preset.updatedAt = new Date().toISOString();

  savePresets(presets);
  return true;
}

/**
 * Duplica un preset existente
 */
export function duplicateFilterPreset(id: string): FilterPreset | null {
  const preset = getFilterPreset(id);
  if (!preset) return null;

  const duplicate: FilterPreset = {
    ...preset,
    id: generatePresetId(),
    name: `${preset.name} (Copia)`,
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const presets = getFilterPresets();
  presets.push(duplicate);
  savePresets(presets);

  return duplicate;
}

/**
 * Exporta todos los presets a JSON
 */
export function exportPresets(): string {
  const presets = getFilterPresets();
  return JSON.stringify(presets, null, 2);
}

/**
 * Importa presets desde JSON
 */
export function importPresets(json: string): { success: boolean; count: number } {
  try {
    const imported = JSON.parse(json) as FilterPreset[];

    if (!Array.isArray(imported)) {
      throw new Error("Invalid format: expected array");
    }

    // Validar estructura básica
    const valid = imported.every(
      (p) => p.id && p.name && p.filters && p.createdAt
    );

    if (!valid) {
      throw new Error("Invalid preset structure");
    }

    // Regenerar IDs para evitar conflictos
    const newPresets = imported.map((p) => ({
      ...p,
      id: generatePresetId(),
      isDefault: false, // No importar defaults
    }));

    const existing = getFilterPresets();
    const merged = [...existing, ...newPresets];
    savePresets(merged);

    return { success: true, count: newPresets.length };
  } catch (error) {
    console.error("Error importing presets:", error);
    return { success: false, count: 0 };
  }
}

/**
 * Limpia todos los presets (excepto los default del sistema)
 */
export function clearAllPresets(): void {
  savePresets(getDefaultPresets());
}

// ========================================================================
// UTILIDADES PRIVADAS
// ========================================================================

/**
 * Guarda los presets en localStorage
 */
function savePresets(presets: FilterPreset[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  } catch (error) {
    console.error("Error saving filter presets:", error);
  }
}

/**
 * Genera un ID único para presets
 */
function generatePresetId(): string {
  return `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Presets predefinidos del sistema
 */
function getDefaultPresets(): FilterPreset[] {
  return [
    {
      id: "default_out_of_stock",
      name: "Sin Stock",
      description: "Productos sin inventario disponible",
      filters: {
        isOutOfStock: true,
      },
      color: "red",
      icon: "AlertTriangle",
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "default_low_stock",
      name: "Stock Bajo",
      description: "Productos con stock por debajo del mínimo",
      filters: {
        hasLowStock: true,
      },
      color: "yellow",
      icon: "AlertCircle",
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "default_critical_stock",
      name: "Stock Crítico",
      description: "Productos en stock crítico",
      filters: {
        hasCriticalStock: true,
      },
      color: "orange",
      icon: "Zap",
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "default_active_products",
      name: "Productos Activos",
      description: "Solo productos activos",
      filters: {
        isActive: true,
      },
      color: "green",
      icon: "CheckCircle",
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "default_inactive_products",
      name: "Productos Inactivos",
      description: "Solo productos inactivos",
      filters: {
        isActive: false,
      },
      color: "gray",
      icon: "XCircle",
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

/**
 * Obtiene estadísticas de un preset
 */
export function getPresetStats(preset: FilterPreset): {
  filterCount: number;
  hasSearch: boolean;
  hasDateRange: boolean;
  hasPriceRange: boolean;
} {
  const filters = preset.filters;
  const filterCount = Object.keys(filters).filter(
    (key) => filters[key as keyof ProductFilters] !== undefined
  ).length;

  return {
    filterCount,
    hasSearch: !!filters.search,
    hasDateRange: !!(filters.createdAfter || filters.createdBefore),
    hasPriceRange: !!(filters.minPrice || filters.maxPrice),
  };
}
