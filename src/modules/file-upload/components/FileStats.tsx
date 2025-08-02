// 📊 FILE STATS COMPONENT
// =======================
// Componente para mostrar estadísticas de archivos

"use client";

import React from "react";
import {
  HardDrive,
  Files,
  Image,
  FileText,
  Video,
  Music,
  Archive,
  TrendingUp,
  Cloud,
  Server,
} from "lucide-react";
import { useFileStats } from "../hooks";
import { humanFileSize } from "../utils";
import { FILE_CATEGORIES } from "../config";

interface FileStatsProps {
  className?: string;
  showDetails?: boolean;
}

export function FileStats({
  className = "",
  showDetails = true,
}: FileStatsProps) {
  const { stats, refreshStats, formattedTotalSize } = useFileStats();

  // Calcular estadísticas por categoría
  const categoryStats = React.useMemo(() => {
    const categories = {
      images: { count: 0, size: 0, icon: Image, color: "text-green-600" },
      documents: { count: 0, size: 0, icon: FileText, color: "text-blue-600" },
      videos: { count: 0, size: 0, icon: Video, color: "text-purple-600" },
      audio: { count: 0, size: 0, icon: Music, color: "text-yellow-600" },
      other: { count: 0, size: 0, icon: Archive, color: "text-gray-600" },
    };

    Object.entries(stats.byType).forEach(([mimeType, count]) => {
      if (mimeType.startsWith("image/")) {
        categories.images.count += count;
      } else if (
        mimeType.includes("pdf") ||
        mimeType.includes("text/") ||
        mimeType.includes("document")
      ) {
        categories.documents.count += count;
      } else if (mimeType.startsWith("video/")) {
        categories.videos.count += count;
      } else if (mimeType.startsWith("audio/")) {
        categories.audio.count += count;
      } else {
        categories.other.count += count;
      }
    });

    return categories;
  }, [stats.byType]);

  // Estadísticas por proveedor
  const providerStats = React.useMemo(() => {
    return [
      {
        name: "Local",
        count: stats.byProvider.local || 0,
        icon: Server,
        color: "text-blue-600",
      },
      {
        name: "S3",
        count: stats.byProvider.s3 || 0,
        icon: Cloud,
        color: "text-orange-600",
      },
      {
        name: "Cloudinary",
        count: stats.byProvider.cloudinary || 0,
        icon: Cloud,
        color: "text-green-600",
      },
    ].filter((provider) => provider.count > 0);
  }, [stats.byProvider]);

  return (
    <div className={`file-stats ${className}`}>
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Total de archivos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Files className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total de archivos
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.totalFiles.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Espacio usado */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <HardDrive className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Espacio usado
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formattedTotalSize}
              </p>
            </div>
          </div>
        </div>

        {/* Promedio por archivo */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Promedio por archivo
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.totalFiles > 0
                  ? humanFileSize(
                      Math.round(stats.totalSize / stats.totalFiles)
                    )
                  : "0 B"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {showDetails && (
        <>
          {/* Estadísticas por categoría */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Archivos por categoría
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(categoryStats).map(([category, data]) => {
                const Icon = data.icon;
                return (
                  <div key={category} className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Icon className={`w-8 h-8 ${data.color}`} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {data.count}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {category === "other" ? "Otros" : category}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Estadísticas por proveedor */}
          {providerStats.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Distribución por proveedor
              </h3>
              <div className="space-y-4">
                {providerStats.map((provider) => {
                  const Icon = provider.icon;
                  const percentage =
                    stats.totalFiles > 0
                      ? Math.round((provider.count / stats.totalFiles) * 100)
                      : 0;

                  return (
                    <div key={provider.name} className="flex items-center">
                      <Icon className={`w-5 h-5 ${provider.color} mr-3`} />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {provider.name}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {provider.count} archivos ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              provider.name === "Local"
                                ? "bg-blue-600"
                                : provider.name === "S3"
                                ? "bg-orange-600"
                                : "bg-green-600"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top tipos de archivo */}
          {Object.keys(stats.byType).length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Tipos de archivo más comunes
              </h3>
              <div className="space-y-3">
                {Object.entries(stats.byType)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([mimeType, count]) => {
                    const percentage =
                      stats.totalFiles > 0
                        ? Math.round((count / stats.totalFiles) * 100)
                        : 0;

                    return (
                      <div
                        key={mimeType}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">
                            {mimeType.startsWith("image/")
                              ? "🖼️"
                              : mimeType.includes("pdf")
                              ? "📄"
                              : mimeType.startsWith("video/")
                              ? "🎥"
                              : mimeType.startsWith("audio/")
                              ? "🎵"
                              : "📎"}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {mimeType}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {count} archivo{count !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {percentage}%
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Estado vacío */}
      {stats.totalFiles === 0 && (
        <div className="text-center py-12">
          <Files className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No hay archivos
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Las estadísticas aparecerán cuando subas tu primer archivo
          </p>
        </div>
      )}
    </div>
  );
}
