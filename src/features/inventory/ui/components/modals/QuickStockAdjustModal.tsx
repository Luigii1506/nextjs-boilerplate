/**
 * 📦 QUICK STOCK ADJUSTMENT MODAL
 * ================================
 *
 * Modal hermoso y simple para ajustar stock de productos
 * Entrada, Salida y Ajuste Manual
 */

"use client";

import { useState, useEffect } from "react";
import {
  BaseModal,
  BaseModalActions,
  BaseModalButton,
} from "@/shared/ui/components/BaseModal";
import { Package, Plus, Minus, Edit3 } from "lucide-react";
import type { ProductWithRelations } from "../../../types";

type AdjustmentType = "IN" | "OUT" | "ADJUSTMENT";

interface QuickStockAdjustModalProps {
  product: ProductWithRelations | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    productId: string;
    type: AdjustmentType;
    quantity: number;
    reason: string;
  }) => Promise<void>;
  isLoading?: boolean;
  defaultType?: AdjustmentType;
}

export function QuickStockAdjustModal({
  product,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  defaultType = "IN",
}: QuickStockAdjustModalProps) {
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>(defaultType);
  const [quantity, setQuantity] = useState<string>("1");
  const [reason, setReason] = useState("");

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setAdjustmentType(defaultType);
      setQuantity("1");
      setReason("");
    }
  }, [isOpen, defaultType]);

  if (!product) return null;

  const handleSubmit = async () => {
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) return;

    await onSubmit({
      productId: product.id,
      type: adjustmentType,
      quantity: qty,
      reason: reason || getDefaultReason(),
    });
  };

  const getDefaultReason = () => {
    switch (adjustmentType) {
      case "IN":
        return "Entrada de stock";
      case "OUT":
        return "Salida de stock";
      case "ADJUSTMENT":
        return "Ajuste de inventario";
    }
  };

  const typeConfig = {
    IN: {
      label: "Entrada de Stock",
      icon: Plus,
      color: "green",
      description: "Agregar unidades al inventario",
    },
    OUT: {
      label: "Salida de Stock",
      icon: Minus,
      color: "red",
      description: "Retirar unidades del inventario",
    },
    ADJUSTMENT: {
      label: "Ajuste Manual",
      icon: Edit3,
      color: "purple",
      description: "Corregir stock manualmente",
    },
  };

  const currentConfig = typeConfig[adjustmentType];
  const Icon = currentConfig.icon;

  // Calcular nuevo stock
  const currentStock = product.stock;
  const qtyNum = parseInt(quantity) || 0;
  let newStock = currentStock;
  if (adjustmentType === "IN") {
    newStock = currentStock + qtyNum;
  } else if (adjustmentType === "OUT") {
    newStock = Math.max(0, currentStock - qtyNum);
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Ajustar Stock: ${product.name}`}
      description={product.sku}
      icon={<Package className="w-6 h-6 text-white" />}
      maxWidth="lg"
      isLoading={isLoading}
      actions={
        <BaseModalActions align="right">
          <BaseModalButton variant="secondary" onClick={onClose}>
            Cancelar
          </BaseModalButton>
          <BaseModalButton
            variant="primary"
            onClick={handleSubmit}
            loading={isLoading}
            disabled={!quantity || parseInt(quantity) <= 0}
          >
            Aplicar Cambio
          </BaseModalButton>
        </BaseModalActions>
      }
    >
      <div className="space-y-6">
        {/* Tipo de Ajuste */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Tipo de Movimiento
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(Object.keys(typeConfig) as AdjustmentType[]).map((type) => {
              const config = typeConfig[type];
              const TypeIcon = config.icon;
              const isActive = adjustmentType === type;

              return (
                <button
                  key={type}
                  onClick={() => setAdjustmentType(type)}
                  className={`
                    p-4 rounded-lg border-2 transition-all
                    ${
                      isActive
                        ? config.color === "green"
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                          : config.color === "red"
                          ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                          : "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }
                  `}
                >
                  <TypeIcon
                    className={`w-6 h-6 mx-auto mb-2 ${
                      isActive
                        ? config.color === "green"
                          ? "text-green-600 dark:text-green-400"
                          : config.color === "red"
                          ? "text-red-600 dark:text-red-400"
                          : "text-purple-600 dark:text-purple-400"
                        : "text-gray-400"
                    }`}
                  />
                  <p
                    className={`text-xs font-medium text-center ${
                      isActive
                        ? "text-gray-900 dark:text-gray-100"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {config.label}
                  </p>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {currentConfig.description}
          </p>
        </div>

        {/* Stock Actual */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Stock Actual
            </span>
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {currentStock}
            </span>
          </div>
        </div>

        {/* Cantidad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cantidad
          </label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full px-4 py-3 text-center text-2xl font-bold border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0"
            autoFocus
          />
        </div>

        {/* Nuevo Stock Preview */}
        {quantity && parseInt(quantity) > 0 && (
          <div
            className={`rounded-lg p-4 ${
              adjustmentType === "IN"
                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                : adjustmentType === "OUT"
                ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                : "bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Nuevo Stock
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400">
                  {currentStock}
                </span>
                <Icon className="w-4 h-4 text-gray-400" />
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {newStock}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Razón (Opcional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Razón (Opcional)
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={getDefaultReason()}
          />
        </div>
      </div>
    </BaseModal>
  );
}
