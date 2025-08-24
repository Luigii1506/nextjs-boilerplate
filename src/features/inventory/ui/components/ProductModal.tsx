/**
 * 📦 PRODUCT MODAL COMPONENT
 * =========================
 *
 * Modal completo para crear/editar productos con validaciones
 * Diseñado con dark mode, animaciones y UX fluida
 *
 * Created: 2025-01-18 - Product Management UI
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  Package,
  DollarSign,
  Warehouse,
  Tag,
  Image as ImageIcon,
  Loader2,
  AlertTriangle,
  Check,
  Plus,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { useInventoryContext } from "../../context";
import { useCreateProductModal, useUpdateProductModal } from "../../hooks";
import { createProductSchema } from "../../schemas";
import type { CreateProductInput } from "../../types";

// 🎯 Form data type
type ProductFormData = CreateProductInput;

// 🏷️ Mock data imports (TODO: Replace with real data)
const MOCK_CATEGORIES = [
  {
    id: "cat-1",
    name: "Electrónicos",
    description: "Dispositivos y accesorios electrónicos",
    color: "#3B82F6",
    icon: "Smartphone",
  },
  {
    id: "cat-2",
    name: "Ropa",
    description: "Prendas de vestir y accesorios",
    color: "#EC4899",
    icon: "Shirt",
  },
  {
    id: "cat-3",
    name: "Hogar",
    description: "Artículos para el hogar",
    color: "#10B981",
    icon: "Home",
  },
];

const MOCK_SUPPLIERS = [
  {
    id: "sup-1",
    name: "TechCorp SA",
    contactPerson: "Juan Pérez",
    rating: 4.5,
  },
  {
    id: "sup-2",
    name: "Textiles del Norte",
    contactPerson: "María González",
    rating: 4.2,
  },
];

const UNITS = [
  { value: "piece", label: "Pieza" },
  { value: "kg", label: "Kilogramo" },
  { value: "g", label: "Gramo" },
  { value: "l", label: "Litro" },
  { value: "ml", label: "Mililitro" },
  { value: "m", label: "Metro" },
  { value: "cm", label: "Centímetro" },
  { value: "box", label: "Caja" },
  { value: "pack", label: "Paquete" },
];

/**
 * 🎯 ProductModal Component
 */
export const ProductModal: React.FC = () => {
  const {
    isProductModalOpen,
    setIsProductModalOpen,
    editingProduct,
    isEditMode,
    closeEditModal,
  } = useInventoryContext();

  // 🚀 Product hooks - create or update based on mode
  const createProduct = useCreateProductModal();
  const updateProduct = useUpdateProductModal();

  const {
    handleCreateProduct,
    handleUpdateProduct,
    isLoading: isSubmitting,
    error: submitError,
    reset: resetMutation,
  } = isEditMode
    ? {
        handleCreateProduct: () => Promise.resolve(false),
        handleUpdateProduct: updateProduct.handleUpdateProduct,
        isLoading: updateProduct.isLoading,
        error: updateProduct.error,
        reset: updateProduct.reset,
      }
    : {
        handleCreateProduct: createProduct.handleCreateProduct,
        handleUpdateProduct: () => Promise.resolve(false),
        isLoading: createProduct.isLoading,
        error: createProduct.error,
        reset: createProduct.reset,
      };
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [currentTag, setCurrentTag] = useState("");

  // 🎛️ Form configuration with dynamic default values
  const getDefaultValues = useCallback((): ProductFormData => {
    if (isEditMode && editingProduct) {
      return {
        sku: editingProduct.sku,
        name: editingProduct.name,
        description: editingProduct.description ?? "",
        categoryId: editingProduct.categoryId,
        price: editingProduct.price,
        cost: editingProduct.cost,
        stock: editingProduct.stock,
        minStock: editingProduct.minStock,
        maxStock: editingProduct.maxStock,
        unit: editingProduct.unit,
        barcode: editingProduct.barcode,
        images: editingProduct.images ?? [],
        supplierId: editingProduct.supplierId,
        tags: editingProduct.tags ?? [],
        metadata: editingProduct.metadata ?? {},
      };
    }

    // Default values for create mode
    return {
      sku: "",
      name: "",
      description: "",
      categoryId: "",
      price: 0,
      cost: 0,
      stock: 0,
      minStock: 0,
      maxStock: null,
      unit: "piece",
      barcode: null,
      images: [],
      supplierId: null,
      tags: [],
      metadata: {},
    };
  }, [isEditMode, editingProduct]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm<ProductFormData>({
    resolver: zodResolver(createProductSchema),
    defaultValues: getDefaultValues(),
    mode: "onChange",
  });

  const watchedImages = watch("images") || [];
  const watchedTags = watch("tags") || [];
  const watchedPrice = watch("price");
  const watchedCost = watch("cost");

  // 🔄 Reset form when editing product changes
  useEffect(() => {
    if (isProductModalOpen) {
      reset(getDefaultValues());
      setCurrentImageUrl("");
      setCurrentTag("");
    }
  }, [isProductModalOpen, isEditMode, editingProduct, reset, getDefaultValues]);

  // 🎯 Close modal handler
  const handleClose = () => {
    if (
      isDirty &&
      !window.confirm(
        "¿Estás seguro de que quieres cerrar? Se perderán los cambios."
      )
    ) {
      return;
    }

    if (isEditMode) {
      closeEditModal();
    } else {
      setIsProductModalOpen(false);
    }

    reset();
    resetMutation();
    setCurrentImageUrl("");
    setCurrentTag("");
  };

  // 🎯 Submit handler
  const onSubmit = async (data: ProductFormData) => {
    let success = false;

    if (isEditMode && editingProduct) {
      success = await handleUpdateProduct(editingProduct.id, data);
    } else {
      success = await handleCreateProduct(data);
    }

    if (success) {
      // Success - close modal and reset form
      if (isEditMode) {
        closeEditModal();
      } else {
        setIsProductModalOpen(false);
      }
      reset();
      setCurrentImageUrl("");
      setCurrentTag("");
    }
    // Error handling is done by the hooks (notifications, etc.)
  };

  // 🖼️ Image management
  const addImage = () => {
    if (currentImageUrl.trim() && watchedImages.length < 10) {
      const newImages = [...watchedImages, currentImageUrl.trim()];
      setValue("images", newImages, { shouldValidate: true });
      setCurrentImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    const newImages = watchedImages.filter((_, i) => i !== index);
    setValue("images", newImages, { shouldValidate: true });
  };

  // 🏷️ Tag management
  const addTag = () => {
    if (
      currentTag.trim() &&
      watchedTags.length < 20 &&
      !watchedTags.includes(currentTag.trim())
    ) {
      const newTags = [...watchedTags, currentTag.trim()];
      setValue("tags", newTags, { shouldValidate: true });
      setCurrentTag("");
    }
  };

  const removeTag = (index: number) => {
    const newTags = watchedTags.filter((_, i) => i !== index);
    setValue("tags", newTags, { shouldValidate: true });
  };

  // 🎨 Auto-generate SKU from name (only in create mode)
  const productName = watch("name");
  const currentSku = watch("sku");

  useEffect(() => {
    if (!isEditMode && productName && !currentSku) {
      const sku = productName
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .substring(0, 10);
      if (sku) {
        setValue("sku", `${sku}-${Date.now().toString().slice(-4)}`, {
          shouldValidate: true,
        });
      }
    }
  }, [productName, currentSku, setValue, isEditMode]);

  // 🚫 Don't render if modal is closed
  if (!isProductModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 🌫️ Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity duration-300 animate-fadeIn"
        onClick={handleClose}
      />

      {/* 📦 Modal Container */}
      <div className="flex min-h-full items-end sm:items-center justify-center p-4">
        <div
          className={cn(
            "relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl",
            "w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh]",
            "transform transition-all duration-300 animate-slideInUp",
            "flex flex-col" // 🎯 Flexbox container
          )}
        >
          {/* 📋 Header - FIXED */}
          <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {isEditMode ? "Editar Producto" : "Agregar Producto"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEditMode
                    ? `Modifica la información de "${editingProduct?.name}"`
                    : "Completa la información del nuevo producto"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
                "hover:bg-gray-100 dark:hover:bg-gray-700",
                "transition-colors duration-200"
              )}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 📝 Form Content - SCROLLABLE */}
          <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-thin">
            <form
              id="product-form"
              onSubmit={handleSubmit(onSubmit)}
              className="h-full"
            >
              <div className="p-6 pb-8 space-y-8">
                {/* 🚨 Error Alert */}
                {submitError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <p className="text-sm text-red-700 dark:text-red-400">
                        {submitError}
                      </p>
                    </div>
                  </div>
                )}

                {/* 📦 Basic Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-500" />
                    Información Básica
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* SKU */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        SKU *
                      </label>
                      <input
                        {...register("sku")}
                        className={cn(
                          "w-full px-4 py-3 rounded-lg border transition-colors duration-200",
                          "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
                          "placeholder-gray-500 dark:placeholder-gray-400",
                          errors.sku
                            ? "border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500/20"
                            : "border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20",
                          "focus:outline-none focus:ring-4"
                        )}
                        placeholder="Ej: IPHONE-14-2024"
                        autoComplete="off"
                      />
                      {errors.sku && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                          {errors.sku.message}
                        </p>
                      )}
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nombre del Producto *
                      </label>
                      <input
                        {...register("name")}
                        className={cn(
                          "w-full px-4 py-3 rounded-lg border transition-colors duration-200",
                          "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
                          "placeholder-gray-500 dark:placeholder-gray-400",
                          errors.name
                            ? "border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500/20"
                            : "border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20",
                          "focus:outline-none focus:ring-4"
                        )}
                        placeholder="Ej: iPhone 14 Pro Max"
                        autoComplete="off"
                      />
                      {errors.name && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Categoría *
                      </label>
                      <select
                        {...register("categoryId")}
                        className={cn(
                          "w-full px-4 py-3 rounded-lg border transition-colors duration-200",
                          "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
                          errors.categoryId
                            ? "border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500/20"
                            : "border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20",
                          "focus:outline-none focus:ring-4"
                        )}
                      >
                        <option value="">Seleccionar categoría</option>
                        {MOCK_CATEGORIES.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {errors.categoryId && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                          {errors.categoryId.message}
                        </p>
                      )}
                    </div>

                    {/* Supplier */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Proveedor
                      </label>
                      <select
                        {...register("supplierId")}
                        className={cn(
                          "w-full px-4 py-3 rounded-lg border transition-colors duration-200",
                          "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
                          "border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20",
                          "focus:outline-none focus:ring-4"
                        )}
                      >
                        <option value="">Sin proveedor</option>
                        {MOCK_SUPPLIERS.map((supplier) => (
                          <option key={supplier.id} value={supplier.id}>
                            {supplier.name} - {supplier.contactPerson}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Descripción
                    </label>
                    <textarea
                      {...register("description")}
                      rows={4}
                      className={cn(
                        "w-full px-4 py-3 rounded-lg border transition-colors duration-200 resize-none",
                        "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
                        "placeholder-gray-500 dark:placeholder-gray-400",
                        errors.description
                          ? "border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500/20"
                          : "border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20",
                        "focus:outline-none focus:ring-4"
                      )}
                      placeholder="Descripción detallada del producto..."
                    />
                    {errors.description && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                        {errors.description.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* 💰 Pricing */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    Precios
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Cost */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Costo *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 dark:text-gray-400">
                            $
                          </span>
                        </div>
                        <input
                          {...register("cost", { valueAsNumber: true })}
                          type="number"
                          step="0.01"
                          min="0"
                          className={cn(
                            "w-full pl-8 pr-4 py-3 rounded-lg border transition-colors duration-200",
                            "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
                            "placeholder-gray-500 dark:placeholder-gray-400",
                            errors.cost
                              ? "border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500/20"
                              : "border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20",
                            "focus:outline-none focus:ring-4"
                          )}
                          placeholder="0.00"
                        />
                      </div>
                      {errors.cost && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                          {errors.cost.message}
                        </p>
                      )}
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Precio de Venta *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 dark:text-gray-400">
                            $
                          </span>
                        </div>
                        <input
                          {...register("price", { valueAsNumber: true })}
                          type="number"
                          step="0.01"
                          min="0"
                          className={cn(
                            "w-full pl-8 pr-4 py-3 rounded-lg border transition-colors duration-200",
                            "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
                            "placeholder-gray-500 dark:placeholder-gray-400",
                            errors.price
                              ? "border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500/20"
                              : "border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20",
                            "focus:outline-none focus:ring-4"
                          )}
                          placeholder="0.00"
                        />
                      </div>
                      {errors.price && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                          {errors.price.message}
                        </p>
                      )}
                      {/* Profit margin indicator */}
                      {watchedPrice > 0 && watchedCost > 0 && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500 dark:text-gray-400">
                              Margen:
                            </span>
                            <span
                              className={cn(
                                "font-medium",
                                watchedPrice >= watchedCost
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                              )}
                            >
                              ${(watchedPrice - watchedCost).toFixed(2)} (
                              {(
                                ((watchedPrice - watchedCost) / watchedPrice) *
                                100
                              ).toFixed(1)}
                              %)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 📦 Inventory */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Warehouse className="w-5 h-5 text-purple-500" />
                    Inventario
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Stock */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Stock Inicial
                      </label>
                      <input
                        {...register("stock", { valueAsNumber: true })}
                        type="number"
                        min="0"
                        step="1"
                        className={cn(
                          "w-full px-4 py-3 rounded-lg border transition-colors duration-200",
                          "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
                          "placeholder-gray-500 dark:placeholder-gray-400",
                          errors.stock
                            ? "border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500/20"
                            : "border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20",
                          "focus:outline-none focus:ring-4"
                        )}
                        placeholder="0"
                      />
                      {errors.stock && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                          {errors.stock.message}
                        </p>
                      )}
                    </div>

                    {/* Min Stock */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Stock Mínimo
                      </label>
                      <input
                        {...register("minStock", { valueAsNumber: true })}
                        type="number"
                        min="0"
                        step="1"
                        className={cn(
                          "w-full px-4 py-3 rounded-lg border transition-colors duration-200",
                          "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
                          "placeholder-gray-500 dark:placeholder-gray-400",
                          errors.minStock
                            ? "border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500/20"
                            : "border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20",
                          "focus:outline-none focus:ring-4"
                        )}
                        placeholder="0"
                      />
                      {errors.minStock && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                          {errors.minStock.message}
                        </p>
                      )}
                    </div>

                    {/* Max Stock */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Stock Máximo
                      </label>
                      <input
                        {...register("maxStock", {
                          valueAsNumber: true,
                          setValueAs: (value) =>
                            value === "" ? null : Number(value),
                        })}
                        type="number"
                        min="0"
                        step="1"
                        className={cn(
                          "w-full px-4 py-3 rounded-lg border transition-colors duration-200",
                          "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
                          "placeholder-gray-500 dark:placeholder-gray-400",
                          errors.maxStock
                            ? "border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500/20"
                            : "border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20",
                          "focus:outline-none focus:ring-4"
                        )}
                        placeholder="Opcional"
                      />
                      {errors.maxStock && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                          {errors.maxStock.message}
                        </p>
                      )}
                    </div>

                    {/* Unit */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Unidad
                      </label>
                      <select
                        {...register("unit")}
                        className={cn(
                          "w-full px-4 py-3 rounded-lg border transition-colors duration-200",
                          "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
                          errors.unit
                            ? "border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500/20"
                            : "border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20",
                          "focus:outline-none focus:ring-4"
                        )}
                      >
                        {UNITS.map((unit) => (
                          <option key={unit.value} value={unit.value}>
                            {unit.label}
                          </option>
                        ))}
                      </select>
                      {errors.unit && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                          {errors.unit.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Barcode */}
                  <div className="max-w-md">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Código de Barras
                    </label>
                    <input
                      {...register("barcode")}
                      className={cn(
                        "w-full px-4 py-3 rounded-lg border transition-colors duration-200",
                        "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
                        "placeholder-gray-500 dark:placeholder-gray-400",
                        errors.barcode
                          ? "border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500/20"
                          : "border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20",
                        "focus:outline-none focus:ring-4"
                      )}
                      placeholder="Ej: 1234567890123"
                      autoComplete="off"
                    />
                    {errors.barcode && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                        {errors.barcode.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* 🖼️ Images */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-indigo-500" />
                    Imágenes ({watchedImages.length}/10)
                  </h3>

                  {/* Add Image */}
                  <div className="flex gap-3">
                    <input
                      value={currentImageUrl}
                      onChange={(e) => setCurrentImageUrl(e.target.value)}
                      className={cn(
                        "flex-1 px-4 py-3 rounded-lg border transition-colors duration-200",
                        "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
                        "placeholder-gray-500 dark:placeholder-gray-400",
                        "border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20",
                        "focus:outline-none focus:ring-4"
                      )}
                      placeholder="URL de la imagen"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addImage();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={addImage}
                      disabled={
                        !currentImageUrl.trim() || watchedImages.length >= 10
                      }
                      className={cn(
                        "px-4 py-3 rounded-lg font-medium transition-colors duration-200",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700",
                        "text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                      )}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Image List */}
                  {watchedImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {watchedImages.map((url, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden">
                            <img
                              src={url}
                              alt={`Imagen ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik03MCA5MEwxMzAgNTBMMTcwIDEwTDE3MDE2MEgzMFY5MEg3MFoiIGZpbGw9IiNEMUQ1REIiLz4KPC9zdmc+";
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className={cn(
                              "absolute -top-2 -right-2 w-6 h-6 rounded-full",
                              "bg-red-500 hover:bg-red-600 text-white",
                              "flex items-center justify-center transition-colors duration-200",
                              "opacity-0 group-hover:opacity-100 focus:opacity-100",
                              "focus:outline-none focus:ring-2 focus:ring-red-500/20"
                            )}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 🏷️ Tags */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-yellow-500" />
                    Etiquetas ({watchedTags.length}/20)
                  </h3>

                  {/* Add Tag */}
                  <div className="flex gap-3">
                    <input
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      className={cn(
                        "flex-1 px-4 py-3 rounded-lg border transition-colors duration-200",
                        "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
                        "placeholder-gray-500 dark:placeholder-gray-400",
                        "border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20",
                        "focus:outline-none focus:ring-4"
                      )}
                      placeholder="Agregar etiqueta"
                      maxLength={30}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      disabled={
                        !currentTag.trim() ||
                        watchedTags.length >= 20 ||
                        watchedTags.includes(currentTag.trim())
                      }
                      className={cn(
                        "px-4 py-3 rounded-lg font-medium transition-colors duration-200",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700",
                        "text-white focus:outline-none focus:ring-4 focus:ring-yellow-500/20"
                      )}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Tag List */}
                  {watchedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {watchedTags.map((tag, index) => (
                        <span
                          key={index}
                          className={cn(
                            "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm",
                            "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400"
                          )}
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="w-4 h-4 rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-800 flex items-center justify-center"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* 🎯 Footer - FIXED */}
          <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800 rounded-b-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Validation Summary */}
                {Object.keys(errors).length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>
                      {Object.keys(errors).length} error(es) en el formulario
                    </span>
                  </div>
                )}
                {isValid && isDirty && (
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4" />
                    <span>Formulario válido</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 sm:ml-auto">
                {/* Cancel */}
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className={cn(
                    "px-6 py-3 rounded-lg font-medium transition-colors duration-200",
                    "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600",
                    "text-gray-700 dark:text-gray-300",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "focus:outline-none focus:ring-4 focus:ring-gray-500/20"
                  )}
                >
                  Cancelar
                </button>

                {/* Submit */}
                <button
                  type="submit"
                  form="product-form"
                  disabled={!isValid || isSubmitting}
                  className={cn(
                    "px-6 py-3 rounded-lg font-medium transition-colors duration-200",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700",
                    "text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20",
                    "flex items-center gap-2"
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isEditMode ? "Actualizando..." : "Creando..."}
                    </>
                  ) : (
                    <>
                      <Package className="w-4 h-4" />
                      {isEditMode ? "Actualizar Producto" : "Crear Producto"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
