/**
 * 🎯 BULK ACTIONS MODAL COMPONENT
 * ===============================
 *
 * Modal for configuring and executing bulk operations
 * Supports multiple operation types with validation
 * Beautiful UI with dark mode and animations
 *
 * Created: 2025-01-19 - Bulk Operations
 */

"use client";

import React, { useState } from "react";
import {
  X,
  Tag,
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Percent,
  Hash,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { cn } from "@/shared/utils";
import {
  BaseModal,
  BaseModalActions,
  BaseModalButton,
} from "@/shared/ui/components";
import type {
  BulkOperationType,
  CategoryWithRelations,
  SupplierWithRelations,
} from "../../../types";

interface BulkActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  operationType?: BulkOperationType;
  categories: CategoryWithRelations[];
  suppliers: SupplierWithRelations[];
  onExecute: (data: BulkOperationData) => Promise<void>;
  isLoading?: boolean;
}

export interface BulkOperationData {
  operation: BulkOperationType;
  categoryId?: string;
  supplierId?: string;
  priceAdjustment?: {
    type: "percentage" | "fixed";
    value: number;
    operation: "increase" | "decrease";
  };
  costAdjustment?: {
    type: "percentage" | "fixed";
    value: number;
    operation: "increase" | "decrease";
  };
}

export const BulkActionsModal: React.FC<BulkActionsModalProps> = ({
  isOpen,
  onClose,
  selectedCount,
  operationType: initialOperationType,
  categories,
  suppliers,
  onExecute,
  isLoading = false,
}) => {
  const [operationType, setOperationType] = useState<BulkOperationType>(
    initialOperationType || "updateCategory"
  );
  const [categoryId, setCategoryId] = useState<string>("");
  const [supplierId, setSupplierId] = useState<string>("");
  const [adjustmentType, setAdjustmentType] = useState<"percentage" | "fixed">(
    "percentage"
  );
  const [adjustmentValue, setAdjustmentValue] = useState<number>(0);
  const [adjustmentOperation, setAdjustmentOperation] = useState<
    "increase" | "decrease"
  >("increase");

  const handleSubmit = async () => {
    const data: BulkOperationData = {
      operation: operationType,
    };

    if (operationType === "updateCategory") {
      data.categoryId = categoryId;
    } else if (operationType === "updateSupplier") {
      data.supplierId = supplierId;
    } else if (operationType === "updatePrice") {
      data.priceAdjustment = {
        type: adjustmentType,
        value: adjustmentValue,
        operation: adjustmentOperation,
      };
    } else if (operationType === "updateCost") {
      data.costAdjustment = {
        type: adjustmentType,
        value: adjustmentValue,
        operation: adjustmentOperation,
      };
    }

    await onExecute(data);
  };

  const isValid = () => {
    if (operationType === "updateCategory") return !!categoryId;
    if (operationType === "updateSupplier") return !!supplierId;
    if (operationType === "updatePrice" || operationType === "updateCost") {
      return adjustmentValue > 0;
    }
    return true;
  };

  const getTitle = () => {
    const titles: Record<BulkOperationType, string> = {
      delete: "Eliminar Productos",
      updateCategory: "Cambiar Categoría",
      updateSupplier: "Cambiar Proveedor",
      updatePrice: "Ajustar Precios",
      updateCost: "Ajustar Costos",
      activate: "Activar Productos",
      deactivate: "Desactivar Productos",
      addTags: "Agregar Etiquetas",
      removeTags: "Remover Etiquetas",
    };
    return titles[operationType];
  };

  const getIcon = () => {
    switch (operationType) {
      case "updateCategory":
        return <Tag className="w-5 h-5 text-white" />;
      case "updateSupplier":
        return <Package className="w-5 h-5 text-white" />;
      case "updatePrice":
      case "updateCost":
        return <DollarSign className="w-5 h-5 text-white" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-white" />;
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      description={`Aplicar cambios a ${selectedCount} producto${selectedCount !== 1 ? "s" : ""} seleccionado${selectedCount !== 1 ? "s" : ""}`}
      icon={getIcon()}
      maxWidth="2xl"
      actions={
        <BaseModalActions align="between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Esta acción afectará {selectedCount} producto
              {selectedCount !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <BaseModalButton
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </BaseModalButton>

            <BaseModalButton
              variant="primary"
              onClick={handleSubmit}
              disabled={!isValid() || isLoading}
              loading={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Aplicando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Aplicar Cambios
                </>
              )}
            </BaseModalButton>
          </div>
        </BaseModalActions>
      }
    >
      <div className="space-y-6">
        {/* Operation Type Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Tipo de Operación
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setOperationType("updateCategory")}
              className={cn(
                "flex items-center gap-2 p-3 rounded-lg border-2 transition-all",
                operationType === "updateCategory"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              )}
            >
              <Tag className="w-4 h-4" />
              <span className="font-medium">Categoría</span>
            </button>

            <button
              onClick={() => setOperationType("updateSupplier")}
              className={cn(
                "flex items-center gap-2 p-3 rounded-lg border-2 transition-all",
                operationType === "updateSupplier"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              )}
            >
              <Package className="w-4 h-4" />
              <span className="font-medium">Proveedor</span>
            </button>

            <button
              onClick={() => setOperationType("updatePrice")}
              className={cn(
                "flex items-center gap-2 p-3 rounded-lg border-2 transition-all",
                operationType === "updatePrice"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              )}
            >
              <DollarSign className="w-4 h-4" />
              <span className="font-medium">Precio</span>
            </button>

            <button
              onClick={() => setOperationType("updateCost")}
              className={cn(
                "flex items-center gap-2 p-3 rounded-lg border-2 transition-all",
                operationType === "updateCost"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              )}
            >
              <DollarSign className="w-4 h-4" />
              <span className="font-medium">Costo</span>
            </button>
          </div>
        </div>

        {/* Operation-specific fields */}
        {operationType === "updateCategory" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nueva Categoría *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Todos los productos seleccionados cambiarán a esta categoría
            </p>
          </div>
        )}

        {operationType === "updateSupplier" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nuevo Proveedor *
            </label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecciona un proveedor</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Todos los productos seleccionados cambiarán a este proveedor
            </p>
          </div>
        )}

        {(operationType === "updatePrice" || operationType === "updateCost") && (
          <div className="space-y-4">
            {/* Adjustment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Ajuste
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setAdjustmentType("percentage")}
                  className={cn(
                    "flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all",
                    adjustmentType === "percentage"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  )}
                >
                  <Percent className="w-4 h-4" />
                  <span className="font-medium">Porcentaje</span>
                </button>

                <button
                  onClick={() => setAdjustmentType("fixed")}
                  className={cn(
                    "flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all",
                    adjustmentType === "fixed"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  )}
                >
                  <Hash className="w-4 h-4" />
                  <span className="font-medium">Cantidad Fija</span>
                </button>
              </div>
            </div>

            {/* Operation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Operación
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setAdjustmentOperation("increase")}
                  className={cn(
                    "flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all",
                    adjustmentOperation === "increase"
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  )}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">Aumentar</span>
                </button>

                <button
                  onClick={() => setAdjustmentOperation("decrease")}
                  className={cn(
                    "flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all",
                    adjustmentOperation === "decrease"
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  )}
                >
                  <TrendingDown className="w-4 h-4" />
                  <span className="font-medium">Disminuir</span>
                </button>
              </div>
            </div>

            {/* Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Valor {adjustmentType === "percentage" ? "(%)" : "($)"}
              </label>
              <input
                type="number"
                min="0"
                step={adjustmentType === "percentage" ? "1" : "0.01"}
                value={adjustmentValue}
                onChange={(e) => setAdjustmentValue(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={adjustmentType === "percentage" ? "10" : "5.00"}
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {adjustmentType === "percentage" ? (
                  <>
                    {adjustmentOperation === "increase" ? "Aumentar" : "Disminuir"} el{" "}
                    {operationType === "updatePrice" ? "precio" : "costo"} en{" "}
                    <span className="font-semibold">{adjustmentValue}%</span>
                  </>
                ) : (
                  <>
                    {adjustmentOperation === "increase" ? "Aumentar" : "Disminuir"} el{" "}
                    {operationType === "updatePrice" ? "precio" : "costo"} en{" "}
                    <span className="font-semibold">${adjustmentValue.toFixed(2)}</span>
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Warning */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                Advertencia
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Esta operación se aplicará a <strong>{selectedCount}</strong> productos
                y no se puede deshacer. Asegúrate de revisar tu selección antes de
                continuar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default BulkActionsModal;
