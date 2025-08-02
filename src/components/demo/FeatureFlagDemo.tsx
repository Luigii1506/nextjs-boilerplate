// 🎯 FEATURE FLAG DEMO COMPONENT
// ==============================
// Demostración simple de cómo usar feature flags

"use client";

import React from "react";
import {
  CheckCircle,
  XCircle,
  Zap,
  Upload,
  BarChart3,
  Palette,
} from "lucide-react";
import { useFeatureFlag, FeatureGate } from "@/shared/hooks/useFeatureFlags";

const FeatureFlagDemo: React.FC = () => {
  const fileUploadEnabled = useFeatureFlag("fileUpload");
  const analyticsEnabled = useFeatureFlag("analytics");
  const darkModeEnabled = useFeatureFlag("darkMode");
  const betaFeaturesEnabled = useFeatureFlag("betaFeatures");

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 border border-blue-200 dark:border-gray-700">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          🎛️ Demo Feature Flags en Acción
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Los componentes a continuación se muestran/ocultan según el estado de
          las feature flags.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* File Upload Demo */}
        <FeatureGate
          flag="fileUpload"
          fallback={
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-800 font-medium">
                  File Upload Deshabilitado
                </span>
              </div>
              <p className="text-sm text-red-600 mt-1">
                Esta funcionalidad está oculta porque fileUpload = false
              </p>
            </div>
          }
        >
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <Upload className="w-4 h-4 text-green-600" />
              <span className="text-green-800 font-medium">
                File Upload Activo
              </span>
            </div>
            <p className="text-sm text-green-700">
              ✅ Sistema de archivos funcionando correctamente
            </p>
          </div>
        </FeatureGate>

        {/* Analytics Demo */}
        <FeatureGate
          flag="analytics"
          fallback={
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-800 font-medium">
                  Analytics Deshabilitado
                </span>
              </div>
              <p className="text-sm text-red-600 mt-1">
                Las métricas están ocultas porque analytics = false
              </p>
            </div>
          }
        >
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <BarChart3 className="w-4 h-4 text-green-600" />
              <span className="text-green-800 font-medium">
                Analytics Activo
              </span>
            </div>
            <p className="text-sm text-green-700">
              📊 Estadísticas: 1,234 usuarios, 5,678 archivos
            </p>
          </div>
        </FeatureGate>

        {/* Dark Mode Demo */}
        <div
          className={`p-4 border rounded-lg ${
            darkModeEnabled
              ? "bg-gray-800 border-gray-600 text-white"
              : "bg-white border-gray-200 text-gray-900"
          }`}
        >
          <div className="flex items-center space-x-2 mb-2">
            {darkModeEnabled ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <Palette className="w-4 h-4" />
            <span className="font-medium">
              Dark Mode {darkModeEnabled ? "Activo" : "Deshabilitado"}
            </span>
          </div>
          <p className="text-sm opacity-75">
            {darkModeEnabled
              ? "🌙 Modo oscuro aplicado dinámicamente"
              : "☀️ Modo claro por defecto"}
          </p>
        </div>

        {/* Beta Features Demo */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            {betaFeaturesEnabled ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <Zap className="w-4 h-4 text-amber-600" />
            <span className="text-amber-800 font-medium">
              Beta Features {betaFeaturesEnabled ? "Activo" : "Deshabilitado"}
            </span>
          </div>
          {betaFeaturesEnabled && (
            <div className="text-sm text-amber-700 space-y-1">
              <p>🧪 Funcionalidad experimental A</p>
              <p>🚀 Nueva funcionalidad B en desarrollo</p>
              <p>⚡ Optimización C en testing</p>
            </div>
          )}
          {!betaFeaturesEnabled && (
            <p className="text-sm text-amber-700">
              Funcionalidades experimentales ocultas
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          💡 <strong>Prueba esto:</strong> Ve a la sección &quot;🎛️ Feature
          Flags&quot; y cambia el estado de cualquier flag. Los componentes aquí
          se actualizarán automáticamente en tiempo real.
        </p>
      </div>
    </div>
  );
};

export default FeatureFlagDemo;
