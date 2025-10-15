/**
 * 💾 SAVE PRESET MODAL COMPONENT
 * ===============================
 *
 * Modal para guardar un preset de filtros
 * Permite nombrar, describir y personalizar el preset
 *
 * Created: 2025-01-17 - Filter Presets Feature
 */

"use client";

import React, { useState } from "react";
import { Save, Bookmark } from "lucide-react";
import { BaseModal } from "@/shared/ui/components/BaseModal";
import { cn } from "@/shared/utils";
import type { SavePresetInput, ProductFilters } from "../../../types";

interface SavePresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: SavePresetInput) => void;
  currentFilters: ProductFilters;
  editingPreset?: { id: string; name: string; description?: string; color?: string };
}

const PRESET_COLORS = [
  { value: "blue", label: "Azul", class: "bg-blue-500" },
  { value: "green", label: "Verde", class: "bg-green-500" },
  { value: "yellow", label: "Amarillo", class: "bg-yellow-500" },
  { value: "red", label: "Rojo", class: "bg-red-500" },
  { value: "purple", label: "Morado", class: "bg-purple-500" },
  { value: "pink", label: "Rosa", class: "bg-pink-500" },
  { value: "indigo", label: "Índigo", class: "bg-indigo-500" },
  { value: "orange", label: "Naranja", class: "bg-orange-500" },
  { value: "gray", label: "Gris", class: "bg-gray-500" },
];

export const SavePresetModal: React.FC<SavePresetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentFilters,
  editingPreset,
}) => {
  const [name, setName] = useState(editingPreset?.name || "");
  const [description, setDescription] = useState(editingPreset?.description || "");
  const [color, setColor] = useState(editingPreset?.color || "blue");
  const [isDefault, setIsDefault] = useState(false);

  const handleSave = () => {
    if (!name.trim()) {
      alert("Por favor ingresa un nombre para el preset");
      return;
    }

    const input: SavePresetInput = {
      name: name.trim(),
      description: description.trim() || undefined,
      filters: currentFilters,
      color,
      isDefault,
    };

    onSave(input);
    handleClose();
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setColor("blue");
    setIsDefault(false);
    onClose();
  };

  const filterCount = Object.keys(currentFilters).filter(
    (key) => currentFilters[key as keyof ProductFilters] !== undefined
  ).length;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingPreset ? "Editar Preset" : "Guardar Preset"}
      description={`${filterCount} filtro${filterCount !== 1 ? "s" : ""} activo${filterCount !== 1 ? "s" : ""}`}
      maxWidth="lg"
      icon={<Bookmark className="w-5 h-5 text-white" />}
    >
      <div className="space-y-6">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Nombre del Preset <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Productos con stock bajo"
            maxLength={50}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            autoFocus
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {name.length}/50 caracteres
          </p>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Descripción (opcional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe cuándo usar este preset..."
            maxLength={200}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {description.length}/200 caracteres
          </p>
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Color
          </label>
          <div className="grid grid-cols-5 gap-3">
            {PRESET_COLORS.map((colorOption) => (
              <button
                key={colorOption.value}
                onClick={() => setColor(colorOption.value)}
                className={cn(
                  "relative p-4 rounded-xl border-2 transition-all",
                  color === colorOption.value
                    ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                )}
              >
                <div className={cn("w-full h-8 rounded-lg", colorOption.class)} />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                  {colorOption.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Default checkbox */}
        <div>
          <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Usar como filtro predeterminado
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Este preset se aplicará automáticamente al abrir la vista de productos
              </p>
            </div>
          </label>
        </div>

        {/* Resumen de filtros activos */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Filtros que se guardarán:
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(currentFilters).map(([key, value]) => {
              if (value === undefined) return null;
              return (
                <span
                  key={key}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs rounded-md font-medium"
                >
                  {key}
                </span>
              );
            })}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all",
              name.trim()
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl"
                : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            )}
          >
            <Save className="w-5 h-5" />
            {editingPreset ? "Actualizar" : "Guardar"} Preset
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default SavePresetModal;
