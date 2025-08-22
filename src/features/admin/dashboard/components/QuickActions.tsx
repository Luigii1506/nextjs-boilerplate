import React from "react";
import { Users, Shield, Sliders } from "lucide-react";
import { QuickAction } from "../types";

/**
 * 🚀 COMPONENTE DE ACCIONES RÁPIDAS
 *
 * Componente para mostrar acciones rápidas del dashboard.
 */

interface QuickActionsProps {
  onViewChange?: (view: string) => void;
}

export function QuickActions({ onViewChange }: QuickActionsProps) {
  const quickActions: QuickAction[] = [
    {
      id: "users",
      title: "Gestionar Usuarios",
      description: "Ver, crear y editar usuarios",
      icon: "Users",
      onClick: () => onViewChange?.("users"),
      color: "blue",
    },
    {
      id: "roles",
      title: "Configurar Roles",
      description: "Administrar permisos y roles",
      icon: "Shield",
      onClick: () => console.log("Navigate to roles"),
      color: "green",
    },
    {
      id: "feature-flags",
      title: "Feature Flags",
      description: "Controlar funcionalidades",
      icon: "Sliders",
      onClick: () => onViewChange?.("feature-flags"),
      color: "orange",
    },
  ];

  const getIcon = (iconName: string) => {
    const icons = {
      Users,
      Shield,
      Sliders,
    };
    return icons[iconName as keyof typeof icons] || Users;
  };

  const getColorClasses = (color: QuickAction["color"]) => {
    const colors = {
      blue: "hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20",
      green:
        "hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20",
      orange:
        "hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20",
      purple:
        "hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20",
      red: "hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20",
    };
    return colors[color];
  };

  const getIconColor = (color: QuickAction["color"]) => {
    const colors = {
      blue: "text-blue-600",
      green: "text-green-600",
      orange: "text-orange-600",
      purple: "text-purple-600",
      red: "text-red-600",
    };
    return colors[color];
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
        Acciones Rápidas
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action) => {
          const Icon = getIcon(action.icon);
          return (
            <button
              key={action.id}
              onClick={action.onClick}
              className={`p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg transition-colors text-left ${getColorClasses(
                action.color
              )}`}
            >
              <Icon className={`w-6 h-6 ${getIconColor(action.color)} mb-2`} />
              <h4 className="font-medium text-slate-900 dark:text-slate-100">
                {action.title}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {action.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
