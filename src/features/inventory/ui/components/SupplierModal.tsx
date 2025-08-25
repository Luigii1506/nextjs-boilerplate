/**
 * 🚛 SUPPLIER MODAL COMPONENT
 * ===========================
 *
 * Modal hermoso para crear/editar proveedores con validación completa
 * Diseño consistente con BaseModal, campos específicos para suppliers
 *
 * Created: 2025-01-18 - Supplier Management Modal
 */

"use client";

import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Check, Truck, MapPin, Star } from "lucide-react";
import { cn } from "@/shared/utils";
import { useInventoryContext } from "../../context";
import { useCreateSupplierModal, useUpdateSupplierModal } from "../../hooks";
import {
  BaseModal,
  BaseModalActions,
  BaseModalButton,
} from "@/shared/ui/components";
import { createSupplierSchema, updateSupplierSchema } from "../../schemas";
import type { CreateSupplierInput, SupplierWithRelations } from "../../types";

// 🎯 Form Data Type
interface SupplierFormData extends CreateSupplierInput {
  rating: number | null;
}

/**
 * 🎯 SupplierModal Component
 */
export const SupplierModal: React.FC = () => {
  const {
    isSupplierModalOpen,
    setIsSupplierModalOpen,
    editingSupplier,
    setEditingSupplier,
    isEditSupplierMode,
  } = useInventoryContext();

  // 🚀 Mutation hooks
  const {
    handleCreateSupplier,
    isLoading: isCreating,
    error: createError,
    reset: resetCreate,
  } = useCreateSupplierModal();

  const {
    handleUpdateSupplier,
    isLoading: isUpdating,
    error: updateError,
    reset: resetUpdate,
  } = useUpdateSupplierModal();

  // 📝 Form setup
  const schema = isEditSupplierMode
    ? updateSupplierSchema
    : createSupplierSchema;
  const isSubmitting = isCreating || isUpdating;
  const submitError = createError || updateError;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    trigger,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(schema),
    mode: "all",
    defaultValues: getDefaultValues(editingSupplier),
  });

  // 🔄 Form data reactivity
  const watchedRating = watch("rating");

  // 🎯 Get default values for form
  function getDefaultValues(
    supplier?: SupplierWithRelations | null
  ): SupplierFormData {
    if (!supplier) {
      return {
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        website: "",
        taxId: "",
        paymentTerms: 30,
        rating: null,
        notes: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "MX",
      };
    }

    return {
      name: supplier.name,
      contactPerson: supplier.contactPerson ?? "",
      email: supplier.email ?? "",
      phone: supplier.phone ?? "",
      website: supplier.website ?? "",
      taxId: supplier.taxId ?? "",
      paymentTerms: supplier.paymentTerms,
      rating: supplier.rating,
      notes: supplier.notes ?? "",
      addressLine1: supplier.addressLine1 ?? "",
      addressLine2: supplier.addressLine2 ?? "",
      city: supplier.city ?? "",
      state: supplier.state ?? "",
      postalCode: supplier.postalCode ?? "",
      country: supplier.country,
    };
  }

  // 🔄 Reset form when editing supplier changes
  useEffect(() => {
    if (editingSupplier) {
      const defaultValues = getDefaultValues(editingSupplier);
      reset(defaultValues);

      // Trigger validation after reset
      setTimeout(() => {
        trigger();
      }, 100);
    }
  }, [editingSupplier?.id, reset, trigger]);

  // 🎯 Handle form submission
  const onSubmit = async (data: SupplierFormData) => {
    try {
      // Convert empty strings to undefined for optional fields
      const supplierData: CreateSupplierInput = {
        name: data.name,
        contactPerson: data.contactPerson || undefined,
        email: data.email || undefined,
        phone: data.phone || undefined,
        website: data.website || undefined,
        taxId: data.taxId || undefined,
        paymentTerms: data.paymentTerms,
        rating: data.rating || undefined,
        notes: data.notes || undefined,
        addressLine1: data.addressLine1 || undefined,
        addressLine2: data.addressLine2 || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        postalCode: data.postalCode || undefined,
        country: data.country,
      };

      let success: boolean;

      if (isEditSupplierMode && editingSupplier) {
        success = await handleUpdateSupplier(editingSupplier.id, {
          ...supplierData,
          isActive: editingSupplier.isActive,
        });
      } else {
        success = await handleCreateSupplier(supplierData);
      }

      if (success) {
        handleClose();
      }
    } catch (error) {
      console.error("Error submitting supplier:", error);
    }
  };

  // 🎯 Close handler
  const handleClose = () => {
    if (!isSubmitting) {
      setIsSupplierModalOpen(false);
      setEditingSupplier(null);
      reset();
      resetCreate();
      resetUpdate();
    }
  };

  // 🎨 Rating stars component
  const RatingStars = ({ rating }: { rating: number | null }) => {
    const stars = Array.from({ length: 5 }, (_, i) => i + 1);

    return (
      <div className="flex items-center gap-1">
        {stars.map((star) => (
          <Star
            key={star}
            className={cn(
              "w-4 h-4 cursor-pointer transition-colors",
              rating && star <= rating
                ? "text-yellow-400 fill-current"
                : "text-gray-300 dark:text-gray-600"
            )}
            onClick={() =>
              setValue("rating", star, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
          />
        ))}
        {rating && (
          <button
            type="button"
            onClick={() =>
              setValue("rating", null, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            className="ml-2 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Limpiar
          </button>
        )}
      </div>
    );
  };

  return (
    <BaseModal
      isOpen={isSupplierModalOpen}
      onClose={handleClose}
      title={isEditSupplierMode ? "Editar Proveedor" : "Agregar Proveedor"}
      description={
        isEditSupplierMode
          ? `Modifica la información de "${editingSupplier?.name}"`
          : "Completa la información del nuevo proveedor"
      }
      icon={<Truck className="w-5 h-5 text-white" />}
      isDirty={isDirty}
      isLoading={isSubmitting}
      maxWidth="4xl"
      actions={
        <BaseModalActions align="between">
          {/* Validation Summary */}
          <div className="flex items-center gap-4">
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

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <BaseModalButton
              variant="secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </BaseModalButton>

            <BaseModalButton
              variant="primary"
              type="submit"
              disabled={!isValid || isSubmitting}
              loading={isSubmitting}
              onClick={handleSubmit(onSubmit)}
            >
              {isEditSupplierMode ? (
                <>
                  <Truck className="w-4 h-4" />
                  Actualizar Proveedor
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4" />
                  Crear Proveedor
                </>
              )}
            </BaseModalButton>
          </div>
        </BaseModalActions>
      }
    >
      {/* 🚨 Error Alert */}
      {submitError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <p className="text-sm text-red-700 dark:text-red-400">
              {submitError}
            </p>
          </div>
        </div>
      )}

      {/* 📝 Form Content */}
      <form
        id="supplier-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8"
      >
        {/* 📋 Basic Information */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-500" />
            Información Básica
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre del Proveedor *
              </label>
              <input
                {...register("name")}
                type="text"
                className={cn(
                  "w-full px-4 py-3 border rounded-lg transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500",
                  errors.name
                    ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                )}
                placeholder="Ej: Proveedores ABC S.A."
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Contact Person */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Persona de Contacto
              </label>
              <input
                {...register("contactPerson")}
                type="text"
                className={cn(
                  "w-full px-4 py-3 border rounded-lg transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500",
                  errors.contactPerson
                    ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                )}
                placeholder="Ej: Juan Pérez"
              />
              {errors.contactPerson && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.contactPerson.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                className={cn(
                  "w-full px-4 py-3 border rounded-lg transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500",
                  errors.email
                    ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                )}
                placeholder="contacto@proveedor.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Teléfono
              </label>
              <input
                {...register("phone")}
                type="tel"
                className={cn(
                  "w-full px-4 py-3 border rounded-lg transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500",
                  errors.phone
                    ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                )}
                placeholder="+52 55 1234 5678"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sitio Web
              </label>
              <input
                {...register("website")}
                type="url"
                className={cn(
                  "w-full px-4 py-3 border rounded-lg transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500",
                  errors.website
                    ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                )}
                placeholder="https://www.proveedor.com"
              />
              {errors.website && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.website.message}
                </p>
              )}
            </div>

            {/* Tax ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                RFC/NIT
              </label>
              <input
                {...register("taxId")}
                type="text"
                className={cn(
                  "w-full px-4 py-3 border rounded-lg transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500",
                  errors.taxId
                    ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                )}
                placeholder="ABC123456789"
              />
              {errors.taxId && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.taxId.message}
                </p>
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
            {/* Payment Terms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Términos de Pago (días)
              </label>
              <input
                {...register("paymentTerms", { valueAsNumber: true })}
                type="number"
                min="0"
                max="365"
                className={cn(
                  "w-full px-4 py-3 border rounded-lg transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500",
                  errors.paymentTerms
                    ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                )}
                placeholder="30"
              />
              {errors.paymentTerms && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.paymentTerms.message}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Días de crédito otorgados por el proveedor
              </p>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Calificación
              </label>
              <div className="space-y-2">
                <RatingStars rating={watchedRating} />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Califica la calidad del proveedor (1-5 estrellas)
                </p>
              </div>
              {errors.rating && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.rating.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 📍 Address */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-500" />
            Dirección
          </h3>

          <div className="space-y-4">
            {/* Address Lines */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dirección Línea 1
                </label>
                <input
                  {...register("addressLine1")}
                  type="text"
                  className={cn(
                    "w-full px-4 py-3 border rounded-lg transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500",
                    errors.addressLine1
                      ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  )}
                  placeholder="Calle Principal 123"
                />
                {errors.addressLine1 && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.addressLine1.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dirección Línea 2
                </label>
                <input
                  {...register("addressLine2")}
                  type="text"
                  className={cn(
                    "w-full px-4 py-3 border rounded-lg transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500",
                    errors.addressLine2
                      ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  )}
                  placeholder="Colonia, Edificio, Piso (opcional)"
                />
                {errors.addressLine2 && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.addressLine2.message}
                  </p>
                )}
              </div>
            </div>

            {/* City, State, Postal Code */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ciudad
                </label>
                <input
                  {...register("city")}
                  type="text"
                  className={cn(
                    "w-full px-4 py-3 border rounded-lg transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500",
                    errors.city
                      ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  )}
                  placeholder="Ciudad de México"
                />
                {errors.city && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.city.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estado/Provincia
                </label>
                <input
                  {...register("state")}
                  type="text"
                  className={cn(
                    "w-full px-4 py-3 border rounded-lg transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500",
                    errors.state
                      ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  )}
                  placeholder="CDMX"
                />
                {errors.state && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.state.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Código Postal
                </label>
                <input
                  {...register("postalCode")}
                  type="text"
                  className={cn(
                    "w-full px-4 py-3 border rounded-lg transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500",
                    errors.postalCode
                      ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  )}
                  placeholder="01000"
                />
                {errors.postalCode && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.postalCode.message}
                  </p>
                )}
              </div>
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                País
              </label>
              <select
                {...register("country")}
                className={cn(
                  "w-full px-4 py-3 border rounded-lg transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500",
                  errors.country
                    ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                )}
              >
                <option value="MX">México</option>
                <option value="US">Estados Unidos</option>
                <option value="CA">Canadá</option>
                <option value="ES">España</option>
                <option value="CO">Colombia</option>
                <option value="AR">Argentina</option>
                <option value="PE">Perú</option>
                <option value="CL">Chile</option>
              </select>
              {errors.country && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.country.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 📝 Notes */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Notas Adicionales
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Observaciones
            </label>
            <textarea
              {...register("notes")}
              rows={4}
              className={cn(
                "w-full px-4 py-3 border rounded-lg transition-colors resize-none",
                "focus:outline-none focus:ring-2 focus:ring-blue-500",
                errors.notes
                  ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                  : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              )}
              placeholder="Información adicional sobre el proveedor, condiciones especiales, etc."
            />
            {errors.notes && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.notes.message}
              </p>
            )}
          </div>
        </div>
      </form>
    </BaseModal>
  );
};

export default SupplierModal;

