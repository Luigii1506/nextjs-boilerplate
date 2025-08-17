import React from "react";
import {
  HardDrive,
  Image,
  FileText,
  Video,
  Music,
  TrendingUp,
  Database,
  Cloud,
} from "lucide-react";
import type { FileStatsData } from "../../types";
import {
  formatFileSize,
  getStoragePercentage,
  getStorageColor,
} from "../../utils";

interface FileStatsProps {
  stats: FileStatsData;
  showDetails?: boolean;
}

const FileStats: React.FC<FileStatsProps> = React.memo(
  ({ stats, showDetails = false }) => {
    // 🏆 ENTERPRISE: Using shared utilities - no duplicate code
    const storagePercentage = getStoragePercentage(
      stats.storageUsed,
      stats.storageLimit
    );
    const storageColorClass = getStorageColor(storagePercentage);

    const fileTypeStats = [
      {
        label: "Imágenes",
        count: stats.imageCount,
        icon: Image,
        color: "blue",
        bgColor: "bg-blue-50",
        textColor: "text-blue-700",
        iconColor: "text-blue-600",
      },
      {
        label: "Documentos",
        count: stats.documentCount,
        icon: FileText,
        color: "red",
        bgColor: "bg-red-50",
        textColor: "text-red-700",
        iconColor: "text-red-600",
      },
      {
        label: "Videos",
        count: stats.videoCount,
        icon: Video,
        color: "purple",
        bgColor: "bg-purple-50",
        textColor: "text-purple-700",
        iconColor: "text-purple-600",
      },
      {
        label: "Audio",
        count: stats.audioCount,
        icon: Music,
        color: "green",
        bgColor: "bg-green-50",
        textColor: "text-green-700",
        iconColor: "text-green-600",
      },
    ];

    return (
      <div className="space-y-6">
        {/* Storage Overview */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <HardDrive className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Almacenamiento
                </h3>
                <p className="text-sm text-slate-600">Uso actual del espacio</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">
                {formatFileSize(stats.storageUsed)}
              </div>
              <div className="text-sm text-slate-500">
                de {formatFileSize(stats.storageLimit)}
              </div>
            </div>
          </div>

          {/* Storage Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Espacio utilizado</span>
              <span className="font-medium text-slate-900">
                {storagePercentage}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${storageColorClass}`}
                style={{ width: `${storagePercentage}%` }}
              />
            </div>
            {storagePercentage >= 90 && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                <TrendingUp size={16} />
                <span>
                  Almacenamiento casi lleno. Considera eliminar archivos
                  innecesarios.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* File Type Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {fileTypeStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bgColor}`}
                  >
                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">
                      {stat.count}
                    </div>
                    <div className="text-sm text-slate-600">{stat.label}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Stats */}
        {showDetails && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Total Files */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Database className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">
                    Total de Archivos
                  </h4>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats.totalFiles}
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-600">
                Archivos almacenados en tu cuenta
              </p>
            </div>

            {/* Storage Provider */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Cloud className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Proveedor</h4>
                  <p className="text-2xl font-bold text-slate-900">Amazon S3</p>
                </div>
              </div>
              <p className="text-sm text-slate-600">
                Almacenamiento en la nube seguro
              </p>
            </div>
          </div>
        )}

        {/* Usage Trends */}
        {showDetails && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Tendencias de Uso
                </h3>
                <p className="text-sm text-slate-600">Últimos 30 días</p>
              </div>
              <TrendingUp className="w-5 h-5 text-slate-400" />
            </div>

            {/* Simple Usage Chart */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Archivos subidos</span>
                <span className="text-sm font-medium text-slate-900">
                  +{stats.totalFiles}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">
                  Espacio utilizado
                </span>
                <span className="text-sm font-medium text-slate-900">
                  +{formatFileSize(stats.storageUsed)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Tipo más común</span>
                <span className="text-sm font-medium text-slate-900">
                  {stats.imageCount >= stats.documentCount
                    ? "Imágenes"
                    : "Documentos"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

FileStats.displayName = "FileStats";

export default FileStats;
