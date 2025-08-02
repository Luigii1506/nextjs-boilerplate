// 🎛️ FEATURE FLAGS ADMIN COMPONENT
// =================================
// Interfaz de administración para controlar feature flags

"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  ToggleLeft,
  ToggleRight,
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Info,
  Zap,
  Eye,
  EyeOff,
  Shield,
  Cpu,
  Palette,
  HardDrive,
  RefreshCw,
} from "lucide-react";
import { useFeatureFlags } from "@/shared/hooks/useFeatureFlags";
import {
  FEATURE_FLAGS,
  FEATURE_GROUPS,
  type FeatureFlag,
  type FeatureGroup,
} from "@/config/feature-flags";

// 📊 Tipos
interface FeatureFlagState {
  [key: string]: boolean;
}

interface NotificationState {
  type: "success" | "error" | "info";
  message: string;
}

// 🎨 Configuración de grupos de features
const GROUP_CONFIG = {
  core: {
    title: "🔥 Funcionalidades Core",
    description: "Funcionalidades esenciales del sistema",
    icon: Shield,
    color: "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800",
    toggleColor: "bg-blue-600",
  },
  modules: {
    title: "🧩 Módulos",
    description: "Módulos opcionales y extensiones",
    icon: HardDrive,
    color:
      "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800",
    toggleColor: "bg-green-600",
  },
  experimental: {
    title: "🧪 Experimental",
    description: "Funcionalidades en desarrollo",
    icon: Zap,
    color:
      "bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800",
    toggleColor: "bg-yellow-600",
  },
  ui: {
    title: "🎨 Interfaz",
    description: "Opciones de UI y UX",
    icon: Palette,
    color:
      "bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800",
    toggleColor: "bg-purple-600",
  },
  admin: {
    title: "👑 Administración",
    description: "Herramientas de administración",
    icon: Cpu,
    color: "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800",
    toggleColor: "bg-red-600",
  },
} as const;

export default function FeatureFlagsAdmin() {
  const { getAllFlags, toggle, setBatch, reset } = useFeatureFlags();
  const [flags, setFlags] = useState<FeatureFlagState>({});
  const [originalFlags, setOriginalFlags] = useState<FeatureFlagState>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<NotificationState | null>(
    null
  );
  const [expandedGroups, setExpandedGroups] = useState<Set<FeatureGroup>>(
    new Set(["core"])
  );

  // 📊 Cargar flags iniciales
  useEffect(() => {
    const currentFlags = getAllFlags();
    setFlags(currentFlags);
    setOriginalFlags(currentFlags);
  }, [getAllFlags]);

  // 📊 Detectar cambios
  useEffect(() => {
    const hasAnyChanges = Object.keys(flags).some(
      (key) => flags[key] !== originalFlags[key]
    );
    setHasChanges(hasAnyChanges);
  }, [flags, originalFlags]);

  // 🔔 Mostrar notificación
  const showNotification = (
    type: "success" | "error" | "info",
    message: string
  ) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // 🔄 Toggle individual
  const handleToggle = (flagName: FeatureFlag) => {
    setFlags((prev) => ({
      ...prev,
      [flagName]: !prev[flagName],
    }));
  };

  // 💾 Guardar cambios
  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Identificar cambios
      const changes: { [key: string]: boolean } = {};
      Object.keys(flags).forEach((key) => {
        if (flags[key] !== originalFlags[key]) {
          changes[key] = flags[key];
        }
      });

      if (Object.keys(changes).length === 0) {
        showNotification("info", "No hay cambios para guardar");
        return;
      }

      // Aplicar cambios al contexto local
      setBatch(changes);

      // TODO: Enviar a la API
      // await fetch('/api/admin/feature-flags', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ flags: changes })
      // });

      setOriginalFlags(flags);
      setHasChanges(false);
      showNotification(
        "success",
        `${Object.keys(changes).length} feature flag(s) actualizadas`
      );
    } catch (error) {
      showNotification("error", "Error al guardar feature flags");
      console.error("Error saving feature flags:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔄 Resetear cambios
  const handleReset = () => {
    setFlags(originalFlags);
    setHasChanges(false);
    showNotification("info", "Cambios descartados");
  };

  // 🔄 Resetear a defaults
  const handleResetToDefaults = async () => {
    if (
      !confirm(
        "¿Estás seguro de resetear todas las feature flags a sus valores por defecto?"
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      // Resetear contexto local
      reset();

      // TODO: Enviar a la API
      // await fetch('/api/admin/feature-flags', { method: 'DELETE' });

      const defaultFlags = getAllFlags();
      setFlags(defaultFlags);
      setOriginalFlags(defaultFlags);
      setHasChanges(false);
      showNotification(
        "success",
        "Feature flags reseteadas a valores por defecto"
      );
    } catch (error) {
      showNotification("error", "Error al resetear feature flags");
      console.error("Error resetting feature flags:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 👁️ Toggle grupo expandido
  const toggleGroup = (group: FeatureGroup) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(group)) {
        newSet.delete(group);
      } else {
        newSet.add(group);
      }
      return newSet;
    });
  };

  // 🎯 Renderizar feature flag individual
  const renderFeatureFlag = (flagName: FeatureFlag, groupColor: string) => {
    const isEnabled = flags[flagName];
    const hasChanged = flags[flagName] !== originalFlags[flagName];

    return (
      <div
        key={flagName}
        className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
          hasChanged
            ? "bg-blue-50 border-blue-300 dark:bg-blue-950 dark:border-blue-700"
            : "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700"
        }`}
      >
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              {flagName}
            </h4>
            {hasChanged && (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                Modificado
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {FEATURE_FLAGS[flagName]
              ? "Habilitado por defecto"
              : "Deshabilitado por defecto"}
          </p>
        </div>

        <button
          onClick={() => handleToggle(flagName)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isEnabled ? groupColor : "bg-gray-300 dark:bg-gray-600"
          }`}
          disabled={isLoading}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isEnabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              🎛️ Feature Flags Admin
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Controla las funcionalidades del sistema en tiempo real
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {hasChanges && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleReset}
                  disabled={isLoading}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Descartar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Guardar Cambios
                </button>
              </div>
            )}

            <button
              onClick={handleResetToDefaults}
              disabled={isLoading}
              className="px-4 py-2 text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Completo
            </button>
          </div>
        </div>
      </div>

      {/* Notificación */}
      {notification && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
            notification.type === "success"
              ? "bg-green-50 border border-green-200"
              : notification.type === "error"
              ? "bg-red-50 border border-red-200"
              : "bg-blue-50 border border-blue-200"
          }`}
        >
          {notification.type === "success" && (
            <CheckCircle className="w-5 h-5 text-green-600" />
          )}
          {notification.type === "error" && (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          {notification.type === "info" && (
            <Info className="w-5 h-5 text-blue-600" />
          )}
          <span
            className={`text-sm font-medium ${
              notification.type === "success"
                ? "text-green-800"
                : notification.type === "error"
                ? "text-red-800"
                : "text-blue-800"
            }`}
          >
            {notification.message}
          </span>
        </div>
      )}

      {/* Grupos de Features */}
      <div className="space-y-6">
        {Object.entries(FEATURE_GROUPS).map(([groupKey, flagNames]) => {
          const group = groupKey as FeatureGroup;
          const config = GROUP_CONFIG[group];
          const isExpanded = expandedGroups.has(group);
          const Icon = config.icon;

          return (
            <div
              key={group}
              className={`border rounded-lg overflow-hidden ${config.color}`}
            >
              {/* Header del grupo */}
              <button
                onClick={() => toggleGroup(group)}
                className="w-full p-6 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Icon className="w-6 h-6" />
                    <div>
                      <h2 className="text-xl font-semibold">{config.title}</h2>
                      <p className="text-sm opacity-75 mt-1">
                        {config.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium">
                      {flagNames.length} feature
                    </span>
                    {isExpanded ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </button>

              {/* Features del grupo */}
              {isExpanded && (
                <div className="p-6 pt-0">
                  <div className="space-y-3">
                    {flagNames.map((flagName) =>
                      renderFeatureFlag(
                        flagName as FeatureFlag,
                        config.toggleColor
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer con información */}
      <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-start space-x-4">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              💡 Información sobre Feature Flags
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>
                • Los cambios se aplican inmediatamente en la interfaz local
                (localStorage)
              </p>
              <p>• Las modificaciones persisten entre sesiones del navegador</p>
              <p>
                • Solo los administradores pueden ver y modificar estas
                configuraciones
              </p>
              <p>
                • Usa Reset Completo para volver a los valores por defecto del
                sistema
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
