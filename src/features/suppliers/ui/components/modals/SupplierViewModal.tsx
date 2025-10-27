/**
 * Native for Suppliers Module - Uses SupplierContext
 *
 * 👁️ SUPPLIER VIEW MODAL COMPONENT
 * ================================
 *
 * Modal completo para visualizar todos los detalles de un proveedor
 * Diseño hermoso con dark mode, animaciones suaves y layout responsive
 *
 * Created: 2025-01-18 - Supplier View Functionality
 */

"use client";

import React, { useMemo } from "react";
import {
  X,
  Truck,
  Package,
  MapPin,
  Star,
  Mail,
  Phone,
  Globe,
  FileText,
  Calendar,
  Eye,
  EyeOff,
  Hash,
  Clock,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { useSupplierContext } from "../../../context";
import type { SupplierWithRelations } from "@/shared/types/supplier";

// 🧮 Utility function to compute enhanced supplier properties
function computeSupplierProps(supplier: SupplierWithRelations) {
  const hasProducts = (supplier._count?.products || 0) > 0;
  const totalProducts = supplier._count?.products || 0;

  // Rating display
  const ratingStars = supplier.rating
    ? Array.from({ length: 5 }, (_, i) => i + 1)
    : [];

  // Payment terms category
  let paymentCategory = "Estándar";
  if (supplier.paymentTerms <= 15) {
    paymentCategory = "Rápido";
  } else if (supplier.paymentTerms >= 60) {
    paymentCategory = "Extendido";
  }

  // Address completeness
  const hasCompleteAddress = !!(
    supplier.addressLine1 &&
    supplier.city &&
    supplier.state &&
    supplier.postalCode
  );

  return {
    hasProducts,
    totalProducts,
    ratingStars,
    paymentCategory,
    hasCompleteAddress,
    isEmpty: !hasProducts,
  };
}

/**
 * 🎯 SupplierViewModal Component
 */
const SupplierViewModal: React.FC = () => {
  const { modals, closeViewModal } = useSupplierContext();

  // 🧮 Computed properties
  const supplierData = useMemo(() => {
    if (!modals.view.data) return null;
    return {
      ...modals.view.data,
      computed: computeSupplierProps(modals.view.data),
    };
  }, [modals.view.data]);

  // 🎯 Close handler
  const handleClose = () => {
    closeViewModal();
  };

  // 🛡️ Early returns
  if (!modals.view.isOpen || !supplierData) {
    return null;
  }

  const { computed } = supplierData;

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
            "relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl",
            "transform transition-all duration-300 animate-slideInUp sm:animate-scaleIn",
            "max-h-[90vh] flex flex-col overflow-hidden"
          )}
        >
          {/* 🚛 Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {supplierData.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Detalles del proveedor
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 📋 Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-thin">
            <div className="p-0 md:p-6 space-y-8">
              {/* 📊 Stats Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Products Count */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-100 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Productos
                      </p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {computed.totalProducts}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Terms */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                      <Hash className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Términos
                      </p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {supplierData.paymentTerms}d
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-yellow-100 dark:border-yellow-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg flex items-center justify-center">
                      <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Rating
                      </p>
                      <div className="flex items-center gap-1">
                        {supplierData.rating ? (
                          <>
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                              {supplierData.rating}
                            </span>
                            <div className="flex ml-1">
                              {computed.ratingStars.map((star) => (
                                <Star
                                  key={star}
                                  className={cn(
                                    "w-4 h-4",
                                    star <= (supplierData.rating || 0)
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300 dark:text-gray-600"
                                  )}
                                />
                              ))}
                            </div>
                          </>
                        ) : (
                          <span className="text-sm text-gray-500">
                            Sin rating
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div
                  className={cn(
                    "rounded-xl p-4 border",
                    supplierData.isActive
                      ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-100 dark:border-green-800"
                      : "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-100 dark:border-red-800"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        supplierData.isActive
                          ? "bg-green-100 dark:bg-green-900/40"
                          : "bg-red-100 dark:bg-red-900/40"
                      )}
                    >
                      {supplierData.isActive ? (
                        <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <EyeOff className="w-5 h-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Estado
                      </p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {supplierData.isActive ? "Activo" : "Inactivo"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 📋 Basic Information */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-orange-500" />
                  Información de Contacto
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nombre
                      </label>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {supplierData.name}
                      </p>
                    </div>

                    {supplierData.contactPerson && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Persona de Contacto
                        </label>
                        <p className="text-gray-600 dark:text-gray-400">
                          {supplierData.contactPerson}
                        </p>
                      </div>
                    )}

                    {supplierData.email && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Email
                        </label>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-blue-500" />
                          <a
                            href={`mailto:${supplierData.email}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {supplierData.email}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {supplierData.phone && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Teléfono
                        </label>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-green-500" />
                          <a
                            href={`tel:${supplierData.phone}`}
                            className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                          >
                            {supplierData.phone}
                          </a>
                        </div>
                      </div>
                    )}

                    {supplierData.website && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Sitio Web
                        </label>
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-purple-500" />
                          <a
                            href={supplierData.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 dark:text-purple-400 hover:underline"
                          >
                            {supplierData.website}
                          </a>
                        </div>
                      </div>
                    )}

                    {supplierData.taxId && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          RFC/NIT
                        </label>
                        <p className="text-gray-600 dark:text-gray-400 font-mono">
                          {supplierData.taxId}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 💰 Commercial Terms */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Términos Comerciales
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Términos de Pago
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {supplierData.paymentTerms}
                      </span>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          días
                        </span>
                        <div className="text-sm text-gray-500">
                          <span
                            className={cn(
                              "px-2 py-1 rounded-full text-xs",
                              computed.paymentCategory === "Rápido" &&
                                "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
                              computed.paymentCategory === "Estándar" &&
                                "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
                              computed.paymentCategory === "Extendido" &&
                                "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
                            )}
                          >
                            {computed.paymentCategory}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {supplierData.rating && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Calificación
                      </label>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {supplierData.rating}
                        </span>
                        <div className="flex">
                          {computed.ratingStars.map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                "w-5 h-5",
                                star <= (supplierData.rating || 0)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300 dark:text-gray-600"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 📍 Address */}
              {computed.hasCompleteAddress && (
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-500" />
                    Dirección
                  </h3>

                  <div className="space-y-2 text-gray-600 dark:text-gray-400">
                    {supplierData.addressLine1 && (
                      <p>{supplierData.addressLine1}</p>
                    )}
                    {supplierData.addressLine2 && (
                      <p>{supplierData.addressLine2}</p>
                    )}
                    <p>
                      {[supplierData.city, supplierData.state]
                        .filter(Boolean)
                        .join(", ")}
                      {supplierData.postalCode && ` ${supplierData.postalCode}`}
                    </p>
                    {supplierData.country && (
                      <p className="font-medium">
                        {getCountryName(supplierData.country)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* 📝 Notes */}
              {supplierData.notes && (
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-500" />
                    Notas Adicionales
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {supplierData.notes}
                  </p>
                </div>
              )}

              {/* ⏰ Timestamps */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-500" />
                  Historial
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Creado
                    </label>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <p className="text-gray-600 dark:text-gray-400">
                        {new Intl.DateTimeFormat("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(supplierData.createdAt))}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Última modificación
                    </label>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <p className="text-gray-600 dark:text-gray-400">
                        {new Intl.DateTimeFormat("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(supplierData.updatedAt))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 🚨 Empty State Warning */}
              {computed.isEmpty && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-amber-800 dark:text-amber-200">
                        Proveedor sin productos
                      </h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Este proveedor no tiene productos asociados aún.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get country name
function getCountryName(code: string): string {
  const countries: Record<string, string> = {
    MX: "México",
    US: "Estados Unidos",
    CA: "Canadá",
    ES: "España",
    CO: "Colombia",
    AR: "Argentina",
    PE: "Perú",
    CL: "Chile",
  };
  return countries[code] || code;
}

export default SupplierViewModal;
