"use client";

import React from "react";
import {
  Key,
  Lock,
  Shield,
  Settings,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

/**
 * 🔐 PERMISSIONS TAB - GESTIÓN DE PERMISOS (FUTURO)
 * ================================================
 *
 * Tab para la gestión avanzada de permisos y políticas de acceso.
 * Actualmente es un placeholder que muestra la estructura futura
 * del sistema de permisos granulares.
 *
 * Features planificadas:
 * - Sistema de roles granulares
 * - Permisos por recurso
 * - Políticas de acceso
 * - Auditoría de permisos
 * - Herencia de roles
 *
 * Created: 2025-01-18 - Users SPA Implementation
 */

const PermissionsTab: React.FC = () => {
  // 🎯 Mock data for future permissions system
  const mockPermissions = [
    {
      resource: "Users",
      icon: Users,
      permissions: {
        read: true,
        create: true,
        update: true,
        delete: false,
      },
    },
    {
      resource: "Inventory",
      icon: Settings,
      permissions: {
        read: true,
        create: false,
        update: false,
        delete: false,
      },
    },
    {
      resource: "Reports",
      icon: Shield,
      permissions: {
        read: true,
        create: false,
        update: false,
        delete: false,
      },
    },
  ];

  const PermissionBadge: React.FC<{ granted: boolean; label: string }> = ({
    granted,
    label,
  }) => (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
        granted
          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      }`}
    >
      {granted ? (
        <CheckCircle className="w-3 h-3" />
      ) : (
        <XCircle className="w-3 h-3" />
      )}
      {label}
    </span>
  );

  return (
    <div className="p-6 space-y-8 animate-fadeInUp">
      {/* Header Section */}
      <div className="mb-8 animate-slideInUp">
        <div className="flex items-center gap-3 mb-4">
          <Key className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Permisos
          </h2>
          <span className="px-3 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 rounded-full text-sm font-medium">
            Próximamente
          </span>
        </div>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
          Sistema avanzado de permisos granulares para control de acceso
          detallado a recursos y funcionalidades.
        </p>
      </div>

      {/* Coming Soon Notice */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-8 border border-orange-200 dark:border-orange-700 text-center animate-slideInUp stagger-1">
        <Lock className="w-16 h-16 text-orange-500 dark:text-orange-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Sistema de Permisos Avanzado
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
          Estamos desarrollando un sistema completo de gestión de permisos
          granulares que permitirá un control de acceso muy detallado a todos
          los recursos del sistema.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-lg">
            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
              Roles Granulares
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Definición de roles específicos por área
            </p>
          </div>

          <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-lg">
            <Key className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
              Permisos por Recurso
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Control CRUD detallado por entidad
            </p>
          </div>

          <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-lg">
            <Settings className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
              Políticas Dinámicas
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Reglas de acceso basadas en contexto
            </p>
          </div>

          <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-lg">
            <AlertCircle className="w-8 h-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
              Auditoría Completa
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Registro de todos los accesos
            </p>
          </div>
        </div>
      </div>

      {/* Preview of Future Permissions System */}
      <div className="animate-slideInUp stagger-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Vista Previa - Sistema de Permisos
        </h3>

        <div className="space-y-4">
          {mockPermissions.map((resource) => {
            const IconComponent = resource.icon;
            return (
              <div
                key={resource.resource}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <IconComponent className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      {resource.resource}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Permisos para gestión de {resource.resource.toLowerCase()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <PermissionBadge
                    granted={resource.permissions.read}
                    label="Leer"
                  />
                  <PermissionBadge
                    granted={resource.permissions.create}
                    label="Crear"
                  />
                  <PermissionBadge
                    granted={resource.permissions.update}
                    label="Actualizar"
                  />
                  <PermissionBadge
                    granted={resource.permissions.delete}
                    label="Eliminar"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Implementation Timeline */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700 animate-fadeInUp stagger-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Hoja de Ruta de Implementación
        </h3>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Fase 1: Sistema básico de roles ✅
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Implementación actual con roles user, admin, super_admin
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Fase 2: Permisos granulares por recurso
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Q2 2025 - Control CRUD detallado para cada entidad
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Fase 3: Políticas dinámicas y herencia
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Q3 2025 - Reglas contextuales y herencia de permisos
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Fase 4: UI avanzada y auditoría
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Q4 2025 - Interfaz completa de gestión y logs detallados
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionsTab;
