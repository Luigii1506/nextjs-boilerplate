/**
 * 🎯 EJEMPLOS DE USO - BASE MODAL
 * ==============================
 *
 * Este archivo contiene ejemplos de cómo usar BaseModal para crear
 * modales hermosos y consistentes en toda la aplicación.
 *
 * BaseModal ya incluye:
 * ✨ Animaciones fluidas (fadeIn, slideInUp)
 * 🌙 Dark mode completo
 * 📱 Responsive design
 * ⌨️ Keyboard navigation (ESC para cerrar)
 * 🎯 Loading states
 * 💾 Dirty state protection
 * 🎨 Botones y acciones pre-configurados
 *
 * Created: 2025-01-17 - BaseModal Examples
 */

"use client";

import React, { useState } from "react";
import { Save, Trash2, AlertCircle, CheckCircle, Users } from "lucide-react";
import { BaseModal, BaseModalActions, BaseModalButton } from "./BaseModal";

// 📋 EJEMPLO 1: Modal Simple de Confirmación
export const SimpleConfirmModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    setIsOpen(false);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Abrir Modal Simple</button>

      <BaseModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirmar Acción"
        description="¿Estás seguro de que quieres continuar con esta acción?"
        icon={<AlertCircle className="w-5 h-5 text-white" />}
        maxWidth="md"
        actions={
          <BaseModalActions align="right">
            <BaseModalButton
              variant="secondary"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </BaseModalButton>
            <BaseModalButton
              variant="primary"
              onClick={handleConfirm}
              loading={isLoading}
            >
              Confirmar
            </BaseModalButton>
          </BaseModalActions>
        }
      >
        <p className="text-gray-700 dark:text-gray-300">
          Esta acción no se puede deshacer. Por favor confirma que quieres
          proceder.
        </p>
      </BaseModal>
    </>
  );
};

// 🗑️ EJEMPLO 2: Modal de Eliminación (Peligroso)
export const DeleteConfirmModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    // Simulate delete operation
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsDeleting(false);
    setIsOpen(false);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Eliminar Item</button>

      <BaseModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Eliminar Usuario"
        description="Esta acción no se puede deshacer"
        icon={<Trash2 className="w-5 h-5 text-white" />}
        maxWidth="sm"
        actions={
          <BaseModalActions align="right">
            <BaseModalButton
              variant="secondary"
              onClick={() => setIsOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </BaseModalButton>
            <BaseModalButton
              variant="danger"
              onClick={handleDelete}
              loading={isDeleting}
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </BaseModalButton>
          </BaseModalActions>
        }
      >
        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800 dark:text-red-400">
                  Advertencia
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Al eliminar este usuario se perderán todos sus datos
                  asociados.
                </p>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>
              <strong>Usuario:</strong> Juan Pérez
            </p>
            <p>
              <strong>Email:</strong> juan@example.com
            </p>
            <p>
              <strong>Creado:</strong> 15 de enero, 2024
            </p>
          </div>
        </div>
      </BaseModal>
    </>
  );
};

// 📋 EJEMPLO 3: Modal con Formulario y Validación Dirty
export const FormModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save operation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSaving(false);
    setIsDirty(false);
    setIsOpen(false);
    // Reset form
    setFormData({ name: "", email: "" });
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsDirty(false);
    setFormData({ name: "", email: "" });
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Nuevo Usuario</button>

      <BaseModal
        isOpen={isOpen}
        onClose={handleClose}
        title="Agregar Usuario"
        description="Completa la información del nuevo usuario"
        icon={<Users className="w-5 h-5 text-white" />}
        isDirty={isDirty}
        confirmOnClose="¿Estás seguro? Se perderán los cambios no guardados."
        maxWidth="lg"
        actions={
          <BaseModalActions align="between">
            {/* Info sobre validación */}
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              {isDirty && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                  Hay cambios sin guardar
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex items-center gap-3">
              <BaseModalButton
                variant="secondary"
                onClick={handleClose}
                disabled={isSaving}
              >
                Cancelar
              </BaseModalButton>
              <BaseModalButton
                variant="primary"
                onClick={handleSave}
                loading={isSaving}
                disabled={!formData.name || !formData.email}
              >
                <Save className="w-4 h-4" />
                Guardar Usuario
              </BaseModalButton>
            </div>
          </BaseModalActions>
        }
      >
        <div className="space-y-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre Completo *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-colors duration-200"
              placeholder="Ej: Juan Pérez"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-colors duration-200"
              placeholder="Ej: juan@empresa.com"
            />
          </div>

          {/* Info adicional */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-400">
                  Información
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  El usuario recibirá un email de bienvenida automáticamente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </BaseModal>
    </>
  );
};

// 🎯 EJEMPLO 4: Modal de Solo Lectura/Información
export const InfoModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Ver Información</button>

      <BaseModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Información del Sistema"
        description="Detalles técnicos y estadísticas"
        icon={<CheckCircle className="w-5 h-5 text-white" />}
        maxWidth="2xl"
        actions={
          <BaseModalActions align="right">
            <BaseModalButton variant="primary" onClick={() => setIsOpen(false)}>
              Entendido
            </BaseModalButton>
          </BaseModalActions>
        }
      >
        <div className="space-y-6">
          {/* Grid de stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                1,234
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                Usuarios Activos
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                5,678
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                Productos
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                99.9%
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">
                Uptime
              </div>
            </div>
          </div>

          {/* Información detallada */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
              Detalles Técnicos
            </h4>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm">
              <div className="space-y-1 text-gray-600 dark:text-gray-400">
                <div>
                  <span className="text-gray-900 dark:text-gray-200">
                    Versión:
                  </span>{" "}
                  v2.1.0
                </div>
                <div>
                  <span className="text-gray-900 dark:text-gray-200">
                    Build:
                  </span>{" "}
                  #1234
                </div>
                <div>
                  <span className="text-gray-900 dark:text-gray-200">
                    Entorno:
                  </span>{" "}
                  Producción
                </div>
                <div>
                  <span className="text-gray-900 dark:text-gray-200">
                    Última actualización:
                  </span>{" "}
                  17 Jan 2025, 14:30
                </div>
              </div>
            </div>
          </div>
        </div>
      </BaseModal>
    </>
  );
};

// 🎨 GUÍA DE TAMAÑOS
// ==================
// sm: max-w-sm (384px)   - Confirmaciones simples
// md: max-w-md (448px)   - Alertas, confirmaciones
// lg: max-w-lg (512px)   - Formularios pequeños
// xl: max-w-xl (576px)   - Formularios medianos
// 2xl: max-w-2xl (672px) - Formularios grandes
// 3xl: max-w-3xl (768px) - Contenido amplio
// 4xl: max-w-4xl (896px) - Formularios complejos (como ProductModal)

// 🎯 VARIANTES DE BOTONES
// =======================
// primary: Azul - Acciones principales (Guardar, Confirmar, Crear)
// secondary: Gris - Acciones secundarias (Cancelar, Cerrar)
// danger: Rojo - Acciones destructivas (Eliminar, Borrar)

export default {
  SimpleConfirmModal,
  DeleteConfirmModal,
  FormModal,
  InfoModal,
};

