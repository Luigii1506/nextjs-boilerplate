/**
 * 🚫 BAN REASON MODAL - CAPTURA ELEGANTE DE RAZÓN
 * ===============================================
 *
 * Modal elegante para capturar la razón del baneo con React Portal
 * - Renderizado en document.body para aparecer sobre toda la app
 * - Z-index máximo para garantizar visibilidad
 * - Formulario con react-hook-form + validación
 * - Razones predefinidas y campo personalizado
 * - Dark mode y responsive design
 *
 * Created: 2025-01-18 - Elegant Ban Reason Capture
 */

"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Ban,
  X,
  Loader2,
  AlertTriangle,
  MessageSquare,
  Check,
  FileText,
} from "lucide-react";
import { cn } from "@/shared/utils";
import type { User } from "../../types";

// 🎯 Form schema for ban reason
const banReasonSchema = z.object({
  reason: z
    .string()
    .min(10, "La razón debe tener al menos 10 caracteres")
    .max(500, "La razón no puede exceder 500 caracteres"),
  customReason: z.string().optional(),
});

type BanReasonFormData = z.infer<typeof banReasonSchema>;

interface BanReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onConfirm: (reason: string) => Promise<void> | void;
  isLoading?: boolean;
}

// 🎯 Predefined ban reasons
const COMMON_BAN_REASONS = [
  {
    id: "tos_violation",
    label: "Violación de términos de servicio",
    description: "Incumplimiento de las reglas establecidas",
  },
  {
    id: "harassment",
    label: "Acoso o comportamiento inapropiado",
    description: "Hostigamiento hacia otros usuarios",
  },
  {
    id: "spam",
    label: "Spam o contenido no deseado",
    description: "Publicación excesiva de contenido repetitivo",
  },
  {
    id: "fraud",
    label: "Actividad fraudulenta o sospechosa",
    description: "Comportamiento que compromete la seguridad",
  },
  {
    id: "abuse",
    label: "Abuso del sistema",
    description: "Uso indebido de funcionalidades del sistema",
  },
  {
    id: "custom",
    label: "Otra razón (especificar)",
    description: "Razón personalizada",
  },
];

/**
 * 🎯 BanReasonModal Component with Portal
 */
const BanReasonModal: React.FC<BanReasonModalProps> = ({
  isOpen,
  onClose,
  user,
  onConfirm,
  isLoading = false,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>("");

  // 📋 Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<BanReasonFormData>({
    resolver: zodResolver(banReasonSchema),
    defaultValues: {
      reason: "",
      customReason: "",
    },
  });

  const watchedReason = watch("reason");
  const isCustomReason = selectedReason === "custom";

  // 🚫 Don't render if closed, no user, or no document (SSR safety)
  if (!isOpen || !user || typeof document === "undefined") return null;

  // 🚀 Form submission handler
  const onSubmit = async (data: BanReasonFormData) => {
    let finalReason = data.reason;

    // If custom reason is selected and provided, use it
    if (isCustomReason && data.customReason?.trim()) {
      finalReason = data.customReason.trim();
    }

    await onConfirm(finalReason);
    reset();
    setSelectedReason("");
    onClose();
  };

  // 🎯 Handle predefined reason selection
  const handleReasonSelect = (reasonId: string, reasonText: string) => {
    setSelectedReason(reasonId);
    if (reasonId !== "custom") {
      setValue("reason", reasonText, { shouldValidate: true });
    } else {
      setValue("reason", "", { shouldValidate: false });
    }
  };

  // 🌐 Use Portal to render modal directly in document.body
  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* 🌫️ Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
      />

      {/* 📦 Modal Container */}
      <div className="flex min-h-full items-end sm:items-center justify-center p-4">
        <div
          className={cn(
            "relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl",
            "w-full max-w-2xl max-h-[90vh]",
            "transform transition-all duration-300 animate-slideInUp",
            "border border-gray-200 dark:border-gray-700",
            "flex flex-col overflow-hidden"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 📋 Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-50 to-orange-50 dark:from-gray-800 dark:to-gray-800">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-xl">
                <Ban className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Banear Usuario
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Usuario: <span className="font-medium">{user.name}</span>
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading || isSubmitting}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 📝 Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Warning Notice */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                      Importante: Proporciona una razón clara
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      La razón del baneo será registrada en el sistema y podrá
                      ser revisada por otros administradores. Asegúrate de ser
                      específico y profesional.
                    </p>
                  </div>
                </div>
              </div>

              {/* Predefined Reasons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Selecciona una razón común o especifica una personalizada
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {COMMON_BAN_REASONS.map((reason) => (
                    <button
                      key={reason.id}
                      type="button"
                      onClick={() =>
                        handleReasonSelect(reason.id, reason.label)
                      }
                      className={cn(
                        "p-4 text-left rounded-xl border-2 transition-all",
                        "hover:border-red-200 hover:bg-red-50 dark:hover:border-red-700 dark:hover:bg-red-900/10",
                        selectedReason === reason.id
                          ? "border-red-500 bg-red-50 dark:border-red-400 dark:bg-red-900/20"
                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                      )}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                            selectedReason === reason.id
                              ? "border-red-500 bg-red-500 dark:border-red-400 dark:bg-red-400"
                              : "border-gray-300 dark:border-gray-600"
                          )}
                        >
                          {selectedReason === reason.id && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {reason.label}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {reason.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Reason Input */}
              {isCustomReason && (
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FileText className="w-4 h-4 mr-2" />
                    Especifica la razón personalizada
                  </label>
                  <textarea
                    {...register("customReason")}
                    rows={4}
                    className={cn(
                      "w-full px-4 py-3 border rounded-xl transition-all",
                      "focus:ring-2 focus:ring-red-500 focus:border-transparent",
                      "bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
                      "placeholder-gray-500 dark:placeholder-gray-400",
                      errors.customReason
                        ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                        : "border-gray-300 dark:border-gray-600"
                    )}
                    placeholder="Describe la razón específica del baneo..."
                    disabled={isLoading || isSubmitting}
                  />
                  {errors.customReason && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {errors.customReason.message}
                    </p>
                  )}
                </div>
              )}

              {/* Selected Reason Preview */}
              {!isCustomReason && watchedReason && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Razón seleccionada:
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    &ldquo;{watchedReason}&rdquo;
                  </p>
                </div>
              )}

              {/* Character count for custom reason */}
              {isCustomReason && (
                <div className="text-right">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {watch("customReason")?.length || 0}/500 caracteres
                  </span>
                </div>
              )}

              {/* Hidden input for validation */}
              <input type="hidden" {...register("reason")} />
              {errors.reason && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.reason.message}
                </p>
              )}
            </form>
          </div>

          {/* 🎯 Footer Actions */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading || isSubmitting}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={
                isLoading ||
                isSubmitting ||
                !selectedReason ||
                (isCustomReason && !watch("customReason")?.trim())
              }
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isLoading || isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Baneando...</span>
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4" />
                  <span>Confirmar Baneo</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BanReasonModal;
